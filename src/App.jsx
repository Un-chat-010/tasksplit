import { useState } from "react";
import TaskInput from "./components/TaskInput.jsx";
import StepList from "./components/StepList.jsx";
import FocusTimer from "./components/FocusTimer.jsx";
import { splitTask, splitTaskMock } from "./services/ai.js";

function App() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [timerStep, setTimerStep] = useState(null);
  const [taskName, setTaskName] = useState("");

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("deepseek_api_key") || ""
  );
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 设置按钮 */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 
            flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          ⚙️
        </button>
        {showSettings && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">DeepSeek API Key</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                {apiKey ? "✅ 已配置" : "未配置则使用演示数据"}
              </p>
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 主内容 */}
      <div className="pt-16 pb-20 px-4">
        <div className={`transition-all duration-500 ${
          steps.length === 0 ? "mt-[25vh]" : "mt-4"
        }`}>
          <TaskInput onSubmit={handleSubmit} loading={loading} />
        </div>

        {loading && (
          <div className="mt-12 text-center space-y-3 animate-pulse">
            <div className="text-3xl">🧠</div>
            <p className="text-gray-500">正在拆解「{taskName}」...</p>
            <p className="text-xs text-gray-400">AI 正在把大任务变成小步骤</p>
          </div>
        )}

        {error && (
          <div className="mt-8 max-w-xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">❌ {error}</p>
            <p className="text-red-400 text-xs mt-1">
              请检查 API Key 是否正确，或稍后重试
            </p>
          </div>
        )}

        {steps.length > 0 && !loading && (
          <div className="mt-8 animate-fadeIn">
            <StepList
              steps={steps}
              onToggle={handleToggle}
              onStartTimer={setTimerStep}
              completedCount={completed.size}
            />
          </div>
        )}
      </div>

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
