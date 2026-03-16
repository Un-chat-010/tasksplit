export default function CompletionRecord({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="card p-4 text-center">
        <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
          📊 完成记录会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>
        📊 完成记录
      </span>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {records.slice(0, 8).map((rec, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-1 border-b last:border-0"
            style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">
                {rec.steps >= 5 ? "🔥" : rec.steps >= 3 ? "⭐" : "💪"}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: "var(--soft-dark)" }}>
                  {rec.task}
                </p>
                <p className="text-[10px] font-medium" style={{ color: "var(--warm-gray)" }}>
                  {rec.date}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-xs font-extrabold" style={{ color: "var(--mint)" }}>{rec.steps}步</p>
              <p className="text-[10px]" style={{ color: "var(--warm-gray)" }}>{rec.minutes}分</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
