"use client";

import { useEffect } from "react";

export function UpdateChecker() {
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                // Check sessionStorage to avoid spamming GitHub API on every navigation/reload
                const lastCheck = sessionStorage.getItem("wa_last_update_check");
                const now = Date.now();
                if (lastCheck && now - Number(lastCheck) < 60 * 60 * 1000) {
                    return;
                }
                sessionStorage.setItem("wa_last_update_check", String(now));

                await fetch('/api/system/check-updates', { method: 'POST' });
            } catch (error) {
                // Silent catch for background check
            }
        };

        checkUpdates();
    }, []);

    return null; // Invisible component
}
