"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Play, Square, RotateCcw, LogOut, Power, Trash2, QrCode, Activity, HardDrive, Wifi, MemoryStick, Copy, Check } from "lucide-react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SessionDetail = {
    id: string;
    name: string;
    sessionId: string;
    status: string;
    userId: string;
    uptime: number; // in seconds
    me?: {
        id: string;
        name: string;
    };
    hasInstance: boolean;
};

export default function SessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [uptime, setUptime] = useState(0);
    const [systemMetrics, setSystemMetrics] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isPairing, setIsPairing] = useState(false);

    const fetchSession = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    toast.error("Session not found");
                    router.push("/dashboard/sessions");
                    return;
                }
                throw new Error("Failed to fetch");
            }
            const responseData = await res.json();
            const data = responseData?.data;
            if (!data) throw new Error("No data returned");
            setSession(data);
            setQrCode(data.qr || null);
            setPairingCode(data.pairingCode || null);
            setUptime(data.uptime || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load session details");
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`/api/system/monitor/${sessionId}`);
            const result = await res.json();
            if (result.status) {
                setSystemMetrics(result.data);
            }
        } catch (e) {
            // silent ignore
        }
    };

    useEffect(() => {
        fetchSession();

        const socketInstance = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
            console.log("Connected to socket");
            socketInstance.emit("join-session", sessionId);
        });

        socketInstance.on("connection.update", (data: { status: string, qr: string, pairingCode?: string }) => {
            console.log("Socket update:", data);
            setSession(prev => prev ? { ...prev, status: data.status } : null);
            setQrCode(data.qr || null);
            if (data.pairingCode) setPairingCode(data.pairingCode);

            // Re-fetch full details on major status change (like connection) to get 'me' info
            if (data.status === 'CONNECTED') {
                fetchSession();
            }
        });

        setSocket(socketInstance);

        // Uptime counter
        const interval = setInterval(() => {
            setUptime(prev => prev + 1);
        }, 1000);

        // Fetch metrics periodically
        fetchMetrics();
        const metricsInterval = setInterval(fetchMetrics, 3000);

        return () => {
            socketInstance.disconnect();
            clearInterval(interval);
            clearInterval(metricsInterval);
        };
    }, [sessionId]);

    const performAction = async (action: string, payload: any = {}) => {
        const loadingToast = toast.loading(` performing ${action}...`);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || data.error || "Action failed");

            toast.success(data.message || "Success");

            // Refresh logic
            if (action === 'logout') {
                setQrCode(null);
                setPairingCode(null);
            }
            if (action === 'pair' && data.data?.pairingCode) {
                setPairingCode(data.data.pairingCode);
            }
            fetchSession();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const handlePairingRequest = async () => {
        if (!phoneNumber) {
            toast.error("Please enter a phone number");
            return;
        }
        setIsPairing(true);
        await performAction('pair', { phoneNumber });
        setIsPairing(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const deleteSession = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Session deleted");
                router.push("/dashboard/sessions");
            } else {
                toast.error("Failed to delete");
            }
        } catch (e) {
            toast.error("Error deleting session");
        }
    };

    const formatUptime = (seconds: number) => {
        if (!session?.status || session.status !== "CONNECTED") return "Offline";
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!session) return <div className="p-8 text-muted-foreground">Session not found</div>;

    const rawId = session.me?.id || "";
    // WhatsApp JIDs are typically in format "918098502859:85@s.whatsapp.net" or "918098502859@s.whatsapp.net"
    const cleanPhone = rawId ? rawId.split("@")[0].split(":")[0] : "";
    const formattedPhone = cleanPhone ? (cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`) : "";
    const pingValue = systemMetrics?.ping;
    const isOnline = session.status === 'CONNECTED' && (pingValue === 'Online' || pingValue === 'Unknown' || !pingValue);
    const displayPing = isOnline ? 'Online' : (pingValue || 'Offline');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <Button variant="ghost" asChild className="self-start">
                    <Link href="/dashboard/sessions">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
                    </Link>
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                    {session.name} <span className="text-muted-foreground font-normal text-xs sm:text-sm block sm:inline mt-1 sm:mt-0">({session.sessionId})</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                            Session Status
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${
                                session.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                session.status === 'STOPPED' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                                {session.status}
                            </div>
                        </CardTitle>
                        <CardDescription>Real-time connection status and uptime.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/40 border border-border/60 rounded-xl min-w-0">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground block mb-1">Uptime</span>
                                <span className="text-lg sm:text-xl font-mono font-semibold tracking-tight text-foreground block truncate">
                                    {formatUptime(uptime)}
                                </span>
                            </div>
                            <div className="p-4 bg-muted/40 border border-border/60 rounded-xl min-w-0 overflow-hidden">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Connected As</span>
                                    {rawId && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(formattedPhone || rawId)}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                                            title={`Copy ID: ${rawId}`}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="min-w-0" title={rawId || "-"}>
                                    {session.me?.name ? (
                                        <div className="min-w-0">
                                            <span className="text-base sm:text-lg font-semibold text-foreground block truncate">
                                                {session.me.name}
                                            </span>
                                            {formattedPhone && (
                                                <span className="text-xs font-mono text-muted-foreground block truncate">
                                                    {formattedPhone}
                                                </span>
                                            )}
                                        </div>
                                    ) : formattedPhone ? (
                                        <div className="min-w-0">
                                            <span className="text-base sm:text-lg font-mono font-semibold text-foreground block truncate">
                                                {formattedPhone}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground/80 block truncate">
                                                WhatsApp Active
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-base sm:text-lg font-medium text-muted-foreground block">
                                            -
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* System Resource Extension */}
                        {session.status === 'CONNECTED' && (
                            <div className="mt-4 pt-4 border-t border-border/60">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                                    <Activity className="h-4 w-4 text-emerald-500" /> System Health
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-muted/40 border border-border/60 p-3 rounded-xl text-center relative overflow-hidden">
                                        <Wifi className="h-4 w-4 text-muted-foreground/60 absolute top-2 right-2" />
                                        <div className="text-xs font-medium text-muted-foreground">Ping state</div>
                                        <div className={`font-bold mt-1 text-sm sm:text-base flex items-center justify-center gap-1.5 ${
                                            isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            <span className={`inline-block h-2 w-2 rounded-full ${
                                                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                            }`} />
                                            {displayPing}
                                        </div>
                                    </div>
                                    <div className="bg-muted/40 border border-border/60 p-3 rounded-xl text-center">
                                        <div className="text-xs font-medium text-muted-foreground">Store Contacts</div>
                                        <div className="font-bold text-foreground mt-1 text-sm sm:text-base">{systemMetrics?.store?.contacts ?? 0}</div>
                                    </div>
                                    <div className="bg-muted/40 border border-border/60 p-3 rounded-xl text-center">
                                        <div className="text-xs font-medium text-muted-foreground">Store Chats</div>
                                        <div className="font-bold text-foreground mt-1 text-sm sm:text-base">{systemMetrics?.store?.chats ?? 0}</div>
                                    </div>
                                    <div className="bg-muted/40 border border-border/60 p-3 rounded-xl text-center relative">
                                        <MemoryStick className="h-4 w-4 text-muted-foreground/60 absolute top-2 right-2" />
                                        <div className="text-xs font-medium text-muted-foreground">Store Msgs</div>
                                        <div className="font-bold text-foreground mt-1 text-sm sm:text-base">{systemMetrics?.store?.messages ?? 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {qrCode && (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/60 rounded-xl bg-card relative group">
                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                    <QRCodeSVG value={qrCode} size={256} />
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground animate-pulse">Scan with WhatsApp to connect</p>

                                <div className="mt-6 pt-6 border-t border-border/60 w-full">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Or link with phone number</div>
                                        <div className="flex flex-col w-full max-w-sm gap-2 mt-1">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="628123456789"
                                                    value={phoneNumber}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                                                    className="font-mono"
                                                />
                                                <Button onClick={handlePairingRequest} disabled={isPairing || !phoneNumber}>
                                                    Link
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground text-center">Use country code without + or spaces (e.g., 628123456789)</p>
                                        </div>
                                        {pairingCode && (
                                            <div className="mt-4 p-4 bg-slate-900 dark:bg-slate-950 rounded-lg w-full max-w-[320px] text-center border-2 border-slate-700 shadow-xl relative group/code">
                                                <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2 font-semibold">Your Pairing Code</div>
                                                <div
                                                    className="text-3xl font-mono font-bold text-white tracking-[0.3em] flex justify-center cursor-pointer hover:text-emerald-400 transition-colors py-2"
                                                    onClick={() => copyToClipboard(pairingCode)}
                                                    title="Click to copy"
                                                >
                                                    {pairingCode.toUpperCase().replace('-', '').split('').map((char, i) => (
                                                        <span key={i} className="flex items-center">
                                                            {char}
                                                            {i === 3 && <span className="mx-2 text-slate-600 opacity-50">-</span>}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-7 w-7 text-slate-500 hover:text-white"
                                                    onClick={() => copyToClipboard(pairingCode)}
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                <div className="text-[9px] text-slate-500 mt-2 italic">Enter this code on your phone</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Controls</CardTitle>
                        <CardDescription>Manage the active session.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 border-border/60 transition-colors"
                            onClick={() => performAction('start')}
                            disabled={session.status === 'CONNECTED' || session.status === 'SCAN_QR'}
                        >
                            <Play className="mr-2 h-4 w-4" /> Start Session
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10 border-border/60 transition-colors"
                            onClick={() => performAction('restart')}
                            disabled={!session.hasInstance && session.status !== 'CONNECTED'}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" /> Restart Session
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10 border-border/60 transition-colors"
                            onClick={() => performAction('stop')}
                            disabled={session.status === 'STOPPED'}
                        >
                            <Square className="mr-2 h-4 w-4" /> Stop Session
                        </Button>

                        <div className="border-t border-border/60 my-4 pt-4 space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start border-border/60"
                                onClick={() => performAction('logout')}
                                disabled={session.status !== 'CONNECTED'}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-start bg-rose-600 hover:bg-rose-700 text-white"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Session
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the session
                                            and remove your connection data from the server.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteSession} className="bg-rose-600 hover:bg-rose-700">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
