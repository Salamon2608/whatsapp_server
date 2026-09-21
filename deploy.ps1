<#
.SYNOPSIS
    Automated 1-Click Deployment Script for WhatsApp Server on AWS EC2.
.DESCRIPTION
    Option 1: Fast Deploy (Git push + AWS pull + PM2 restart) - ~5 seconds
    Option 2: Full Deploy (Next.js production build + Transfer + PM2 restart) - ~1 minute
#>

param(
    [string]$Mode = "",
    [string]$Message = ""
)

$ServerIP = "13.213.124.18"
$KeyPath = ".\wa-key.pem"
$RemoteDir = "~/whatsapp_server"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       WHATSAPP GATEWAY SERVER AWS DEPLOYMENT            " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Server: ubuntu@$ServerIP" -ForegroundColor White
Write-Host ""

if (-not $Mode) {
    Write-Host "Select deployment type:" -ForegroundColor White
    Write-Host " [1] Fast Deploy (Backend / API / WhatsApp logic changes) - ~5 seconds" -ForegroundColor Green
    Write-Host " [2] Full Deploy (Frontend UI / Page layout / CSS changes) - ~1 minute" -ForegroundColor Yellow
    Write-Host " [Q] Quit" -ForegroundColor Gray
    Write-Host ""
    $Choice = Read-Host "Enter your choice (1 or 2)"
} else {
    $Choice = $Mode
}

if ($Choice -eq "Q" -or $Choice -eq "q") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Prompt for Git Commit message
if (-not $Message) {
    $CommitMsg = Read-Host "Enter commit message (or press Enter for default)"
} else {
    $CommitMsg = $Message
}

if ([string]::IsNullOrWhiteSpace($CommitMsg)) {
    $CommitMsg = "Auto update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# --- OPTION 2: FULL BUILD ---
if ($Choice -eq "2") {
    Write-Host "`n[1/5] Building Next.js production bundle locally..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed! Fix build errors before deploying." -ForegroundColor Red
        exit 1
    }

    Write-Host "[2/5] Compressing production build..." -ForegroundColor Cyan
    if (Test-Path "next_build.tar.gz") { Remove-Item "next_build.tar.gz" -Force }
    tar.exe --exclude="cache" -czf next_build.tar.gz -C .next .

    Write-Host "[3/5] Uploading build bundle to AWS..." -ForegroundColor Cyan
    scp.exe -i $KeyPath -o BatchMode=yes -o StrictHostKeyChecking=no next_build.tar.gz "ubuntu@${ServerIP}:${RemoteDir}/"
    Remove-Item "next_build.tar.gz" -Force -ErrorAction SilentlyContinue
}

# --- GIT PUSH ---
Write-Host "`nGit commit and push to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "$CommitMsg"
git push origin main

# --- REMOTE UPDATE ---
Write-Host "`nUpdating AWS server and restarting PM2..." -ForegroundColor Cyan

if ($Choice -eq "2") {
    $RemoteCmd = "cd ~/whatsapp_server ; git fetch origin ; git reset --hard origin/main ; tar -xzf next_build.tar.gz -C .next/ ; rm -f next_build.tar.gz ; pm2 restart whatsapp-server ; pm2 status"
} else {
    $RemoteCmd = "cd ~/whatsapp_server ; git fetch origin ; git reset --hard origin/main ; pm2 restart whatsapp-server ; pm2 status"
}

ssh.exe -n -i $KeyPath -o StrictHostKeyChecking=no "ubuntu@$ServerIP" $RemoteCmd

Write-Host "`nDEPLOYMENT COMPLETE! Site is live at: https://salo26.duckdns.org" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
