"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Home, Rocket, Calendar, AlertCircle, Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WebhookLogItem {
    id: string;
    device: string;
    hookUrl: string;
    payload: any;
    status: "SENT" | "FAILED";
    httpStatus: number;
    requestedAt: string;
}

interface WebhookReportData {
    stats: {
        totalPayloads: number;
        sentHooks: number;
        failedHooks: number;
    };
    logs: WebhookLogItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function WebhookLogsView() {
    const [data, setData] = useState<WebhookReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: "15",
                search,
                status: statusFilter
            });
            const res = await fetch(`/api/reports/webhooks?${query.toString()}`);
            const result = await res.json();
            if (result.status) {
                setData(result.data);
            }
        } catch (e) {
            console.error("Failed to load webhook logs:", e);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

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
                    <span className="text-foreground">Webhooks log reports</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-muted-foreground">user</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-blue-600">webhooks</span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                    <Link
                        href="/dashboard/reports/webhooks"
                        className="px-3 py-1.5 rounded-md font-medium bg-background text-foreground shadow-xs transition-all"
                    >
                        Webhooks Logs
                    </Link>
                    <Link
                        href="/dashboard/reports/messages"
                        className="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:text-foreground transition-all"
                    >
                        Messages Logs
                    </Link>
                </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Total Payloads */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.totalPayloads.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Total Payloads
                            </p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shrink-0">
                            <Rocket className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    </CardContent>
                </Card>

                {/* Sent Hooks */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.sentHooks.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Sent Hooks
                            </p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Calendar className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    </CardContent>
                </Card>

                {/* Failed Hooks */}
                <Card className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                {loading ? <Skeleton className="h-9 w-24" /> : data?.stats.failedHooks.toLocaleString() ?? "0"}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                Failed Hooks
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
                        placeholder="Search URL or Event..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm focus:ring-1 focus:ring-primary outline-hidden"
                    >
                        <option value="ALL">All Status</option>
                        <option value="SUCCESS">Sent / Success</option>
                        <option value="FAILED">Failed</option>
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
                                <th className="py-3.5 px-4 sm:px-6">Device</th>
                                <th className="py-3.5 px-4 sm:px-6">Hook URL</th>
                                <th className="py-3.5 px-4 sm:px-6 min-w-[200px]">Payload</th>
                                <th className="py-3.5 px-4 sm:px-6">Status</th>
                                <th className="py-3.5 px-4 sm:px-6">HTTP Status</th>
                                <th className="py-3.5 px-4 sm:px-6 text-right">Requested At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-20" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-48" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-12 w-48 rounded-md" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-6 w-14 rounded-full" /></td>
                                        <td className="py-4 px-4 sm:px-6"><Skeleton className="h-4 w-10" /></td>
                                        <td className="py-4 px-4 sm:px-6 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : data?.logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                        No webhook execution records found.
                                    </td>
                                </tr>
                            ) : (
                                data?.logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Device */}
                                        <td className="py-4 px-4 sm:px-6 font-medium text-foreground whitespace-nowrap">
                                            {log.device}
                                        </td>

                                        {/* Hook URL */}
                                        <td className="py-4 px-4 sm:px-6 text-muted-foreground font-mono text-xs max-w-xs truncate" title={log.hookUrl}>
                                            <a href={log.hookUrl} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary inline-flex items-center gap-1">
                                                {log.hookUrl}
                                                <ExternalLink className="h-3 w-3 opacity-60" />
                                            </a>
                                        </td>

                                        {/* Payload Box */}
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="relative group">
                                                <textarea
                                                    readOnly
                                                    value={typeof log.payload === "object" ? JSON.stringify(log.payload, null, 2) : String(log.payload)}
                                                    className="w-full max-w-sm h-14 text-[11px] font-mono p-2 rounded-lg border border-border/40 bg-muted/40 text-muted-foreground resize-y focus:outline-hidden styled-scrollbar"
                                                />
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                                                    log.status === "SENT"
                                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                                        : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                                                )}
                                            >
                                                {log.status}
                                            </Badge>
                                        </td>

                                        {/* HTTP Status */}
                                        <td className="py-4 px-4 sm:px-6 font-mono text-sm text-foreground">
                                            <span className={cn(
                                                log.httpStatus >= 200 && log.httpStatus < 300 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"
                                            )}>
                                                {log.httpStatus}
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
