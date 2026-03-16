import { useState, useEffect, useRef } from "react";
import scenes from "../prompts/scenes.js";

const SCENE_COLORS = {
  thesis: { bg: "#FFF0F0", active: "#FF6B6B", text: "#C53030" },
  job: { bg: "#FFF8E0", active: "#F6AD55", text: "#B7791F" },
  exam: { bg: "#EBF3FF", active: "#4D96FF", text: "#2B6CB0" },
  free: { bg: "#F3ECFF", active: "#B088F9", text: "#6B46C1" },
};

export default function TaskInput({ onSubmit, loading }) {
  const [task, setTask] = useState("");
  const [selectedScene, setSelectedScene] = useState(null);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const inputRef = useRef(null);

  const sceneKeys = Object.keys(scenes);
  const currentScene = selectedScene ? scenes[selectedScene] : null;
  const questions = currentScene?.questions || [];
  const showQuestions = selectedScene && selectedScene !== "free" && questionStep < questions.length;
  const questionsComplete = selectedScene && (selectedScene === "free" || questionStep >= questions.length);

  function handleSceneClick(key) {
    setSelectedScene(key);
    setQuestionStep(0);
    setAnswers({});
    // Auto-fill task name with scene name
    if (key !== "free") {
      setTask(scenes[key].name);
    } else {
      setTask("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleAnswer(qId, answer) {
    const newAnswers = { ...answers, [qId]: answer };
    setAnswers(newAnswers);
    const nextStep = questionStep + 1;
    setQuestionStep(nextStep);
    // After all questions answered, focus input
    if (nextStep >= questions.length) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
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

  function clearScene() {
    setSelectedScene(null);
    setQuestionStep(0);
    setAnswers({});
    setTask("");
  }

  // Placeholder text based on state
  const placeholder = selectedScene && selectedScene !== "free"
    ? `补充细节，如"检查论文格式"、"准备第二章"...`
    : "你今天要做什么？";

  return (
    <div className="space-y-3">
      {/* Scene pills */}
      <div className="flex flex-wrap gap-2">
        {sceneKeys.map((key) => {
          const c = SCENE_COLORS[key];
          const active = selectedScene === key;
          return (
            <button key={key} onClick={() => handleSceneClick(key)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: active ? c.active : c.bg,
                color: active ? "white" : c.text,
                boxShadow: active ? `0 3px 12px ${c.active}40` : "none",
                transform: active ? "scale(1.05)" : "scale(1)",
              }}>
              {scenes[key].emoji} {scenes[key].name}
            </button>
          );
        })}
        {selectedScene && (
          <button onClick={clearScene}
            className="px-2 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ color: "var(--warm-gray)" }}>
            ✕ 清除
          </button>
        )}
      </div>

      {/* Scene selected indicator */}
      {selectedScene && selectedScene !== "free" && (
        <div className="flex items-center gap-2 px-1 animate-fadeIn">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SCENE_COLORS[selectedScene].active }} />
          <span className="text-xs font-bold" style={{ color: SCENE_COLORS[selectedScene].active }}>
            已选择「{scenes[selectedScene].name}」场景
            {questionsComplete && Object.keys(answers).length > 0 && " · 信息已补充"}
          </span>
        </div>
      )}

      {/* Follow-up questions */}
      {showQuestions && (
        <div className="rounded-2xl p-4 space-y-3 animate-popIn"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: SCENE_COLORS[selectedScene]?.bg, color: SCENE_COLORS[selectedScene]?.text }}>
              {questionStep + 1}/{questions.length}
            </span>
            <p className="font-bold text-sm" style={{ color: "var(--soft-dark)" }}>
              {questions[questionStep].text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions[questionStep].options.map((opt) => (
              <button key={opt}
                onClick={() => handleAnswer(questions[questionStep].id, opt)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#FFF0E5", color: "var(--coral)" }}>
                {opt}
              </button>
            ))}
          </div>
          {/* Already answered */}
          {questionStep > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(answers).map(([k, v], i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>
                  ✓ {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input row - only show when not in middle of questions */}
      {!showQuestions && (
        <div className="flex gap-2 animate-fadeIn">
          <input ref={inputRef} type="text" value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
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
      )}
    </div>
  );
}
