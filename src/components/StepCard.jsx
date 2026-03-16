import { useState } from "react";

export default function StepCard({ step, onToggle, onStartTimer }) {
  const [checked, setChecked] = useState(false);

  function handleToggle() {
    setChecked(!checked);
    onToggle(step.order, !checked);
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all
        ${
          checked
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-100 shadow-sm hover:shadow-md"
        }`}
    >
      {/* 勾选框 */}
      <button
        onClick={handleToggle}
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${
            checked
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-indigo-400"
          }`}
      >
        {checked && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-base leading-relaxed ${
            checked ? "text-gray-400 line-through" : "text-gray-800"
          }`}
        >
          <span className="text-indigo-400 font-mono text-sm mr-2">
            {step.order}.
          </span>
          {step.description}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ✅ 完成标准：{step.done_criteria}
        </p>
      </div>

      {/* 右侧：时间 + 计时按钮 */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
          {step.estimated_minutes} 分钟
        </span>
        {!checked && (
          <button
            onClick={() => onStartTimer(step)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            ▶ 开始计时
          </button>
        )}
      </div>
    </div>
  );
}
