import StepCard from "./StepCard.jsx";

export default function StepList({ steps, onToggle, onStartTimer, completedCount }) {
  const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);
  const allDone = completedCount === steps.length && steps.length > 0;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--soft-dark)" }}>
          📋 拆解结果
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold px-3 py-1 rounded-xl"
            style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
            {completedCount}/{steps.length}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
            约 {totalMinutes} 分钟
          </span>
        </div>
      </div>

      {/* Colorful progress bar - Tiimo gradient style */}
      <div className="w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: "#F0ECE8" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--coral), var(--sunshine), var(--mint), var(--sky), var(--lavender))",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.order} className="animate-fadeInUp"
            style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
            <StepCard
              step={step}
              index={i}
              onToggle={onToggle}
              onStartTimer={onStartTimer}
            />
          </div>
        ))}
      </div>

      {/* Celebration */}
      {allDone && (
        <div className="text-center py-10 space-y-4 animate-popIn">
          <div className="text-6xl animate-float">🎉</div>
          <p className="text-2xl font-extrabold" style={{ color: "var(--mint)" }}>
            太棒了！全部完成！
          </p>
          <p className="text-base font-medium" style={{ color: "var(--warm-gray)" }}>
            今天完成了 <strong>{steps.length}</strong> 个步骤，共约 <strong>{totalMinutes}</strong> 分钟
          </p>
          <div className="flex justify-center gap-2 text-2xl">
            {["🌟", "💪", "🔥", "✨", "🏆"].map((e, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 200}ms` }}>
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
