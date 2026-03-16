import { useState } from "react";
import scenes from "../prompts/scenes.js";

const SCENE_COLORS = {
  thesis: { bg: "bg-red-50", border: "border-red-200", active: "bg-red-400", text: "text-red-700" },
  job: { bg: "bg-amber-50", border: "border-amber-200", active: "bg-amber-400", text: "text-amber-700" },
  exam: { bg: "bg-blue-50", border: "border-blue-200", active: "bg-blue-400", text: "text-blue-700" },
  free: { bg: "bg-purple-50", border: "border-purple-200", active: "bg-purple-400", text: "text-purple-700" },
};

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
  }

  function handleAnswer(questionId, answer) {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    setQuestionStep(questionStep + 1);
  }

  function handleSubmit() {
    if (!task.trim()) return;
    onSubmit({ task: task.trim(), scene: currentScene, answers });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !showQuestions) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Logo */}
      <div className="text-center space-y-3">
        <div className="text-5xl animate-float">✂️</div>
        <h1 className="text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--coral)" }}>
          TaskSplit
        </h1>
        <p className="text-base font-medium" style={{ color: "var(--warm-gray)" }}>
          把大任务拆成你能一眼看完的小单元
        </p>
      </div>

      {/* Scene buttons - Tiimo style colorful pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {sceneKeys.map((key) => {
          const colors = SCENE_COLORS[key];
          const isActive = selectedScene === key;
          return (
            <button
              key={key}
              onClick={() => handleSceneClick(key)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200
                ${isActive
                  ? `${colors.active} text-white shadow-lg scale-105`
                  : `${colors.bg} ${colors.text} ${colors.border} border hover:scale-105 hover:shadow-md`
                }`}
            >
              {scenes[key].emoji} {scenes[key].name}
            </button>
          );
        })}
      </div>

      {/* Follow-up questions */}
      {showQuestions && (
        <div className="animate-popIn rounded-3xl p-6 space-y-4"
          style={{ backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <p className="font-bold text-lg" style={{ color: "var(--soft-dark)" }}>
            {questions[questionStep].text}
          </p>
          <div className="flex flex-wrap gap-2">
            {questions[questionStep].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(questions[questionStep].id, opt)}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all
                  hover:scale-105 hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: "#FFF0E5",
                  color: "var(--coral)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {questionStep > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.values(answers).map((val, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
                  ✓ {val}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input + button */}
      <div className="flex gap-3">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="你今天要做什么？"
          disabled={loading}
          className="flex-1 px-6 py-4 rounded-2xl border-2 border-transparent text-base font-medium
            placeholder-gray-300 focus:outline-none transition-all"
          style={{
            backgroundColor: "white",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            color: "var(--soft-dark)",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--peach)"}
          onBlur={(e) => e.target.style.borderColor = "transparent"}
        />
        <button
          onClick={handleSubmit}
          disabled={!task.trim() || loading}
          className="px-7 py-4 rounded-2xl font-bold text-white text-base
            transition-all hover:scale-105 active:scale-95 
            disabled:opacity-40 disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, var(--coral), var(--peach))",
            boxShadow: "0 4px 16px rgba(255,107,107,0.3)",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              拆解中
            </span>
          ) : "拆解 ✨"}
        </button>
      </div>
    </div>
  );
}
