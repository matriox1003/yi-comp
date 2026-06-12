// 六十甲子纳音五行算法（太玄数法）

import { TIAN_GAN, DI_ZHI } from "../constants";

// 天干太玄数：甲己9 乙庚8 丙辛7 丁壬6 戊癸5
const GAN_TXS = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
// 地支太玄数：子午9 丑未8 寅申7 卯酉6 辰戌5 巳亥4
const ZHI_TXS = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];

// 两对干支太玄数之和 % 5 → 五行：1火 2土 3木 4金 0水
const WUXING_MAP = ["水", "火", "土", "木", "金"];

/** 纳音名：30对，索引 = floor(甲子序号 / 2) */
const NAYIN_NAMES = [
  "海中金", "炉中火", "大林木", "路旁土", "剑锋金",
  "山头火", "涧下水", "城头土", "白蜡金", "杨柳木",
  "泉中水", "屋上土", "霹雳火", "松柏木", "长流水",
  "砂石金", "山下火", "平地木", "壁上土", "金箔金",
  "覆灯火", "天河水", "大驿土", "钗钏金", "桑柘木",
  "大溪水", "沙中土", "天上火", "石榴木", "大海水",
];

export interface JiaziResult {
  index: number;
  gan: string;
  zhi: string;
  ganzhi: string;
  nayin: string;
  wuxing: string;
}

/** 太玄数法计算纳音五行 */
function calcWuxing(pairBase: number): string {
  const g1 = pairBase % 10, z1 = pairBase % 12;
  const g2 = (pairBase + 1) % 10, z2 = (pairBase + 1) % 12;
  return WUXING_MAP[(GAN_TXS[g1] + ZHI_TXS[z1] + GAN_TXS[g2] + ZHI_TXS[z2]) % 5];
}

export function getJiaziNayin(year: number): JiaziResult {
  const idx = ((year - 4) % 60 + 60) % 60;
  const ganIdx = idx % 10;
  const zhiIdx = idx % 12;
  const pairBase = Math.floor(idx / 2) * 2;

  return {
    index: idx,
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIdx],
    ganzhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx],
    nayin: NAYIN_NAMES[pairBase / 2],
    wuxing: calcWuxing(pairBase),
  };
}

/**
 * 计算胎元
 * 默认十月怀胎：干进一位，支进三位
 * 非十月怀胎时自动调整：每月差异对应干支各偏移一位
 */
export function getTaiYuan(ganIdx: number, zhiIdx: number, months: number = 10): JiaziResult {
  // 十月基准：干进1(=11-10)，支进3(=13-10)，非十月按 (11-N)/(13-N) 调整
  const newGan = (ganIdx + ((11 - months) % 10 + 10) % 10) % 10;
  const newZhi = (zhiIdx + ((13 - months) % 12 + 12) % 12) % 12;
  const idx = ((newGan * 6 - newZhi * 5) % 60 + 60) % 60;
  const pairBase = Math.floor(idx / 2) * 2;

  return {
    index: idx,
    gan: TIAN_GAN[newGan],
    zhi: DI_ZHI[newZhi],
    ganzhi: TIAN_GAN[newGan] + DI_ZHI[newZhi],
    nayin: NAYIN_NAMES[pairBase / 2],
    wuxing: calcWuxing(pairBase),
  };
}

export function getJiaziNayinByGanZhi(ganIdx: number, zhiIdx: number): JiaziResult {
  // 中国剩余定理反推甲子序号
  const idx = ((ganIdx * 6 - zhiIdx * 5) % 60 + 60) % 60;
  const pairBase = Math.floor(idx / 2) * 2;

  return {
    index: idx,
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIdx],
    ganzhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx],
    nayin: NAYIN_NAMES[pairBase / 2],
    wuxing: calcWuxing(pairBase),
  };
}
