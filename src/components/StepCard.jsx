import { useState } from "react";

const COLORS = [
  { bg: "#FFF0F0", check: "#FF6B6B", badge: "#FFE0E0", badgeText: "#FF6B6B" },
  { bg: "#FFF8E0", check: "#FFD93D", badge: "#FFF3C4", badgeText: "#D4A000" },
  { bg: "#E8F8EB", check: "#6BCB77", badge: "#D4F5D4", badgeText: "#4CAF50" },
  { bg: "#EBF3FF", check: "#4D96FF", badge: "#D6E8FF", badgeText: "#2979FF" },
  { bg: "#F3ECFF", check: "#B088F9", badge: "#E8DCFF", badgeText: "#7C4DFF" },
  { bg: "#FFF0F8", check: "#FF8ED4", badge: "#FFE0F0", badgeText: "#E91E90" },
  { bg: "#FFF3EB", check: "#FFA07A", badge: "#FFE4D4", badgeText: "#FF7043" },
];

export default function StepCard({ step, onToggle, onStartTimer, index }) {
  const [checked, setChecked] = useState(false);
  const color = COLORS[index % COLORS.length];

  function handleToggle() {
    setChecked(!checked);
    onToggle(step.order, !checked);
  }

  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 step-color-${index % 7}
        ${checked ? "opacity-60 scale-[0.98]" : "hover:scale-[1.01] hover:shadow-lg"}`}
      style={{
        backgroundColor: checked ? "#F5F5F0" : color.bg,
        boxShadow: checked ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="mt-1 w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center
          transition-all duration-200 border-2"
        style={{
          backgroundColor: checked ? color.check : "white",
          borderColor: checked ? color.check : "#E0DCD8",
        }}
      >
        {checked && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-base font-semibold leading-relaxed transition-all ${
          checked ? "line-through text-gray-400" : ""
        }`} style={{ color: checked ? undefined : "var(--soft-dark)" }}>
          {step.description}
        </p>
        <p className="text-sm mt-1.5 font-medium" style={{ color: "var(--warm-gray)", opacity: 0.7 }}>
          ✅ {step.done_criteria}
        </p>
      </div>

      {/* Time badge + timer */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs px-3 py-1.5 rounded-xl font-bold"
          style={{ backgroundColor: color.badge, color: color.badgeText }}>
          {step.estimated_minutes}分钟
        </span>
        {!checked && (
          <button
            onClick={() => onStartTimer(step)}
            className="text-xs font-bold transition-all hover:scale-110 active:scale-95"
            style={{ color: color.check }}
          >
            ▶ 计时
          </button>
        )}
      </div>
    </div>
  );
}
