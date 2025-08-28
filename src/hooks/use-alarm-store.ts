"use client";

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, update, remove, Unsubscribe } from 'firebase/database';
import type { Alarm } from '@/types';
import { useToast } from "@/hooks/use-toast";

const STOP_BUTTON_STORAGE_KEY = 'esp32-show-stop-button';
const DEVICE_ID_STORAGE_KEY = 'esp32-device-id';

export const useAlarmStore = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showStopButton, setShowStopButtonState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceIdState] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedShowStopButton = localStorage.getItem(STOP_BUTTON_STORAGE_KEY);
      if (storedShowStopButton) {
        setShowStopButtonState(JSON.parse(storedShowStopButton));
      }
      const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      setDeviceIdState(storedDeviceId);
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    if (deviceId) {
      setIsLoading(true);
      const alarmsRef = ref(database, `devices/${deviceId}/alarms`);
      unsubscribe = onValue(alarmsRef, (snapshot) => {
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
          description: "Could not fetch alarms. Please check your device ID and network connection.",
        });
        setAlarms([]);
        setIsLoading(false);
      });
    } else {
      setAlarms([]);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deviceId, toast]);

  const setDeviceId = useCallback((id: string | null) => {
    setDeviceIdState(id);
    try {
      if (id) {
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
      } else {
        localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to write deviceId to localStorage", error);
    }
  }, []);

  const setShowStopButton = useCallback((show: boolean) => {
      setShowStopButtonState(show);
      try {
        localStorage.setItem(STOP_BUTTON_STORAGE_KEY, JSON.stringify(show));
      } catch (error) {
        console.error("Failed to write showStopButton to localStorage", error);
      }
  }, []);

  const addAlarm = useCallback(async (alarmData: Omit<Alarm, 'id'>) => {
    if (!deviceId) return;
    try {
      const alarmsRef = ref(database, `devices/${deviceId}/alarms`);
      const newAlarmRef = push(alarmsRef);
      await set(newAlarmRef, alarmData);
      toast({ title: "Alarm Added", description: "Your new alarm has been set." });
    } catch (error) {
      console.error("Failed to add alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add new alarm." });
    }
  }, [deviceId, toast]);

  const updateAlarm = useCallback(async (id: string, alarmData: Partial<Omit<Alarm, 'id'>>) => {
    if (!deviceId) return;
    try {
      const alarmToUpdateRef = ref(database, `devices/${deviceId}/alarms/${id}`);
      await update(alarmToUpdateRef, alarmData);
      toast({ title: "Alarm Updated", description: "Your alarm has been successfully updated." });
    } catch (error) {
      console.error("Failed to update alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update alarm." });
    }
  }, [deviceId, toast]);
  
  const deleteAlarm = useCallback(async (id: string) => {
    if (!deviceId) return;
    try {
      const alarmToDeleteRef = ref(database, `devices/${deviceId}/alarms/${id}`);
      await remove(alarmToDeleteRef);
      toast({ title: "Alarm Deleted", description: "The alarm has been removed." });
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete alarm." });
    }
  }, [deviceId, toast]);

  const toggleAlarm = useCallback(async (id: string, enabled: boolean) => {
    if (!deviceId) return;
    try {
        const alarmToUpdateRef = ref(database, `devices/${deviceId}/alarms/${id}`);
        await update(alarmToUpdateRef, { enabled });
    } catch (error) {
        console.error("Failed to toggle alarm:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to toggle alarm." });
    }
  }, [deviceId, toast]);

  const triggerStopAlarm = useCallback(async () => {
    if (!deviceId) return;
    try {
      const stopAlarmRef = ref(database, `devices/${deviceId}/commands/stopAlarm`);
      await set(stopAlarmRef, true);
      toast({ title: "Command Sent", description: "Stop alarm command sent to ESP32." });
    } catch (error) {
      console.error("Failed to send stop command:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send stop command." });
    }
  }, [deviceId, toast]);

  return { alarms, isLoading, deviceId, setDeviceId, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, triggerStopAlarm, showStopButton, setShowStopButton };
};
