"use client";

import { useState, useEffect } from "react";
import { useSession as useSessionProvider } from "@/components/dashboard/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    RefreshCw, Save, AlertCircle, Bot, X, Plus, ShieldCheck, Zap, UserCheck, 
    MessageSquarePlus, Users, Shield, Moon, Clock, Shuffle, CheckCircle2, 
    Flame, Gauge, Sparkles, Activity, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { resolveSpintax, generateSpintaxVariations, containsSpintax } from "@/lib/spintax";

export default function BotSettingsPage() {
    const { sessionId } = useSessionProvider();

    const [botConfig, setBotConfig] = useState({
        botName: "WA-AKG Bot",
        prefix: "#",
        enableSticker: true,
        enableVideoSticker: true,
        maxStickerDuration: 10,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: "",
        botMode: "OWNER",
        autoReplyMode: "ALL",
        ignoreGroups: true,
        antiSpamEnabled: false,
        spamLimit: 5,
        spamInterval: 10,
        spamDelayMin: 1000,
        spamDelayMax: 3000,

        // Bot Extra fields
        welcomeMessage: "",
        autoRead: false,
        alwaysOnline: false,
        botAllowedJids: [] as string[],
        botBlockedJids: [] as string[],
        autoReplyAllowedJids: [] as string[],
        autoReplyBlockedJids: [] as string[],

        // Anti-Ban & Safety Features
        humanTyping: false,
        dailyLimit: 100,
        warmupMode: false,
        warmupStage: 1,
        spintaxEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
    });
    const [botLoading, setBotLoading] = useState(false);
    const [safetyMetrics, setSafetyMetrics] = useState<any>(null);

    // Spintax Tester State
    const [spintaxTestInput, setSpintaxTestInput] = useState("{Hello|Hi|Hey} {friend|customer}, {how are you|hope you have a wonderful day}!");
    const [spintaxTestVariations, setSpintaxTestVariations] = useState<string[]>([]);

    const [newJid, setNewJid] = useState("");

    const [privacyConfig, setPrivacyConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
    });
    const [privacyLoading, setPrivacyLoading] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        fetch(`/api/sessions/${sessionId}/bot-config`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setBotConfig(prev => ({
                        ...prev,
                        ...data,
                        ignoreGroups: data.ignoreGroups ?? true,
                        removeBgApiKey: data.removeBgApiKey || "",
                        prefix: data.prefix || "#",
                        welcomeMessage: data.welcomeMessage || "",
                        botAllowedJids: data.botAllowedJids || [],
                        botBlockedJids: data.botBlockedJids || [],
                        autoReplyAllowedJids: data.autoReplyAllowedJids || [],
                        autoReplyBlockedJids: data.autoReplyBlockedJids || [],
                        humanTyping: data.humanTyping ?? false,
                        dailyLimit: data.dailyLimit ?? 100,
                        warmupMode: data.warmupMode ?? false,
                        warmupStage: data.warmupStage ?? 1,
                        spintaxEnabled: data.spintaxEnabled ?? true,
                        quietHoursEnabled: data.quietHoursEnabled ?? false,
                        quietHoursStart: data.quietHoursStart || "22:00",
                        quietHoursEnd: data.quietHoursEnd || "07:00",
                    }));
                }
                if (responseData?.safetyMetrics) {
                    setSafetyMetrics(responseData.safetyMetrics);
                }
            })
            .catch(() => { });

        fetch(`/api/sessions/${sessionId}/settings`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setPrivacyConfig({
                        ghostMode: data.config?.ghostMode || false,
                        antiDelete: data.config?.antiDelete || false,
                        readReceipts: data.config?.readReceipts ?? true
                    });
                }
            })
            .catch(() => { });
    }, [sessionId]);

    const handleSaveBot = async () => {
        if (!sessionId) return;
        setBotLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botConfig)
            });

            if (res.ok) {
                const json = await res.json();
                if (json.safetyMetrics) {
                    setSafetyMetrics(json.safetyMetrics);
                }
                toast.success("Bot & Anti-Ban configuration saved");
            } else {
                toast.error("Failed to save bot configuration");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving bot configuration");
        } finally {
            setBotLoading(false);
        }
    };

    const handleSavePrivacy = async () => {
        if (!sessionId) return;
        setPrivacyLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    config: {
                        ghostMode: privacyConfig.ghostMode,
                        antiDelete: privacyConfig.antiDelete,
                        readReceipts: privacyConfig.readReceipts
                    }
                })
            });

            if (res.ok) {
                toast.success("Privacy settings saved");
            } else {
                toast.error("Failed to save privacy settings");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving privacy settings");
        } finally {
            setPrivacyLoading(false);
        }
    };

    const addJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids') => {
        if (!newJid || !newJid.trim()) return;
        let formatted = newJid.trim();
        if (!formatted.includes('@')) formatted += '@s.whatsapp.net';

        if (!botConfig[listName].includes(formatted)) {
            setBotConfig(prev => ({
                ...prev,
                [listName]: [...prev[listName], formatted]
            }));
        }
        setNewJid("");
    };

    const removeJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids', jid: string) => {
        setBotConfig(prev => ({
            ...prev,
            [listName]: prev[listName].filter(item => item !== jid)
        }));
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground";

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Bot Settings</h2>
                    <p className="text-muted-foreground text-sm mt-1">Configure bot features and session privacy for the active WhatsApp session.</p>
                </div>

                {/* Bot Mode & Access Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Bot Mode & Access Control
                        </CardTitle>
                        <CardDescription>Configure who can interact with the bot and use commands.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label>Bot Name</Label>
                                <Input
                                    placeholder="WA-AKG Bot"
                                    value={botConfig.botName}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">The display name used by the bot in automated responses.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Command Prefix</Label>
                                    <Input
                                        className="max-w-[100px]"
                                        placeholder="#"
                                        maxLength={3}
                                        value={botConfig.prefix}
                                        onChange={(e) => setBotConfig(prev => ({ ...prev, prefix: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">The prefix character for bot commands.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Bot Interaction Mode</Label>
                                    <Select
                                        value={botConfig.botMode}
                                        onValueChange={(v: any) => setBotConfig(prev => ({ ...prev, botMode: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Public (Everyone)</SelectItem>
                                            <SelectItem value="OWNER">Private (Owner Only)</SelectItem>
                                            <SelectItem value="SPECIFIC">Whitelist (Selected JIDs)</SelectItem>
                                            <SelectItem value="BLACKLIST">Blacklist (Block JIDs)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Control who can trigger bot commands.</p>
                                </div>
                            </div>

                            {(botConfig.botMode === 'SPECIFIC' || botConfig.botMode === 'BLACKLIST') && (
                                <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Label className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        {botConfig.botMode === 'SPECIFIC' ? "Whitelisted Numbers" : "Blacklisted Numbers"}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="628123456789@s.whatsapp.net"
                                            value={newJid}
                                            onChange={(e) => setNewJid(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids')}
                                        />
                                        <Button variant="outline" size="icon" onClick={() => addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids')}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).map(jid => (
                                            <div key={jid} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                                                {jid}
                                                <button onClick={() => removeJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids', jid)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">No numbers added yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Group Interaction Setting */}
                            <div className="flex items-center justify-between space-x-3 border border-purple-500/30 bg-purple-500/5 p-4 rounded-xl">
                                <Label htmlFor="ignore-groups" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5 text-sm">
                                        <Users className="h-4 w-4" /> Ignore WhatsApp Groups (Private Chats Only)
                                    </span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        When enabled, the bot, command handler, and auto-replies will completely ignore messages from WhatsApp groups and never reply to group members.
                                    </span>
                                </Label>
                                <Switch
                                    id="ignore-groups"
                                    checked={botConfig.ignoreGroups}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, ignoreGroups: c }))}
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-ping" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">Ping Command</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">Respond to {botConfig.prefix}ping</span>
                                    </Label>
                                    <Switch id="enable-ping" checked={botConfig.enablePing}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enablePing: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-uptime" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">Uptime Command</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">Respond to {botConfig.prefix}uptime</span>
                                    </Label>
                                    <Switch id="enable-uptime" checked={botConfig.enableUptime}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableUptime: c }))} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Bot Configuration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Automation & Presence Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Automation & Presence
                            </CardTitle>
                            <CardDescription>Advanced bot automation and presence customization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="always-online" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">Always Online</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">Stay "Online" even when inactive.</span>
                                    </Label>
                                    <Switch id="always-online" checked={botConfig.alwaysOnline}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, alwaysOnline: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="auto-read" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">Auto Read (Blue Ticks)</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">Automatically mark messages as read.</span>
                                    </Label>
                                    <Switch id="auto-read" checked={botConfig.autoRead}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, autoRead: c }))} />
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border/50 pt-4">
                                <Label className="flex items-center gap-2">
                                    <MessageSquarePlus className="h-4 w-4 text-primary" />
                                    Welcome Message (Beta)
                                </Label>
                                <Textarea
                                    placeholder="Hello! Welcome to our WhatsApp Bot. How can I help you today?"
                                    className="min-h-[100px]"
                                    value={botConfig.welcomeMessage}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                />
                                <p className="text-[10px] text-muted-foreground">Sent automatically to users when they message this bot for the first time.</p>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Automation Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anti-Ban & Account Protection Shield */}
                    <Card className="border-emerald-500/20 shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <CardTitle className="flex items-center gap-2.5 text-xl font-bold">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <span>WhatsApp Anti-Ban & Safety Suite</span>
                                </CardTitle>
                                {botConfig.antiSpamEnabled && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 w-fit">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Protection Active
                                    </span>
                                )}
                            </div>
                            <CardDescription className="text-sm">
                                Comprehensive algorithmic protection against WhatsApp bans, mass-reporting, and rate-limiting. Applies to bot messages, broadcasts, autoreplies, and API triggers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Live Metrics Banner */}
                            {safetyMetrics && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Today's Sends</span>
                                        <p className="text-lg font-bold flex items-baseline gap-1">
                                            {safetyMetrics.dailyCount}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                / {safetyMetrics.dailyLimit > 0 ? safetyMetrics.dailyLimit : "∞"}
                                            </span>
                                        </p>
                                        {safetyMetrics.dailyLimit > 0 && (
                                            <Progress 
                                                value={Math.min((safetyMetrics.dailyCount / safetyMetrics.dailyLimit) * 100, 100)} 
                                                className="h-1.5 mt-1"
                                                indicatorClassName={
                                                    safetyMetrics.dailyCount >= safetyMetrics.dailyLimit 
                                                        ? "bg-red-500" 
                                                        : safetyMetrics.dailyCount > safetyMetrics.dailyLimit * 0.8 
                                                            ? "bg-yellow-500" 
                                                            : "bg-emerald-500"
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Warmup Mode</span>
                                        <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
                                            {safetyMetrics.warmupMode ? (
                                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <Flame className="h-3.5 w-3.5" /> Stage {safetyMetrics.warmupStage}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Disabled</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Quiet Hours</span>
                                        <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
                                            {safetyMetrics.inQuietHours ? (
                                                <span className="text-blue-500 flex items-center gap-1">
                                                    <Moon className="h-3.5 w-3.5" /> Sleeping
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <Activity className="h-3.5 w-3.5" /> Active
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Human Typing</span>
                                        <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
                                            {safetyMetrics.humanTyping ? (
                                                <span className="text-emerald-600 dark:text-emerald-400">Simulating</span>
                                            ) : (
                                                <span className="text-muted-foreground">Off</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Main Anti-Spam Switch */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
                                <Label htmlFor="anti-spam" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-semibold text-base flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        Master Anti-Ban Rate Limiter
                                    </span>
                                    <span className="font-normal text-xs text-muted-foreground max-w-xl">
                                        Queues messages and introduces human-like jitter delays when thresholds are exceeded. Messages are safely delayed in memory and never dropped.
                                    </span>
                                </Label>
                                <Switch 
                                    id="anti-spam" 
                                    checked={botConfig.antiSpamEnabled}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, antiSpamEnabled: c }))} 
                                />
                            </div>

                            {/* Human Typing Simulation */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
                                <Label htmlFor="human-typing" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-semibold text-base flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        Realistic Human Typing Simulation (Presence)
                                    </span>
                                    <span className="font-normal text-xs text-muted-foreground max-w-xl">
                                        Broadcasts a real WhatsApp <code className="bg-muted px-1 rounded text-foreground font-mono">composing...</code> state for 1.2s – 3.5s before dispatching each message. Completely eliminates the signature of headless bot traffic.
                                    </span>
                                </Label>
                                <Switch 
                                    id="human-typing" 
                                    checked={botConfig.humanTyping}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, humanTyping: c }))} 
                                />
                            </div>

                            {/* Automated Warmup Mode */}
                            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="warmup-mode" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-semibold text-base flex items-center gap-2">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            Automated Warm-up Mode (For New / Fresh Numbers)
                                        </span>
                                        <span className="font-normal text-xs text-muted-foreground max-w-xl">
                                            Gradually builds phone number reputation with WhatsApp over days to prevent instant bans on newly connected SIM cards.
                                        </span>
                                    </Label>
                                    <Switch 
                                        id="warmup-mode" 
                                        checked={botConfig.warmupMode}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, warmupMode: c }))} 
                                    />
                                </div>

                                {botConfig.warmupMode && (
                                    <div className="pt-3 border-t border-border/60 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Warmup Stage</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                            {[
                                                { stage: 1, label: "Stage 1: Day 1–3", limit: "≤ 20 / day", delay: "8–15s delays", desc: "For fresh SIMs" },
                                                { stage: 2, label: "Stage 2: Day 4–7", limit: "≤ 50 / day", delay: "5–10s delays", desc: "Light activity" },
                                                { stage: 3, label: "Stage 3: Day 8–14", limit: "≤ 150 / day", delay: "3–6s delays", desc: "Moderate volume" },
                                                { stage: 4, label: "Stage 4: Day 15+", limit: "≤ 500 / day", delay: "Adaptive delays", desc: "Established" },
                                            ].map(s => (
                                                <div 
                                                    key={s.stage}
                                                    onClick={() => setBotConfig(prev => ({ ...prev, warmupStage: s.stage }))}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                        botConfig.warmupStage === s.stage
                                                            ? "border-primary bg-primary/10 shadow-sm"
                                                            : "border-border/60 hover:border-border bg-muted/20"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-xs">{s.label}</span>
                                                        {botConfig.warmupStage === s.stage && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                                                    </div>
                                                    <p className="text-xs font-semibold text-foreground">{s.limit}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.delay}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Daily Quota & Quiet Hours */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Daily Safety Limit */}
                                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        <Label className="font-semibold text-sm">Daily Message Quota</Label>
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={25}
                                        value={botConfig.dailyLimit}
                                        disabled={botConfig.warmupMode}
                                        onChange={e => setBotConfig(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) || 0 }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {botConfig.warmupMode 
                                            ? "Controlled automatically by Active Warmup Stage." 
                                            : "Max outbound messages allowed in 24 hours. (0 = unlimited)"}
                                    </p>
                                </div>

                                {/* Quiet Hours */}
                                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4 text-blue-500" />
                                            <Label htmlFor="quiet-hours" className="font-semibold text-sm cursor-pointer">Quiet Hours (Sleep)</Label>
                                        </div>
                                        <Switch 
                                            id="quiet-hours" 
                                            checked={botConfig.quietHoursEnabled}
                                            onCheckedChange={c => setBotConfig(prev => ({ ...prev, quietHoursEnabled: c }))} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[11px] text-muted-foreground block mb-1">Start (Night)</span>
                                            <Input
                                                type="time"
                                                value={botConfig.quietHoursStart}
                                                disabled={!botConfig.quietHoursEnabled}
                                                onChange={e => setBotConfig(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-muted-foreground block mb-1">End (Morning)</span>
                                            <Input
                                                type="time"
                                                value={botConfig.quietHoursEnd}
                                                disabled={!botConfig.quietHoursEnabled}
                                                onChange={e => setBotConfig(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Pauses outbound queue during night hours to avoid abnormal traffic flags.</p>
                                </div>
                            </div>

                            {/* Spintax Anti-Fingerprinting Engine */}
                            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="spintax-engine" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-semibold text-base flex items-center gap-2">
                                            <Shuffle className="h-4 w-4 text-purple-500" />
                                            Spintax Anti-Fingerprinting Engine
                                        </span>
                                        <span className="font-normal text-xs text-muted-foreground max-w-xl">
                                            Automatically resolves Spin Syntax like <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{"{Hello|Hi|Hey}"}</code> into randomized text variations per recipient. Prevents WhatsApp hash-matching algorithms from flagging repeated messages.
                                        </span>
                                    </Label>
                                    <Switch 
                                        id="spintax-engine" 
                                        checked={botConfig.spintaxEnabled}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, spintaxEnabled: c }))} 
                                    />
                                </div>

                                {botConfig.spintaxEnabled && (
                                    <div className="pt-3 border-t border-border/60 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                                Live Spintax Playground & Tester
                                            </Label>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="h-7 text-xs gap-1.5"
                                                onClick={() => {
                                                    const variations = generateSpintaxVariations(spintaxTestInput, 3);
                                                    setSpintaxTestVariations(variations);
                                                }}
                                            >
                                                <Shuffle className="h-3 w-3" />
                                                Generate 3 Variations
                                            </Button>
                                        </div>
                                        <Input
                                            value={spintaxTestInput}
                                            onChange={e => setSpintaxTestInput(e.target.value)}
                                            placeholder="{Hello|Hi|Hey} {friend|customer}..."
                                            className="font-mono text-xs"
                                        />
                                        {spintaxTestVariations.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {spintaxTestVariations.map((v, i) => (
                                                    <div key={i} className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-foreground flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-purple-500 px-1 py-0.5 rounded bg-purple-500/20">#{i + 1}</span>
                                                        <span>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Advanced Burst Delays (When antiSpamEnabled) */}
                            {botConfig.antiSpamEnabled && (
                                <div className="grid sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
                                    <div className="grid gap-1">
                                        <Label className="text-xs font-semibold">Burst Limit</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamLimit}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamLimit: parseInt(e.target.value) || 1 }))}
                                            min={1}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Instant msgs allowed</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label className="text-xs font-semibold">Window (Sec)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamInterval}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamInterval: parseInt(e.target.value) || 1 }))}
                                            min={1}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Rolling count reset</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label className="text-xs font-semibold">Min Jitter (ms)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamDelayMin}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMin: parseInt(e.target.value) || 0 }))}
                                            min={0}
                                            step={200}
                                        />
                                        <p className="text-[10px] text-muted-foreground">e.g. 1000 = 1s</p>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label className="text-xs font-semibold">Max Jitter (ms)</Label>
                                        <Input
                                            type="number"
                                            value={botConfig.spamDelayMax}
                                            onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMax: parseInt(e.target.value) || 0 }))}
                                            min={0}
                                            step={200}
                                        />
                                        <p className="text-[10px] text-muted-foreground">e.g. 3000 = 3s</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button 
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium" 
                                    onClick={handleSaveBot} 
                                    disabled={botLoading || !sessionId}
                                >
                                    {botLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Protection & Anti-Ban Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & Utility */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy & Utility</CardTitle>
                            <CardDescription>Configure ghost mode and other features for your active session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="ghost-mode" className="flex flex-col space-y-1">
                                    <span>Ghost Mode</span>
                                    <span className="font-normal text-xs text-muted-foreground">View status and read messages without sending blue ticks.</span>
                                </Label>
                                <Switch id="ghost-mode" checked={privacyConfig.ghostMode}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, ghostMode: c }))} />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="anti-delete" className="flex flex-col space-y-1">
                                    <span>Anti-Delete</span>
                                    <span className="font-normal text-xs text-muted-foreground">Keep messages even if the sender deletes them for everyone.</span>
                                </Label>
                                <Switch id="anti-delete" checked={privacyConfig.antiDelete}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, antiDelete: c }))} />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSavePrivacy} disabled={privacyLoading || !sessionId}>
                                    {privacyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Privacy Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SessionGuard>
        );
    }
