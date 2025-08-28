"use client";

import React from 'react';
import { AppHeader } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlarmTab } from '@/components/alarm-tab';
import { TerminalTab } from '@/components/terminal-tab';

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="alarms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alarms">Alarms</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
          </TabsList>
          <TabsContent value="alarms" className="mt-6">
            <AlarmTab />
          </TabsContent>
          <TabsContent value="terminal" className="mt-6">
            <TerminalTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
