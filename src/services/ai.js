import { buildPrompt } from "../prompts/base.js";

const API_URL = "https://api.deepseek.com/chat/completions";

export async function splitTask(taskText, scene, sceneAnswers, apiKey) {
  const systemPrompt = buildPrompt(scene, sceneAnswers);

  const userMessage = scene && scene.name !== "其他"
    ? `场景：${scene.name}\n任务：${taskText}`
    : taskText;

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
          { role: "user", content: userMessage },
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

// Mock 数据，用于没有 API key 时测试
export function splitTaskMock(taskText) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          order: 1,
          description: `打开与「${taskText}」相关的文档或工具`,
          estimated_minutes: 2,
          done_criteria: "文档/工具已在屏幕上打开",
        },
        {
          order: 2,
          description: "花2分钟快速浏览一遍，了解当前状态",
          estimated_minutes: 5,
          done_criteria: "你能说出目前已经完成了什么、还缺什么",
        },
        {
          order: 3,
          description: "找出最容易完成的一小块内容，动手写/做第一段",
          estimated_minutes: 15,
          done_criteria: "第一小块内容已完成，保存了",
        },
        {
          order: 4,
          description: "休息一下，回来检查刚才完成的部分",
          estimated_minutes: 5,
          done_criteria: "检查完毕，没有明显问题",
        },
        {
          order: 5,
          description: "继续下一小块内容",
          estimated_minutes: 20,
          done_criteria: "第二小块内容已完成，保存了",
        },
      ]);
    }, 1500);
  });
}
