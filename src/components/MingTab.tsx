/**
 * "命" Tab - 出生信息输入与八字展示
 *
 * 两种输入模式：
 *   出生日期 — 选择公历/农历日期，自动计算四柱八字 + 胎元
 *   输入八字 — 直接选择年月日时四柱的天干地支
 */
import { useState, useEffect } from "react";
import { useRecordStore } from "../store";
import { toast } from "../utils/toast";
import {
  TIAN_GAN, DI_ZHI, SHICHEN,
  LUNAR_MONTHS, LUNAR_DAYS, PREGNANCY_MONTHS,
  BAGONG_NAMES, BAGONG_SUBS, WUXING_COLOR,
  toCnYear, wuxingStyle,
} from "../constants";
import { convertDate, computeBazi, type DateState, type CalType } from "../utils/calendar";
import { getTaiYuan, getJiaziNayinByGanZhi } from "../utils/nayin";
import {
  calcBagong, getPalaceWuxing, calcPillarWuxing,
  calcMingGong, calcMingGongInfo, calcBenGong,
} from "../utils/palace";

type InputMode = "date" | "bazi";

// 下拉选项预生成，避免渲染时重复创建
const PAD2 = (n: number) => String(n).padStart(2, "0");
const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_UNITS = Array.from({ length: 60 }, (_, i) => i); // 分/秒共用
const PREGNANCY_OPTS = Array.from({ length: 12 }, (_, i) => i + 1);

interface FormState {
  mode: InputMode;
  calType: CalType;
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
  queried: boolean;
  editingId: string | null;
}

const INITIAL_FORM: FormState = {
  mode: "date",
  calType: "solar",
  year: 1990,
  month: 1,
  day: 1,
  isLeap: false,
  solarHour: 0,
  solarMinute: 0,
  solarSecond: 0,
  hourIdx: 0,
  pregnancyMonths: 10,
  pillars: [[0, 0], [0, 0], [0, 0], [0, 0]],
  queried: false,
  editingId: null,
};

export default function MingTab() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const {
    mode, calType, year, month, day, isLeap,
    solarHour, solarMinute, solarSecond, hourIdx,
    pregnancyMonths, pillars, queried, editingId,
  } = form;

  const patch = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // 保存对话框
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordName, setRecordName] = useState("");

  // 从 store 加载记录
  const pendingRecord = useRecordStore((s) => s.pendingRecord);
  const addRecord = useRecordStore((s) => s.addRecord);
  const updateRecord = useRecordStore((s) => s.updateRecord);
  const consumeRecord = useRecordStore((s) => s.consumeRecord);
  const savedRecords = useRecordStore((s) => s.savedRecords);

  useEffect(() => {
    if (!pendingRecord) return;
    setForm({
      mode: pendingRecord.mode,
      calType: pendingRecord.calType,
      year: pendingRecord.year,
      month: pendingRecord.month,
      day: pendingRecord.day,
      isLeap: pendingRecord.isLeap,
      solarHour: pendingRecord.solarHour,
      solarMinute: pendingRecord.solarMinute,
      solarSecond: pendingRecord.solarSecond,
      hourIdx: pendingRecord.hourIdx,
      pregnancyMonths: pendingRecord.pregnancyMonths,
      pillars: pendingRecord.pillars,
      queried: true,
      editingId: pendingRecord.id,
    });
    consumeRecord();
  }, [pendingRecord]);

  const handleQuery = () => {
    patch("queried", true);
  };

  const dateState: DateState = { year, month, day, isLeap, solarHour, solarMinute, solarSecond, hourIdx, pregnancyMonths };

  // 公历↔农历切换时转换日期值
  const toggleCalType = (t: CalType) => {
    if (t === calType) return;
    const updated = convertDate(dateState, t);
    setForm(prev => ({
      ...prev,
      calType: t,
      ...(updated.year !== undefined && { year: updated.year }),
      ...(updated.month !== undefined && { month: updated.month }),
      ...(updated.day !== undefined && { day: updated.day }),
      ...(updated.isLeap !== undefined && { isLeap: updated.isLeap }),
    }));
  };

  // 实时计算八字（胎元 + 年月日时四柱），出生日期模式
  const dateBazi = computeBazi(dateState, calType);

  // 八字输入模式：从月柱计算胎元，组合完整展示数据
  const baziInputData = [
    getTaiYuan(pillars[1][0], pillars[1][1], pregnancyMonths).ganzhi,
    TIAN_GAN[pillars[0][0]] + DI_ZHI[pillars[0][1]],
    TIAN_GAN[pillars[1][0]] + DI_ZHI[pillars[1][1]],
    TIAN_GAN[pillars[2][0]] + DI_ZHI[pillars[2][1]],
    TIAN_GAN[pillars[3][0]] + DI_ZHI[pillars[3][1]],
  ];

  const baziDisplay = mode === "date" ? dateBazi : baziInputData;

  // 计算八宫
  let bagongResult = null;
  if (baziDisplay) {
    const taiGanIdx = TIAN_GAN.indexOf(baziDisplay[0][0]);
    const taiZhiIdx = DI_ZHI.indexOf(baziDisplay[0][1]);
    bagongResult = calcBagong(taiGanIdx, taiZhiIdx, {
      yearGan: TIAN_GAN.indexOf(baziDisplay[1][0]),
      yearZhi: DI_ZHI.indexOf(baziDisplay[1][1]),
      monthGan: TIAN_GAN.indexOf(baziDisplay[2][0]),
      monthZhi: DI_ZHI.indexOf(baziDisplay[2][1]),
      dayGan: TIAN_GAN.indexOf(baziDisplay[3][0]),
      dayZhi: DI_ZHI.indexOf(baziDisplay[3][1]),
      hourGan: TIAN_GAN.indexOf(baziDisplay[4][0]),
      hourZhi: DI_ZHI.indexOf(baziDisplay[4][1]),
    });
  }

  const pillarWuxing = baziDisplay ? calcPillarWuxing(baziDisplay) : null;
  const mingGong = bagongResult ? calcMingGong(bagongResult.bagong) : -1;
  const mingGongInfo = bagongResult && baziDisplay && pillarWuxing
    ? calcMingGongInfo(mingGong, bagongResult.bagong, pillarWuxing, baziDisplay[2][1])
    : null;
  const benGong = bagongResult ? calcBenGong(bagongResult.bagong) : null;

  // 更新八字直接输入的某一柱
  const setPillar = (i: number, field: 0 | 1, val: number) => {
    setForm(prev => ({
      ...prev,
      pillars: prev.pillars.map((p, j) => (j === i ? [field === 0 ? val : p[0], field === 1 ? val : p[1]] : p)),
    }));
  };

  const isLunar = calType === "lunar";

  const handleSave = () => {
    const existing = editingId ? savedRecords.find((r) => r.id === editingId) : null;
    const name = existing ? existing.name : (recordName.trim() || `记录 ${savedRecords.length + 1}`);
    const data = {
      name,
      savedAt: Date.now(),
      mode,
      calType,
      year, month, day, isLeap,
      solarHour, solarMinute, solarSecond,
      hourIdx, pregnancyMonths,
      pillars,
      baziSummary: baziDisplay ? baziDisplay.slice(1).join(" ") : "",
    };
    if (editingId) {
      updateRecord({ id: editingId, ...data });
      toast("已更新");
    } else {
      const id = crypto.randomUUID();
      addRecord({ id, ...data });
      setForm(prev => ({ ...prev, editingId: id }));
      toast("已保存");
    }
    setRecordName("");
    setShowSaveDialog(false);
  };

  return (
    <div className="ming-tab">
      {/* 命宫信息 */}
      {queried && mingGongInfo && (
        <div className="ming-gong-info">
          <span className="ming-gong-label">命</span>
          <span className="ming-gong-title">{BAGONG_NAMES[mingGong]}</span>
          <span className={`ming-gong-verdict ${mingGongInfo.ji ? "ji" : "xiong"}`}>{mingGongInfo.ji ? "吉" : "凶"}</span>
        </div>
      )}

      {/* 输入区域：两种模式等高容器 */}
      <div className="input-area">
        {mode === "date" ? (
          <>
            {/* 日历类型 + 输入模式切换 */}
            <div className="cal-toggle">
              <button className={!isLunar ? "active" : ""} onClick={() => toggleCalType("solar")}>公历</button>
              <button className={isLunar ? "active" : ""} onClick={() => toggleCalType("lunar")}>农历</button>
              <button onClick={() => patch("mode", "bazi")}>八字</button>
            </div>

            {/* 日期选择：农历显示汉字，公历显示数字 */}
            <div className="date-fields">
              <div className="field-group">
                <label>年</label>
                <select value={year} onChange={e => patch("year", +e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{isLunar ? toCnYear(y) : y}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>月</label>
                <select value={month} onChange={e => patch("month", +e.target.value)}>
                  {MONTHS.map(m => <option key={m} value={m}>{isLunar ? LUNAR_MONTHS[m - 1] : `${PAD2(m)}月`}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>日</label>
                <select value={day} onChange={e => patch("day", +e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{isLunar ? LUNAR_DAYS[d - 1] : PAD2(d)}</option>)}
                </select>
              </div>

              {/* 农历：时辰选择 */}
              {isLunar ? (
                <div className="field-group">
                  <label>时辰</label>
                  <select value={hourIdx} onChange={e => patch("hourIdx", +e.target.value)}>
                    {SHICHEN.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                </div>
              ) : (
                /* 公历：时分秒 */
                <>
                  <div className="field-group">
                    <label>时</label>
                    <select value={solarHour} onChange={e => patch("solarHour", +e.target.value)}>
                      {HOURS.map(h => <option key={h} value={h}>{PAD2(h)}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>分</label>
                    <select value={solarMinute} onChange={e => patch("solarMinute", +e.target.value)}>
                      {TIME_UNITS.map(m => <option key={m} value={m}>{PAD2(m)}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>秒</label>
                    <select value={solarSecond} onChange={e => patch("solarSecond", +e.target.value)}>
                      {TIME_UNITS.map(s => <option key={s} value={s}>{PAD2(s)}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* 怀胎月数 */}
              <div className="field-group">
                <label>怀胎</label>
                <select value={pregnancyMonths} onChange={e => patch("pregnancyMonths", +e.target.value)}>
                  {PREGNANCY_OPTS.map(m => <option key={m} value={m}>{PREGNANCY_MONTHS[m - 1]}</option>)}
                </select>
              </div>

              {/* 农历闰月标记 */}
              {isLunar && (
                <label className="leap-check">
                  <input type="checkbox" checked={isLeap} onChange={e => patch("isLeap", e.target.checked)} />
                  闰月
                </label>
              )}

              <button className="query-btn" onClick={handleQuery}>查询</button>
              {editingId && (
                <button className="cancel-edit-btn" onClick={() => patch("editingId", null)}>取消编辑</button>
              )}
            </div>
          </>
        ) : (
          /* 八字直接输入 */
          <>
            <div className="cal-toggle">
              <button onClick={() => patch("mode", "date")}>公历</button>
              <button onClick={() => patch("mode", "date")}>农历</button>
              <button className="active">八字</button>
            </div>
            <div className="bazi-input-horizontal">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bazi-pillar-input">
                <span className="pillar-tag">{["年", "月", "日", "时"][i]}</span>
                <div className="gan-zhi-row">
                  <select value={pillars[i][0]} onChange={e => setPillar(i, 0, +e.target.value)}>
                    {TIAN_GAN.map((g, j) => <option key={j} value={j}>{g}</option>)}
                  </select>
                  <select value={pillars[i][1]} onChange={e => setPillar(i, 1, +e.target.value)}>
                    {DI_ZHI.map((z, j) => <option key={j} value={j}>{z}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {/* 怀胎月数 */}
            <div className="bazi-pillar-input">
              <span className="pillar-tag">怀胎</span>
              <select value={pregnancyMonths} onChange={e => patch("pregnancyMonths", +e.target.value)}>
                {PREGNANCY_OPTS.map(m => <option key={m} value={m}>{PREGNANCY_MONTHS[m - 1]}</option>)}
              </select>
            </div>
            <button className="query-btn" onClick={handleQuery}>查询</button>
            {editingId && (
              <button className="cancel-edit-btn" onClick={() => patch("editingId", null)}>取消编辑</button>
            )}
          </div>
          </>
        )}
      </div>

      {/* 共享八字展示：胎/年/月/日/时 竖向排列，天干地支按五行上色 */}
      {queried && baziDisplay && (
        <div className="bazi-preview">
          {baziDisplay.map((gz, i) => (
            <div key={i} className="bazi-pillar">
              <span className="pillar-tag">{["胎", "年", "月", "日", "时"][i]}</span>
              <span className="pillar-value" style={wuxingStyle(gz[0])}>{gz[0]}</span>
              <span className="pillar-value" style={wuxingStyle(gz[1])}>{gz[1]}</span>
              {(() => {
                const r = getJiaziNayinByGanZhi(TIAN_GAN.indexOf(gz[0]), DI_ZHI.indexOf(gz[1]));
                return <span className="pillar-nayin" style={{ color: WUXING_COLOR[r.wuxing] }}>{r.wuxing}</span>;
              })()}
            </div>
          ))}
        </div>
      )}

      {/* 八宫展示 */}
      {queried && bagongResult && (
        <div className="section-preview">
          <span className="section-label">八宫</span>
          <div className="bagong-preview">
          {BAGONG_NAMES.map((name, i) => {
            const n = +bagongResult!.bagong[i];
            const wuxing = pillarWuxing ? getPalaceWuxing(i, bagongResult!.bagong, pillarWuxing) : null;
            return (
              <div key={i} className="bagong-item">
                <span className="bagong-tag">{name}</span>
                <span className="bagong-sub">{BAGONG_SUBS[i]}</span>
                <span className="bagong-num">{n}</span>
                {wuxing && <span className="bagong-hetu" style={{ color: WUXING_COLOR[wuxing] }}>{wuxing}</span>}
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* 本宫展示 */}
      {queried && benGong && (
        <div className="section-preview">
          <span className="section-label">本宫</span>
          <div className="bengong-preview">
          {benGong.split("").map((d, i) => (
            <div key={i} className="bengong-item">
              <span className="bengong-num">{d}</span>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* 悬浮保存按钮 */}
      {queried && (
        <div className="save-fab-container">
          {showSaveDialog && (
            <div className="save-dialog">
              <input
                type="text"
                placeholder="输入备注名..."
                value={recordName}
                onChange={e => setRecordName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
              <button onClick={handleSave}>确认</button>
            </div>
          )}
          <button className="save-fab" onClick={() => {
            if (editingId) {
              handleSave();
            } else {
              setShowSaveDialog(!showSaveDialog);
            }
          }}>
            {editingId ? "更" : "存"}
          </button>
        </div>
      )}
    </div>
  );
}