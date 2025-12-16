import OpenAI from "openai";
import { ProjectSchema, type Project } from "../../shared/types";

export const extractProjectData = async (
  readmeContent: string,
  repoUrl: string = ""
): Promise<Project> => {
  // Support both Nuxt runtime config and direct process.env for scripts
  const config =
    typeof useRuntimeConfig !== "undefined"
      ? useRuntimeConfig()
      : { deepseekApiKey: process.env.NUXT_DEEPSEEK_API_KEY };
  const apiKey = config.deepseekApiKey || process.env.NUXT_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NUXT_DEEPSEEK_API_KEY");
  }

  const openai = new OpenAI({
    apiKey: apiKey as string,
    baseURL: "https://api.deepseek.com",
  });

  const jsonSchema = ProjectSchema.toJSONSchema();

  const systemPrompt = `
You are a high-precision technical analyst for 'The Brutalist Automaton'.
Your objective: Extract structured technical data from the provided README content.

FORMAT Strict JSON that matches this schema:
${JSON.stringify(jsonSchema, null, 2)}

GUIDELINES:
1. **id**: specific slug from the repository name (e.g. 'tinyshow-v2').
2. **title**: Clean, punchy title.
3. **tagline**: A brutalist, short description (max 60 chars).
4. **description**: Technical but engaging summary.
5. **tech_stack**: Array of specific technologies mentioned (e.g. 'Nuxt 3', 'Tailwind', 'GSAP').
6. **repo_url**: Use '${repoUrl}' if provided, otherwise infer.
7: **img_url**: If a relevant screenshot or header image is found in markdown standard syntax, use it. IMPORTANT: If the path is relative (e.g. './img.png' or 'public/img.png'), you MUST convert it to an absolute raw GitHub URL (e.g. 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}'). Use '${repoUrl}' to infer the owner and repo. Assume 'main' branch if not specified.

CRITICAL: Return ONLY valid JSON. No Markdown code fences.
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Repository URL: ${repoUrl}\n\n${readmeContent.substring(
            0,
            15000
          )}`,
        }, // Truncate to avoid context limits if huge
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temp for precision
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from DeepSeek");

    // Parse JSON
    const rawData = JSON.parse(content);

    // Validate with Zod
    return ProjectSchema.parse(rawData);
  } catch (error) {
    console.error("DeepSeek Extraction Failed:", error);
    throw error;
  }
};
