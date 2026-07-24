import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const useSessionTimeout = (isAuthenticated: boolean) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleLogout = async () => {
            try {
                console.log("[useSessionTimeout] LOGOUT TRIGGERED: 10-minute inactivity timeout reached!");
                await supabase.auth.signOut();
                // Use window.location for a hard refresh to clear all states
                window.location.href = '/login?reason=timeout';
            } catch (error) {
                console.error('[useSessionTimeout] Error logging out due to inactivity:', error);
            }
        };

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Only set timer if user is authenticated
            if (isAuthenticated) {
                timerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT_MS);
            }
        };

        const handleActivity = () => {
            resetTimer();
        };

        // Events that indicate user activity (using capture phase to intercept stopped propagation)
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'input',
        ];

        if (isAuthenticated) {
            // Set initial timer
            resetTimer();

            // Add event listeners in capture phase
            events.forEach((event) => {
                window.addEventListener(event, handleActivity, { capture: true, passive: true });
            });
        }

        return () => {
            // Cleanup
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity, { capture: true });
            });
        };
    }, [isAuthenticated]);
};
