"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import type { Alarm } from "@/types"
import { useAlarmStore } from "@/hooks/use-alarm-store"
import { formatRepeatDays } from "@/lib/utils"

interface AlarmCardProps {
  alarm: Alarm
  onEdit: (alarm: Alarm) => void
}

export function AlarmCard({ alarm, onEdit }: AlarmCardProps) {
  const { toggleAlarm, deleteAlarm } = useAlarmStore()

  return (
    <Card className="flex flex-col justify-between transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1">
          <p className="text-4xl font-bold text-foreground">{alarm.time}</p>
          <p className="text-sm text-muted-foreground truncate">
            {alarm.label || "No label"}
          </p>
        </div>
        <Switch
          checked={alarm.enabled}
          onCheckedChange={(checked) => toggleAlarm(alarm.id, checked)}
          aria-label={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
        />
      </CardHeader>
      <CardContent className="flex-grow">
         <Badge variant={alarm.enabled ? "default" : "secondary"}>{formatRepeatDays(alarm.repeat)}</Badge>
      </CardContent>
      <CardFooter className="flex justify-end p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(alarm)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => deleteAlarm(alarm.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

export function AlarmCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <Skeleton className="h-10 w-28 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-11" />
      </CardHeader>
      <CardContent>
         <Skeleton className="h-5 w-24" />
      </CardContent>
      <CardFooter className="flex justify-end p-4">
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  )
}
