"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Alarm, Day } from "@/types"
import { useAlarmStore } from "@/hooks/use-alarm-store"

const alarmSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  label: z.string().max(50).optional().default(""),
  repeat: z.object({
    mon: z.boolean().default(false),
    tue: z.boolean().default(false),
    wed: z.boolean().default(false),
    thu: z.boolean().default(false),
    fri: z.boolean().default(false),
    sat: z.boolean().default(false),
    sun: z.boolean().default(false),
  }),
  enabled: z.boolean().default(true),
  wakeUpGame: z.boolean().default(false),
})

type AlarmFormData = z.infer<typeof alarmSchema>

const days: { id: Day; label: string }[] = [
  { id: 'sun', label: 'S' },
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
]

interface AlarmFormDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  alarm: Alarm | null
}

export function AlarmFormDialog({ isOpen, setIsOpen, alarm }: AlarmFormDialogProps) {
  const { addAlarm, updateAlarm } = useAlarmStore()

  const form = useForm<AlarmFormData>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      time: "07:00",
      label: "",
      repeat: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      enabled: true,
      wakeUpGame: false,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (alarm) {
        form.reset({
          time: alarm.time,
          label: alarm.label,
          repeat: alarm.repeat,
          enabled: alarm.enabled,
          wakeUpGame: alarm.wakeUpGame || false,
        })
      } else {
        form.reset({
          time: "07:00",
          label: "",
          repeat: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
          enabled: true,
          wakeUpGame: false,
        })
      }
    }
  }, [isOpen, alarm, form])

  const onSubmit = async (data: AlarmFormData) => {
    if (alarm) {
      await updateAlarm(alarm.id, data)
    } else {
      await addAlarm(data)
    }
    setIsOpen(false)
  }
  
  const handleRepeatChange = (days: Day[]) => {
    form.setValue("repeat", {
        mon: days.includes('mon'),
        tue: days.includes('tue'),
        wed: days.includes('wed'),
        thu: days.includes('thu'),
        fri: days.includes('fri'),
        sat: days.includes('sat'),
        sun: days.includes('sun'),
    });
  };

  const setWeekdays = () => handleRepeatChange(['mon', 'tue', 'wed', 'thu', 'fri']);
  const setDaily = () => handleRepeatChange(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{alarm ? "Edit Alarm" : "Add Alarm"}</DialogTitle>
          <DialogDescription>
            {alarm ? "Modify the details of your alarm." : "Set up a new alarm for your device."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...form.register("time")} className="text-lg" />
              {form.formState.errors.time && <p className="text-sm text-destructive">{form.formState.errors.time.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" placeholder="e.g. Wake up" {...form.register("label")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Repeat</Label>
            <div className="space-y-2">
               <Controller
                  control={form.control}
                  name="repeat"
                  render={({ field }) => (
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      className="justify-start flex-wrap"
                      value={Object.entries(field.value).filter(([,v]) => v).map(([k]) => k)}
                      onValueChange={(value: Day[]) => handleRepeatChange(value)}
                    >
                      {days.map((day, index) => (
                        <ToggleGroupItem key={`${day.id}-${index}`} value={day.id} aria-label={day.id}>{day.label}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  )}
                />
                 <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={setWeekdays}>Weekdays</Button>
                    <Button type="button" variant="outline" size="sm" onClick={setDaily}>Daily</Button>
                </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <Label htmlFor="wakeUpGame" className="text-base">Enable Wake-up Game</Label>
             <Controller
                  control={form.control}
                  name="wakeUpGame"
                  render={({ field }) => (
                    <Switch id="wakeUpGame" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <Label htmlFor="enabled" className="text-base">Enable Alarm</Label>
             <Controller
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <Switch id="enabled" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
