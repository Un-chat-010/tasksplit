import StepCard from "./StepCard.jsx";

export default function StepList({ steps, onToggle, onStartTimer, completedCount }) {
  const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);
  const allDone = completedCount === steps.length && steps.length > 0;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--warm-gray)" }}>
          {completedCount}/{steps.length} 完成
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
          约 {totalMinutes} 分钟
        </span>
      </div>

      {/* Progress */}
      <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`,
            background: "linear-gradient(90deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))",
            backgroundSize: "200% 100%" }} />
      </div>

      {/* Cards */}
      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <div key={step.order} className="animate-fadeInUp" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
            <StepCard step={step} index={i} onToggle={onToggle} onStartTimer={onStartTimer} />
          </div>
        ))}
      </div>

      {/* Done celebration */}
      {allDone && (
        <div className="text-center py-8 space-y-3 animate-popIn">
          <div className="text-5xl animate-float">🎉</div>
          <p className="text-xl font-extrabold" style={{ color: "var(--mint)" }}>全部完成！</p>
          <p className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
            {steps.length} 个步骤 · 约 {totalMinutes} 分钟
          </p>
          <div className="flex justify-center gap-2 text-xl">
            {["🌟","💪","🔥","✨","🏆"].map((e, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 200}ms` }}>{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
