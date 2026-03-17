import { useState, useRef } from "react";

const STATUS_OPTIONS = [
  { value: "not_started", label: "还没开始", emoji: "🆕" },
  { value: "in_progress", label: "进行中", emoji: "🔄" },
  { value: "stuck", label: "卡住了", emoji: "😵" },
  { value: "almost_done", label: "快完成了", emoji: "🏁" },
];

export default function TaskInput({ onSubmit, loading }) {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState(null);
  const [goal, setGoal] = useState("");
  const [showAttrs, setShowAttrs] = useState(false);
  const inputRef = useRef(null);

  function handleSubmit() {
    if (!task.trim()) return;
    onSubmit({
      task: task.trim(),
      deadline: deadline || null,
      status: status || null,
      goal: goal.trim() || null,
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function clearAttrs() {
    setDeadline(""); setStatus(null); setGoal(""); setShowAttrs(false);
  }

  const hasAttrs = deadline || status || goal;

  return (
    <div className="space-y-3">
      {/* Attribute pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowAttrs(!showAttrs)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: showAttrs ? "var(--coral)" : hasAttrs ? "#FFF0F0" : "var(--border)",
            color: showAttrs ? "white" : hasAttrs ? "var(--coral)" : "var(--warm-gray)",
          }}>
          ⚙️ {hasAttrs ? "已设属性" : "设置属性"}
        </button>

        {/* Show current attributes as small tags */}
        {!showAttrs && hasAttrs && (
          <>
            {deadline && (
              <span className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                style={{ backgroundColor: "#FFF3EB", color: "var(--peach)" }}>
                📅 {deadline}
              </span>
            )}
            {status && (
              <span className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                style={{ backgroundColor: "#EBF3FF", color: "var(--sky)" }}>
                {STATUS_OPTIONS.find(s => s.value === status)?.emoji} {STATUS_OPTIONS.find(s => s.value === status)?.label}
              </span>
            )}
            {goal && (
              <span className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold truncate max-w-[140px]"
                style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
                🎯 {goal}
              </span>
            )}
            <button onClick={clearAttrs} className="text-[10px] font-bold self-center"
              style={{ color: "var(--warm-gray)" }}>✕</button>
          </>
        )}
      </div>

      {/* Attribute panel */}
      {showAttrs && (
        <div className="rounded-2xl p-4 space-y-4 animate-popIn"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

          {/* Deadline */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>📅 截止日期</p>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none"
              style={{ borderColor: "var(--border)" }} />
            {deadline && (() => {
              const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
              return (
                <p className="text-[10px] font-bold mt-1"
                  style={{ color: days <= 3 ? "var(--coral)" : days <= 7 ? "var(--peach)" : "var(--mint)" }}>
                  {days <= 0 ? "⚠️ 已过期！" : days === 1 ? "⚠️ 明天截止" : `还有 ${days} 天`}
                </p>
              );
            })()}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>📊 当前状态</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setStatus(status === opt.value ? null : opt.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor: status === opt.value ? "var(--sky)" : "#EBF3FF",
                    color: status === opt.value ? "white" : "var(--sky)",
                  }}>
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>🎯 完成后的样子（什么算成功？）</p>
            <input type="text" value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="例如：论文通过查重、拿到面试邀请..."
              className="w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none"
              style={{ borderColor: "var(--border)" }} />
          </div>

          <button onClick={() => setShowAttrs(false)}
            className="w-full py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))" }}>
            确定
          </button>
        </div>
      )}

      {/* Input row */}
      {!showAttrs && (
        <div className="flex gap-2 min-w-0 animate-fadeIn">
          <input ref={inputRef} type="text" value={task} onChange={e => setTask(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="你今天要做什么？" disabled={loading}
            className="flex-1 min-w-0 px-4 py-3 rounded-2xl border-2 border-transparent text-sm font-medium
              placeholder-gray-300 focus:outline-none transition-all"
            style={{ backgroundColor: "white", boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}
            onFocus={e => e.target.style.borderColor = "var(--peach)"}
            onBlur={e => e.target.style.borderColor = "transparent"} />
          <button onClick={handleSubmit} disabled={!task.trim() || loading}
            className="flex-shrink-0 px-4 py-3 rounded-2xl font-bold text-white text-sm
              transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))",
              boxShadow: "0 3px 12px rgba(255,107,107,0.25)" }}>
            {loading ? "拆中..." : "拆解"}
          </button>
        </div>
      )}
    </div>
  );
}
