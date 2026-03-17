import { useState, useEffect, useRef, useCallback } from "react";

export default function FocusTimer({ step, onComplete, onClose, onSplitMore }) {
  const totalSeconds = step.estimated_minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [stuckDismissed, setStuckDismissed] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, secondsLeft]);

  // Stuck detection: if elapsed > 150% of estimated and not dismissed
  const elapsed = totalSeconds - secondsLeft;
  const stuckThreshold = totalSeconds * 1.5;
  useEffect(() => {
    if (elapsed > stuckThreshold && !stuckDismissed && secondsLeft > 0) {
      setShowStuckHint(true);
    }
  }, [elapsed]);

  // Keyboard shortcuts
  const handleKey = useCallback((e) => {
    if (e.key === " " || e.code === "Space") { e.preventDefault(); setRunning(r => !r); }
    if (e.key === "Enter") { e.preventDefault(); onComplete(); }
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
  }, [onComplete, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const progress = 1 - secondsLeft / totalSeconds;
  const mins = Math.floor(Math.abs(secondsLeft) / 60);
  const secs = Math.abs(secondsLeft) % 60;
  const timeUp = secondsLeft <= 0;
  const overTime = secondsLeft < 0;

  const radius = 100;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.min(progress, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ background: "linear-gradient(135deg, #2D2A32 0%, #1a1520 50%, #2D2A32 100%)" }}>
      <div className="max-w-md w-full mx-4 text-center space-y-6">

        {/* Step info */}
        <div className="px-6">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--peach)", opacity: 0.8 }}>
            专注中
          </p>
          <p className="text-lg font-bold leading-relaxed text-white">
            {step.description}
          </p>
          {step.done_criteria && (
            <p className="text-xs mt-2 text-white opacity-40">✅ {step.done_criteria}</p>
          )}
        </div>

        {/* Timer ring */}
        <div className="relative w-56 h-56 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle cx="110" cy="110" r={radius} fill="none"
              stroke={timeUp ? "#6BCB77" : overTime ? "#FF6B6B" : "#FF6B6B"}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-extrabold tabular-nums text-white ${overTime ? "text-red-400" : ""}`}>
              {overTime && "+"}{String(mins).padStart(2, "0")}
              <span className={running ? "animate-pulse" : ""}>:</span>
              {String(secs).padStart(2, "0")}
            </span>
            {!timeUp && (
              <button onClick={() => setRunning(!running)}
                className="mt-2 text-sm font-bold text-white opacity-50 hover:opacity-100 transition-all">
                {running ? "⏸ 暂停" : "▶ 继续"}
              </button>
            )}
          </div>
        </div>

        {/* Time up actions */}
        {timeUp && (
          <div className="space-y-4 animate-popIn">
            <p className="text-lg font-bold" style={{ color: "var(--mint)" }}>⏰ 时间到！</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onComplete}
                className="px-8 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--mint), #4CAF50)",
                  boxShadow: "0 4px 16px rgba(107,203,119,0.4)" }}>
                ✅ 完成了
              </button>
              <button onClick={() => { setSecondsLeft(5 * 60); setRunning(true); }}
                className="px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                +5分钟
              </button>
            </div>
          </div>
        )}

        {/* Stuck hint (P1 卡住检测) */}
        {showStuckHint && !stuckDismissed && !timeUp && (
          <div className="mx-4 p-4 rounded-2xl animate-slideDown"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <p className="text-sm font-bold text-white mb-3">卡住了？试试这些：</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => { onClose(); onSplitMore?.(step); }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: "var(--lavender)" }}>
                🔀 把这步再拆细
              </button>
              <button onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: "var(--sky)" }}>
                🔄 换个步骤先做
              </button>
              <button onClick={() => { setSecondsLeft(5 * 60); setRunning(true); setShowStuckHint(false); }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: "var(--mint)" }}>
                ☕ 先休息 5 分钟
              </button>
            </div>
            <button onClick={() => { setShowStuckHint(false); setStuckDismissed(true); }}
              className="text-[10px] text-white opacity-30 mt-2 hover:opacity-60">不再提示</button>
          </div>
        )}

        {/* Bottom hints */}
        {!timeUp && (
          <div className="flex justify-center gap-4 text-[10px] text-white opacity-20">
            <span>空格 暂停</span><span>Enter 完成</span><span>Esc 退出</span>
          </div>
        )}

        {/* Close */}
        {!timeUp && (
          <button onClick={onClose}
            className="text-sm font-semibold text-white opacity-20 hover:opacity-60 transition-all">
            退出专注
          </button>
        )}
      </div>
    </div>
  );
}
