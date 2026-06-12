export interface SavedRecord {
  id: string;
  name: string;
  savedAt: number;
  mode: "date" | "bazi";
  calType: "solar" | "lunar";
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  solarHour: number;
  solarMinute: number;
  solarSecond: number;
  hourIdx: number;
  pregnancyMonths: number;
  pillars: number[][];
  baziSummary: string;
}
