export default function CompletionRecord({ records }) {
  if (!records || records.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-8 animate-fadeInUp">
      <h3 className="text-lg font-extrabold mb-4 px-2" style={{ color: "var(--soft-dark)" }}>
        📊 完成记录
      </h3>
      <div className="space-y-2">
        {records.map((rec, i) => (
          <div key={i}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              backgroundColor: "white",
              boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
            }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {rec.steps >= 5 ? "🔥" : rec.steps >= 3 ? "⭐" : "💪"}
              </span>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--soft-dark)" }}>
                  {rec.task}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
                  {rec.date}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold" style={{ color: "var(--mint)" }}>
                {rec.steps} 步
              </p>
              <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
                {rec.minutes} 分钟
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
