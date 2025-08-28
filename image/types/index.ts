export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface Alarm {
  id: string;
  time: string; // "HH:mm"
  label: string;
  repeat: Record<Day, boolean>;
  enabled: boolean;
  wakeUpGame: boolean;
}
