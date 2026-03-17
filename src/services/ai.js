import { buildPrompt } from "../prompts/base.js";

const API_URL = "https://api.deepseek.com/chat/completions";

export async function splitTask(taskText, attrs, apiKey) {
  const systemPrompt = buildPrompt(attrs);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskText },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.steps;
  } catch (error) {
    console.error("AI 拆解失败:", error);
    throw error;
  }
}

export function splitTaskMock(taskText) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { order: 1, description: `打开与「${taskText}」相关的文档或工具`, estimated_minutes: 2, done_criteria: "文档/工具已在屏幕上打开" },
        { order: 2, description: "花 2 分钟快速浏览，了解当前进度", estimated_minutes: 5, done_criteria: "能说出目前完成了什么、还缺什么" },
        { order: 3, description: "找出最容易的一小块，动手做第一段", estimated_minutes: 15, done_criteria: "第一小块已完成并保存" },
        { order: 4, description: "休息一下，喝口水", estimated_minutes: 3, done_criteria: "已休息" },
        { order: 5, description: "继续下一小块内容", estimated_minutes: 20, done_criteria: "第二小块已完成并保存" },
      ]);
    }, 1500);
  });
}
