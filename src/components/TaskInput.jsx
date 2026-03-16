import { useState } from "react";
import scenes from "../prompts/scenes.js";

export default function TaskInput({ onSubmit, loading }) {
  const [task, setTask] = useState("");
  const [selectedScene, setSelectedScene] = useState(null);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const sceneKeys = Object.keys(scenes);
  const currentScene = selectedScene ? scenes[selectedScene] : null;
  const questions = currentScene?.questions || [];
  const showQuestions =
    selectedScene && selectedScene !== "free" && questionStep < questions.length;

  function handleSceneClick(key) {
    setSelectedScene(key);
    setQuestionStep(0);
    setAnswers({});
    if (key === "free") {
      // 自由输入，不追问
    }
  }

  function handleAnswer(questionId, answer) {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    setQuestionStep(questionStep + 1);
  }

  function handleSubmit() {
    if (!task.trim()) return;
    onSubmit({
      task: task.trim(),
      scene: currentScene,
      answers,
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !showQuestions) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-indigo-600">✂️ TaskSplit</h1>
        <p className="text-gray-500">把大任务拆成你能一眼看完的小单元</p>
      </div>

      {/* 场景按钮 */}
      <div className="flex flex-wrap justify-center gap-3">
        {sceneKeys.map((key) => (
          <button
            key={key}
            onClick={() => handleSceneClick(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                selectedScene === key
                  ? "bg-indigo-500 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-sm"
              }`}
          >
            {scenes[key].emoji} {scenes[key].name}
          </button>
        ))}
      </div>

      {/* 追问问题 */}
      {showQuestions && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 animate-fadeIn">
          <p className="text-gray-700 font-medium">
            {questions[questionStep].text}
          </p>
          <div className="flex flex-wrap gap-2">
            {questions[questionStep].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(questions[questionStep].id, opt)}
                className="px-4 py-2 rounded-xl text-sm bg-indigo-50 text-indigo-700 
                  hover:bg-indigo-100 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
          {/* 已回答的显示 */}
          {questionStep > 0 && (
            <div className="pt-2 space-y-1">
              {Object.entries(answers).map(([key, val]) => (
                <p key={key} className="text-xs text-gray-400">
                  ✓ {val}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 输入框 + 拆解按钮 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="你今天要做什么？"
          className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 bg-white
            text-gray-800 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
            shadow-sm text-base"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={!task.trim() || loading}
          className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-medium
            hover:bg-indigo-600 active:scale-95 transition-all shadow-sm
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              拆解中
            </span>
          ) : (
            "拆解"
          )}
        </button>
      </div>
    </div>
  );
}
