import { useState, useEffect, useRef } from "react";
import TaskInput from "./components/TaskInput.jsx";
import StepTimeline from "./components/StepTimeline.jsx";
import FocusTimer from "./components/FocusTimer.jsx";
import CompletionRecord from "./components/CompletionRecord.jsx";
import MoodTracker from "./components/MoodTracker.jsx";
import Journal from "./components/Journal.jsx";
import ADHDTools from "./components/ADHDTools.jsx";
import { splitTask, splitTaskMock } from "./services/ai.js";

function App() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [timerStep, setTimerStep] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [mobileTab, setMobileTab] = useState("home");
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tasksplit_records") || "[]"); }
    catch { return []; }
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("deepseek_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);

  // FIX: prevent duplicate record saves
  const savedRef = useRef(false);

  useEffect(() => {
    if (steps.length > 0 && completed.size === steps.length && !savedRef.current) {
      savedRef.current = true;
      const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);
      const rec = { task: taskName, steps: steps.length, minutes: totalMinutes,
        date: new Date().toLocaleDateString("zh-CN") };
      const nr = [rec, ...records].slice(0, 20);
      setRecords(nr);
      localStorage.setItem("tasksplit_records", JSON.stringify(nr));
      // Add reward points
      const pts = parseInt(localStorage.getItem("tasksplit_points") || "0") + steps.length;
      localStorage.setItem("tasksplit_points", String(pts));
    }
    // Reset saved flag if not all complete
    if (steps.length > 0 && completed.size < steps.length) {
      savedRef.current = false;
    }
  }, [completed.size, steps.length]);

  async function handleSubmit({ task, scene, answers }) {
    setLoading(true); setError(null); setSteps([]); setCompleted(new Set());
    setTaskName(task); setMobileTab("home"); savedRef.current = false;
    try {
      const result = apiKey.trim()
        ? await splitTask(task, scene, answers, apiKey.trim())
        : await splitTaskMock(task);
      setSteps(result);
    } catch (err) { setError(err.message || "拆解失败"); }
    finally { setLoading(false); }
  }

  function handleToggle(order, isChecked) {
    setCompleted(prev => { const n = new Set(prev); isChecked ? n.add(order) : n.delete(order); return n; });
    // Add 1 point per step completed
    if (isChecked) {
      const pts = parseInt(localStorage.getItem("tasksplit_points") || "0") + 1;
      localStorage.setItem("tasksplit_points", String(pts));
    }
  }
  function handleReorder(from, to) {
    const s = [...steps]; const [m] = s.splice(from, 1); s.splice(to, 0, m);
    s.forEach((st, i) => st.order = i + 1); setSteps(s);
  }
  function handleTimerComplete() {
    if (timerStep) setCompleted(prev => new Set(prev).add(timerStep.order));
    setTimerStep(null);
  }

  const hasSteps = steps.length > 0 && !loading;
  const today = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  const loadingView = (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fadeIn">
      <div className="text-5xl animate-float">🧠</div>
      <p className="text-lg font-bold" style={{ color: "var(--soft-dark)" }}>正在拆解「{taskName}」...</p>
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: ["var(--coral)","var(--sunshine)","var(--mint)"][i], animationDelay: `${i*200}ms` }} />
        ))}
      </div>
    </div>
  );

  const errorView = error && (
    <div className="p-5 rounded-3xl animate-popIn" style={{ backgroundColor: "#FFF0F0", border: "2px solid #FFD0D0" }}>
      <p className="font-bold" style={{ color: "var(--coral)" }}>❌ {error}</p>
      <p className="text-sm mt-1" style={{ color: "var(--warm-gray)" }}>请检查 API Key 或稍后重试</p>
    </div>
  );

  const settingsPanel = showSettings && (
    <div className="card p-4 space-y-3 animate-slideDown">
      <p className="text-xs font-bold">🔑 DeepSeek API Key</p>
      <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..." className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none border"
        style={{ borderColor: "var(--border)" }} />
      <div className="flex justify-between items-center">
        <span className="text-[10px]" style={{ color: "var(--warm-gray)" }}>{apiKey ? "✅ 已配置" : "未配置=演示"}</span>
        <button onClick={() => { localStorage.setItem("deepseek_api_key", apiKey); setShowSettings(false); }}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))" }}>保存</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--cream)" }}>
      <div className="fixed top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-12 pointer-events-none"
        style={{ background: "var(--peach)", filter: "blur(80px)" }} />
      <div className="fixed bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-12 pointer-events-none"
        style={{ background: "var(--lavender)", filter: "blur(80px)" }} />

      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex h-screen relative z-10">
        <div className="w-[360px] flex-shrink-0 border-r flex flex-col h-full overflow-y-auto p-5 space-y-4"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✂️</span>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--coral)" }}>TaskSplit</h1>
            <div className="flex-1" />
            <button onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm hover:scale-110 transition-all"
              style={{ backgroundColor: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>⚙️</button>
          </div>
          <p className="text-xs font-medium -mt-2" style={{ color: "var(--warm-gray)" }}>{today}</p>

          {settingsPanel}

          <div className="card p-4">
            <p className="text-xs font-bold mb-3" style={{ color: "var(--warm-gray)" }}>📝 新任务</p>
            <TaskInput onSubmit={handleSubmit} loading={loading} />
          </div>

          <MoodTracker compact />
          <Journal compact />
          <ADHDTools compact />
          <CompletionRecord records={records} />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {loading && loadingView}
            {errorView}
            {hasSteps && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold" style={{ color: "var(--soft-dark)" }}>{taskName}</h2>
                <StepTimeline steps={steps} completed={completed}
                  onToggle={handleToggle} onStartTimer={setTimerStep} onReorder={handleReorder} />
              </div>
            )}
            {!hasSteps && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-5 opacity-50">
                <div className="text-7xl animate-float">✂️</div>
                <p className="text-xl font-extrabold" style={{ color: "var(--soft-dark)" }}>在左侧输入任务</p>
                <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
                  试试 "写毕业论文"、"整理房间"、"准备面试"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✂️</span>
            <div>
              <h1 className="text-lg font-extrabold leading-tight" style={{ color: "var(--coral)" }}>TaskSplit</h1>
              <p className="text-[10px] font-medium -mt-0.5" style={{ color: "var(--warm-gray)" }}>{today}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ backgroundColor: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>⚙️</button>
        </div>

        {showSettings && <div className="mx-4 mt-2">{settingsPanel}</div>}

        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
          {mobileTab === "home" && (
            <div className="space-y-4">
              <div className="card p-4"><TaskInput onSubmit={handleSubmit} loading={loading} /></div>
              {loading && loadingView}
              {errorView}
              {hasSteps && (
                <div className="space-y-3">
                  <h2 className="text-base font-extrabold px-1" style={{ color: "var(--soft-dark)" }}>{taskName}</h2>
                  <StepTimeline steps={steps} completed={completed}
                    onToggle={handleToggle} onStartTimer={setTimerStep} onReorder={handleReorder} />
                </div>
              )}
              {!hasSteps && !loading && !error && (
                <div className="text-center py-8 space-y-3 opacity-40">
                  <div className="text-4xl animate-float">✂️</div>
                  <p className="text-sm font-bold">选择场景或输入任务，AI 帮你拆</p>
                </div>
              )}
            </div>
          )}
          {mobileTab === "mood" && <MoodTracker />}
          {mobileTab === "journal" && <Journal />}
          {mobileTab === "tools" && <ADHDTools />}
          {mobileTab === "history" && <CompletionRecord records={records} />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex border-t pb-safe z-30"
          style={{ backgroundColor: "var(--cream)", borderColor: "var(--border)", boxShadow: "0 -2px 12px rgba(0,0,0,0.04)" }}>
          {[
            { id: "home", icon: "✂️", label: "拆解" },
            { id: "mood", icon: "🧠", label: "状态" },
            { id: "journal", icon: "📝", label: "日记" },
            { id: "tools", icon: "⚡", label: "工具" },
            { id: "history", icon: "📊", label: "记录" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all
                ${mobileTab === tab.id ? "" : "opacity-40"}`}>
              <span className="text-base">{tab.icon}</span>
              <span className="text-[9px] font-bold"
                style={{ color: mobileTab === tab.id ? "var(--coral)" : "var(--warm-gray)" }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {timerStep && <FocusTimer step={timerStep} onComplete={handleTimerComplete} onClose={() => setTimerStep(null)} />}
    </div>
  );
}

export default App;
