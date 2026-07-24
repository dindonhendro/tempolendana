import { useEffect, useRef } from 'react';

interface UseIdleTimeoutProps {
  onIdle: () => void;
  idleTime?: number; // in milliseconds
}

export const useIdleTimeout = ({ onIdle, idleTime = 600000 }: UseIdleTimeoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Keep onIdleRef updated with the latest callback
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onIdleRef.current();
    }, idleTime);
  };

  useEffect(() => {
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

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners in capture phase
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { capture: true, passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, { capture: true });
      });
    };
  }, [idleTime]);
};
