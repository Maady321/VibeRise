"use client"

import type { Alarm } from "@/types"
import { AlarmCard, AlarmCardSkeleton } from "./alarm-card"
import { BellOff } from "lucide-react"

interface AlarmListProps {
  alarms: Alarm[]
  isLoading: boolean
  onEdit: (alarm: Alarm) => void
}

export function AlarmList({ alarms, isLoading, onEdit }: AlarmListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <AlarmCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed">
        <BellOff className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground">No Alarms Found</h3>
        <p className="text-muted-foreground mt-2">
          Click "Add Alarm" to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {alarms.sort((a,b) => a.time.localeCompare(b.time)).map((alarm) => (
        <AlarmCard key={alarm.id} alarm={alarm} onEdit={onEdit} />
      ))}
    </div>
  )
}
