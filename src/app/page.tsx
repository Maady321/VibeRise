"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAlarmStore } from '@/hooks/use-alarm-store';
import { AlarmFormDialog } from '@/components/alarm-form-dialog';
import { AlarmList } from '@/components/alarm-list';
import type { Alarm } from '@/types';
import { AppHeader } from '@/components/header';
import { Power } from 'lucide-react';

export default function Home() {
  const {
    alarms,
    isLoading,
    showStopButton,
    triggerStopAlarm,
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

  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Alarms</h2>
          <Button onClick={handleAddAlarm}>Add Alarm</Button>
        </div>

        <AlarmList
          isLoading={isLoading}
          alarms={alarms}
          onEdit={handleEditAlarm}
        />

        {showStopButton && (
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
      </main>

      <AlarmFormDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        alarm={editingAlarm}
      />
    </div>
  );
}
