"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAlarmStore } from '@/hooks/use-alarm-store';
import { AlarmFormDialog } from '@/components/alarm-form-dialog';
import { AlarmList } from '@/components/alarm-list';
import type { Alarm } from '@/types';
import { Power, WifiOff } from 'lucide-react';
import { WakeUpGameDialog } from '@/components/wake-up-game-dialog';

export function AlarmTab() {
  const {
    alarms,
    isLoading,
    showStopButton,
    triggerStopAlarm,
    deviceId,
    ringingAlarm,
    stopRinging,
  } = useAlarmStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const handleAddAlarm = () => {
    setEditingAlarm(null);
    setDialogOpen(true);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setDialogOpen(true);
  };

  const handleStopAlarm = () => {
    triggerStopAlarm();
  }

  const handleGameWin = () => {
    stopRinging();
    triggerStopAlarm();
  };

  return (
    <div className="w-full">
        {!deviceId ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed">
                <WifiOff className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Device Connected</h3>
                <p className="text-muted-foreground mt-2">
                Please connect to an ESP32 device using the button in the header.
                </p>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Your Alarms</h2>
                    <Button onClick={handleAddAlarm}>Add Alarm</Button>
                </div>

                <AlarmList
                    isLoading={isLoading}
                    alarms={alarms}
                    onEdit={handleEditAlarm}
                />
            </>
        )}

        {showStopButton && deviceId && !ringingAlarm && (
          <div className="fixed bottom-8 right-8">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full w-20 h-20 shadow-lg animate-pulse"
              onClick={handleStopAlarm}
              aria-label="Stop All Alarms"
            >
              <Power className="w-8 h-8" />
            </Button>
          </div>
        )}

      <AlarmFormDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        alarm={editingAlarm}
      />

      <WakeUpGameDialog
        isOpen={!!ringingAlarm}
        onGameWin={handleGameWin}
        alarm={ringingAlarm}
      />
    </div>
  );
}
