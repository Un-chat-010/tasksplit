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

function countAllSteps(steps) {
  let count = 0;
  for (const s of steps) {
    count += 1;
    if (s.children?.length) count += countAllSteps(s.children);
  }
  return count;
}

function countCompleted(steps, completed) {
  let count = 0;
  for (const s of steps) {
    if (completed.has(s.id)) count++;
    if (s.children?.length) count += countCompleted(s.children, completed);
  }
  return count;
}

function totalMinutes(steps) {
  let sum = 0;
  for (const s of steps) {
    sum += s.estimated_minutes || 0;
    if (s.children?.length) sum += totalMinutes(s.children);
  }
  return sum;
}

// Single step row (recursive)
function StepRow({ step, index, depth, completed, onToggle, onStartTimer, onSplitMore, splitting }) {
  const c = COLORS[(index + depth) % COLORS.length];
  const done = completed.has(step.id);
  const hasChildren = step.children?.length > 0;
  const [expanded, setExpanded] = useState(true);
  const isSplitting = splitting === step.id;

  // If all children done, parent auto-done
  const childrenAllDone = hasChildren && step.children.every(ch =>
    completed.has(ch.id) && (!ch.children?.length || ch.children.every(gc => completed.has(gc.id)))
  );

  return (
    <>
      <div className={`relative flex items-start gap-3 p-3 rounded-2xl transition-all duration-300
        ${done || childrenAllDone ? "opacity-55" : "hover:shadow-md"}`}
        style={{
          backgroundColor: done || childrenAllDone ? "#F5F5F0" : c.bg,
          boxShadow: done ? "none" : "0 1px 8px rgba(0,0,0,0.03)",
          marginLeft: `${depth * 20}px`,
          borderLeft: `3px solid ${c.dot}`,
        }}>

        {/* Checkbox */}
        <button onClick={() => onToggle(step.id, !(done || childrenAllDone))}
          className="mt-0.5 w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all"
          style={{ backgroundColor: (done || childrenAllDone) ? c.check : "white",
            borderColor: (done || childrenAllDone) ? c.check : "#E0DCD8" }}>
          {(done || childrenAllDone) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-relaxed ${(done || childrenAllDone) ? "line-through text-gray-400" : ""}`}
            style={{ color: (done || childrenAllDone) ? undefined : "var(--soft-dark)" }}>
            {step.description}
          </p>
          {step.done_criteria && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--warm-gray)", opacity: 0.6 }}>
              ✅ {step.done_criteria}
            </p>
          )}
          {/* Actions row */}
          {!(done || childrenAllDone) && (
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => onStartTimer(step)}
                className="text-[11px] font-bold hover:scale-110 transition-all" style={{ color: c.dot }}>
                ▶ 计时
              </button>
              <button onClick={() => onSplitMore(step)}
                disabled={isSplitting}
                className="text-[11px] font-bold hover:scale-110 transition-all disabled:opacity-40"
                style={{ color: "var(--lavender)" }}>
                {isSplitting ? "拆解中..." : "🔀 继续拆"}
              </button>
              {hasChildren && (
                <button onClick={() => setExpanded(!expanded)}
                  className="text-[11px] font-bold" style={{ color: "var(--warm-gray)" }}>
                  {expanded ? "▼ 收起" : `▶ ${step.children.length} 个子步骤`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Badge */}
        <span className="text-[10px] px-2 py-1 rounded-lg font-bold flex-shrink-0"
          style={{ backgroundColor: c.badge, color: c.badgeText }}>
          {step.estimated_minutes}'
        </span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="animate-fadeIn">
          {step.children.map((child, ci) => (
            <StepRow key={child.id} step={child} index={ci} depth={depth + 1}
              completed={completed} onToggle={onToggle} onStartTimer={onStartTimer}
              onSplitMore={onSplitMore} splitting={splitting} />
          ))}
        </div>
      )}
    </>
  );
}

export default function StepTimeline({ steps, completed, onToggle, onStartTimer, onReorder, onSplitMore, splitting }) {
  const total = totalMinutes(steps);
  const allCount = countAllSteps(steps);
  const doneCount = countCompleted(steps, completed);
  const progress = allCount > 0 ? (doneCount / allCount) * 100 : 0;
  const allDone = allCount > 0 && doneCount === allCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--warm-gray)" }}>
          {doneCount}/{allCount} 完成
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg font-bold"
          style={{ backgroundColor: "#FFF3EB", color: "var(--peach)" }}>
          共 {formatMins(total)}
        </span>
      </div>

      <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`,
            background: "linear-gradient(90deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))",
            backgroundSize: "200% 100%" }} />
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
            <StepRow step={step} index={i} depth={0}
              completed={completed} onToggle={onToggle} onStartTimer={onStartTimer}
              onSplitMore={onSplitMore} splitting={splitting} />
          </div>
        ))}
      </div>

      {allDone && (
        <div className="text-center py-8 space-y-3 animate-popIn">
          <div className="text-5xl animate-float">🎉</div>
          <p className="text-xl font-extrabold" style={{ color: "var(--mint)" }}>全部完成！</p>
          <p className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
            {allCount} 个步骤 · 约 {formatMins(total)}
          </p>
        </div>
      )}
    </div>
  );
}
