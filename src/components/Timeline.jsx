import { useState, useRef } from "react";

const TIMELINE_COLORS = [
  { dot: "#FF6B6B", line: "#FFD0D0", bg: "#FFF0F0" },
  { dot: "#FFD93D", line: "#FFF3C4", bg: "#FFFBE5" },
  { dot: "#6BCB77", line: "#C4F0C8", bg: "#EDFAEF" },
  { dot: "#4D96FF", line: "#C4DAFF", bg: "#EBF3FF" },
  { dot: "#B088F9", line: "#DCC8FF", bg: "#F3ECFF" },
  { dot: "#FF8ED4", line: "#FFD0EC", bg: "#FFF0F8" },
  { dot: "#FFA07A", line: "#FFD4C0", bg: "#FFF3EB" },
];

export default function Timeline({ steps, completed, onReorder, onStartTimer, onToggle }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragItemRef = useRef(null);

  // Cumulative time for timeline
  let cumulative = 0;
  const timeMarkers = steps.map((s) => {
    const start = cumulative;
    cumulative += s.estimated_minutes;
    return { start, end: cumulative };
  });
  const totalMinutes = cumulative;

  function handleDragStart(e, index) {
    setDragIndex(index);
    dragItemRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Make ghost semi-transparent
    e.target.style.opacity = "0.5";
  }

  function handleDragEnd(e) {
    e.target.style.opacity = "1";
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      onReorder(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    setOverIndex(index);
  }

  function formatTime(minutes) {
    if (minutes < 60) return `${minutes}分钟`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-5">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--soft-dark)" }}>
          🕐 时间线
        </h2>
        <span className="text-sm font-bold px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: "#FFF3EB", color: "var(--peach)" }}>
          共 {formatTime(totalMinutes)}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative pl-12">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-4 bottom-4 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))" }} />

        {steps.map((step, i) => {
          const color = TIMELINE_COLORS[i % TIMELINE_COLORS.length];
          const isCompleted = completed.has(step.order);
          const isDragging = dragIndex === i;
          const isDragOver = overIndex === i && dragIndex !== i;

          return (
            <div
              key={step.order}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, i)}
              className={`relative mb-3 transition-all duration-200 cursor-grab active:cursor-grabbing
                ${isDragOver ? "translate-y-1" : ""}
                ${isDragging ? "opacity-50 scale-95" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Dot on timeline */}
              <div className="absolute -left-12 top-5 flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-[3px] transition-all ${
                    isCompleted ? "scale-110" : ""
                  }`}
                  style={{
                    borderColor: color.dot,
                    backgroundColor: isCompleted ? color.dot : "var(--cream)",
                  }}
                >
                  {isCompleted && (
                    <svg className="w-full h-full p-0.5 text-white" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Drop indicator */}
              {isDragOver && (
                <div className="absolute -top-1.5 left-0 right-0 h-[3px] rounded-full"
                  style={{ backgroundColor: color.dot }} />
              )}

              {/* Card */}
              <div
                className={`rounded-2xl p-4 transition-all ${
                  isCompleted ? "opacity-60" : "hover:shadow-md"
                }`}
                style={{
                  backgroundColor: isCompleted ? "#F5F5F0" : color.bg,
                  boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-relaxed ${
                      isCompleted ? "line-through text-gray-400" : ""
                    }`} style={{ color: isCompleted ? undefined : "var(--soft-dark)" }}>
                      {step.description}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: "var(--warm-gray)", opacity: 0.6 }}>
                      ✅ {step.done_criteria}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {/* Time badge */}
                    <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold whitespace-nowrap"
                      style={{ backgroundColor: color.line, color: color.dot }}>
                      {timeMarkers[i].start > 0 ? `${timeMarkers[i].start}′ → ` : ""}{timeMarkers[i].end}′
                    </span>
                    {/* Actions */}
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onToggle(step.order, true)}
                          className="text-[11px] font-bold transition-all hover:scale-110"
                          style={{ color: "var(--mint)" }}>
                          ✓ 完成
                        </button>
                        <button
                          onClick={() => onStartTimer(step)}
                          className="text-[11px] font-bold transition-all hover:scale-110"
                          style={{ color: color.dot }}>
                          ▶ 计时
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* End marker */}
        <div className="relative">
          <div className="absolute -left-12 top-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              style={{ backgroundColor: "#F0ECE8" }}>
              🏁
            </div>
          </div>
          <div className="py-2 pl-1">
            <p className="text-xs font-bold" style={{ color: "var(--warm-gray)", opacity: 0.5 }}>
              全部完成 · 预计 {formatTime(totalMinutes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
