import { Solar, Lunar } from "lunar-javascript";
import { TIAN_GAN, DI_ZHI, SHICHEN_HOUR } from "../constants";
import { getTaiYuan } from "./nayin";

export interface DateState {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  solarHour: number;
  solarMinute: number;
  solarSecond: number;
  hourIdx: number;
  pregnancyMonths: number;
}

export type CalType = "solar" | "lunar";

/** 公历↔农历互转，返回更新后的日期字段 */
export function convertDate(state: DateState, to: CalType): Partial<DateState> {
  try {
    if (to === "lunar") {
      const l = Solar.fromYmd(state.year, state.month, state.day).getLunar();
      return {
        year: l.getYear(),
        month: l.getMonth(),
        day: l.getDay(),
        isLeap: l.getMonth() < 0,
      };
    } else {
      const m = state.isLeap ? -state.month : state.month;
      const s = Lunar.fromYmd(state.year, m, state.day).getSolar();
      return {
        year: s.getYear(),
        month: s.getMonth(),
        day: s.getDay(),
      };
    }
  } catch {
    return {};
  }
}

/** 根据日期和日历类型计算八字（含胎元） */
export function computeBazi(state: DateState, calType: CalType): string[] | null {
  try {
    let solar: InstanceType<typeof Solar>;
    if (calType === "solar") {
      solar = Solar.fromYmdHms(state.year, state.month, state.day, state.solarHour, state.solarMinute, state.solarSecond);
    } else {
      const h = SHICHEN_HOUR[state.hourIdx];
      const m = state.isLeap ? -state.month : state.month;
      const s = Lunar.fromYmd(state.year, m, state.day).getSolar();
      solar = Solar.fromYmdHms(s.getYear(), s.getMonth(), s.getDay(), h, 0, 0);
    }
    const ec = solar.getLunar().getEightChar();
    const mStr = ec.getMonth();
    const tai = getTaiYuan(TIAN_GAN.indexOf(mStr[0]), DI_ZHI.indexOf(mStr[1]), state.pregnancyMonths);
    return [tai.ganzhi, ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()];
  } catch {
    return null;
  }
}
