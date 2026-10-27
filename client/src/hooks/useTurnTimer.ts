// client/src/hooks/useTurnTimer.ts
import { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';

interface UseTurnTimerProps {
  isActive: boolean;
  isMyTurn: boolean;
  turnKey: string | number;
  initialTime?: number;
  onTimeout: (timedOutUser: 'me' | 'opponent') => void;
}

export function useTurnTimer({
  isActive,
  isMyTurn,
  turnKey,
  initialTime = 30,
  onTimeout
}: UseTurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // Reset timer whenever the turn changes
  useEffect(() => {
    if (isActive) {
      setTimeLeft(initialTime);
    }
  }, [turnKey, isActive, initialTime]);

  // Countdown effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeoutRef.current(isMyTurn ? 'me' : 'opponent');
          return 0;
        }

        // Low time tick sound
        if (prev <= 6) {
          sound.play('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isMyTurn, turnKey]);

  return {
    timeLeft,
    percent: Math.round((timeLeft / initialTime) * 100)
  };
}
