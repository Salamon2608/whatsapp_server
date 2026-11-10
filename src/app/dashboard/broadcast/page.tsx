"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { 
    RefreshCw, Send, CheckCircle2, XCircle, Radio, Clock, AlertTriangle, History, Eye, Calendar, 
    Shuffle, Sparkles, ShieldCheck, Users, UserPlus, Search, Plus, Trash2, Phone, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useSocket } from "@/components/dashboard/socket-context";
import { resolveSpintax, containsSpintax } from "@/lib/spintax";

interface BroadcastProgress {
    broadcastId: string;
    status: "running" | "completed";
    total: number;
    sent: number;
    failed: number;
    current?: string | null;
    progress?: number;
    errors?: { jid: string; error: string }[];
    startedAt?: string;
    completedAt?: string;
}

interface BroadcastLog {
    id: string;
    sessionId: string;
    message: string;
    total: number;
    sent: number;
    failed: number;
    status: string;
    delay: number;
    startedAt: string;
    completedAt: string | null;
    _count?: { recipients: number };
    recipients?: BroadcastRecipient[];
}

interface BroadcastRecipient {
    id: string;
    jid: string;
    status: string;
    error: string | null;
    sentAt: string | null;
}

interface ContactItem {
    id: string;
    jid: string;
    name: string | null;
    notify: string | null;
    verifiedName: string | null;
    remoteJidAlt?: string | null;
    imgUrl?: string | null;
}

export default function BroadcastPage() {
    const { sessionId } = useSession();
    const [contacts, setContacts] = useState("");
    const [message, setMessage] = useState("");
    const [delay, setDelay] = useState([2000]);
    const [loading, setLoading] = useState(false);
    const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [sampleVariation, setSampleVariation] = useState("");

    const hasSpintax = containsSpintax(message);

    useEffect(() => {
        if (containsSpintax(message)) {
            setSampleVariation(resolveSpintax(message));
        } else {
            setSampleVariation("");
        }
    }, [message]);

    // History
    const [history, setHistory] = useState<BroadcastLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<BroadcastLog | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const { getSocket, joinSession } = useSocket();

    // Socket for progress updates
    useEffect(() => {
        const socket = getSocket();
        if (!socket || !sessionId) return;

        const onConnect = () => joinSession(sessionId);
        if (socket.connected) joinSession(sessionId);
        socket.on("connect", onConnect);

        const handler = (data: BroadcastProgress) => {
            setBroadcastProgress(data);
            if (data.status === "completed") {
                setLoading(false);
                // Refresh history after completion
                fetchHistory();
                if (data.failed === 0) {
                    toast.success(`Broadcast complete! ${data.sent} sent.`);
                } else {
                    toast.warning(`Broadcast complete. ${data.sent} sent, ${data.failed} failed.`);
                }
            }
        };

        socket.on("broadcast.progress", handler);
        return () => { socket.off("connect", onConnect); socket.off("broadcast.progress", handler); };
    }, [sessionId, getSocket, joinSession]);

    // Fetch history
    const fetchHistory = useCallback(async () => {
        if (!sessionId) return;
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/history?limit=20`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch broadcast history", e);
        } finally {
            setHistoryLoading(false);
        }
    }, [sessionId]);

    // Load history on mount & tab switch
    useEffect(() => {
        if (activeTab === "history" && sessionId) {
            fetchHistory();
        }
    }, [activeTab, sessionId, fetchHistory]);

    // Open detail modal
    const openDetail = async (log: BroadcastLog) => {
        setSelectedLog(log);
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/history/${log.id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedLog(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch broadcast detail", e);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSend = async () => {
        if (!sessionId) return toast.error("No active session found");
        if (!message.trim()) return toast.error("Message cannot be empty");
        setLoading(true);
        setBroadcastProgress(null);

        try {
            const recipients = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => {
                if (!s.includes('@')) return `${s}@s.whatsapp.net`;
                return s;
            });

            if (recipients.length === 0) {
                toast.error("No recipients specified");
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/messages/${sessionId}/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients,
                    message,
                    delay: delay[0]
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.info(`Broadcast started for ${recipients.length} recipients...`);
            } else {
                toast.error(data.message || "Failed to start broadcast");
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error sending broadcast");
            setLoading(false);
        }
    };

    const recipientCount = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
    const formatJid = (jid: string) => {
        if (!jid) return "-";
        return jid.replace("@s.whatsapp.net", "").replace("@g.us", " (Group)");
    };

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Contact Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerContacts, setPickerContacts] = useState<ContactItem[]>([]);
    const [pickerLoading, setPickerLoading] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pickerPage, setPickerPage] = useState(1);
    const [pickerLimit] = useState(20);
    const [pickerTotal, setPickerTotal] = useState(0);
    const [pickerTotalPages, setPickerTotalPages] = useState(1);
    const [selectedContactsMap, setSelectedContactsMap] = useState<Record<string, ContactItem>>({});
    const [addAllLoading, setAddAllLoading] = useState(false);

    // Add Contact State
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [autoAddToBroadcast, setAutoAddToBroadcast] = useState(true);
    const [addContactLoading, setAddContactLoading] = useState(false);

    const getContactRecipient = useCallback((c: ContactItem) => {
        if (c.remoteJidAlt && c.remoteJidAlt.includes("@s.whatsapp.net")) {
            return c.remoteJidAlt.replace("@s.whatsapp.net", "");
        }
        if (c.jid && c.jid.includes("@s.whatsapp.net")) {
            return c.jid.replace("@s.whatsapp.net", "");
        }
        if (c.remoteJidAlt) {
            return c.remoteJidAlt.replace(/[^0-9]/g, "");
        }
        return c.jid.replace(/@s\.whatsapp\.net$/, "");
    }, []);

    const getContactDisplayName = useCallback((c: ContactItem) => {
        return c.name || c.notify || c.verifiedName || formatJid(c.jid);
    }, []);

    const fetchPickerContacts = useCallback(async (page = 1, search = "") => {
        if (!sessionId) return;
        setPickerLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: String(pickerLimit),
                search: search.trim()
            });
            const res = await fetch(`/api/contacts/${sessionId}?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setPickerContacts(data.data || []);
                setPickerTotal(data.meta?.total || 0);
                setPickerTotalPages(data.meta?.totalPages || 1);
                setPickerPage(data.meta?.page || 1);
            } else {
                toast.error("Failed to load contacts");
            }
        } catch (e) {
            console.error("Error loading contacts", e);
            toast.error("Error loading contacts");
        } finally {
            setPickerLoading(false);
        }
    }, [sessionId, pickerLimit]);

    useEffect(() => {
        if (isPickerOpen && sessionId) {
            fetchPickerContacts(pickerPage, pickerSearch);
        }
    }, [isPickerOpen, pickerPage, fetchPickerContacts]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPickerPage(1);
        fetchPickerContacts(1, pickerSearch);
    };

    const toggleSelectContact = (contact: ContactItem) => {
        const key = contact.jid;
        setSelectedContactsMap(prev => {
            const next = { ...prev };
            if (next[key]) {
                delete next[key];
            } else {
                next[key] = contact;
            }
            return next;
        });
    };

    const isAllPageSelected = pickerContacts.length > 0 && pickerContacts.every(c => !!selectedContactsMap[c.jid]);

    const toggleSelectAllOnPage = () => {
        if (isAllPageSelected) {
            setSelectedContactsMap(prev => {
                const next = { ...prev };
                pickerContacts.forEach(c => {
                    delete next[c.jid];
                });
                return next;
            });
        } else {
            setSelectedContactsMap(prev => {
                const next = { ...prev };
                pickerContacts.forEach(c => {
                    next[c.jid] = c;
                });
                return next;
            });
        }
    };

    const handleAddSelectedToBroadcast = () => {
        const selectedList = Object.values(selectedContactsMap);
        if (selectedList.length === 0) {
            toast.warning("No contacts selected");
            return;
        }

        const existing = new Set(
            contacts.split(/[\n,]+/).map(s => s.trim().replace("@s.whatsapp.net", "")).filter(Boolean)
        );

        let addedCount = 0;
        const newNumbers: string[] = [];

        selectedList.forEach(c => {
            const target = getContactRecipient(c);
            if (target && !existing.has(target)) {
                existing.add(target);
                newNumbers.push(target);
                addedCount++;
            }
        });

        if (newNumbers.length > 0) {
            const updated = contacts.trim() 
                ? `${contacts.trim()}\n${newNumbers.join("\n")}`
                : newNumbers.join("\n");
            setContacts(updated);
            toast.success(`Added ${addedCount} contact(s) to broadcast list`);
        } else {
            toast.info("All selected contacts are already in the list");
        }

        setIsPickerOpen(false);
        setSelectedContactsMap({});
    };

    const handleAddAllContacts = async () => {
        if (!sessionId) return;
        if (!confirm(`Are you sure you want to add all ${pickerTotal.toLocaleString()} contacts to the broadcast list?`)) return;
        setAddAllLoading(true);
        try {
            const res = await fetch(`/api/contacts/${sessionId}?limit=all`);
            if (res.ok) {
                const json = await res.json();
                const all = (json.data || []) as ContactItem[];
                const existing = new Set(
                    contacts.split(/[\n,]+/).map(s => s.trim().replace("@s.whatsapp.net", "")).filter(Boolean)
                );
                const toAdd: string[] = [];
                all.forEach(c => {
                    const target = getContactRecipient(c);
                    if (target && !existing.has(target)) {
                        existing.add(target);
                        toAdd.push(target);
                    }
                });
                if (toAdd.length > 0) {
                    const updated = contacts.trim() 
                        ? `${contacts.trim()}\n${toAdd.join("\n")}`
                        : toAdd.join("\n");
                    setContacts(updated);
                    toast.success(`Imported ${toAdd.length} contact(s)!`);
                } else {
                    toast.info("All contacts are already in the list");
                }
                setIsPickerOpen(false);
            } else {
                toast.error("Failed to load all contacts");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error importing all contacts");
        } finally {
            setAddAllLoading(false);
        }
    };

    const handleSaveNewContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) return toast.error("No active session");
        if (!newContactPhone.trim()) return toast.error("Phone number is required");

        setAddContactLoading(true);
        try {
            const res = await fetch(`/api/contacts/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newContactName.trim() || undefined,
                    phone: newContactPhone.trim()
                })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                toast.success("Contact saved successfully");
                
                const cleanPhone = newContactPhone.replace(/[^0-9]/g, "");
                if (autoAddToBroadcast && cleanPhone) {
                    const existing = new Set(
                        contacts.split(/[\n,]+/).map(s => s.trim().replace("@s.whatsapp.net", "")).filter(Boolean)
                    );
                    if (!existing.has(cleanPhone)) {
                        const updated = contacts.trim() ? `${contacts.trim()}\n${cleanPhone}` : cleanPhone;
                        setContacts(updated);
                    }
                }

                setNewContactName("");
                setNewContactPhone("");
                setIsAddContactOpen(false);
                if (isPickerOpen) {
                    fetchPickerContacts(pickerPage, pickerSearch);
                }
            } else {
                toast.error(data.message || "Failed to save contact");
            }
        } catch (err: any) {
            console.error("Error creating contact:", err);
            toast.error("Error creating contact");
        } finally {
            setAddContactLoading(false);
        }
    };

    const tabs = [
        { id: "new" as const, label: "New Broadcast", icon: Send },
        { id: "history" as const, label: "History", icon: History },
    ];

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Broadcast / Blast</h2>
                    <p className="text-muted-foreground text-sm mt-1">Send bulk messages to multiple recipients at once.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === tab.id
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "new" && (
                    <>
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                            {/* Recipients Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-primary" />
                                                Recipients
                                            </CardTitle>
                                            <CardDescription>
                                                Enter numbers or choose from synced contacts.
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                                                onClick={() => {
                                                    setIsPickerOpen(true);
                                                    fetchPickerContacts(1, pickerSearch);
                                                }}
                                                disabled={loading || !sessionId}
                                            >
                                                <Users className="h-3.5 w-3.5 text-primary" />
                                                Select Contacts
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                                                onClick={() => setIsAddContactOpen(true)}
                                                disabled={loading || !sessionId}
                                            >
                                                <UserPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Add Contact
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Target Numbers (one per line or comma-separated)</Label>
                                            {recipientCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setContacts("")}
                                                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-3 w-3" /> Clear list
                                                </button>
                                            )}
                                        </div>
                                        <Textarea
                                            placeholder={"919524972260\n628123456789\n628987654321"}
                                            className="min-h-[200px] font-mono text-sm leading-relaxed"
                                            value={contacts}
                                            onChange={e => setContacts(e.target.value)}
                                            disabled={loading}
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {recipientCount} {recipientCount === 1 ? "recipient" : "recipients"} identified
                                            </span>
                                            <span>Format: country code + phone</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Message Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Message Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Message</Label>
                                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                                <ShieldCheck className="h-3 w-3" /> Anti-Ban Spintax Ready
                                            </span>
                                        </div>
                                        <Textarea
                                            placeholder="Type message with spintax: {Hello|Hi|Hey} {friend|customer}, ..."
                                            className="min-h-[140px]"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            disabled={loading}
                                        />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-muted-foreground pt-0.5">
                                            <span>💡 Spin syntax: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{"{Option 1|Option 2}"}</code></span>
                                            {hasSpintax && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSampleVariation(resolveSpintax(message))}
                                                    className="flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
                                                >
                                                    <Shuffle className="h-3 w-3" />
                                                    Re-spin variation preview
                                                </button>
                                            )}
                                        </div>

                                        {hasSpintax && sampleVariation && (
                                            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-xs space-y-1 animate-in fade-in">
                                                <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 text-[11px]">
                                                    <Sparkles className="h-3.5 w-3.5" /> Sample recipient variation:
                                                </span>
                                                <p className="font-mono text-foreground whitespace-pre-wrap text-xs bg-background/50 p-2 rounded border border-border/50">
                                                    {sampleVariation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label>Delay: {(delay[0] / 1000).toFixed(1)}s</Label>
                                            <Slider
                                                defaultValue={[2000]}
                                                min={1000}
                                                max={15000}
                                                step={500}
                                                value={delay}
                                                onValueChange={setDelay}
                                                disabled={loading}
                                            />
                                            <p className="text-xs text-muted-foreground">Delay antar pesan (+ random).</p>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={handleSend}
                                            disabled={loading || !sessionId || recipientCount === 0 || !message.trim()}
                                        >
                                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                            {loading ? "Broadcasting..." : "Start Broadcast"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Progress */}
                        {broadcastProgress && (
                            <Card className={`border-2 transition-colors ${
                                broadcastProgress.status === "completed"
                                    ? (broadcastProgress.failed === 0 ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : "border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-950/10")
                                    : "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/10"
                            }`}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {broadcastProgress.status === "running" ? (
                                            <><Radio className="h-5 w-5 text-blue-500 animate-pulse" /><span>Broadcast In Progress</span></>
                                        ) : broadcastProgress.failed === 0 ? (
                                            <><CheckCircle2 className="h-5 w-5 text-green-500" /><span>Broadcast Completed</span></>
                                        ) : (
                                            <><AlertTriangle className="h-5 w-5 text-yellow-500" /><span>Broadcast Completed with Errors</span></>
                                        )}
                                    </CardTitle>
                                    <CardDescription>ID: {broadcastProgress.broadcastId}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-mono font-medium">
                                                {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total} ({broadcastProgress.progress || 0}%)
                                            </span>
                                        </div>
                                        <Progress value={broadcastProgress.progress || 0} className="h-3" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-green-600">{broadcastProgress.sent}</div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <CheckCircle2 className="h-3 w-3" /> Sent
                                            </div>
                                        </div>
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-red-500">{broadcastProgress.failed}</div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <XCircle className="h-3 w-3" /> Failed
                                            </div>
                                        </div>
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-muted-foreground">
                                                {broadcastProgress.total - broadcastProgress.sent - broadcastProgress.failed}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" /> Pending
                                            </div>
                                        </div>
                                    </div>

                                    {broadcastProgress.status === "running" && broadcastProgress.current && (
                                        <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted/50 rounded-lg">
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                            <span className="text-muted-foreground">Now sending:</span>
                                            <span className="font-mono font-medium">{formatJid(broadcastProgress.current)}</span>
                                        </div>
                                    )}

                                    {broadcastProgress.status === "completed" && broadcastProgress.errors && broadcastProgress.errors.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                                <XCircle className="h-4 w-4" /> Failed ({broadcastProgress.errors.length})
                                            </h4>
                                            <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-950/30 rounded-lg p-2 space-y-1">
                                                {broadcastProgress.errors.map((err, i) => (
                                                    <div key={i} className="flex justify-between items-center text-xs py-1 px-2 bg-background/60 rounded">
                                                        <span className="font-mono">{formatJid(err.jid)}</span>
                                                        <span className="text-red-500 truncate ml-2 max-w-[200px]">{err.error}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {activeTab === "history" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Broadcast History
                            </CardTitle>
                            <CardDescription>History of sent broadcasts, stored permanently.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">Belum ada broadcast.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map(log => (
                                        <div key={log.id}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                                        >
                                            {/* Status icon */}
                                            <div className="shrink-0">
                                                {log.status === "completed" ? (
                                                    log.failed === 0
                                                        ? <CheckCircle2 className="h-8 w-8 text-green-500" />
                                                        : <AlertTriangle className="h-8 w-8 text-yellow-500" />
                                                ) : (
                                                    <Radio className="h-8 w-8 text-blue-500 animate-pulse" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{log.message}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" /> {log.sent}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3 text-red-500" /> {log.failed}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {formatTime(log.startedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* View button */}
                                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => openDetail(log)}>
                                                <Eye className="h-4 w-4 mr-1" /> Detail
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Detail Modal */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedLog?.status === "completed"
                                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    : <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
                                }
                                Broadcast Detail
                            </DialogTitle>
                        </DialogHeader>

                        {detailLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : selectedLog ? (
                            <div className="flex flex-col gap-4 overflow-hidden min-h-0">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold text-green-600">{selectedLog.sent}</div>
                                        <div className="text-xs text-muted-foreground">Sent</div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold text-red-500">{selectedLog.failed}</div>
                                        <div className="text-xs text-muted-foreground">Failed</div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                                        <div className="text-xl font-bold">{selectedLog.total}</div>
                                        <div className="text-xs text-muted-foreground">Total</div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Message:</p>
                                    <p className="text-sm whitespace-pre-wrap break-words">{selectedLog.message}</p>
                                </div>

                                {/* Time */}
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>Started: {formatTime(selectedLog.startedAt)}</span>
                                    {selectedLog.completedAt && <span>Completed: {formatTime(selectedLog.completedAt)}</span>}
                                </div>

                                {/* Recipients list */}
                                {selectedLog.recipients && selectedLog.recipients.length > 0 && (
                                    <div className="flex-1 overflow-y-auto min-h-0">
                                        <h4 className="text-sm font-semibold mb-2">Recipients ({selectedLog.recipients.length})</h4>
                                        <div className="space-y-1">
                                            {selectedLog.recipients.map(r => (
                                                <div key={r.id}
                                                    className={`flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded ${
                                                        r.status === "sent" ? "bg-green-500/5" :
                                                        r.status === "failed" ? "bg-red-500/5" : "bg-muted/30"
                                                    }`}
                                                >
                                                    <span className="font-mono truncate">{formatJid(r.jid)}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                                                            r.status === "sent" ? "text-green-600 bg-green-500/10" :
                                                            r.status === "failed" ? "text-red-500 bg-red-500/10" : "text-muted-foreground bg-muted/50"
                                                        }`}>
                                                            {r.status}
                                                        </span>
                                                        {r.error && (
                                                            <span className="text-red-500 max-w-[200px] truncate" title={r.error}>{r.error}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>

                {/* Contact Picker Dialog */}
                <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-5 pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    Select Contacts for Broadcast
                                </DialogTitle>
                            </div>
                            <DialogDescription>
                                Choose from your synced WhatsApp address book ({pickerTotal.toLocaleString()} contacts available).
                            </DialogDescription>
                        </DialogHeader>

                        {/* Search & Actions Bar */}
                        <div className="px-5 py-3 border-b bg-muted/20 space-y-3">
                            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contact name or phone number..."
                                        value={pickerSearch}
                                        onChange={e => setPickerSearch(e.target.value)}
                                        className="pl-9 h-9"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary" className="h-9 px-3">
                                    Search
                                </Button>
                                {pickerSearch && (
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-9 px-2 text-xs"
                                        onClick={() => {
                                            setPickerSearch("");
                                            fetchPickerContacts(1, "");
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </form>

                            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs px-2 cursor-pointer"
                                        onClick={toggleSelectAllOnPage}
                                        disabled={pickerContacts.length === 0}
                                    >
                                        {isAllPageSelected ? "Deselect Page" : "Select Current Page"}
                                    </Button>
                                    {Object.keys(selectedContactsMap).length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-muted-foreground hover:text-destructive px-2 cursor-pointer"
                                            onClick={() => setSelectedContactsMap({})}
                                        >
                                            Clear Selection
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={Object.keys(selectedContactsMap).length > 0 ? "default" : "secondary"}>
                                        {Object.keys(selectedContactsMap).length} selected
                                    </Badge>
                                    {pickerTotal > 0 && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 text-xs px-2.5 font-medium cursor-pointer"
                                            onClick={handleAddAllContacts}
                                            disabled={addAllLoading}
                                        >
                                            {addAllLoading ? (
                                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                            ) : (
                                                <Plus className="h-3 w-3 mr-1" />
                                            )}
                                            Import All ({pickerTotal.toLocaleString()})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contacts List Body */}
                        <div className="flex-1 overflow-y-auto p-3 min-h-[280px]">
                            {pickerLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-sm">Loading contacts...</p>
                                </div>
                            ) : pickerContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Users className="h-10 w-10 stroke-1 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">No contacts found</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {pickerSearch ? "Try searching with a different term" : "No synced contacts available yet for this session"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {pickerContacts.map(contact => {
                                        const isSelected = !!selectedContactsMap[contact.jid];
                                        const phone = getContactRecipient(contact);
                                        const displayName = getContactDisplayName(contact);
                                        const isAlreadyInBroadcast = contacts.includes(phone);

                                        return (
                                            <div
                                                key={contact.jid}
                                                onClick={() => toggleSelectContact(contact)}
                                                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                                    isSelected
                                                        ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs"
                                                        : "border-transparent hover:border-border hover:bg-muted/40"
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelectContact(contact)}
                                                    className="data-[state=checked]:bg-primary"
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                                                    {(displayName[0] || "?").toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {displayName}
                                                        </p>
                                                        {isAlreadyInBroadcast && (
                                                            <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground border-dashed">
                                                                In list
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono truncate">
                                                        {phone}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer with Pagination and Submit */}
                        <DialogFooter className="p-4 border-t bg-muted/10 sm:justify-between items-center gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    Page {pickerPage} of {pickerTotalPages || 1}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={pickerPage <= 1 || pickerLoading}
                                        onClick={() => {
                                            const newPage = pickerPage - 1;
                                            setPickerPage(newPage);
                                            fetchPickerContacts(newPage, pickerSearch);
                                        }}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={pickerPage >= pickerTotalPages || pickerLoading}
                                        onClick={() => {
                                            const newPage = pickerPage + 1;
                                            setPickerPage(newPage);
                                            fetchPickerContacts(newPage, pickerSearch);
                                        }}
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsPickerOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddSelectedToBroadcast}
                                    disabled={Object.keys(selectedContactsMap).length === 0}
                                    className="gap-1.5 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Selected ({Object.keys(selectedContactsMap).length})
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Quick Add Contact Dialog */}
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Add New Contact
                            </DialogTitle>
                            <DialogDescription>
                                Save a new contact to your session address book and optionally add it directly to this broadcast.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveNewContact} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Contact Name</Label>
                                <Input
                                    id="contact-name"
                                    placeholder="e.g. Alex Johnson"
                                    value={newContactName}
                                    onChange={e => setNewContactName(e.target.value)}
                                    disabled={addContactLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact-phone">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="contact-phone"
                                        type="tel"
                                        placeholder="e.g. 919524972260 or 628123456789"
                                        value={newContactPhone}
                                        onChange={e => setNewContactPhone(e.target.value)}
                                        className="pl-9 font-mono"
                                        required
                                        disabled={addContactLoading}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Include country code without special characters (e.g., 91 for India, 62 for Indonesia).
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="auto-add"
                                    checked={autoAddToBroadcast}
                                    onCheckedChange={checked => setAutoAddToBroadcast(!!checked)}
                                />
                                <Label htmlFor="auto-add" className="text-xs font-normal cursor-pointer select-none">
                                    Automatically add this number to current broadcast list
                                </Label>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddContactOpen(false)}
                                    disabled={addContactLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addContactLoading || !newContactPhone.trim()} className="gap-1.5 cursor-pointer">
                                    {addContactLoading ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    {addContactLoading ? "Saving..." : "Save Contact"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </SessionGuard>
    );
}
