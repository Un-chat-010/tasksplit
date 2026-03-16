import { useState, useEffect } from "react";

const MOODS = [
  { emoji: "😫", label: "很低", value: 1, color: "#FF6B6B" },
  { emoji: "😔", label: "偏低", value: 2, color: "#FFA07A" },
  { emoji: "😐", label: "一般", value: 3, color: "#FFD93D" },
  { emoji: "🙂", label: "还不错", value: 4, color: "#6BCB77" },
  { emoji: "😊", label: "很好", value: 5, color: "#4D96FF" },
];

const ENERGY_LEVELS = [
  { emoji: "🪫", label: "没电了", value: 1 },
  { emoji: "🔋", label: "电量低", value: 2 },
  { emoji: "🔋", label: "一般", value: 3 },
  { emoji: "⚡", label: "精力充沛", value: 4 },
  { emoji: "🔥", label: "超级满电", value: 5 },
];

function getStoredMoods() {
  try {
    return JSON.parse(localStorage.getItem("tasksplit_moods") || "[]");
  } catch { return []; }
}

function saveMoods(moods) {
  localStorage.setItem("tasksplit_moods", JSON.stringify(moods));
}

export default function MoodTracker() {
  const [moods, setMoods] = useState(getStoredMoods);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toLocaleDateString("zh-CN");
  const todayEntry = moods.find((m) => m.date === today);
  const recentMoods = moods.slice(0, 14); // Last 14 days

  function handleSubmit() {
    if (!selectedMood || !selectedEnergy) return;

    const entry = {
      date: today,
      mood: selectedMood,
      energy: selectedEnergy,
      note: note.trim(),
      timestamp: Date.now(),
    };

    const updated = [entry, ...moods.filter((m) => m.date !== today)].slice(0, 90);
    setMoods(updated);
    saveMoods(updated);
    setShowForm(false);
    setSelectedMood(null);
    setSelectedEnergy(null);
    setNote("");
  }

  // Find patterns
  const avgMood = recentMoods.length > 0
    ? (recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length).toFixed(1)
    : null;

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--soft-dark)" }}>
          💭 今日状态
        </h2>
        {!todayEntry && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-2xl text-sm font-bold text-white
              transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--lavender), var(--pink))" }}>
            记录今天
          </button>
        )}
      </div>

      {/* Today's entry display */}
      {todayEntry && !showForm && (
        <div className="rounded-3xl p-5 animate-fadeInUp"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{MOODS[todayEntry.mood - 1]?.emoji}</span>
            <div>
              <p className="font-bold" style={{ color: "var(--soft-dark)" }}>
                心情{MOODS[todayEntry.mood - 1]?.label}，精力{ENERGY_LEVELS[todayEntry.energy - 1]?.label}
              </p>
              {todayEntry.note && (
                <p className="text-sm mt-1" style={{ color: "var(--warm-gray)" }}>
                  "{todayEntry.note}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-xs font-bold transition-all hover:scale-105"
            style={{ color: "var(--lavender)" }}>
            修改
          </button>
        </div>
      )}

      {/* Entry form */}
      {showForm && (
        <div className="rounded-3xl p-6 space-y-5 animate-popIn"
          style={{ backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          
          {/* Mood picker */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "var(--soft-dark)" }}>
              今天心情怎么样？
            </p>
            <div className="flex justify-between">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all
                    ${selectedMood === m.value ? "scale-110 shadow-md" : "hover:scale-105 opacity-60"}`}
                  style={{
                    backgroundColor: selectedMood === m.value ? `${m.color}15` : "transparent",
                    border: selectedMood === m.value ? `2px solid ${m.color}` : "2px solid transparent",
                  }}>
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy picker */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "var(--soft-dark)" }}>
              精力状态？
            </p>
            <div className="flex justify-between">
              {ENERGY_LEVELS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setSelectedEnergy(e.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all
                    ${selectedEnergy === e.value ? "scale-110 shadow-md" : "hover:scale-105 opacity-60"}`}
                  style={{
                    backgroundColor: selectedEnergy === e.value ? "#F3ECFF" : "transparent",
                    border: selectedEnergy === e.value ? "2px solid var(--lavender)" : "2px solid transparent",
                  }}>
                  <span className="text-2xl">{e.emoji}</span>
                  <span className="text-[10px] font-bold" style={{ color: "var(--warm-gray)" }}>
                    {e.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-sm font-bold mb-2" style={{ color: "var(--soft-dark)" }}>
              想说点什么？（可选）
            </p>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天发生了什么..."
              className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-medium
                focus:outline-none transition-all"
              style={{ borderColor: "#F0ECE8", color: "var(--soft-dark)" }}
              onFocus={(e) => e.target.style.borderColor = "var(--lavender)"}
              onBlur={(e) => e.target.style.borderColor = "#F0ECE8"}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedMood || !selectedEnergy}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all
                hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, var(--lavender), var(--pink))" }}>
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-2xl font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "#F0ECE8", color: "var(--warm-gray)" }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* History - mini mood bar chart */}
      {recentMoods.length > 1 && (
        <div className="rounded-3xl p-5 space-y-3"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "var(--soft-dark)" }}>
              📈 最近趋势
            </p>
            {avgMood && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
                平均 {avgMood}/5
              </span>
            )}
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {recentMoods.slice().reverse().map((m, i) => {
              const mood = MOODS[m.mood - 1];
              const height = (m.mood / 5) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-lg transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: mood?.color || "#ddd",
                      opacity: 0.7,
                      minHeight: "4px",
                    }}
                    title={`${m.date}: ${mood?.label}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-medium" style={{ color: "var(--warm-gray)" }}>
              {recentMoods[recentMoods.length - 1]?.date}
            </span>
            <span className="text-[10px] font-medium" style={{ color: "var(--warm-gray)" }}>
              今天
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
