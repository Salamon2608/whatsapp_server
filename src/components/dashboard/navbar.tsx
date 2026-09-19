"use client";

import { useState, useEffect } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SessionSelector } from "@/components/dashboard/session-selector";
import { Button } from "@/components/ui/button";
import { RealtimeClock } from "@/components/dashboard/realtime-clock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Inbox, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { ThemePickerMenu } from "@/components/dashboard/theme-picker-menu";

interface NavbarProps {
    appName?: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    href?: string;
    createdAt: string;
}

export function Navbar({ appName }: NavbarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const responseData = await res.json();
                const items = responseData?.data || [];
                setNotifications(items);
                setUnreadCount(items.filter((n: Notification) => !n.read).length);
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Setup Socket.IO connection
        if (session?.user?.id) {
            const socketInstance = io({
                path: "/api/socket/io",
            });

            socketInstance.on("connect", () => {
                console.log("Socket connected for notifications");
                // Join user-specific room
                socketInstance.emit("join-user-room", session.user.id);
            });

            socketInstance.on("notification:new", (notification: Notification) => {
                console.log("New notification received:", notification);

                // Add to notifications list
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show toast popup
                toast.info(notification.title, {
                    description: notification.message,
                    action: notification.href ? {
                        label: "View",
                        onClick: () => router.push(notification.href!)
                    } : undefined,
                });
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [session?.user?.id]);

    const markAsRead = async (id?: string) => {
        try {
            const ids = id ? [id] : []; // Empty array means mark all
            const res = await fetch("/api/notifications/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                }
            }
        } catch (e) {
            console.error("Failed to mark read");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/delete?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setUnreadCount(prev => {
                    const notification = notifications.find(n => n.id === id);
                    return notification && !notification.read ? Math.max(0, prev - 1) : prev;
                });
                toast.success("Notification deleted");
            }
        } catch (e) {
            console.error("Failed to delete notification");
            toast.error("Failed to delete notification");
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id);
        if (n.href) router.push(n.href);
        setIsOpen(false);
    };

    return (
        <header className="bg-background/80 backdrop-blur-md border-b border-border h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full">
            <div className="flex items-center gap-3">
                <MobileNav appName={appName} />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <span className="hidden sm:inline"><RealtimeClock /></span>
                <SessionSelector />
                <div className="h-5 w-px bg-border hidden sm:block" />

                <ThemePickerMenu />
                <ModeToggle />

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-lg h-9 w-9">
                            <Bell className={`h-4 w-4 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full animate-pulse ring-2 ring-background" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-xl border border-border bg-card shadow-xl" align="end">
                        <div className="p-3.5 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}.` : "No new notifications."}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 py-1 px-2 text-xs" onClick={() => { router.push("/dashboard/inbox"); setIsOpen(false); }}>
                                    See all
                                </Button>
                                {unreadCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => markAsRead()} className="h-7 py-1 px-2 text-xs">
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="min-h-[140px] flex flex-col items-center justify-center text-center p-4">
                                    <div className="bg-muted p-2.5 rounded-full mb-2.5">
                                        <Inbox className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs font-medium text-foreground">No new notifications</p>
                                    <p className="text-[11px] text-muted-foreground max-w-[180px] mt-0.5">We'll notify you when something important arrives.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3.5 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div
                                                    className="flex-1 space-y-1 cursor-pointer"
                                                    onClick={() => handleNotificationClick(n)}
                                                >
                                                    <p className={`text-xs font-semibold leading-snug ${!n.read ? 'text-primary' : 'text-foreground'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/70">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {!n.read && <span className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(n.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
