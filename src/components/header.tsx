"use client"

import { Settings, Bell, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAlarmStore } from "@/hooks/use-alarm-store"
import { DeviceConnection } from "./device-connection"
import Link from "next/link"

export function AppHeader() {
  const { showStopButton, setShowStopButton } = useAlarmStore()

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Bell className="h-6 w-6 text-primary" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            ESP32 Alarm Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <DeviceConnection />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure application settings.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="stop-button" className="font-normal">
                      Show 'Stop Alarm' button
                    </Label>
                    <Switch
                      id="stop-button"
                      checked={showStopButton}
                      onCheckedChange={setShowStopButton}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
