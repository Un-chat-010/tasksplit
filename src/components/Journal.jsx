import { useState } from "react";

const TEMPLATES = {
  gratitude: { name: "感恩日记", emoji: "❤️", color: "#FF8ED4", alwaysShow: true,
    fields: [
      { key: "obj1", type: "text", prompt: "感恩的事 1（及其品质）", placeholder: "例如：感谢母亲，她的耐心..." },
      { key: "evt1", type: "text", prompt: "具体体现事件", placeholder: "她今天特意为我..." },
      { key: "obj2", type: "text", prompt: "感恩的事 2", placeholder: "" },
      { key: "evt2", type: "text", prompt: "具体体现事件", placeholder: "" },
      { key: "obj3", type: "text", prompt: "感恩的事 3", placeholder: "" },
      { key: "evt3", type: "text", prompt: "具体体现事件", placeholder: "" },
    ] },
  morning: { name: "晨间日记", emoji: "🌅", color: "#FFD93D", alwaysShow: false,
    startHour: 5, endHour: 11,
    fields: [
      { key: "main", type: "textarea", prompt: "晨间日记：捕捉灵感，清空大脑，为创造力开路。", placeholder: "今天早上醒来，我感到..." },
    ] },
  evening: { name: "晚间日记", emoji: "🌙", color: "#4D96FF", alwaysShow: false,
    startHour: 21, endHour: 25, // 25 = next day 1am
    fields: [
      { key: "main", type: "textarea", prompt: "无需流水账，记录今天一个有「故事性」或「触动点」的时刻。", placeholder: "今天发生了一件有趣的事..." },
    ] },
};

function isTimeGateOpen(tpl) {
  if (tpl.alwaysShow) return true;
  const h = new Date().getHours();
  const adjustedH = h < 5 ? h + 24 : h; // treat 0-4am as 24-28 for evening
  return adjustedH >= tpl.startHour && adjustedH < tpl.endHour;
}

function getStored() {
  try { return JSON.parse(localStorage.getItem("tasksplit_journal") || "[]"); }
  catch { return []; }
}

export default function Journal({ compact = false }) {
  const [entries, setEntries] = useState(getStored);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});

  const availableKeys = Object.keys(TEMPLATES).filter(k => isTimeGateOpen(TEMPLATES[k]));
  const tpl = selectedType ? TEMPLATES[selectedType] : null;
  const recent = entries.slice(0, compact ? 3 : 30);

  function startEntry(type) { setSelectedType(type); setFormData({}); }
  function updateField(key, value) { setFormData(prev => ({ ...prev, [key]: value })); }

  function saveEntry() {
    if (!selectedType) return;
    const hasContent = Object.values(formData).some(v => typeof v === "string" ? v.trim() : false);
    if (!hasContent) return;
    const entry = { id: Date.now(), type: selectedType, data: formData,
      date: new Date().toLocaleDateString("zh-CN"),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now() };
    const updated = [entry, ...entries].slice(0, 200);
    setEntries(updated);
    localStorage.setItem("tasksplit_journal", JSON.stringify(updated));
    setSelectedType(null); setFormData({});
  }

  function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("tasksplit_journal", JSON.stringify(updated));
  }

  // ===== COMPACT =====
  if (compact) {
    return (
      <div className="card p-4 space-y-3">
        <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>📝 小日记</span>
        {!selectedType ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {availableKeys.map(k => (
                <button key={k} onClick={() => startEntry(k)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold hover:scale-105 transition-all"
                  style={{ backgroundColor: `${TEMPLATES[k].color}18`, color: TEMPLATES[k].color }}>
                  {TEMPLATES[k].emoji} {TEMPLATES[k].name}
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                {recent.map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-[10px]">
                    <span>{TEMPLATES[e.type]?.emoji}</span>
                    <span className="flex-1 truncate font-medium" style={{ color: "var(--warm-gray)" }}>
                      {Object.values(e.data).find(v => typeof v === "string" && v.trim())?.slice(0, 30) || "..."}
                    </span>
                    <span style={{ color: "var(--warm-gray)", opacity: 0.5 }}>{e.time}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-sm">{tpl.emoji}</span>
              <span className="text-xs font-bold" style={{ color: tpl.color }}>{tpl.name}</span>
              <button onClick={() => setSelectedType(null)} className="ml-auto text-[10px]"
                style={{ color: "var(--warm-gray)" }}>✕</button>
            </div>
            {tpl.fields.slice(0, 2).map(f => (
              <input key={f.key} type="text" value={formData[f.key] || ""}
                onChange={e => updateField(f.key, e.target.value)}
                placeholder={f.placeholder || f.prompt}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none border"
                style={{ borderColor: "var(--border)" }} />
            ))}
            <button onClick={saveEntry} className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: tpl.color }}>保存</button>
          </div>
        )}
      </div>
    );
  }

  // ===== FULL PAGE =====
  return (
    <div className="space-y-4">
      {!selectedType ? (
        <>
          <div className="card p-5 space-y-4">
            <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📝 写点什么</span>
            <div className="space-y-2">
              {availableKeys.map(k => {
                const t = TEMPLATES[k];
                return (
                  <button key={k} onClick={() => startEntry(k)}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01] hover:shadow-md"
                    style={{ backgroundColor: `${t.color}12` }}>
                    <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold" style={{ color: t.color }}>{t.name}</p>
                      <p className="text-xs" style={{ color: "var(--warm-gray)" }}>
                        {t.fields.length} 个引导问题
                      </p>
                    </div>
                    {!t.alwaysShow && (
                      <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                        style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                        限时
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {availableKeys.length < 3 && (
              <p className="text-[11px] text-center" style={{ color: "var(--warm-gray)" }}>
                🌅 晨间日记 5-11点 · 🌙 晚间日记 21-1点
              </p>
            )}
          </div>

          {entries.length > 0 && (
            <div className="card p-5 space-y-3">
              <span className="text-base font-extrabold" style={{ color: "var(--soft-dark)" }}>📅 记录回顾</span>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recent.map(e => {
                  const t = TEMPLATES[e.type];
                  const preview = Object.values(e.data).find(v => typeof v === "string" && v.trim()) || "";
                  return (
                    <div key={e.id} className="flex items-start gap-3 py-3 border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}>
                      <span className="text-lg">{t?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: t?.color }}>{t?.name}</span>
                          <span className="text-[10px]" style={{ color: "var(--warm-gray)" }}>{e.date} {e.time}</span>
                        </div>
                        <p className="text-xs mt-1 truncate" style={{ color: "var(--warm-gray)" }}>
                          {typeof preview === "string" ? preview.slice(0, 80) : ""}
                        </p>
                      </div>
                      <button onClick={() => deleteEntry(e.id)}
                        className="text-[10px] font-bold opacity-30 hover:opacity-100"
                        style={{ color: "var(--coral)" }}>删除</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
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
            style={{ backgroundColor: tpl.color }}>保存 ✨</button>
        </div>
      )}
    </div>
  );
}
