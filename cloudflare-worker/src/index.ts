// ============================================================
// WhatsApp Server – Cloudflare Worker Sentinel
// Handles: cron keep-alive, InstaBox webhook, maintenance page
// ============================================================

export interface Env {
  INSTABOX_API_KEY: string;
  INSTABOX_MACHINE_ID: string;
  SERVER_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  WEBHOOK_SECRET: string;
}

// ─── InstaBox API ────────────────────────────────────────────

interface InstaboxMachine {
  id: string;
  state: "running" | "suspended" | "stopped" | "starting" | "stopping";
  runStartedAt: string | null;
  maxRunMinutes: number;
  autoSuspendAfterSeconds: number;
  retryAfterSeconds?: number;
}

async function getMachineState(env: Env): Promise<InstaboxMachine | null> {
  try {
    const res = await fetch("https://api.instabox.sh/v1/machines", {
      headers: { Authorization: `Bearer ${env.INSTABOX_API_KEY}` },
      cf: { cacheTtl: 0 },
    });
    if (!res.ok) return null;
    const data: { machines: InstaboxMachine[] } = await res.json();
    return data.machines.find((m) => m.id === env.INSTABOX_MACHINE_ID) ?? null;
  } catch {
    return null;
  }
}

async function wakeServer(env: Env): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.instabox.sh/v1/machines/${env.INSTABOX_MACHINE_ID}/start`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.INSTABOX_API_KEY}` },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Telegram ────────────────────────────────────────────────

async function sendTelegram(env: Env, text: string): Promise<void> {
  await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    }
  );
}

// ─── InstaBox Webhook Verification ───────────────────────────

async function verifyWebhookSignature(
  request: Request,
  body: string,
  secret: string
): Promise<boolean> {
  const sigHeader = request.headers.get("svix-signature") ?? "";
  const tsHeader = request.headers.get("svix-timestamp") ?? "";
  const msgId = request.headers.get("svix-id") ?? "";

  const toSign = `${msgId}.${tsHeader}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret.replace(/^whsec_/, "")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(toSign)
  );
  const computed = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  return sigHeader.split(" ").some((s) => s.startsWith(`v1,${computed}`));
}

// ─── Maintenance Page HTML ────────────────────────────────────

function maintenancePage(secondsLeft: number, state: string): string {
  const VIDEO_URL =
    "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/202606021731-e_hqa6sn.mp4";

  const stateLabel =
    state === "suspended"
      ? "Cooldown Active"
      : state === "starting"
      ? "Node Initializing"
      : "Service Paused";

  const stateDesc =
    state === "starting"
      ? "Starting cluster container"
      : "Suspended (Resting)";

  const initialCycleSeconds = 120 * 60; // 2 hours

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>System Maintenance — WhatsApp Gateway</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --card-bg: rgba(15, 17, 23, 0.72);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-hover: rgba(255, 255, 255, 0.16);
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-sub: #64748b;
      --accent: #25d366;
      --accent-subtle: rgba(37, 211, 102, 0.12);
      --status-amber: #f59e0b;
      --status-amber-bg: rgba(245, 158, 11, 0.1);
      --status-amber-border: rgba(245, 158, 11, 0.25);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      width: 100vw;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Cinematic Video Background with Multi-layer Vignette ── */
    .media-layer {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    #bg-video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100vw;
      min-height: 100vh;
      width: auto;
      height: auto;
      object-fit: cover;
      opacity: 0.32;
      filter: saturate(0.8) contrast(1.1) brightness(0.65);
    }

    .vignette-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at center, rgba(9, 10, 15, 0.45) 0%, rgba(9, 10, 15, 0.88) 75%, #090a0f 100%),
        linear-gradient(180deg, rgba(9, 10, 15, 0.8) 0%, rgba(9, 10, 15, 0.2) 35%, rgba(9, 10, 15, 0.75) 75%, #090a0f 100%);
    }

    /* ── Main Layout Frame ── */
    .app-frame {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      justify-content: space-between;
    }

    /* ── Header ── */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-bottom: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #fff;
    }

    .brand-sub {
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-sub);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      background: var(--status-amber-bg);
      border: 1px solid var(--status-amber-border);
      color: var(--status-amber);
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--status-amber);
      box-shadow: 0 0 8px var(--status-amber);
      animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* ── Center Content Box ── */
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin: 2.5rem 0;
      width: 100%;
    }

    .hero-pretitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--accent);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: #ffffff;
      max-width: 720px;
      margin-bottom: 1rem;
    }

    .hero-desc {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-muted);
      max-width: 540px;
      margin-bottom: 2.5rem;
    }

    /* ── Segmented Countdown Panel ── */
    .timer-panel {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.75rem 2rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
      transition: border-color 0.2s ease;
    }

    .timer-panel:hover {
      border-color: var(--card-border-hover);
    }

    .timer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .time-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 10px;
    }

    .time-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: clamp(2.25rem, 5vw, 3.25rem);
      font-weight: 600;
      line-height: 1;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
      margin-bottom: 0.4rem;
    }

    .time-label {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-sub);
    }

    /* ── Subtle Progress ── */
    .progress-section {
      width: 100%;
      text-align: left;
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
    }

    .progress-meta span:last-child {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: var(--accent);
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981, #25d366);
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Action and System Info Bar ── */
    .system-status-ribbon {
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem 1.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
      color: var(--text-sub);
    }

    .system-status-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .system-status-item strong {
      color: var(--text-muted);
      font-weight: 500;
    }

    .actions-group {
      margin-top: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-main);
      border: 1px solid var(--card-border);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--card-border-hover);
    }

    /* ── Footer ── */
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.75rem;
      color: var(--text-sub);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .footer-right {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-sub);
    }

    @media (max-width: 640px) {
      .app-frame { padding: 1.25rem 1rem; }
      .timer-panel { padding: 1.25rem 1rem; }
      .timer-grid { gap: 0.5rem; }
      .time-slot { padding: 0.75rem 0.25rem; }
      footer { justify-content: center; text-align: center; }
    }
  </style>
</head>
<body>

  <div class="media-layer">
    <video id="bg-video" autoplay loop muted playsinline>
      <source src="${VIDEO_URL}" type="video/mp4" />
    </video>
    <div class="vignette-overlay"></div>
  </div>

  <div class="app-frame">
    <header>
      <div class="brand">
        <div class="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
            <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
            <line x1="6" x2="6.01" y1="6" y2="6"/>
            <line x1="6" x2="6.01" y1="18" y2="18"/>
          </svg>
        </div>
        <div class="brand-info">
          <span class="brand-name">WhatsApp Gateway</span>
          <span class="brand-sub">Production Cluster</span>
        </div>
      </div>

      <div class="status-badge">
        <span class="status-dot"></span>
        <span id="badge-label">${stateLabel}</span>
      </div>
    </header>

    <main>
      <div class="hero-pretitle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Automated Lifecycle Rest
      </div>

      <h1 class="hero-title">Service Rest in Progress</h1>
      <p class="hero-desc">
        The instance is completing its scheduled runtime rest cycle. The gateway will automatically spin up and reconnect when the cooldown finishes.
      </p>

      <div class="timer-panel">
        <div class="timer-grid">
          <div class="time-slot">
            <span class="time-num" id="hours">00</span>
            <span class="time-label">Hours</span>
          </div>
          <div class="time-slot">
            <span class="time-num" id="minutes">--</span>
            <span class="time-label">Minutes</span>
          </div>
          <div class="time-slot">
            <span class="time-num" id="seconds">--</span>
            <span class="time-label">Seconds</span>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-meta">
            <span id="cycle-state">Cycle Progress</span>
            <span id="progress-pct">0%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" id="progress-bar" style="width: 0%;"></div>
          </div>
        </div>
      </div>

      <div class="system-status-ribbon">
        <div class="system-status-item">
          <span>Target:</span>
          <strong>InstaBox Edge Node</strong>
        </div>
        <div class="system-status-item">
          <span>State:</span>
          <strong id="system-state-text">${stateDesc}</strong>
        </div>
        <div class="system-status-item">
          <span>Protocol:</span>
          <strong>Auto-Resume Enabled</strong>
        </div>
      </div>

      <div class="actions-group">
        <button class="btn btn-secondary" onclick="checkNow()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          Check Connectivity
        </button>
      </div>
    </main>

    <footer>
      <div class="footer-left">
        <span>Cloudflare Sentinel Edge</span>
        <span>•</span>
        <span>HTTP 503 Service Maintenance</span>
      </div>
      <div class="footer-right">
        Auto-reloads when operational
      </div>
    </footer>
  </div>

  <script>
    let remaining = ${secondsLeft > 0 ? secondsLeft : 0};
    const initialCycleSeconds = ${initialCycleSeconds};

    function updateDisplay() {
      if (remaining <= 0) {
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('progress-pct').textContent = '100%';
        document.getElementById('progress-bar').style.width = '100%';
        document.getElementById('badge-label').textContent = 'Reconnecting';
        document.getElementById('cycle-state').textContent = 'Ready to launch';
        setTimeout(() => location.reload(), 3000);
        return;
      }

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');

      const elapsed = Math.max(0, initialCycleSeconds - remaining);
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / initialCycleSeconds) * 100)));
      document.getElementById('progress-pct').textContent = pct + '%';
      document.getElementById('progress-bar').style.width = pct + '%';

      remaining--;
      setTimeout(updateDisplay, 1000);
    }

    function checkNow() {
      const btn = event.currentTarget;
      btn.textContent = 'Checking...';
      btn.style.opacity = '0.7';
      setTimeout(() => {
        location.reload();
      }, 800);
    }

    updateDisplay();
  </script>
</body>
</html>`;
}

// ─── Cron Handler ────────────────────────────────────────────

async function handleCron(env: Env): Promise<void> {
  const machine = await getMachineState(env);
  if (!machine) return;

  if (machine.state === "running") {
    // Keep-alive ping
    try {
      await fetch(env.SERVER_URL, { signal: AbortSignal.timeout(8000) });
    } catch {
      // Server not responding — try to wake it
    }

    // Check if approaching max runtime (warn at 5 min remaining)
    if (machine.runStartedAt) {
      const startMs = new Date(machine.runStartedAt).getTime();
      const elapsedMin = (Date.now() - startMs) / 60000;
      const remaining = machine.maxRunMinutes - elapsedMin;

      if (remaining > 0 && remaining <= 5) {
        await sendTelegram(
          env,
          `⚠️ <b>WhatsApp Server</b> freezes in <b>${Math.ceil(remaining)} min</b>!\n\nMax runtime (${machine.maxRunMinutes}m) almost reached.\nServer will be offline ~2h after freeze.`
        );
      }
    }
  } else if (machine.state === "suspended" || machine.state === "stopped") {
    // Try to wake it up
    await wakeServer(env);
  }
}

// ─── Webhook Handler ─────────────────────────────────────────

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();

  // Verify signature
  const valid = await verifyWebhookSignature(
    request,
    body,
    env.WEBHOOK_SECRET
  ).catch(() => false);

  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: { type: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const emojiMap: Record<string, string> = {
    "sandbox.started": "🟢",
    "sandbox.stopped": "🔴",
    "sandbox.suspended": "⏸️",
    "sandbox.error": "❌",
    "sandbox.created": "🆕",
    "sandbox.deleted": "🗑️",
    "snapshot.created": "📸",
    "snapshot.failed": "⚠️",
    "snapshot.deleted": "🗑️",
  };

  const emoji = emojiMap[event.type] ?? "ℹ️";
  const label = event.type.replace(".", " ").toUpperCase();

  await sendTelegram(
    env,
    `${emoji} <b>InstaBox Event</b>: ${label}\n\n<code>${JSON.stringify(event.data ?? {}, null, 2)}</code>`
  );

  return new Response("OK", { status: 200 });
}

// ─── Fetch Handler (Main Entry) ──────────────────────────────

export default {
  // ── HTTP requests ──
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // POST /webhook — InstaBox events
    if (request.method === "POST" && url.pathname === "/webhook") {
      return handleWebhook(request, env);
    }

    // GET /status — raw JSON status (for debugging)
    if (url.pathname === "/status") {
      const machine = await getMachineState(env);
      return new Response(JSON.stringify(machine, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /wake — manually trigger wake (for debugging)
    if (url.pathname === "/wake") {
      const ok = await wakeServer(env);
      return new Response(JSON.stringify({ woken: ok }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── All other requests: check server state ──
    const machine = await getMachineState(env);

    if (!machine) {
      // API error — show maintenance page with unknown ETA
      return new Response(maintenancePage(300, "suspended"), {
        status: 503,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    if (machine.state === "running") {
      // Server is live — redirect to actual server
      const targetUrl = env.SERVER_URL + url.pathname + url.search;
      return Response.redirect(targetUrl, 302);
    }

    if (machine.state === "starting") {
      return new Response(maintenancePage(60, "starting"), {
        status: 503,
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Retry-After": "30",
        },
      });
    }

    // Suspended / stopped — calculate seconds until cooldown ends
    let secondsLeft = 0;

    if (machine.runStartedAt) {
      const startMs = new Date(machine.runStartedAt).getTime();
      const ranForMs = Date.now() - startMs;
      const maxMs = machine.maxRunMinutes * 60 * 1000;
      // Cooldown ≈ same duration as max runtime (InstaBox rule)
      const cooldownMs = maxMs;
      const cooldownEndMs = startMs + maxMs + cooldownMs;
      secondsLeft = Math.max(0, Math.ceil((cooldownEndMs - Date.now()) / 1000));
    } else {
      // Fallback: assume 2h cooldown
      secondsLeft = 2 * 60 * 60;
    }

    // Also try to wake it
    wakeServer(env); // fire-and-forget

    return new Response(maintenancePage(secondsLeft, machine.state), {
      status: 503,
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Retry-After": String(Math.min(secondsLeft, 120)),
      },
    });
  },

  // ── Cron trigger ──
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    await handleCron(env);
  },
};
