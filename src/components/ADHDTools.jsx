import { useState, useEffect, useRef } from "react";

// ===== Body Doubling Timer =====
function BodyDouble() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>👥 虚拟陪伴</span>
        {active && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse"
          style={{ backgroundColor: "#E8F5E9", color: "var(--mint)" }}>陪伴中</span>}
      </div>
      <p className="text-[11px]" style={{ color: "var(--warm-gray)" }}>
        {active ? "有人在陪你一起做事。不用说话，做你的就好。" : "假装有人坐在旁边陪你，ADHD 的「陪伴效应」能帮助启动任务。"}
      </p>
      {active && (
        <div className="text-center py-2">
          <span className="text-2xl font-extrabold tabular-nums" style={{ color: "var(--mint)" }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <p className="text-[10px] mt-1" style={{ color: "var(--warm-gray)" }}>已陪伴</p>
        </div>
      )}
      <button onClick={() => { setActive(!active); if (active) setSeconds(0); }}
        className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
        style={{ backgroundColor: active ? "var(--warm-gray)" : "var(--mint)" }}>
        {active ? "结束陪伴" : "开始陪伴"}
      </button>
    </div>
  );
}

// ===== Stim Break =====
function StimBreak() {
  const breaks = [
    { emoji: "🧊", text: "摸摸冰的东西" },
    { emoji: "🎵", text: "听一首喜欢的歌" },
    { emoji: "🚶", text: "站起来走 30 步" },
    { emoji: "💧", text: "喝一杯水" },
    { emoji: "🤸", text: "伸个懒腰，扭扭脖子" },
    { emoji: "🫧", text: "深呼吸 5 次" },
    { emoji: "👀", text: "看窗外 20 秒" },
    { emoji: "✋", text: "搓搓手掌，感受温度" },
  ];
  const [current, setCurrent] = useState(null);

  function roll() {
    const idx = Math.floor(Math.random() * breaks.length);
    setCurrent(breaks[idx]);
  }

  return (
    <div className="card p-4 space-y-3">
      <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>⚡ 感官休息</span>
      <p className="text-[11px]" style={{ color: "var(--warm-gray)" }}>
        ADHD 大脑需要感官输入来调节。随机抽一个 30 秒小活动。
      </p>
      {current && (
        <div className="text-center py-3 animate-popIn">
          <span className="text-3xl">{current.emoji}</span>
          <p className="text-sm font-bold mt-2" style={{ color: "var(--soft-dark)" }}>{current.text}</p>
        </div>
      )}
      <button onClick={roll}
        className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
        style={{ backgroundColor: "var(--lavender)" }}>
        {current ? "再来一个" : "随机抽取"}
      </button>
    </div>
  );
}

// ===== Reward System =====
function Rewards() {
  const [points, setPoints] = useState(() => {
    try { return parseInt(localStorage.getItem("tasksplit_points") || "0"); }
    catch { return 0; }
  });

  const rewards = [
    { cost: 5, name: "看 10 分钟短视频", emoji: "📱" },
    { cost: 10, name: "吃个小零食", emoji: "🍪" },
    { cost: 20, name: "玩 30 分钟游戏", emoji: "🎮" },
    { cost: 30, name: "点一杯奶茶", emoji: "🧋" },
    { cost: 50, name: "自选大奖励", emoji: "🎁" },
  ];

  function addPoint() {
    const newPts = points + 1;
    setPoints(newPts);
    localStorage.setItem("tasksplit_points", String(newPts));
  }

  function redeem(cost) {
    if (points >= cost) {
      const newPts = points - cost;
      setPoints(newPts);
      localStorage.setItem("tasksplit_points", String(newPts));
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold" style={{ color: "var(--soft-dark)" }}>⭐ 奖励商店</span>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "#FFF3C4", color: "#D4A000" }}>
          {points} 星
        </span>
      </div>
      <p className="text-[11px]" style={{ color: "var(--warm-gray)" }}>
        完成步骤赚星星，用星星兑换奖励。ADHD 大脑靠即时反馈驱动。
      </p>
      <div className="space-y-1.5">
        {rewards.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--soft-dark)" }}>
              {r.emoji} {r.name}
            </span>
            <button onClick={() => redeem(r.cost)}
              disabled={points < r.cost}
              className="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-30"
              style={{ backgroundColor: points >= r.cost ? "#FFF3C4" : "var(--border)",
                color: points >= r.cost ? "#D4A000" : "var(--warm-gray)" }}>
              {r.cost}⭐
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Export all as tabs =====
export default function ADHDTools({ compact = false }) {
  if (compact) {
    return (
      <div className="space-y-4">
        <StimBreak />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BodyDouble />
      <StimBreak />
      <Rewards />
    </div>
  );
}

export { Rewards };
