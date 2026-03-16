import { useState } from "react";

const MOODS = [
  { emoji: "😫", label: "很低", value: 1, color: "#FF6B6B" },
  { emoji: "😔", label: "偏低", value: 2, color: "#FFA07A" },
  { emoji: "😐", label: "一般", value: 3, color: "#FFD93D" },
  { emoji: "🙂", label: "还不错", value: 4, color: "#6BCB77" },
  { emoji: "😊", label: "很好", value: 5, color: "#4D96FF" },
];

const ENERGY = [
  { emoji: "🪫", label: "没电了", value: 1, pct: 10 },
  { emoji: "🔋", label: "电量低", value: 2, pct: 30 },
  { emoji: "🔋", label: "一般", value: 3, pct: 55 },
  { emoji: "⚡", label: "充沛", value: 4, pct: 80 },
  { emoji: "🔥", label: "满电", value: 5, pct: 100 },
];

const BODY_TAGS = ["头疼", "疲惫", "紧张", "肩颈酸", "胃不舒服", "睡得好", "精神好", "运动了", "没食欲", "心情平静"];

function getStored() {
  try { return JSON.parse(localStorage.getItem("tasksplit_moods") || "[]"); }
  catch { return []; }
}

export default function MoodTracker({ compact = false }) {
  const [moods, setMoods] = useState(getStored);
  const [selMood, setSelMood] = useState(null);
  const [selEnergy, setSelEnergy] = useState(null);
  const [selBody, setSelBody] = useState([]);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  const today = new Date().toLocaleDateString("zh-CN");
  const todayEntry = moods.find((m) => m.date === today);
  const recent = moods.slice(0, 14);
  const avgMood = recent.length > 0
    ? (recent.reduce((s, m) => s + m.mood, 0) / recent.length).toFixed(1) : null;

  function save() {
    if (!selMood || !selEnergy) return;
    const entry = { date: today, mood: selMood, energy: selEnergy,
      body: selBody, note: note.trim(), timestamp: Date.now() };
    const updated = [entry, ...moods.filter((m) => m.date !== today)].slice(0, 90);
    setMoods(updated);
    localStorage.setItem("tasksplit_moods", JSON.stringify(updated));
    setEditing(false); setSelMood(null); setSelEnergy(null); setSelBody([]); setNote("");
  }

  function toggleBody(tag) {
    setSelBody(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function startEdit() {
    if (todayEntry) {
      setSelMood(todayEntry.mood); setSelEnergy(todayEntry.energy);
      setSelBody(todayEntry.body || []); setNote(todayEntry.note || "");
    }
    setEditing(true);
  }

  // ===== COMPACT mode (sidebar widget) =====
  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>💭 今日状态</span>
          {todayEntry && !editing && (
            <button onClick={startEdit} className="text-[10px] font-bold" style={{ color: "var(--lavender)" }}>修改</button>
          )}
        </div>
        {todayEntry && !editing ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{MOODS[todayEntry.mood - 1]?.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: "var(--soft-dark)" }}>
                {MOODS[todayEntry.mood - 1]?.label} · {ENERGY[todayEntry.energy - 1]?.label}
              </p>
              {todayEntry.body?.length > 0 && (
                <p className="text-[10px] mt-0.5" style={{ color: "var(--warm-gray)" }}>
                  {todayEntry.body.join(" · ")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex gap-1">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setSelMood(m.value)}
                  className={`flex-1 py-1.5 rounded-lg text-center text-lg transition-all
                    ${selMood === m.value ? "scale-110" : "opacity-40 hover:opacity-70"}`}
                  style={selMood === m.value ? { backgroundColor: `${m.color}18`, outline: `2px solid ${m.color}` } : {}}>
                  {m.emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {ENERGY.map((e) => (
                <button key={e.value} onClick={() => setSelEnergy(e.value)}
                  className={`flex-1 py-1.5 rounded-lg text-center text-lg transition-all
                    ${selEnergy === e.value ? "scale-110" : "opacity-40 hover:opacity-70"}`}
                  style={selEnergy === e.value ? { backgroundColor: "#F3ECFF", outline: "2px solid var(--lavender)" } : {}}>
                  {e.emoji}
                </button>
              ))}
            </div>
            <button onClick={save} disabled={!selMood || !selEnergy}
              className="w-full py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--lavender), var(--pink))" }}>保存</button>
          </div>
        )}
        {/* Mini trend */}
        {recent.length > 2 && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-end gap-[3px] h-8">
              {recent.slice().reverse().map((m, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{
                  height: `${(m.mood / 5) * 100}%`, backgroundColor: MOODS[m.mood - 1]?.color,
                  opacity: 0.6, minHeight: "3px" }} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== FULL PAGE mode (mobile mood tab) =====
  return (
    <div className="space-y-4">
      {/* Brain Battery - Tiimo signature */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>🧠 大脑电量</span>
          {todayEntry && !editing && (
            <button onClick={startEdit} className="text-xs font-bold px-3 py-1 rounded-lg"
              style={{ backgroundColor: "#F3ECFF", color: "var(--lavender)" }}>修改</button>
          )}
        </div>

        {todayEntry && !editing ? (
          <div className="space-y-4">
            {/* Battery visualization */}
            <div className="flex items-center gap-4">
              <span className="text-4xl">{MOODS[todayEntry.mood - 1]?.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold" style={{ color: "var(--soft-dark)" }}>
                    {MOODS[todayEntry.mood - 1]?.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: ENERGY[todayEntry.energy - 1]?.color || "var(--mint)" }}>
                    {ENERGY[todayEntry.energy - 1]?.pct}%
                  </span>
                </div>
                {/* Battery bar */}
                <div className="w-full h-5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${ENERGY[todayEntry.energy - 1]?.pct}%`,
                      background: todayEntry.energy >= 4
                        ? "linear-gradient(90deg, var(--mint), var(--sky))"
                        : todayEntry.energy >= 3
                        ? "linear-gradient(90deg, var(--sunshine), var(--mint))"
                        : "linear-gradient(90deg, var(--coral), var(--peach))",
                    }} />
                </div>
              </div>
            </div>
            {/* Body tags */}
            {todayEntry.body?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {todayEntry.body.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ backgroundColor: "#F0ECE8", color: "var(--warm-gray)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {todayEntry.note && (
              <p className="text-sm font-medium px-1" style={{ color: "var(--warm-gray)" }}>
                💬 "{todayEntry.note}"
              </p>
            )}
          </div>
        ) : (
          /* Edit form */
          <div className="space-y-5 animate-fadeIn">
            {/* Mood */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--warm-gray)" }}>今天心情</p>
              <div className="flex gap-1.5">
                {MOODS.map((m) => (
                  <button key={m.value} onClick={() => setSelMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all
                      ${selMood === m.value ? "scale-105 shadow-md" : "opacity-40 hover:opacity-70"}`}
                    style={selMood === m.value ? { backgroundColor: `${m.color}15`, border: `2px solid ${m.color}` }
                      : { border: "2px solid transparent" }}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--warm-gray)" }}>精力电量</p>
              <div className="flex gap-1.5">
                {ENERGY.map((e) => (
                  <button key={e.value} onClick={() => setSelEnergy(e.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all
                      ${selEnergy === e.value ? "scale-105 shadow-md" : "opacity-40 hover:opacity-70"}`}
                    style={selEnergy === e.value ? { backgroundColor: "#F3ECFF", border: "2px solid var(--lavender)" }
                      : { border: "2px solid transparent" }}>
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body check-in */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--warm-gray)" }}>身体状况（可多选）</p>
              <div className="flex flex-wrap gap-2">
                {BODY_TAGS.map((tag) => {
                  const active = selBody.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleBody(tag)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                      style={{
                        backgroundColor: active ? "var(--peach)" : "var(--border)",
                        color: active ? "white" : "var(--warm-gray)",
                      }}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: "var(--warm-gray)" }}>想说点什么？</p>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="今天发生了什么..."
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none border-2"
                style={{ borderColor: "var(--border)", color: "var(--soft-dark)" }}
                onFocus={(e) => e.target.style.borderColor = "var(--lavender)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            </div>

            <div className="flex gap-2">
              <button onClick={save} disabled={!selMood || !selEnergy}
                className="flex-1 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, var(--lavender), var(--pink))" }}>
                保存
              </button>
              {editing && todayEntry && (
                <button onClick={() => setEditing(false)}
                  className="px-5 py-3 rounded-2xl font-bold"
                  style={{ backgroundColor: "var(--border)", color: "var(--warm-gray)" }}>取消</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trend chart */}
      {recent.length > 1 && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📈 趋势</span>
            {avgMood && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
                平均 {avgMood}/5
              </span>
            )}
          </div>
          <div className="flex items-end gap-1 h-20">
            {recent.slice().reverse().map((m, i) => {
              const mood = MOODS[m.mood - 1];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold" style={{ color: "var(--warm-gray)" }}>
                    {mood?.emoji}
                  </span>
                  <div className="w-full rounded-lg transition-all"
                    style={{ height: `${(m.mood / 5) * 100}%`, backgroundColor: mood?.color, opacity: 0.6, minHeight: "4px" }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-1">
            <span className="text-[9px] font-medium" style={{ color: "var(--warm-gray)" }}>
              {recent[recent.length - 1]?.date}
            </span>
            <span className="text-[9px] font-medium" style={{ color: "var(--warm-gray)" }}>今天</span>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="card p-5 space-y-3">
        <button onClick={() => setViewHistory(!viewHistory)}
          className="flex items-center justify-between w-full">
          <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📅 历史记录</span>
          <span className="text-xs" style={{ color: "var(--warm-gray)" }}>
            {viewHistory ? "收起 ▲" : `${moods.length} 条 ▼`}
          </span>
        </button>
        {viewHistory && (
          <div className="space-y-2 max-h-80 overflow-y-auto animate-slideDown">
            {moods.slice(0, 30).map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}>
                <span className="text-xl">{MOODS[m.mood - 1]?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "var(--soft-dark)" }}>{m.date}</span>
                    <span className="text-[10px] font-medium" style={{ color: "var(--warm-gray)" }}>
                      {MOODS[m.mood - 1]?.label} · {ENERGY[m.energy - 1]?.label}
                    </span>
                  </div>
                  {m.note && <p className="text-[10px] truncate" style={{ color: "var(--warm-gray)" }}>"{m.note}"</p>}
                </div>
              </div>
            ))}
            {moods.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "var(--warm-gray)" }}>还没有记录，今天开始吧</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
