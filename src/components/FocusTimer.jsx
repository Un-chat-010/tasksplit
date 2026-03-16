import { useState, useEffect, useRef } from "react";

export default function FocusTimer({ step, onComplete, onClose }) {
  const totalSeconds = step.estimated_minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, secondsLeft]);

  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeUp = secondsLeft <= 0;

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ backgroundColor: "rgba(45, 42, 50, 0.85)", backdropFilter: "blur(12px)" }}>
      <div className="rounded-[2rem] p-10 max-w-md w-full mx-4 text-center space-y-8 animate-popIn"
        style={{ backgroundColor: "var(--cream)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Step description */}
        <div className="px-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--peach)" }}>
            专注中
          </p>
          <p className="text-lg font-bold leading-relaxed"
            style={{ color: "var(--soft-dark)" }}>
            {step.description}
          </p>
        </div>

        {/* Timer ring */}
        <div className="relative w-56 h-56 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            {/* Background ring */}
            <circle cx="110" cy="110" r={radius}
              fill="none" stroke="#F0ECE8" strokeWidth="10" />
            {/* Progress ring - gradient effect */}
            <circle cx="110" cy="110" r={radius}
              fill="none"
              stroke={timeUp ? "var(--mint)" : "var(--coral)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold tabular-nums"
              style={{ color: "var(--soft-dark)" }}>
              {String(minutes).padStart(2, "0")}
              <span className="animate-pulse">:</span>
              {String(seconds).padStart(2, "0")}
            </span>
            {!timeUp && (
              <button
                onClick={() => setRunning(!running)}
                className="mt-2 text-sm font-bold transition-all hover:scale-110"
                style={{ color: "var(--warm-gray)" }}
              >
                {running ? "⏸ 暂停" : "▶ 继续"}
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {timeUp ? (
          <div className="space-y-4">
            <p className="text-lg font-bold" style={{ color: "var(--mint)" }}>
              ⏰ 时间到！完成了吗？
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onComplete}
                className="px-8 py-3 rounded-2xl text-white font-bold text-base
                  transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
                style={{
                  background: "linear-gradient(135deg, var(--mint), #4CAF50)",
                  boxShadow: "0 4px 16px rgba(107,203,119,0.4)",
                }}
              >
                ✅ 完成了！
              </button>
              <button
                onClick={() => { setSecondsLeft(5 * 60); setRunning(true); }}
                className="px-6 py-3 rounded-2xl font-bold text-base
                  transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "#F0ECE8",
                  color: "var(--warm-gray)",
                }}
              >
                再 5 分钟
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="text-sm font-semibold transition-all hover:scale-105"
            style={{ color: "var(--warm-gray)", opacity: 0.6 }}
          >
            取消计时
          </button>
        )}
      </div>
    </div>
  );
}
