// 场景模板配置
const scenes = {
  thesis: {
    name: "毕业论文",
    emoji: "📝",
    questions: [
      {
        id: "stage",
        text: "你现在到了哪个阶段？",
        options: ["还没开始", "初稿在写", "在修改", "在最后检查"],
      },
      {
        id: "template",
        text: "学校有没有格式模板？",
        options: ["有", "没有", "不确定"],
      },
      {
        id: "deadline",
        text: "截止日期大概是？",
        options: ["一周内", "两周内", "一个月内", "还早"],
      },
    ],
    promptSupplement:
      "论文拆解应包含：格式检查、内容修改、查重、打印装订等实际步骤，不要拆成\"写第一章\"这种抽象单元。",
  },
  job: {
    name: "找工作",
    emoji: "💼",
    questions: [
      {
        id: "direction",
        text: "什么方向？",
        options: ["技术开发", "产品/运营", "设计", "其他"],
      },
      {
        id: "resume",
        text: "有简历吗？",
        options: ["有，但需要更新", "没有", "有，已经准备好了"],
      },
      {
        id: "city",
        text: "有没有目标城市？",
        options: ["有", "没有，都可以"],
      },
    ],
    promptSupplement:
      "拆解应包含：岗位扫描、简历撰写、投递、面试准备等具体动作，第一步应该是\"打开招聘网站\"而不是\"确定职业方向\"。",
  },
  exam: {
    name: "考研备考",
    emoji: "📚",
    questions: [
      {
        id: "direction",
        text: "考哪个方向？",
        options: ["理工科", "文科/社科", "商科", "其他"],
      },
      {
        id: "month",
        text: "现在距离考试还有多久？",
        options: ["3个月内", "半年", "半年以上"],
      },
      {
        id: "started",
        text: "已经开始复习了吗？",
        options: ["还没开始", "刚开始", "已经复习一段时间了"],
      },
    ],
    promptSupplement:
      "拆解应区分\"信息收集\"和\"实际学习\"两个阶段，每个阶段内部进一步拆解。",
  },
  free: {
    name: "其他",
    emoji: "✨",
    questions: [],
    promptSupplement: "",
  },
};

export default scenes;
