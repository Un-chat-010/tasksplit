import { useState } from "react";

const TEMPLATES = {
  freewrite: { name: "自由书写", emoji: "✏️", color: "#B088F9",
    fields: [{ key: "main", type: "textarea", prompt: "想写点什么？捕捉灵感，清空大脑。", placeholder: "开始书写..." }] },
  morning: { name: "晨间日记", emoji: "🌅", color: "#FFD93D",
    fields: [
      { key: "feeling", type: "textarea", prompt: "今天早上醒来，我感到...", placeholder: "描述你醒来时的状态" },
      { key: "intention", type: "textarea", prompt: "今天最想完成的一件小事是？", placeholder: "不用很大，能做完就好" },
      { key: "worry", type: "textarea", prompt: "有什么在占据我的大脑空间？（写出来=卸载它）", placeholder: "把焦虑倒出来..." },
    ] },
  evening: { name: "晚间复盘", emoji: "🌙", color: "#4D96FF",
    fields: [
      { key: "highlight", type: "textarea", prompt: "今天一个有触动的时刻", placeholder: "不用是大事，小事也算" },
      { key: "did", type: "textarea", prompt: "今天实际做了什么？（不管多少）", placeholder: "列出来，承认自己做了" },
      { key: "tomorrow", type: "text", prompt: "明天的第一个小步骤是？", placeholder: "越具体越好" },
    ] },
  gratitude: { name: "感恩日记", emoji: "❤️", color: "#FF8ED4",
    fields: [
      { key: "g1", type: "text", prompt: "感恩的事 1", placeholder: "今天我感谢..." },
      { key: "g2", type: "text", prompt: "感恩的事 2", placeholder: "" },
      { key: "g3", type: "text", prompt: "感恩的事 3", placeholder: "" },
    ] },
  emotion: { name: "情绪觉察", emoji: "🫧", color: "#6BCB77",
    fields: [
      { key: "emotion_name", type: "text", prompt: "此刻的情绪叫什么？（给它命名）", placeholder: "焦虑？烦躁？委屈？平静？" },
      { key: "body", type: "text", prompt: "它在身体的哪个部位？", placeholder: "胸口、肩膀、胃..." },
      { key: "trigger", type: "textarea", prompt: "是什么触发了它？", placeholder: "" },
      { key: "need", type: "textarea", prompt: "这个情绪想告诉我什么？我需要什么？", placeholder: "" },
    ] },
  adhd_dump: { name: "脑内倒垃圾", emoji: "🧠", color: "#FF6B6B",
    fields: [
      { key: "main", type: "textarea", prompt: "把脑子里所有东西倒出来，不用整理，不用有逻辑。写完就扔。", placeholder: "乱写就对了..." },
    ] },
  win: { name: "今日小赢", emoji: "🏆", color: "#FFA07A",
    fields: [
      { key: "win", type: "textarea", prompt: "今天做到了什么？哪怕是很小的事。", placeholder: "起床了/吃饭了/做了一步任务..." },
      { key: "effort", type: "textarea", prompt: "这件事其实对我来说并不容易，因为...", placeholder: "承认难度，肯定自己" },
    ] },
};

function getStored() {
  try { return JSON.parse(localStorage.getItem("tasksplit_journal") || "[]"); }
  catch { return []; }
}

export default function Journal({ compact = false }) {
  const [entries, setEntries] = useState(getStored);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [viewAll, setViewAll] = useState(false);

  const templateKeys = Object.keys(TEMPLATES);

  function startEntry(type) {
    setSelectedType(type);
    setFormData({});
  }

  function updateField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  function saveEntry() {
    if (!selectedType) return;
    const hasContent = Object.values(formData).some(v => v?.trim());
    if (!hasContent) return;

    const entry = {
      id: Date.now(),
      type: selectedType,
      data: formData,
      date: new Date().toLocaleDateString("zh-CN"),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
    };
    const updated = [entry, ...entries].slice(0, 200);
    setEntries(updated);
    localStorage.setItem("tasksplit_journal", JSON.stringify(updated));
    setSelectedType(null);
    setFormData({});
  }

  function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("tasksplit_journal", JSON.stringify(updated));
  }

  const tpl = selectedType ? TEMPLATES[selectedType] : null;
  const recent = entries.slice(0, compact ? 3 : 50);

  // ===== COMPACT (sidebar widget) =====
  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>📝 小日记</span>
        {!selectedType ? (
          <div className="flex flex-wrap gap-1.5">
            {templateKeys.slice(0, 4).map(k => (
              <button key={k} onClick={() => startEntry(k)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold hover:scale-105 transition-all"
                style={{ backgroundColor: `${TEMPLATES[k].color}18`, color: TEMPLATES[k].color }}>
                {TEMPLATES[k].emoji} {TEMPLATES[k].name}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-sm">{tpl.emoji}</span>
              <span className="text-xs font-bold" style={{ color: tpl.color }}>{tpl.name}</span>
            </div>
            {tpl.fields.slice(0, 1).map(f => (
              <textarea key={f.key} value={formData[f.key] || ""}
                onChange={e => updateField(f.key, e.target.value)}
                placeholder={f.placeholder} rows={2}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none border resize-none"
                style={{ borderColor: "var(--border)" }} />
            ))}
            <div className="flex gap-2">
              <button onClick={saveEntry} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: tpl.color }}>保存</button>
              <button onClick={() => setSelectedType(null)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                style={{ backgroundColor: "var(--border)", color: "var(--warm-gray)" }}>取消</button>
            </div>
          </div>
        )}
        {recent.length > 0 && !selectedType && (
          <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
            {recent.map(e => (
              <div key={e.id} className="flex items-center gap-2 text-[10px]">
                <span>{TEMPLATES[e.type]?.emoji}</span>
                <span className="flex-1 truncate font-medium" style={{ color: "var(--warm-gray)" }}>
                  {Object.values(e.data).find(v => v?.trim())?.slice(0, 30)}...
                </span>
                <span style={{ color: "var(--warm-gray)", opacity: 0.5 }}>{e.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== FULL PAGE (mobile journal tab) =====
  return (
    <div className="space-y-4">
      {/* Template picker */}
      {!selectedType && (
        <>
          <div className="card p-5 space-y-4">
            <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📝 写点什么</span>
            <div className="grid grid-cols-2 gap-2">
              {templateKeys.map(k => {
                const t = TEMPLATES[k];
                return (
                  <button key={k} onClick={() => startEntry(k)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-md"
                    style={{ backgroundColor: `${t.color}12` }}>
                    <span className="text-xl">{t.emoji}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: t.color }}>{t.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--warm-gray)" }}>
                        {t.fields.length} 个引导问题
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entry history */}
          {entries.length > 0 && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📅 记录回顾</span>
                <span className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>{entries.length} 条</span>
              </div>
              <div className="space-y-2">
                {recent.map(e => {
                  const t = TEMPLATES[e.type];
                  const preview = Object.values(e.data).find(v => v?.trim()) || "";
                  return (
                    <div key={e.id} className="flex items-start gap-3 py-3 border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}>
                      <span className="text-lg">{t?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: t?.color }}>{t?.name}</span>
                          <span className="text-[10px]" style={{ color: "var(--warm-gray)" }}>{e.date} {e.time}</span>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--warm-gray)" }}>
                          {preview.slice(0, 100)}{preview.length > 100 ? "..." : ""}
                        </p>
                      </div>
                      <button onClick={() => deleteEntry(e.id)}
                        className="text-[10px] font-bold mt-1 opacity-30 hover:opacity-100 transition-all"
                        style={{ color: "var(--coral)" }}>删除</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Writing form */}
      {selectedType && tpl && (
        <div className="card p-5 space-y-4 animate-popIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{tpl.emoji}</span>
              <span className="text-base font-extrabold" style={{ color: tpl.color }}>{tpl.name}</span>
            </div>
            <button onClick={() => setSelectedType(null)} className="text-xs font-bold"
              style={{ color: "var(--warm-gray)" }}>✕ 关闭</button>
          </div>

          {tpl.fields.map(f => (
            <div key={f.key}>
              <p className="text-xs font-bold mb-1.5" style={{ color: "var(--warm-gray)" }}>{f.prompt}</p>
              {f.type === "textarea" ? (
                <textarea value={formData[f.key] || ""} onChange={e => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder} rows={3}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none border-2 resize-none"
                  style={{ borderColor: "var(--border)" }}
                  onFocus={e => e.target.style.borderColor = tpl.color}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              ) : (
                <input type="text" value={formData[f.key] || ""} onChange={e => updateField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none border-2"
                  style={{ borderColor: "var(--border)" }}
                  onFocus={e => e.target.style.borderColor = tpl.color}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              )}
            </div>
          ))}

          <button onClick={saveEntry}
            className="w-full py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
            style={{ backgroundColor: tpl.color }}>
            保存 ✨
          </button>
        </div>
      )}
    </div>
  );
}
