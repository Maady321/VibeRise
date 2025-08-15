import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Day, Alarm } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dayOrder: Day[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayNames: Record<Day, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};


export function formatRepeatDays(repeat: Alarm['repeat']) {
  const activeDays = dayOrder.filter(day => repeat[day]);

  if (activeDays.length === 7) {
    return 'Daily';
  }

  const isWeekdays = 
    repeat.mon && repeat.tue && repeat.wed && repeat.thu && repeat.fri &&
    !repeat.sat && !repeat.sun;
  
  if (isWeekdays) {
    return 'Weekdays';
  }

  const isWeekend = repeat.sat && repeat.sun && activeDays.length === 2;
  if(isWeekend) {
    return 'Weekends';
  }

  if (activeDays.length === 0) {
    return 'Once';
  }

  return activeDays.map(day => dayNames[day]).join(', ');
}
