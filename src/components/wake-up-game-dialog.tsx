"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alarm } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface WakeUpGameDialogProps {
  isOpen: boolean;
  onGameWin: () => void;
  alarm: Alarm | null;
}

const COLORS = ['red', 'green', 'blue', 'yellow'];
const SEQUENCE_LENGTH = 4;

export function WakeUpGameDialog({ isOpen, onGameWin, alarm }: WakeUpGameDialogProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [message, setMessage] = useState('Memorize the sequence!');
  const { toast } = useToast();

  const generateSequence = useCallback(() => {
    const newSequence = Array.from({ length: SEQUENCE_LENGTH }, () =>
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    setSequence(newSequence);
    setPlayerSequence([]);
    return newSequence;
  }, []);

  const displaySequence = useCallback(async (seq: string[]) => {
    setIsDisplaying(true);
    setMessage('Watch carefully...');
    for (const color of seq) {
      setActiveColor(color);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveColor(null);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setActiveColor(null);
    setIsDisplaying(false);
    setMessage('Your turn!');
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      const newSequence = generateSequence();
      setTimeout(() => displaySequence(newSequence), 1000);
    }
  }, [isOpen, generateSequence, displaySequence]);


  const handleColorClick = (color: string) => {
    if (isDisplaying || !isOpen) return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (sequence[newPlayerSequence.length - 1] !== color) {
      toast({
        variant: 'destructive',
        title: 'Wrong Move!',
        description: "That's not right. The sequence will restart.",
      });
      const newSequence = generateSequence();
      setTimeout(() => displaySequence(newSequence), 1000);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      toast({
        title: 'Success!',
        description: "You've silenced the alarm. Great job!",
      });
      onGameWin();
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Wake Up Challenge!</DialogTitle>
          <DialogDescription>
            {alarm?.label ? `For alarm: "${alarm.label}" at ${alarm.time}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 my-6">
            <p className="text-lg font-medium">{message}</p>
            <div className="grid grid-cols-2 gap-4">
                {COLORS.map((color) => (
                <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    disabled={isDisplaying}
                    className={cn(
                    'h-24 w-24 rounded-lg transition-all duration-200 disabled:cursor-not-allowed',
                    `bg-${color}-500`,
                    {
                        'animate-pulse ring-4 ring-offset-2 ring-white': activeColor === color,
                        'hover:scale-105 active:scale-95': !isDisplaying,
                    }
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`color ${color}`}
                />
                ))}
            </div>
        </div>
         <DialogFooter>
             <p className="text-xs text-muted-foreground text-center w-full">You must complete the challenge to stop the alarm.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
