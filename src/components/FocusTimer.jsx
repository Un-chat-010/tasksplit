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

  // SVG circle params
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-6 shadow-2xl">
        {/* 当前步骤 */}
        <p className="text-gray-600 text-sm leading-relaxed px-4">
          {step.description}
        </p>

        {/* 倒计时圆环 */}
        <div className="relative w-52 h-52 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" r={radius}
              fill="none" stroke="#E5E7EB" strokeWidth="8"
            />
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={timeUp ? "#22C55E" : "#6366F1"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-gray-800">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            {!timeUp && (
              <button
                onClick={() => setRunning(!running)}
                className="text-xs text-gray-400 hover:text-indigo-500 mt-1 transition-colors"
              >
                {running ? "暂停" : "继续"}
              </button>
            )}
          </div>
        </div>

        {/* 按钮区 */}
        {timeUp ? (
          <div className="space-y-3">
            <p className="text-green-600 font-medium">⏰ 时间到！完成了吗？</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onComplete}
                className="px-6 py-2.5 rounded-xl bg-green-500 text-white font-medium
                  hover:bg-green-600 active:scale-95 transition-all"
              >
                ✅ 完成了
              </button>
              <button
                onClick={() => {
                  setSecondsLeft(5 * 60);
                  setRunning(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium
                  hover:bg-gray-200 active:scale-95 transition-all"
              >
                还需要 5 分钟
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            取消计时
          </button>
        )}
      </div>
    </div>
  );
}
