# ✂️ TaskSplit

**把大任务拆成你能一眼看完的小单元**

面向 AuDHD / 执行功能困难人群的 AI 任务拆解工具。

## 💡 解决什么问题

> "我知道我要做这件事，但我不知道从哪里开始、每一步具体做什么、做到什么程度算完成。"

用户只需要说出"我要做什么"，TaskSplit 输出"你现在具体做这一步"。

## ✨ 功能

- **🎯 AI 智能拆解** — 输入任务，AI 自动拆解为可执行的最小步骤
- **📋 场景模板** — 毕业论文、找工作、考研备考、自由输入
- **⏱ 专注计时器** — 选择步骤后启动番茄钟，沉浸式倒计时
- **✅ 完成追踪** — 勾选完成、查看进度、记录历史
- **🎨 温暖设计** — 对标 Tiimo，圆润彩色，对神经多样性友好

## 🔧 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React + Vite + TailwindCSS |
| AI | DeepSeek API |
| 字体 | Nunito（Google Fonts） |
| 部署 | Vercel / Netlify / Cloudflare Pages |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Un-chat-010/tasksplit.git
cd tasksplit

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:5173 即可使用。

### 配置 AI

1. 获取 [DeepSeek API Key](https://platform.deepseek.com/)
2. 点击页面右上角 ⚙️ 按钮
3. 输入 API Key 并保存

未配置 API Key 时会使用演示数据，方便体验完整流程。

## 📁 项目结构

```
src/
├── components/
│   ├── TaskInput.jsx         # 任务输入 + 场景选择
│   ├── StepCard.jsx          # 单个步骤卡片
│   ├── StepList.jsx          # 步骤列表 + 进度条
│   ├── FocusTimer.jsx        # 专注计时器
│   └── CompletionRecord.jsx  # 完成记录
├── services/
│   └── ai.js                 # DeepSeek API 调用
├── prompts/
│   ├── base.js               # 基础 system prompt
│   └── scenes.js             # 场景模板配置
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 设计理念

对标 [Tiimo](https://www.tiimo.dk/)，但差异化在于：
- Tiimo 是"视觉化规划器"——帮你管理时间
- TaskSplit 是"外接拆解器"——帮你跳过你做不到的那一步

设计上采用温暖的奶油色背景、圆润大圆角、每个步骤独立配色，降低认知负担。

## 📜 License

MIT
