// 基础 system prompt
const basePrompt = `你是一个任务拆解助手，专门服务于有执行功能困难的用户。
用户会给你一个任务描述。你需要将其拆解为可直接执行的最小步骤。

规则：
1. 每个步骤必须是一个具体动作，用户看到后不需要再思考"具体做什么"
2. 每个步骤的预估时间不超过30分钟，理想为5-20分钟
3. 每个步骤必须附带"完成标准"——怎么知道这一步做完了
4. 第一个步骤必须是最简单的，简单到不可能失败
5. 如果用户提供了场景（如"毕业论文"），使用该场景的专业知识来细化步骤

输出格式（严格JSON，不要输出其他内容）：
{
  "steps": [
    {
      "order": 1,
      "description": "打开论文文档",
      "estimated_minutes": 2,
      "done_criteria": "文档已经在屏幕上打开"
    }
  ]
}`;

export function buildPrompt(scene, sceneAnswers) {
  let prompt = basePrompt;

  if (scene && scene.promptSupplement) {
    prompt += `\n\n场景补充：${scene.promptSupplement}`;
  }

  if (sceneAnswers && Object.keys(sceneAnswers).length > 0) {
    const context = Object.entries(sceneAnswers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("，");
    prompt += `\n\n用户补充信息：${context}`;
  }

  return prompt;
}

export default basePrompt;
