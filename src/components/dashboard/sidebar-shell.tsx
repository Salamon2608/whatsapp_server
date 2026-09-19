"use client";

import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarShellProps {
    appName: string;
    userName?: string | null;
    userEmail?: string | null;
    version: string;
}

export function SidebarShell({ appName, userName, userEmail, version }: SidebarShellProps) {
    const { isCollapsed } = useSidebar();

    return (
        <aside
            className={`
                bg-card border-r border-border
                hidden md:flex flex-col h-full sticky left-0 top-0 z-20
                transition-all duration-200 ease-out
                ${isCollapsed ? "w-[68px]" : "w-[240px]"}
            `}
        >
            {/* Logo / Brand Header */}
            <div className={`h-14 shrink-0 flex items-center border-b border-border transition-all duration-200 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
                {isCollapsed ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm font-semibold text-foreground truncate leading-tight">
                                {appName}
                            </h1>
                            <p className="text-[10px] text-muted-foreground font-medium truncate">WhatsApp Gateway</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <SidebarNav />

            {/* User Footer */}
            <div 
                suppressHydrationWarning={true}
                className={`shrink-0 border-t border-border bg-card transition-all duration-200 ${isCollapsed ? "p-2" : "p-3"}`}
            >
                {isCollapsed ? (
                    <div suppressHydrationWarning={true} className="flex flex-col items-center gap-2">
                        <div suppressHydrationWarning={true} className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            title="Sign out"
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div suppressHydrationWarning={true} className="flex items-center gap-2.5 mb-2.5">
                            <div 
                                suppressHydrationWarning={true}
                                className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary"
                            >
                                {userName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div suppressHydrationWarning={true} className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{userName || "User"}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 text-xs h-7 rounded-lg border-border hover:bg-muted hover:text-foreground transition-colors"
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        >
                            <LogOut size={13} /> Sign Out
                        </Button>
                        <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5 font-mono">v{version}</p>
                    </>
                )}
            </div>
        </aside>
    );
}
