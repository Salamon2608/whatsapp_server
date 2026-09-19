"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Home, Rocket, Calendar, Search, RefreshCw, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MessageLogItem {
    id: string;
    messageFrom: string;
    messageTo: string;
    messageType: string;
    requestType: string;
    content: string;
    status: string;
    requestedAt: string;
}

interface MessageReportData {
    stats: {
        totalMessages: number;
        todaysMessages: number;
        last30DaysMessages: number;
    };
    logs: MessageLogItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function MessageLogsView() {
    const [data, setData] = useState<MessageReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: "15",
                search,
                type: typeFilter
            });
            const res = await fetch(`/api/reports/messages?${query.toString()}`);
            const result = await res.json();
            if (result.status) {
                setData(result.data);
            }
        } catch (e) {
            console.error("Failed to load message logs:", e);
        } finally {
            setLoading(false);
        }
    }, [page, search, typeFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const formatDate = (isoString: string) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Breadcrumb Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <Link href="/dashboard" className="hover:underline flex items-center gap-1.5">
                        <Home className="h-4 w-4" />
                    </Link>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-foreground">Messages log reports</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-muted-foreground">user</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-blue-600">logs</span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                    <Link
                        href="/dashboard/reports/webhooks"
                        className="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:text-foreground transition-all"
                    >
                        Webhooks Logs
                    </Link>
                    <Link
                        href="/dashboard/reports/messages"
                        className="px-3 py-1.5 rounded-md font-medium bg-background text-foreground shadow-xs transition-all"
                    >
                        Messages Logs
                    </Link>
                </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Total Messages */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.totalMessages.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Total Messages
                            </p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shrink-0">
                            <Rocket className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Messages */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.todaysMessages.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Todays Messages
                            </p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Calendar className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    </CardContent>
                </Card>

                {/* Last 30 days Messages */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.last30DaysMessages.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Last 30 days Messages
                            </p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
                            <Calendar className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/40 shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search phone or text..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm focus:ring-1 focus:ring-primary outline-hidden"
                    >
                        <option value="ALL">All Types</option>
                        <option value="TEXT">Plain Text</option>
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="AUDIO">Audio</option>
                        <option value="DOCUMENT">Document</option>
                    </select>

                    <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="h-9 gap-1.5">
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Main Log Table */}
            <Card className="border border-border/40 shadow-sm bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                <th className="py-3.5 px-4 sm:px-6">Message From</th>
                                <th className="py-3.5 px-4 sm:px-6">Message To</th>
                                <th className="py-3.5 px-4 sm:px-6">Message Type</th>
                                <th className="py-3.5 px-4 sm:px-6">Request Type</th>
                                <th className="py-3.5 px-4 sm:px-6 text-right">Requested At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-28" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-28" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-20" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-16" /></td>
                                        <td className="py-4 px-4 sm:px-6 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : data?.logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                        No message logs found.
                                    </td>
                                </tr>
                            ) : (
                                data?.logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Message From */}
                                        <td className="py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                                            {log.messageFrom}
                                        </td>

                                        {/* Message To */}
                                        <td className="py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                            {log.messageTo}
                                        </td>

                                        {/* Message Type */}
                                        <td className="py-4 px-4 sm:px-6 text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                                            {log.messageType}
                                        </td>

                                        {/* Request Type */}
                                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {log.requestType}
                                            </span>
                                        </td>

                                        {/* Requested At */}
                                        <td className="py-4 px-4 sm:px-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(log.requestedAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {data && data.pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            Page <span className="font-semibold text-foreground">{data.pagination.page}</span> of{" "}
                            <span className="font-semibold text-foreground">{data.pagination.totalPages}</span> ({data.pagination.total} entries)
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="h-8 gap-1"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page >= data.pagination.totalPages}
                                className="h-8 gap-1"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
