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
  const [viewMode, setViewMode] = useState("list");
  const [mobileTab, setMobileTab] = useState("home"); // home | mood | history
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tasksplit_records") || "[]"); }
    catch { return []; }
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("deepseek_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (steps.length > 0 && completed.size === steps.length) {
      const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);
      const record = { task: taskName, steps: steps.length, minutes: totalMinutes,
        date: new Date().toLocaleDateString("zh-CN") };
      const newRecords = [record, ...records].slice(0, 20);
      setRecords(newRecords);
      localStorage.setItem("tasksplit_records", JSON.stringify(newRecords));
    }
  }, [completed.size]);

  async function handleSubmit({ task, scene, answers }) {
    setLoading(true); setError(null); setSteps([]); setCompleted(new Set()); setTaskName(task);
    setMobileTab("home");
    try {
      const result = apiKey.trim()
        ? await splitTask(task, scene, answers, apiKey.trim())
        : await splitTaskMock(task);
      setSteps(result);
    } catch (err) { setError(err.message || "拆解失败"); }
    finally { setLoading(false); }
  }

  function handleToggle(order, isChecked) {
    setCompleted(prev => {
      const next = new Set(prev);
      isChecked ? next.add(order) : next.delete(order);
      return next;
    });
  }

  function handleReorder(from, to) {
    const s = [...steps]; const [moved] = s.splice(from, 1); s.splice(to, 0, moved);
    s.forEach((st, i) => st.order = i + 1); setSteps(s);
  }

  function handleTimerComplete() {
    if (timerStep) setCompleted(prev => new Set(prev).add(timerStep.order));
    setTimerStep(null);
  }

  const hasSteps = steps.length > 0 && !loading;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--cream)" }}>
      {/* Background blobs */}
      <div className="fixed top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "var(--peach)", filter: "blur(80px)" }} />
      <div className="fixed bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "var(--lavender)", filter: "blur(80px)" }} />

      {/* ===== DESKTOP LAYOUT (lg+) ===== */}
      <div className="hidden lg:flex h-screen relative z-10">
        {/* Left Sidebar */}
        <div className="w-[380px] flex-shrink-0 border-r flex flex-col h-full overflow-y-auto p-5 space-y-4"
          style={{ borderColor: "var(--border)" }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 pb-2">
            <span className="text-2xl">✂️</span>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--coral)" }}>TaskSplit</h1>
            <div className="flex-1" />
            <button onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm hover:scale-110 transition-all"
              style={{ backgroundColor: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>⚙️</button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="card p-4 space-y-3 animate-slideDown">
              <p className="text-xs font-bold" style={{ color: "var(--soft-dark)" }}>🔑 DeepSeek API Key</p>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none border"
                style={{ borderColor: "var(--border)" }} />
              <div className="flex justify-between items-center">
                <span className="text-[10px]" style={{ color: "var(--warm-gray)" }}>
                  {apiKey ? "✅ 已配置" : "未配置=演示"}
                </span>
                <button onClick={() => { localStorage.setItem("deepseek_api_key", apiKey); setShowSettings(false); }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))" }}>保存</button>
              </div>
            </div>
          )}

          {/* Task Input */}
          <div className="card p-4">
            <p className="text-xs font-bold mb-3" style={{ color: "var(--warm-gray)" }}>📝 新任务</p>
            <TaskInput onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Mood */}
          <MoodTracker />

          {/* Records */}
          <CompletionRecord records={records} />

          {/* Tips */}
          <div className="card p-4">
            <p className="text-xs font-bold mb-2" style={{ color: "var(--soft-dark)" }}>💡 小贴士</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--warm-gray)" }}>
              每个步骤都设计得足够小，5-20分钟就能完成。不需要一口气做完，每天完成1个步骤就是胜利。
            </p>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Empty state */}
          {!hasSteps && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="text-6xl animate-float">✂️</div>
              <p className="text-lg font-bold" style={{ color: "var(--soft-dark)" }}>在左侧输入任务开始拆解</p>
              <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
                输入像"写毕业论文"、"整理房间"、"准备面试"这样的任务
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fadeIn">
              <div className="text-5xl animate-float">🧠</div>
              <p className="text-lg font-bold" style={{ color: "var(--soft-dark)" }}>正在拆解「{taskName}」...</p>
              <div className="flex gap-2">
                {[0,1,2].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: ["var(--coral)","var(--sunshine)","var(--mint)"][i], animationDelay: `${i*200}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-lg mx-auto mt-20 p-5 rounded-3xl animate-popIn"
              style={{ backgroundColor: "#FFF0F0", border: "2px solid #FFD0D0" }}>
              <p className="font-bold" style={{ color: "var(--coral)" }}>❌ {error}</p>
              <p className="text-sm mt-1" style={{ color: "var(--warm-gray)" }}>请检查 API Key 或稍后重试</p>
            </div>
          )}

          {/* Steps with view toggle */}
          {hasSteps && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Header + toggle */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold" style={{ color: "var(--soft-dark)" }}>
                  📋 {taskName}
                </h2>
                <div className="inline-flex rounded-xl p-0.5" style={{ backgroundColor: "var(--border)" }}>
                  <button onClick={() => setViewMode("list")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === "list" ? "text-white shadow" : ""}`}
                    style={viewMode === "list" ? { background: "linear-gradient(135deg, var(--coral), var(--peach))" } : { color: "var(--warm-gray)" }}>
                    列表
                  </button>
                  <button onClick={() => setViewMode("timeline")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === "timeline" ? "text-white shadow" : ""}`}
                    style={viewMode === "timeline" ? { background: "linear-gradient(135deg, var(--sky), var(--lavender))" } : { color: "var(--warm-gray)" }}>
                    时间线
                  </button>
                </div>
              </div>

              {viewMode === "list" ? (
                <StepList steps={steps} onToggle={handleToggle} onStartTimer={setTimerStep} completedCount={completed.size} />
              ) : (
                <Timeline steps={steps} completed={completed} onReorder={handleReorder} onStartTimer={setTimerStep} onToggle={handleToggle} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✂️</span>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--coral)" }}>TaskSplit</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ backgroundColor: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>⚙️</button>
        </div>

        {showSettings && (
          <div className="mx-4 mb-3 card p-4 space-y-3 animate-slideDown">
            <p className="text-xs font-bold">🔑 DeepSeek API Key</p>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..." className="w-full px-3 py-2 rounded-xl text-xs border"
              style={{ borderColor: "var(--border)" }} />
            <div className="flex justify-between">
              <span className="text-[10px]" style={{ color: "var(--warm-gray)" }}>{apiKey ? "✅ 已配置" : "未配置=演示"}</span>
              <button onClick={() => { localStorage.setItem("deepseek_api_key", apiKey); setShowSettings(false); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))" }}>保存</button>
            </div>
          </div>
        )}

        {/* Mobile content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Home tab */}
          {mobileTab === "home" && (
            <div className="space-y-4 py-2">
              {/* Input always visible */}
              <div className="card p-4">
                <TaskInput onSubmit={handleSubmit} loading={loading} />
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-10 space-y-3 animate-fadeIn">
                  <div className="text-4xl animate-float">🧠</div>
                  <p className="text-base font-bold" style={{ color: "var(--soft-dark)" }}>正在拆解「{taskName}」...</p>
                  <div className="flex justify-center gap-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: ["var(--coral)","var(--sunshine)","var(--mint)"][i], animationDelay: `${i*200}ms` }} />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl animate-popIn"
                  style={{ backgroundColor: "#FFF0F0", border: "2px solid #FFD0D0" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--coral)" }}>❌ {error}</p>
                </div>
              )}

              {/* Steps */}
              {hasSteps && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>
                      {taskName}
                    </h2>
                    <div className="inline-flex rounded-lg p-0.5" style={{ backgroundColor: "var(--border)" }}>
                      <button onClick={() => setViewMode("list")}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold ${viewMode === "list" ? "text-white shadow" : ""}`}
                        style={viewMode === "list" ? { background: "linear-gradient(135deg, var(--coral), var(--peach))" } : { color: "var(--warm-gray)" }}>
                        列表
                      </button>
                      <button onClick={() => setViewMode("timeline")}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold ${viewMode === "timeline" ? "text-white shadow" : ""}`}
                        style={viewMode === "timeline" ? { background: "linear-gradient(135deg, var(--sky), var(--lavender))" } : { color: "var(--warm-gray)" }}>
                        时间线
                      </button>
                    </div>
                  </div>
                  {viewMode === "list" ? (
                    <StepList steps={steps} onToggle={handleToggle} onStartTimer={setTimerStep} completedCount={completed.size} />
                  ) : (
                    <Timeline steps={steps} completed={completed} onReorder={handleReorder} onStartTimer={setTimerStep} onToggle={handleToggle} />
                  )}
                </div>
              )}

              {/* Empty state */}
              {!hasSteps && !loading && !error && (
                <div className="text-center py-10 space-y-3 opacity-50">
                  <div className="text-4xl animate-float">✂️</div>
                  <p className="text-sm font-bold">输入任务，AI 帮你拆解成小步骤</p>
                </div>
              )}
            </div>
          )}

          {/* Mood tab */}
          {mobileTab === "mood" && (
            <div className="py-4">
              <MoodTracker />
            </div>
          )}

          {/* History tab */}
          {mobileTab === "history" && (
            <div className="py-4">
              <CompletionRecord records={records} />
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 flex border-t pb-safe z-30"
          style={{ backgroundColor: "var(--cream)", borderColor: "var(--border)", boxShadow: "0 -2px 12px rgba(0,0,0,0.04)" }}>
          {[
            { id: "home", icon: "✂️", label: "拆解" },
            { id: "mood", icon: "💭", label: "状态" },
            { id: "history", icon: "📊", label: "记录" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all
                ${mobileTab === tab.id ? "scale-105" : "opacity-50"}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-bold"
                style={{ color: mobileTab === tab.id ? "var(--coral)" : "var(--warm-gray)" }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timer overlay */}
      {timerStep && (
        <FocusTimer step={timerStep} onComplete={handleTimerComplete} onClose={() => setTimerStep(null)} />
      )}
    </div>
  );
}

export default App;
