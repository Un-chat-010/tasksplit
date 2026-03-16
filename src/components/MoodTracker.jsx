import { useState } from "react";

const MOODS = [
  { emoji: "😫", label: "很低", value: 1, color: "#FF6B6B" },
  { emoji: "😔", label: "偏低", value: 2, color: "#FFA07A" },
  { emoji: "😐", label: "一般", value: 3, color: "#FFD93D" },
  { emoji: "🙂", label: "还不错", value: 4, color: "#6BCB77" },
  { emoji: "😊", label: "很好", value: 5, color: "#4D96FF" },
];

const ENERGY = [
  { emoji: "🪫", label: "没电", value: 1 },
  { emoji: "🔋", label: "偏低", value: 2 },
  { emoji: "🔋", label: "一般", value: 3 },
  { emoji: "⚡", label: "充沛", value: 4 },
  { emoji: "🔥", label: "满电", value: 5 },
];

function getStored() {
  try { return JSON.parse(localStorage.getItem("tasksplit_moods") || "[]"); }
  catch { return []; }
}

export default function MoodTracker() {
  const [moods, setMoods] = useState(getStored);
  const [selMood, setSelMood] = useState(null);
  const [selEnergy, setSelEnergy] = useState(null);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);

  const today = new Date().toLocaleDateString("zh-CN");
  const todayEntry = moods.find((m) => m.date === today);
  const recent = moods.slice(0, 14);
  const avgMood = recent.length > 0
    ? (recent.reduce((s, m) => s + m.mood, 0) / recent.length).toFixed(1) : null;

  function save() {
    if (!selMood || !selEnergy) return;
    const entry = { date: today, mood: selMood, energy: selEnergy, note: note.trim(), timestamp: Date.now() };
    const updated = [entry, ...moods.filter((m) => m.date !== today)].slice(0, 90);
    setMoods(updated);
    localStorage.setItem("tasksplit_moods", JSON.stringify(updated));
    setEditing(false);
    setSelMood(null);
    setSelEnergy(null);
    setNote("");
  }

  // Compact: show today's entry or quick-add form
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>💭 今日状态</span>
        {todayEntry && !editing && (
          <button onClick={() => { setEditing(true); setSelMood(todayEntry.mood); setSelEnergy(todayEntry.energy); setNote(todayEntry.note || ""); }}
            className="text-[10px] font-bold" style={{ color: "var(--lavender)" }}>修改</button>
        )}
      </div>

      {/* Show today's entry */}
      {todayEntry && !editing && (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{MOODS[todayEntry.mood - 1]?.emoji}</span>
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: "var(--soft-dark)" }}>
              {MOODS[todayEntry.mood - 1]?.label} · {ENERGY[todayEntry.energy - 1]?.label}
            </p>
            {todayEntry.note && (
              <p className="text-[11px] mt-0.5" style={{ color: "var(--warm-gray)" }}>"{todayEntry.note}"</p>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      {(!todayEntry || editing) && (
        <div className="space-y-3 animate-fadeIn">
          {/* Mood row */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>心情</p>
            <div className="flex gap-1">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setSelMood(m.value)}
                  className={`flex-1 py-1.5 rounded-xl text-center transition-all text-lg
                    ${selMood === m.value ? "scale-110 shadow-sm" : "opacity-50 hover:opacity-80"}`}
                  style={selMood === m.value ? { backgroundColor: `${m.color}18`, outline: `2px solid ${m.color}` } : {}}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          {/* Energy row */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>精力</p>
            <div className="flex gap-1">
              {ENERGY.map((e) => (
                <button key={e.value} onClick={() => setSelEnergy(e.value)}
                  className={`flex-1 py-1.5 rounded-xl text-center transition-all text-lg
                    ${selEnergy === e.value ? "scale-110 shadow-sm" : "opacity-50 hover:opacity-80"}`}
                  style={selEnergy === e.value ? { backgroundColor: "#F3ECFF", outline: "2px solid var(--lavender)" } : {}}>
                  {e.emoji}
                </button>
              ))}
            </div>
          </div>
          {/* Note + save */}
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="一句话备注（可选）"
            className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none border"
            style={{ borderColor: "var(--border)" }} />
          <div className="flex gap-2">
            <button onClick={save} disabled={!selMood || !selEnergy}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all
                hover:scale-105 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--lavender), var(--pink))" }}>
              保存
            </button>
            {editing && (
              <button onClick={() => setEditing(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: "var(--border)", color: "var(--warm-gray)" }}>
                取消
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mini trend */}
      {recent.length > 2 && (
        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>最近趋势</span>
            {avgMood && <span className="text-[10px] font-bold" style={{ color: "var(--mint)" }}>均 {avgMood}</span>}
          </div>
          <div className="flex items-end gap-[3px] h-8">
            {recent.slice().reverse().map((m, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${(m.mood / 5) * 100}%`,
                  backgroundColor: MOODS[m.mood - 1]?.color || "#ddd",
                  opacity: 0.6, minHeight: "3px",
                }}
                title={`${m.date}: ${MOODS[m.mood - 1]?.label}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
