import { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput.jsx";
import StepList from "./components/StepList.jsx";
import Timeline from "./components/Timeline.jsx";
import FocusTimer from "./components/FocusTimer.jsx";
import CompletionRecord from "./components/CompletionRecord.jsx";
import MoodTracker from "./components/MoodTracker.jsx";
import { splitTask, splitTaskMock } from "./services/ai.js";

function App() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [timerStep, setTimerStep] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "timeline"
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tasksplit_records") || "[]"); }
    catch { return []; }
  });

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("deepseek_api_key") || ""
  );
  const [showSettings, setShowSettings] = useState(false);

  // Save record when all steps completed
  useEffect(() => {
    if (steps.length > 0 && completed.size === steps.length) {
      const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);
      const record = {
        task: taskName,
        steps: steps.length,
        minutes: totalMinutes,
        date: new Date().toLocaleDateString("zh-CN"),
      };
      const newRecords = [record, ...records].slice(0, 20);
      setRecords(newRecords);
      localStorage.setItem("tasksplit_records", JSON.stringify(newRecords));
    }
  }, [completed.size]);

  async function handleSubmit({ task, scene, answers }) {
    setLoading(true);
    setError(null);
    setSteps([]);
    setCompleted(new Set());
    setTaskName(task);

    try {
      let result;
      if (apiKey.trim()) {
        result = await splitTask(task, scene, answers, apiKey.trim());
      } else {
        result = await splitTaskMock(task);
      }
      setSteps(result);
    } catch (err) {
      setError(err.message || "拆解失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(order, isChecked) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (isChecked) next.add(order);
      else next.delete(order);
      return next;
    });
  }

  function handleReorder(fromIndex, toIndex) {
    const newSteps = [...steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    // Re-number orders
    newSteps.forEach((s, i) => s.order = i + 1);
    setSteps(newSteps);
  }

  function handleTimerComplete() {
    if (timerStep) {
      setCompleted((prev) => new Set(prev).add(timerStep.order));
    }
    setTimerStep(null);
  }

  function handleSaveKey() {
    localStorage.setItem("deepseek_api_key", apiKey);
    setShowSettings(false);
  }

  const hasSteps = steps.length > 0 && !loading;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "var(--cream)" }}>
      {/* Background blobs */}
      <div className="fixed top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "var(--peach)", filter: "blur(80px)" }} />
      <div className="fixed bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "var(--lavender)", filter: "blur(80px)" }} />
      <div className="fixed top-[40%] left-[60%] w-[250px] h-[250px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--mint)", filter: "blur(80px)" }} />

      {/* Settings button */}
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg
            transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          ⚙️
        </button>
        {showSettings && (
          <div className="absolute right-0 mt-2 w-80 rounded-3xl p-5 space-y-4 animate-slideDown"
            style={{ backgroundColor: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <p className="text-sm font-bold" style={{ color: "var(--soft-dark)" }}>
              🔑 DeepSeek API Key
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-medium focus:outline-none transition-all"
              style={{ borderColor: "#F0ECE8" }}
              onFocus={(e) => e.target.style.borderColor = "var(--peach)"}
              onBlur={(e) => e.target.style.borderColor = "#F0ECE8"}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
                {apiKey ? "✅ 已配置" : "未配置 = 演示模式"}
              </p>
              <button onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))" }}>
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-16 pb-24 px-5">
        {/* Input area */}
        <div className={`transition-all duration-700 ease-out ${
          steps.length === 0 && !loading ? "mt-[18vh]" : "mt-4"
        }`}>
          <TaskInput onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-16 text-center space-y-4 animate-fadeIn">
            <div className="text-5xl animate-float">🧠</div>
            <p className="text-lg font-bold" style={{ color: "var(--soft-dark)" }}>
              正在拆解「{taskName}」...
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
              AI 正在把大任务变成小步骤
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor: ["var(--coral)", "var(--sunshine)", "var(--mint)"][i],
                    animationDelay: `${i * 200}ms`,
                  }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 max-w-lg mx-auto p-5 rounded-3xl animate-popIn"
            style={{ backgroundColor: "#FFF0F0", border: "2px solid #FFD0D0" }}>
            <p className="font-bold" style={{ color: "var(--coral)" }}>❌ {error}</p>
            <p className="text-sm mt-1 font-medium" style={{ color: "var(--warm-gray)" }}>
              请检查 API Key 是否正确，或稍后重试
            </p>
          </div>
        )}

        {/* View toggle + Steps */}
        {hasSteps && (
          <div className="mt-8 space-y-5">
            {/* View mode toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl p-1"
                style={{ backgroundColor: "#F0ECE8" }}>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === "list" ? "text-white shadow-md" : ""
                  }`}
                  style={viewMode === "list"
                    ? { background: "linear-gradient(135deg, var(--coral), var(--peach))" }
                    : { color: "var(--warm-gray)" }}>
                  📋 列表
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === "timeline" ? "text-white shadow-md" : ""
                  }`}
                  style={viewMode === "timeline"
                    ? { background: "linear-gradient(135deg, var(--sky), var(--lavender))" }
                    : { color: "var(--warm-gray)" }}>
                  🕐 时间线
                </button>
              </div>
            </div>

            {/* Current view */}
            <div className="animate-fadeIn">
              {viewMode === "list" ? (
                <StepList
                  steps={steps}
                  onToggle={handleToggle}
                  onStartTimer={setTimerStep}
                  completedCount={completed.size}
                />
              ) : (
                <Timeline
                  steps={steps}
                  completed={completed}
                  onReorder={handleReorder}
                  onStartTimer={setTimerStep}
                  onToggle={handleToggle}
                />
              )}
            </div>
          </div>
        )}

        {/* Home screen: mood tracker + records */}
        {!hasSteps && !loading && (
          <div className="mt-10 space-y-8">
            <MoodTracker />
            <CompletionRecord records={records} />
          </div>
        )}
      </div>

      {/* Focus timer overlay */}
      {timerStep && (
        <FocusTimer
          step={timerStep}
          onComplete={handleTimerComplete}
          onClose={() => setTimerStep(null)}
        />
      )}
    </div>
  );
}

export default App;
