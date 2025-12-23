/**
 * [MODULE] :: AI_UTILS
 * ----------------------------------------------------------------------
 * Integración con DeepSeek para el análisis semántico de repositorios.
 * Extrae metadatos técnicos estructurados a partir de archivos README.
 *
 * @module    server/utils/ai
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import OpenAI from "openai";
import { ProjectSchema, type Project } from "../../shared/types";

// =====================================================================
// [SECTION] :: DATA EXTRACTION
// =====================================================================

/**
 * [EXTRACT] :: EXTRACT_PROJECT_DATA
 * Utiliza IA para parsear el contenido de un README y transformarlo en
 * una estructura conforme al esquema Project.
 *
 * @param readmeContent - El texto completo del archivo README.md.
 * @param repoUrl      - (Optional) URL del repositorio para inferir datos.
 *
 * @returns Objeto Project validado por Zod.
 * @throws  {Error} - Si la API Key falta o la IA devuelve datos corruptos.
 */
export const extractProjectData = async (
  readmeContent: string,
  repoUrl: string = ""
): Promise<Project> => {
  // Soporta tanto configuración runtime de Nuxt como process.env directo para scripts
  const config =
    typeof useRuntimeConfig !== "undefined"
      ? useRuntimeConfig()
      : { deepseekApiKey: process.env.NUXT_DEEPSEEK_API_KEY };
  const apiKey = config.deepseekApiKey || process.env.NUXT_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NUXT_DEEPSEEK_API_KEY");
  }

  const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
  const DEEPSEEK_MODEL = "deepseek-chat";
  const MAX_README_CHARS = 15000;
  const TEMPERATURE = 0.1;

  const openai = new OpenAI({
    apiKey: apiKey as string,
    baseURL: DEEPSEEK_BASE_URL,
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
3. **tagline**: A brutalist, short description (max 60 chars). Object with keys: 'en', 'es'.
4. **description**: Technical but engaging summary. Object with keys: 'en', 'es'.
5. **tech_stack**: Array of specific technologies mentioned (e.g. 'Nuxt 3', 'Tailwind', 'GSAP').
6. **primary_tech**: The dominant technology. Rule: Framework > Language. Examples: 'Astro' over 'TypeScript', 'Nuxt' over 'Vue', 'Next' over 'React'.
7. **repo_url**: Use '${repoUrl}' if provided, otherwise infer.
8: **img_url**: If a relevant screenshot or header image is found in markdown standard syntax, use it. IMPORTANT: If the path is relative (e.g. './img.png' or 'public/img.png'), you MUST convert it to an absolute raw GitHub URL (e.g. 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}'). Use '${repoUrl}' to infer the owner and repo. Assume 'main' branch if not specified.
9: **origin**: Analyze if the README mentions "Course", "Bootcamp", "Tutorial", "Based on", "Inspirado en", "Midudev", "Alura", etc. If yes, set is_course: true and extract:
   - **name**: The official course name. IMPORTANT: Do NOT repeat the author's name here (e.g., avoid "Midudev Course" if author is "Midudev"). If no explicit course name is found, infer a descriptive name using the primary_tech and repo title (e.g., "Nuxt 3 Fundamentals", "Vue Portfolio Workshop").
   - **author**: The instructor or platform name.
   - **course_url**: Link to course landing page if found.
   - **author_url**: Instructor's website, Twitter, or YouTube if found.

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
            MAX_README_CHARS
          )}`,
        }, // Truncate to avoid context limits if huge
      ],
      model: DEEPSEEK_MODEL,
      response_format: { type: "json_object" },
      temperature: TEMPERATURE, // Low temp for precision
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from DeepSeek");

    // Parsear JSON
    const rawData = JSON.parse(content);

    // Validar con Zod
    return ProjectSchema.parse(rawData);
  } catch (error) {
    console.error("[ERR]   :: DEEPSEEK_FAIL ::", error);
    throw error;
  }
};
