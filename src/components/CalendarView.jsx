import { useState } from "react";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function getRecords() {
  try { return JSON.parse(localStorage.getItem("tasksplit_records") || "[]"); }
  catch { return []; }
}
function getMoods() {
  try { return JSON.parse(localStorage.getItem("tasksplit_moods") || "[]"); }
  catch { return []; }
}
function getJournal() {
  try { return JSON.parse(localStorage.getItem("tasksplit_journal") || "[]"); }
  catch { return []; }
}

const MOOD_EMOJI = ["", "😫", "😔", "😐", "🙂", "😊"];

export default function CalendarView() {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const todayStr = today.toLocaleDateString("zh-CN");

  // Build month grid
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay(); // 0=Sun
  if (startWeekday === 0) startWeekday = 7; // Mon=1
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Empty cells before first day
  for (let i = 1; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Data lookups
  const records = getRecords();
  const moods = getMoods();
  const journal = getJournal();

  function getDayData(day) {
    const dateStr = new Date(year, month, day).toLocaleDateString("zh-CN");
    const dayRecords = records.filter(r => r.date === dateStr);
    const dayMood = moods.find(m => m.date === dateStr);
    const dayJournals = journal.filter(j => j.date === dateStr);
    const totalSteps = dayRecords.reduce((s, r) => s + r.steps, 0);
    return { totalSteps, mood: dayMood, journals: dayJournals.length, dateStr };
  }

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }
  function goToday() { setViewDate(new Date()); }

  const monthName = viewDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center
            hover:scale-110 transition-all text-sm font-bold"
            style={{ backgroundColor: "var(--border)", color: "var(--warm-gray)" }}>◀</button>
          <div className="text-center">
            <p className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>{monthName}</p>
            <button onClick={goToday} className="text-[10px] font-bold" style={{ color: "var(--coral)" }}>回到今天</button>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center
            hover:scale-110 transition-all text-sm font-bold"
            style={{ backgroundColor: "var(--border)", color: "var(--warm-gray)" }}>▶</button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(w => (
            <div key={w} className="text-center text-[10px] font-bold py-1"
              style={{ color: "var(--warm-gray)" }}>{w}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;

            const data = getDayData(day);
            const isToday = data.dateStr === todayStr;
            const hasActivity = data.totalSteps > 0 || data.mood || data.journals > 0;

            // Intensity color based on steps
            let bgColor = "transparent";
            if (data.totalSteps > 0) {
              const intensity = Math.min(data.totalSteps / 8, 1);
              bgColor = `rgba(107, 203, 119, ${0.15 + intensity * 0.35})`;
            }

            return (
              <div key={day}
                className={`relative rounded-xl p-1 text-center transition-all min-h-[48px] flex flex-col items-center justify-start
                  ${isToday ? "ring-2" : ""}`}
                style={{
                  backgroundColor: bgColor,
                  ringColor: "var(--coral)",
                  ...(isToday ? { outline: "2px solid var(--coral)", outlineOffset: "-1px" } : {}),
                }}>
                <span className={`text-xs font-bold ${isToday ? "" : ""}`}
                  style={{ color: isToday ? "var(--coral)" : hasActivity ? "var(--soft-dark)" : "var(--warm-gray)" }}>
                  {day}
                </span>

                {/* Indicators */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {data.totalSteps > 0 && (
                    <span className="text-[8px] font-extrabold" style={{ color: "var(--mint)" }}>
                      {data.totalSteps}步
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mt-0.5">
                  {data.mood && <span className="text-[10px]">{MOOD_EMOJI[data.mood.mood]}</span>}
                  {data.journals > 0 && <span className="text-[8px]">📝</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-bold"
        style={{ color: "var(--warm-gray)" }}>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(107,203,119,0.25)" }} /> 完成任务
        </span>
        <span className="flex items-center gap-1">😊 心情</span>
        <span className="flex items-center gap-1">📝 日记</span>
      </div>

      {/* Today summary */}
      {(() => {
        const todayData = getDayData(today.getDate());
        if (today.getMonth() !== month || today.getFullYear() !== year) return null;
        return (
          <div className="card p-4 space-y-2">
            <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>📌 今日概览</span>
            <div className="flex gap-4">
              <div className="text-center flex-1">
                <p className="text-2xl font-extrabold" style={{ color: "var(--mint)" }}>
                  {todayData.totalSteps || 0}
                </p>
                <p className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>完成步骤</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl">
                  {todayData.mood ? MOOD_EMOJI[todayData.mood.mood] : "—"}
                </p>
                <p className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>今日心情</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl font-extrabold" style={{ color: "var(--lavender)" }}>
                  {todayData.journals || 0}
                </p>
                <p className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>日记条数</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
