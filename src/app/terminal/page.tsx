"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppHeader } from '@/components/header';
import { useTerminalStore } from '@/hooks/use-terminal-store';
import { Bluetooth, BluetoothConnected, BluetoothSearching, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TerminalPage() {
  const { logs, isConnected, isConnecting, connect, disconnect, send } = useTerminalStore();
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleSend = () => {
    if (!inputValue) return;

    const byteValues = inputValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 255);
    
    if (byteValues.length === 0) {
        toast({
            variant: "destructive",
            title: "Invalid Input",
            description: "Please enter comma-separated byte values (0-255).",
        });
        return;
    }

    send(new Uint8Array(byteValues));
    setInputValue('');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Bluetooth Terminal</h2>
            {!isConnected ? (
                <Button onClick={connect} disabled={isConnecting}>
                    {isConnecting ? <BluetoothSearching/> : <Bluetooth />}
                    {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
            ) : (
                <Button variant="destructive" onClick={disconnect}>
                    <X/>
                    Disconnect
                </Button>
            )}
        </div>

        <div className="flex flex-col gap-4 h-[60vh] border rounded-lg p-4">
            <ScrollArea className="flex-grow bg-muted rounded-md p-2">
                 <pre className="text-sm whitespace-pre-wrap">
                    {logs.map((log, index) => (
                        <div key={index} className={cn("font-mono", {
                            'text-green-500': log.type === 'in',
                            'text-blue-500': log.type === 'out',
                            'text-yellow-500': log.type === 'status'
                        })}>
                           {log.type === 'in' && '> '}
                           {log.type === 'out' && '< '}
                           {log.message}
                        </div>
                    ))}
                 </pre>
            </ScrollArea>
            <div className="flex gap-2">
                <Input
                    placeholder={isConnected ? "Enter byte values, e.g. 255, 0, 128" : "Connect to a device to send data"}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected || isConnecting}
                />
                <Button onClick={handleSend} disabled={!isConnected || isConnecting}>Send</Button>
            </div>
        </div>

      </main>
    </div>
  );
}
