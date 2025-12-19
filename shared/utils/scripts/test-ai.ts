/**
 * [SCRIPT] :: TEST_AI
 * ----------------------------------------------------------------------
 * Utilidad para validar la extracción de datos mediante IA de forma aislada.
 * Descarga el README de un repo y lo procesa con DeepSeek.
 *
 * @module    shared/scripts
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { extractProjectData } from "../../../server/utils/ai";
import { config } from "dotenv";

// Load environment variables locally
config();

// =====================================================================
// [SECTION] :: UTILITIES
// =====================================================================

/**
 * [TASK] :: PROCESS_CONTENT
 * Envía el contenido a la IA y muestra el resultado formateado.
 *
 * @param content - Texto del README.
 * @param repoUrl - URL del repositorio original.
 */
async function processContent(content: string, repoUrl: string) {
  console.log(`[INFO]  :: README_SIZE   :: ${content.length} chars`);
  console.log("[AI]    >> SENDING       :: Processing with DeepSeek...");

  const startTime = Date.now();
  const data = await extractProjectData(content, repoUrl);
  const duration = Date.now() - startTime;

  console.log(
    `\n[AI]    ++ COMPLETE      :: time: ${(duration / 1000).toFixed(2)}s`
  );
  console.log("---------------------------------------------------");
  console.dir(data, { depth: null, colors: true });
  console.log("---------------------------------------------------");
}

// =====================================================================
// [SECTION] :: MAIN EXECUTION
// =====================================================================

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error(
      "Usage: npx tsx shared/utils/scripts/test-ai.ts <github-repo-url>"
    );
    process.exit(1);
  }

  console.log(`\n[AI]    >> ANALYZING     :: target: ${repoUrl}\n`);

  try {
    // 1. Convert GitHub URL to Raw README URL
    let rawUrl = repoUrl;
    if (repoUrl.includes("github.com")) {
      const parts = repoUrl.split("github.com/")[1]?.split("/");
      if (parts && parts.length >= 2) {
        const user = parts[0];
        const repo = parts[1];
        rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
      }
    }

    console.log(`[HTTP]  >> FETCHING      :: url: ${rawUrl}`);
    const res = await fetch(rawUrl);

    if (!res.ok) {
      if (rawUrl.includes("/main/")) {
        console.warn(
          "[WARN]  :: BRANCH_404    :: 'main' not found. Retrying with 'master'..."
        );
        rawUrl = rawUrl.replace("/main/", "/master/");
        const res2 = await fetch(rawUrl);
        if (!res2.ok)
          throw new Error(`Failed to fetch README: ${res2.statusText}`);
        const text = await res2.text();
        await processContent(text, repoUrl);
        return;
      }
      throw new Error(`Failed to fetch README: ${res.statusText}`);
    }

    const text = await res.text();
    await processContent(text, repoUrl);
  } catch (err) {
    console.error("[ERR]   :: FETCH_FAIL    ::", err);
  }
}

main();
