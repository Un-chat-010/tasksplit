import { useState, useRef } from "react";

const COLORS = [
  { dot: "#FF6B6B", bg: "#FFF0F0", check: "#FF6B6B", badge: "#FFE0E0", badgeText: "#FF6B6B" },
  { dot: "#FFD93D", bg: "#FFF8E0", check: "#FFD93D", badge: "#FFF3C4", badgeText: "#D4A000" },
  { dot: "#6BCB77", bg: "#E8F8EB", check: "#6BCB77", badge: "#D4F5D4", badgeText: "#4CAF50" },
  { dot: "#4D96FF", bg: "#EBF3FF", check: "#4D96FF", badge: "#D6E8FF", badgeText: "#2979FF" },
  { dot: "#B088F9", bg: "#F3ECFF", check: "#B088F9", badge: "#E8DCFF", badgeText: "#7C4DFF" },
  { dot: "#FF8ED4", bg: "#FFF0F8", check: "#FF8ED4", badge: "#FFE0F0", badgeText: "#E91E90" },
  { dot: "#FFA07A", bg: "#FFF3EB", check: "#FFA07A", badge: "#FFE4D4", badgeText: "#FF7043" },
];

function formatMins(m) {
  if (m < 60) return `${m}'`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h${m % 60}'` : `${h}h`;
}

export default function StepTimeline({ steps, completed, onToggle, onStartTimer, onReorder }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const totalMins = steps.reduce((s, st) => s + st.estimated_minutes, 0);
  const completedCount = completed.size;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const allDone = completedCount === steps.length && steps.length > 0;

  // cumulative time markers
  let cum = 0;
  const cumTimes = steps.map(s => { const start = cum; cum += s.estimated_minutes; return { start, end: cum }; });

  function handleDragStart(e, i) { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; e.target.style.opacity = "0.4"; }
  function handleDragEnd(e) {
    e.target.style.opacity = "1";
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) onReorder(dragIdx, overIdx);
    setDragIdx(null); setOverIdx(null);
  }
  function handleDragOver(e, i) { e.preventDefault(); setOverIdx(i); }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: "var(--warm-gray)" }}>
            {completedCount}/{steps.length} 完成
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg font-bold"
            style={{ backgroundColor: "#FFF3EB", color: "var(--peach)" }}>
            共 {formatMins(totalMins)}
          </span>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--warm-gray)" }}>
          可拖拽调整顺序
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`,
            background: "linear-gradient(90deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))",
            backgroundSize: "200% 100%" }} />
      </div>

      {/* Unified timeline + list */}
      <div className="relative pl-14 lg:pl-16">
        {/* Vertical timeline line */}
        <div className="absolute left-[22px] lg:left-[26px] top-3 bottom-3 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))" }} />

        {steps.map((step, i) => {
          const c = COLORS[i % COLORS.length];
          const done = completed.has(step.order);
          const isDragging = dragIdx === i;
          const isDragOver = overIdx === i && dragIdx !== i;

          return (
            <div key={step.order}
              draggable onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, i)}
              className={`relative mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing
                ${isDragging ? "opacity-40 scale-95" : ""} animate-fadeInUp`}
              style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>

              {/* Timeline dot + time label */}
              <div className="absolute -left-14 lg:-left-16 top-4 flex flex-col items-center" style={{ width: "44px" }}>
                <div className={`w-5 h-5 rounded-full border-[3px] transition-all flex items-center justify-center
                  ${done ? "scale-110" : ""}`}
                  style={{ borderColor: c.dot, backgroundColor: done ? c.dot : "var(--cream)" }}>
                  {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-[9px] font-bold mt-1 whitespace-nowrap" style={{ color: c.dot, opacity: 0.7 }}>
                  {formatMins(cumTimes[i].start)}
                </span>
              </div>

              {/* Drop indicator */}
              {isDragOver && <div className="absolute -top-1.5 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: c.dot }} />}

              {/* Card */}
              <div className={`rounded-2xl p-4 transition-all duration-300 step-color-${i % 7}
                ${done ? "opacity-55" : "hover:shadow-lg"}`}
                style={{ backgroundColor: done ? "#F5F5F0" : c.bg,
                  boxShadow: done ? "none" : "0 2px 12px rgba(0,0,0,0.04)" }}>

                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button onClick={() => onToggle(step.order, !done)}
                    className="mt-0.5 w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all"
                    style={{ backgroundColor: done ? c.check : "white", borderColor: done ? c.check : "#E0DCD8" }}>
                    {done && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-relaxed ${done ? "line-through text-gray-400" : ""}`}
                      style={{ color: done ? undefined : "var(--soft-dark)" }}>
                      {step.description}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: "var(--warm-gray)", opacity: 0.6 }}>
                      ✅ {step.done_criteria}
                    </p>
                  </div>

                  {/* Badge + timer */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold"
                      style={{ backgroundColor: c.badge, color: c.badgeText }}>
                      {step.estimated_minutes}分钟
                    </span>
                    {!done && (
                      <button onClick={() => onStartTimer(step)}
                        className="text-[11px] font-bold hover:scale-110 transition-all"
                        style={{ color: c.dot }}>
                        ▶ 计时
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* End marker */}
        <div className="relative">
          <div className="absolute -left-14 lg:-left-16 top-0" style={{ width: "44px" }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] mx-auto"
              style={{ backgroundColor: "var(--border)" }}>🏁</div>
            <span className="text-[9px] font-bold mt-1 block text-center" style={{ color: "var(--warm-gray)", opacity: 0.5 }}>
              {formatMins(totalMins)}
            </span>
          </div>
          <div className="py-2 pl-1">
            <p className="text-[11px] font-bold" style={{ color: "var(--warm-gray)", opacity: 0.4 }}>
              预计总时长 {formatMins(totalMins)}
            </p>
          </div>
        </div>
      </div>

      {/* Celebration */}
      {allDone && (
        <div className="text-center py-8 space-y-3 animate-popIn">
          <div className="text-5xl animate-float">🎉</div>
          <p className="text-xl font-extrabold" style={{ color: "var(--mint)" }}>全部完成！</p>
          <p className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
            {steps.length} 个步骤 · 约 {formatMins(totalMins)}
          </p>
          <div className="flex justify-center gap-2 text-xl">
            {["🌟","💪","🔥","✨","🏆"].map((e, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i*200}ms` }}>{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
