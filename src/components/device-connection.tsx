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
import { GitBranch, X, Check, Bluetooth } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const connectionSchema = z.object({
  deviceId: z.string().min(1, "Device ID cannot be empty"),
})

type ConnectionFormData = z.infer<typeof connectionSchema>

// Standard BLE Service and Characteristic UUIDs for Device Information
const DEVICE_INFO_SERVICE_UUID = "0000180a-0000-1000-8000-00805f9b34fb";
const DEVICE_ID_CHARACTERISTIC_UUID = "00002a23-0000-1000-8000-00805f9b34fb"; // System ID

export function DeviceConnection() {
  const { deviceId, setDeviceId } = useAlarmStore()
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast();

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

  const handleBluetoothConnect = async () => {
    if (!navigator.bluetooth) {
      toast({
        variant: "destructive",
        title: "Web Bluetooth Not Supported",
        description: "Your browser does not support Web Bluetooth. Please try a different browser like Chrome or Edge.",
      });
      return;
    }

    try {
      toast({ title: "Scanning for devices..." });
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [DEVICE_INFO_SERVICE_UUID] }],
        optionalServices: [DEVICE_INFO_SERVICE_UUID]
      });

      if (!device.gatt) {
        toast({ variant: "destructive", title: "Connection Failed", description: "Could not connect to the device's GATT server." });
        return;
      }
      
      toast({ title: "Connecting to device..." });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(DEVICE_INFO_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(DEVICE_ID_CHARACTERISTIC_UUID);
      const value = await characteristic.readValue();
      
      const decoder = new TextDecoder('utf-8');
      const receivedDeviceId = decoder.decode(value);

      if (receivedDeviceId) {
        setDeviceId(receivedDeviceId);
        form.setValue("deviceId", receivedDeviceId);
        toast({
          title: "Device Connected!",
          description: `Connected to device ID: ${receivedDeviceId}`,
        });
        setIsOpen(false);
      } else {
        toast({ variant: "destructive", title: "Failed to get Device ID", description: "Could not read a valid Device ID from the ESP32." });
      }

      device.gatt.disconnect();

    } catch (error: any) {
        if (error.name === 'NotFoundError') {
             toast({
                variant: "destructive",
                title: "No Device Found",
                description: "No advertising devices found with the required service.",
            });
        } else {
            console.error("Bluetooth connection error:", error);
            toast({
                variant: "destructive",
                title: "Bluetooth Error",
                description: error.message || "An unknown error occurred during Bluetooth connection.",
            });
        }
    }
  };

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
              Enter the ID of your ESP32 device or connect via Bluetooth.
            </p>
          </div>
          <Button variant="outline" onClick={handleBluetoothConnect}>
              <Bluetooth className="mr-2 h-4 w-4" />
              Connect via Bluetooth
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">
                Or manually
                </span>
            </div>
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
                    <Button type="button" variant="destructive" size="sm" onClick={handleDisconnect}>
                        <X className="mr-2 h-4 w-4" /> Disconnect
                    </Button>
                }
                <Button type="submit" size="sm">
                    <Check className="mr-2 h-4 w-4" /> Connect
                </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  )
}

    