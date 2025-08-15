"use client";

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';
import type { Alarm } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Hardcoded device ID. In a multi-device application, this would be dynamic.
const deviceId = 'test-device-123';
const alarmsRef = ref(database, `devices/${deviceId}/alarms`);
const stopAlarmRef = ref(database, `devices/${deviceId}/commands/stopAlarm`);

const STOP_BUTTON_STORAGE_KEY = 'esp32-show-stop-button';

export const useAlarmStore = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showStopButton, setShowStopButtonState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load the 'showStopButton' setting from localStorage, as it's a local UI preference.
    try {
      const storedShowStopButton = localStorage.getItem(STOP_BUTTON_STORAGE_KEY);
      if (storedShowStopButton) {
        setShowStopButtonState(JSON.parse(storedShowStopButton));
      }
    } catch (error) {
      console.error("Failed to read showStopButton from localStorage", error);
    }

    // Subscribe to real-time updates from Firebase for the alarms list.
    const unsubscribe = onValue(alarmsRef, (snapshot) => {
      const data = snapshot.val();
      const alarmsArray: Alarm[] = data 
        ? Object.keys(data).map(key => ({ id: key, ...data[key] })) 
        : [];
      setAlarms(alarmsArray);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase read failed: ", error);
      toast({
        variant: "destructive",
        title: "Error connecting to database",
        description: "Could not fetch alarms. Please check your Firebase configuration and network connection.",
      });
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts.
    return () => unsubscribe();
  }, [toast]);

  const setShowStopButton = useCallback((show: boolean) => {
      setShowStopButtonState(show);
      try {
        localStorage.setItem(STOP_BUTTON_STORAGE_KEY, JSON.stringify(show));
      } catch (error) {
        console.error("Failed to write showStopButton to localStorage", error);
      }
  }, []);

  const addAlarm = useCallback(async (alarmData: Omit<Alarm, 'id'>) => {
    try {
      const newAlarmRef = push(alarmsRef);
      await set(newAlarmRef, alarmData);
      toast({ title: "Alarm Added", description: "Your new alarm has been set." });
    } catch (error) {
      console.error("Failed to add alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add new alarm." });
    }
  }, [toast]);

  const updateAlarm = useCallback(async (id: string, alarmData: Partial<Omit<Alarm, 'id'>>) => {
    try {
      const alarmToUpdateRef = ref(database, `devices/${deviceId}/alarms/${id}`);
      await update(alarmToUpdateRef, alarmData);
      toast({ title: "Alarm Updated", description: "Your alarm has been successfully updated." });
    } catch (error) {
      console.error("Failed to update alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update alarm." });
    }
  }, [toast]);
  
  const deleteAlarm = useCallback(async (id: string) => {
    try {
      const alarmToDeleteRef = ref(database, `devices/${deviceId}/alarms/${id}`);
      await remove(alarmToDeleteRef);
      toast({ title: "Alarm Deleted", description: "The alarm has been removed." });
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete alarm." });
    }
  }, [toast]);

  const toggleAlarm = useCallback(async (id: string, enabled: boolean) => {
    try {
        const alarmToUpdateRef = ref(database, `devices/${deviceId}/alarms/${id}`);
        // Update only the 'enabled' field in Firebase. No toast for this action for a smoother UX.
        await update(alarmToUpdateRef, { enabled });
    } catch (error) {
        console.error("Failed to toggle alarm:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to toggle alarm." });
    }
  }, [toast]);

  const triggerStopAlarm = useCallback(async () => {
    try {
      // Set the stopAlarm command to true. The ESP32 will listen for this change.
      await set(stopAlarmRef, true);
      toast({ title: "Command Sent", description: "Stop alarm command sent to ESP32." });
    } catch (error) {
      console.error("Failed to send stop command:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send stop command." });
    }
  }, [toast]);

  return { alarms, isLoading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, triggerStopAlarm, showStopButton, setShowStopButton };
};
