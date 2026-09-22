import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus,
    Wifi,
    WifiOff,
    Bot,
    Megaphone,
    QrCode,
    ArrowRight,
    Activity,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { auth } from "@/lib/auth";
import { getAccessibleSessions } from "@/lib/api-auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const sessions = await getAccessibleSessions(session.user.id!, session.user.role || "OWNER");

    const totalSessions = sessions.length;
    const connectedSessions = sessions.filter(s => s.status === 'CONNECTED').length;
    const disconnectedSessions = totalSessions - connectedSessions;

    // Fetch auto-reply count for accessible sessions
    let autoReplyCount = 0;
    try {
        const sessionIds = sessions.map(s => s.sessionId);
        if (sessionIds.length > 0) {
            autoReplyCount = await prisma.autoReply.count({
                where: { sessionId: { in: sessionIds } }
            });
        }
    } catch {
        // If auto-reply table doesn't exist yet, show 0
    }

    const stats = [
        {
            title: "Total Sessions",
            value: totalSessions,
            icon: QrCode,
            description: "Registered devices",
            iconColor: "text-primary",
        },
        {
            title: "Connected",
            value: connectedSessions,
            icon: Wifi,
            description: "Online & active",
            iconColor: "text-emerald-500",
        },
        {
            title: "Disconnected",
            value: disconnectedSessions,
            icon: WifiOff,
            description: "Needs reconnection",
            iconColor: "text-destructive",
        },
        {
            title: "Auto-Reply Rules",
            value: autoReplyCount,
            icon: Zap,
            description: "Active automations",
            iconColor: "text-amber-500",
        },
    ];

    const quickActions = [
        { href: "/dashboard/sessions", label: "New Session", icon: Plus, description: "Connect a new device" },
        { href: "/dashboard/broadcast", label: "Broadcast", icon: Megaphone, description: "Send bulk messages" },
        { href: "/dashboard/bot-settings", label: "Bot Settings", icon: Bot, description: "Configure chatbot" },
        { href: "/dashboard/system-monitor", label: "System Monitor", icon: Activity, description: "View server metrics" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Overview of your WhatsApp gateway & device health</p>
                </div>
                <Link href="/dashboard/sessions">
                    <Button size="sm" className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm">
                        <Plus className="h-4 w-4" /> Add Session
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-border hover:bg-card-2"
                        >
                            <div className="flex items-start justify-between">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-muted", stat.iconColor)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-2.5 sm:mt-3 text-2xl sm:text-[28px] leading-none font-bold tabular-nums text-foreground">
                                {stat.value}
                            </p>
                            <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-border hover:bg-muted/60"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground group-hover:text-primary transition-colors">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{action.label}</span>
                                    <span className="text-[11px] sm:text-xs text-muted-foreground block truncate">{action.description}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sessions List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessions</h3>
                    <Link href="/dashboard/sessions" className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors">
                        View all <ArrowRight size={13} />
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
                        <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No sessions yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Connect your first WhatsApp device to get started</p>
                        <Link href="/dashboard/sessions">
                            <Button size="sm" variant="outline" className="gap-2 rounded-lg">
                                <Plus className="h-4 w-4" /> Create Session
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map(s => {
                            const isConnected = s.status === 'CONNECTED';
                            const isDisconnected = !isConnected;

                            return (
                                <Link key={s.id} href={`/dashboard/sessions/${s.sessionId}`}>
                                    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-border hover:bg-card-2 cursor-pointer h-full">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{s.sessionId}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
                                                ${isConnected 
                                                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' 
                                                    : isDisconnected 
                                                    ? 'bg-destructive/10 text-destructive' 
                                                    : 'bg-amber-500/10 text-amber-500'}
                                            `}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : isDisconnected ? 'bg-destructive' : 'bg-amber-500'}`} />
                                                {s.status}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
