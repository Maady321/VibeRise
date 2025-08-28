"use client";

import { create } from 'zustand';
import { toast } from "@/hooks/use-toast";

const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Write
const UART_TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Notify

interface Log {
    type: 'in' | 'out' | 'status';
    message: string;
    timestamp: number;
}

interface TerminalState {
  logs: Log[];
  isConnected: boolean;
  isConnecting: boolean;
  device: BluetoothDevice | null;
  rxCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  addLog: (log: Omit<Log, 'timestamp'>) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (data: Uint8Array) => void;
  clearLogs: () => void;
}

const useTerminalStore = create<TerminalState>((set, get) => ({
    logs: [],
    isConnected: false,
    isConnecting: false,
    device: null,
    rxCharacteristic: null,
    
    addLog: (log) => {
        const newLog = { ...log, timestamp: Date.now() };
        set(state => ({ logs: [...state.logs, newLog] }));
    },

    clearLogs: () => set({ logs: [] }),

    connect: async () => {
        const { addLog } = get();
        if (!navigator.bluetooth) {
            toast({ variant: "destructive", title: "Web Bluetooth not supported" });
            addLog({ type: 'status', message: "Error: Web Bluetooth is not supported on this browser." });
            return;
        }

        set({ isConnecting: true });
        addLog({ type: 'status', message: "Requesting Bluetooth device..." });

        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [UART_SERVICE_UUID] }],
            });

            if (!device.gatt) {
                throw new Error("GATT server not available.");
            }

            addLog({ type: 'status', message: `Connecting to ${device.name}...` });
            const server = await device.gatt.connect();

            addLog({ type: 'status', message: "Getting UART service..." });
            const service = await server.getPrimaryService(UART_SERVICE_UUID);

            addLog({ type: 'status', message: "Getting RX characteristic..." });
            const rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

            addLog({ type: 'status', message: "Getting TX characteristic..." });
            const txCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);

            const handleNotifications = (event: Event) => {
                const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
                if (value) {
                    const textDecoder = new TextDecoder();
                    addLog({ type: 'in', message: textDecoder.decode(value) });
                }
            };

            await txCharacteristic.startNotifications();
            txCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
            
            device.addEventListener('gattserverdisconnected', () => {
                addLog({ type: 'status', message: "Device disconnected." });
                txCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
                set({ isConnected: false, device: null, rxCharacteristic: null });
            });
            
            set({ isConnected: true, isConnecting: false, device, rxCharacteristic });
            addLog({ type: 'status', message: "Connection successful!" });
            toast({ title: "Device Connected", description: "Terminal is ready to use." });

        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                addLog({ type: 'status', message: 'Connection cancelled. No device selected.'});
            } else {
                addLog({ type: 'status', message: `Error: ${error.message}` });
                toast({ variant: "destructive", title: "Connection Failed", description: error.message });
            }
            set({ isConnecting: false });
        }
    },
    
    disconnect: () => {
        const { device } = get();
        if (device && device.gatt) {
            device.gatt.disconnect();
        }
    },

    send: (data: Uint8Array) => {
        const { rxCharacteristic, addLog, isConnected } = get();
        if (rxCharacteristic && isConnected) {
            rxCharacteristic.writeValue(data)
                .then(() => {
                    const values = Array.from(data).join(', ');
                    addLog({ type: 'out', message: `[${values}]` });
                })
                .catch(error => {
                    addLog({ type: 'status', message: `Send Error: ${error.message}` });
                    toast({ variant: "destructive", title: "Send Error", description: error.message });
                });
        }
    },
}));

export { useTerminalStore };
