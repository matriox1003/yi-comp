export const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const SHICHEN = ["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"];
export const SHICHEN_HOUR = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

export const LUNAR_MONTHS = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
export const LUNAR_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
];

export const PREGNANCY_MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

export const CN_DIGITS = "〇一二三四五六七八九";
export const toCnYear = (y: number) => String(y).split("").map(d => CN_DIGITS[+d]).join("");

// 五行配色
export const GAN_WUXING = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
export const ZHI_WUXING = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
export const WUXING_COLOR: Record<string, string> = {
  木: "#2E7D32",
  火: "#C62828",
  土: "#9E6B3A",
  金: "#C49A2A",
  水: "#1565C0",
};

// 八宫名称与含义
export const BAGONG_NAMES = ["伦", "己", "雁", "翡", "乳", "养", "鬼", "基"] as const;
export const BAGONG_SUBS = ["父母", "己身", "兄弟", "夫妻", "子孙", "官禄", "疾病", "家宅"] as const;

// 河图数：1/6水 2/7火 3/8木 4/9金 5/10土
export const HETU_WUXING: Record<number, string> = {
  1: "水", 6: "水", 2: "火", 7: "火",
  3: "木", 8: "木", 4: "金", 9: "金", 5: "土",
};

// 十二长生
export const CHANGSHENG_START: Record<string, number> = { 木: 10, 火: 2, 土: 2, 金: 5, 水: 8 };
export const STAGES = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"] as const;
export const JI_STAGES = new Set(["胎", "养", "长生", "沐浴", "冠带", "临官", "帝旺", "墓"]);

/** 根据干支字符返回阴阳五行样式 */
export function wuxingStyle(char: string): { color: string; fontWeight: number } {
  const gi = TIAN_GAN.indexOf(char);
  const isYang = gi >= 0 ? gi % 2 === 0 : DI_ZHI.indexOf(char) % 2 === 0;
  const wuxing = gi >= 0 ? GAN_WUXING[gi] : ZHI_WUXING[DI_ZHI.indexOf(char)];
  return {
    color: isYang ? WUXING_COLOR[wuxing] : WUXING_COLOR[wuxing] + "99",
    fontWeight: isYang ? 700 : 400,
  };
}
