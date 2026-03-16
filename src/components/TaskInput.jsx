import { useState } from "react";
import scenes from "../prompts/scenes.js";

const SCENE_COLORS = {
  thesis: { bg: "bg-red-50", active: "bg-red-400", text: "text-red-700" },
  job: { bg: "bg-amber-50", active: "bg-amber-400", text: "text-amber-700" },
  exam: { bg: "bg-blue-50", active: "bg-blue-400", text: "text-blue-700" },
  free: { bg: "bg-purple-50", active: "bg-purple-400", text: "text-purple-700" },
};

export default function TaskInput({ onSubmit, loading }) {
  const [task, setTask] = useState("");
  const [selectedScene, setSelectedScene] = useState(null);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const sceneKeys = Object.keys(scenes);
  const currentScene = selectedScene ? scenes[selectedScene] : null;
  const questions = currentScene?.questions || [];
  const showQuestions = selectedScene && selectedScene !== "free" && questionStep < questions.length;

  function handleSceneClick(key) {
    setSelectedScene(key);
    setQuestionStep(0);
    setAnswers({});
  }

  function handleAnswer(qId, answer) {
    setAnswers({ ...answers, [qId]: answer });
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
    <div className="space-y-4">
      {/* Scene pills */}
      <div className="flex flex-wrap gap-2">
        {sceneKeys.map((key) => {
          const c = SCENE_COLORS[key];
          const active = selectedScene === key;
          return (
            <button key={key} onClick={() => handleSceneClick(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
                ${active ? `${c.active} text-white shadow-md scale-105` : `${c.bg} ${c.text} hover:scale-105`}`}>
              {scenes[key].emoji} {scenes[key].name}
            </button>
          );
        })}
      </div>

      {/* Follow-up questions */}
      {showQuestions && (
        <div className="card p-4 space-y-3 animate-popIn">
          <p className="font-bold text-sm">{questions[questionStep].text}</p>
          <div className="flex flex-wrap gap-2">
            {questions[questionStep].options.map((opt) => (
              <button key={opt}
                onClick={() => handleAnswer(questions[questionStep].id, opt)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:scale-105 transition-all"
                style={{ backgroundColor: "#FFF0E5", color: "var(--coral)" }}>
                {opt}
              </button>
            ))}
          </div>
          {questionStep > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.values(answers).map((v, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>✓ {v}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="你今天要做什么？" disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-transparent text-sm font-medium
            placeholder-gray-300 focus:outline-none transition-all"
          style={{ backgroundColor: "white", boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}
          onFocus={(e) => e.target.style.borderColor = "var(--peach)"}
          onBlur={(e) => e.target.style.borderColor = "transparent"} />
        <button onClick={handleSubmit} disabled={!task.trim() || loading}
          className="px-5 py-3 rounded-2xl font-bold text-white text-sm whitespace-nowrap
            transition-all hover:scale-105 active:scale-95
            disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, var(--coral), var(--peach))",
            boxShadow: "0 3px 12px rgba(255,107,107,0.25)" }}>
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              拆解中
            </span>
          ) : "拆解 ✨"}
        </button>
      </div>
    </div>
  );
}
