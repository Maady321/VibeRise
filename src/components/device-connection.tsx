"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAlarmStore } from "@/hooks/use-alarm-store"
import { GitBranch, X, Check } from "lucide-react"

const connectionSchema = z.object({
  deviceId: z.string().min(1, "Device ID cannot be empty"),
})

type ConnectionFormData = z.infer<typeof connectionSchema>

export function DeviceConnection() {
  const { deviceId, setDeviceId } = useAlarmStore()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      deviceId: deviceId || "",
    },
  })
  
  const onSubmit = (data: ConnectionFormData) => {
    setDeviceId(data.deviceId)
    setIsOpen(false)
  }

  const handleDisconnect = () => {
    setDeviceId(null)
    form.reset({ deviceId: "" })
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-2 text-sm text-muted-foreground">
          <GitBranch className="w-4 h-4" />
          <span>{deviceId || "No Device"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Device Connection</h4>
            <p className="text-sm text-muted-foreground">
              Enter the ID of your ESP32 device.
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id="deviceId"
                {...form.register("deviceId")}
                className="col-span-2 h-8"
                defaultValue={deviceId || ""}
              />
            </div>
            {form.formState.errors.deviceId && (
                <p className="text-sm text-destructive col-span-3">{form.formState.errors.deviceId.message}</p>
            )}
            <div className="flex justify-end gap-2 mt-2">
                {deviceId && 
                    <Button type="button" variant="destructive" onClick={handleDisconnect}>
                        <X className="mr-2 h-4 w-4" /> Disconnect
                    </Button>
                }
                <Button type="submit">
                    <Check className="mr-2 h-4 w-4" /> Connect
                </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
