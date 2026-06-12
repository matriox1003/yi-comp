// 八宫计算算法

import { TIAN_GAN, DI_ZHI, HETU_WUXING, CHANGSHENG_START, STAGES, JI_STAGES } from "../constants";
import { getJiaziNayinByGanZhi } from "./nayin";

/** >10减10，10作1 */
function norm(n: number): number {
  return n >= 10 ? (n - 10 || 1) : n;
}

/** 顺数：同位为1，步进+1。天干范围1-10，地支范围1-12，归一化后1-9 */
function fwd(from: number, to: number, n: number): number {
  return norm(((to - from) % n + n) % n + 1);
}

/** 天干顺数 (1-9) */
export function countGan(from: number, to: number): number {
  return fwd(from, to, 10);
}

/** 地支顺数 (1-9) */
export function countZhi(from: number, to: number): number {
  return fwd(from, to, 12);
}

export interface FourPillars {
  yearGan: number;
  monthGan: number;
  dayGan: number;
  hourGan: number;
  yearZhi: number;
  monthZhi: number;
  dayZhi: number;
  hourZhi: number;
}

export interface BagongResult {
  /** 天干四位 [年, 月, 日, 时] */
  yuanDigits: [number, number, number, number];
  /** 地支四位 [年, 月, 日, 时] */
  yingDigits: [number, number, number, number];
  /** 元数 */
  yuanShu: number;
  /** 影数 */
  yingShu: number;
  /** 八宫：元数×影数，不足8位右补0 */
  bagong: string;
}

/**
 * 计算八宫
 * 元数 = 胎命天干分别顺数到年月日时天干，按千百十个排列
 * 影数 = 胎命地支分别顺数到年月日时地支，按千百十个排列
 * 八宫 = 元数 × 影数，不足8位右补0
 */
export function calcBagong(
  taiGan: number,
  taiZhi: number,
  pillars: FourPillars,
): BagongResult {
  const yuanDigits: [number, number, number, number] = [
    countGan(taiGan, pillars.yearGan),
    countGan(taiGan, pillars.monthGan),
    countGan(taiGan, pillars.dayGan),
    countGan(taiGan, pillars.hourGan),
  ];

  const yingDigits: [number, number, number, number] = [
    countZhi(taiZhi, pillars.yearZhi),
    countZhi(taiZhi, pillars.monthZhi),
    countZhi(taiZhi, pillars.dayZhi),
    countZhi(taiZhi, pillars.hourZhi),
  ];

  const yuanShu = yuanDigits[0] * 1000 + yuanDigits[1] * 100 + yuanDigits[2] * 10 + yuanDigits[3];
  const yingShu = yingDigits[0] * 1000 + yingDigits[1] * 100 + yingDigits[2] * 10 + yingDigits[3];

  const bagong = (yuanShu * yingShu).toString().padEnd(8, "0");

  return { yuanDigits, yingDigits, yuanShu, yingShu, bagong };
}

/** 获取宫位五行：空宫按规则填充 */
export function getPalaceWuxing(
  pos: number,
  bagong: string,
  pillarWuxing: string[],
): string | null {
  const n = +bagong[pos];
  if (n !== 0) return HETU_WUXING[n] ?? null;
  // 空：己雁翡乳 → 对应年月日时纳音五行
  if (pos >= 1 && pos <= 4) return pillarWuxing[pos - 1];
  // 空：养鬼基 → 己宫五行
  if (pos >= 5 && pos <= 7) return getPalaceWuxing(1, bagong, pillarWuxing);
  return null;
}

/** 四柱纳音五行 [年, 月, 日, 时] */
export function calcPillarWuxing(baziDisplay: string[]): string[] {
  return [1, 2, 3, 4].map(i =>
    getJiaziNayinByGanZhi(TIAN_GAN.indexOf(baziDisplay[i][0]), DI_ZHI.indexOf(baziDisplay[i][1])).wuxing,
  );
}

/** 命宫位置：八宫数相加，从伦宫起1顺数 */
export function calcMingGong(bagong: string): number {
  return (bagong.split("").reduce((s, d) => s + +d, 0) - 1) % 8;
}

export interface MingGongInfo {
  wuxing: string;
  stage: string;
  ji: boolean;
}

/** 命宫吉凶：命宫五行在月建地支的十二长生阶段 */
export function calcMingGongInfo(
  mingGong: number,
  bagong: string,
  pillarWuxing: string[],
  monthZhi: string,
): MingGongInfo | null {
  const wuxing = getPalaceWuxing(mingGong, bagong, pillarWuxing);
  if (!wuxing) return null;
  const monthZhiIdx = DI_ZHI.indexOf(monthZhi);
  const start = CHANGSHENG_START[wuxing];
  if (start === undefined) return null;
  const stage = STAGES[((monthZhiIdx - start) % 12 + 12) % 12];
  return { wuxing, stage, ji: JI_STAGES.has(stage) };
}

/** 本宫：从右到左每两宫为一组求和，进位传递，伦己组进位加回本组 */
export function calcBenGong(bagong: string): string {
  const n = bagong.split("").map(Number);
  const groups = [[n[6], n[7]], [n[4], n[5]], [n[2], n[3]], [n[0], n[1]]];
  let carry = 0;
  const digits: number[] = [];
  for (let g = 0; g < groups.length; g++) {
    const sum = groups[g][0] + groups[g][1] + carry;
    const digit = sum % 10;
    carry = Math.floor(sum / 10);
    if (g === groups.length - 1) {
      digits.push((digit + carry) % 10);
    } else {
      digits.push(digit);
    }
  }
  return digits.reverse().join("");
}
