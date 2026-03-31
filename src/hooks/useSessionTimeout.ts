import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export const useSessionTimeout = (isAuthenticated: boolean) => {
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Use window.location for a hard refresh to clear all states
            window.location.href = '/login?reason=timeout';
        } catch (error) {
            console.error('Error logging out due to inactivity:', error);
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

    useEffect(() => {
        // List of events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
        ];

        const handleActivity = () => {
            resetTimer();
        };

        if (isAuthenticated) {
            // Set initial timer
            resetTimer();

            // Add event listeners
            events.forEach((event) => {
                window.addEventListener(event, handleActivity, { passive: true });
            });
        }

        return () => {
            // Cleanup
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated]);
};
