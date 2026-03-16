import StepCard from "./StepCard.jsx";

export default function StepList({ steps, onToggle, onStartTimer, completedCount }) {
  const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* 统计栏 */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-700">
          拆解结果
          <span className="text-sm font-normal text-gray-400 ml-2">
            {completedCount}/{steps.length} 完成
          </span>
        </h2>
        <span className="text-sm text-gray-400">
          预计共 {totalMinutes} 分钟
        </span>
      </div>

      {/* 进度条 */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-green-400 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* 步骤列表 */}
      <div className="space-y-3">
        {steps.map((step) => (
          <StepCard
            key={step.order}
            step={step}
            onToggle={onToggle}
            onStartTimer={onStartTimer}
          />
        ))}
      </div>

      {/* 全部完成 */}
      {completedCount === steps.length && steps.length > 0 && (
        <div className="text-center py-8 space-y-2 animate-fadeIn">
          <div className="text-4xl">🎉</div>
          <p className="text-lg font-semibold text-green-600">
            太棒了！所有步骤都完成了！
          </p>
          <p className="text-sm text-gray-400">
            今天完成了 {steps.length} 个步骤，共约 {totalMinutes} 分钟
          </p>
        </div>
      )}
    </div>
  );
}
