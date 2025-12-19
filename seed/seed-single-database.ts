/**
 * [SCRIPT] :: SEED_SINGLE
 * ----------------------------------------------------------------------
 * Script de utilidad para ingerir un único repositorio por URL.
 * Útil para pruebas puntuales o actualizaciones manuales.
 *
 * @module    seed/seed-single-database
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import "dotenv/config";
import { Octokit } from "octokit";
import { ingestProject, saveProject } from "../server/utils/ingest";
import { prisma } from "../server/utils/prisma";
import * as readline from "readline";

// =====================================================================
// [SECTION] :: CONFIGURATION
// =====================================================================

const GITHUB_TOKEN = process.env.GITHUB_SEED_TOKEN;
const OCTOKIT = new Octokit({ auth: GITHUB_TOKEN });

const DEFAULT_BRANCH = "main";
const GITHUB_DOMAIN = "github.com";

// =====================================================================
// [SECTION] :: UTILITIES
// =====================================================================

/**
 * [I/O] :: ASK_QUESTION
 * Promesa utilitaria para obtener entrada del usuario vía terminal.
 * @param query - La pregunta a mostrar.
 * @returns La respuesta del usuario.
 */
async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// =====================================================================
// [SECTION] :: MAIN EXECUTION
// =====================================================================

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error(
      "Usage: npx tsx seed/seed-single-database.ts <github-repo-url>"
    );
    process.exit(1);
  }

  console.log(`\n[SEED]  >> START         :: target: ${repoUrl}\n`);

  const answer = await askQuestion(
    "Enable strict mode (require img_url & demo_url)? [Y/n]: "
  );
  const strictMode = answer.toLowerCase() !== "n";

  console.log(
    `[CONF]  >> MODE          :: ${strictMode ? "STRICT" : "LENIENT"}\n`
  );

  try {
    // [STEP 1] :: PARSE_URL
    let owner = "";
    let repo = "";

    if (repoUrl.includes(GITHUB_DOMAIN)) {
      const splitResult = repoUrl.split(`${GITHUB_DOMAIN}/`);
      const path = splitResult[1];
      if (path) {
        const parts = path.split("/");
        if (parts.length >= 2) {
          owner = parts[0]!;
          repo = parts[1]!;
        }
      }
    }

    if (!owner || !repo) {
      // Fallback for just "owner/repo" string if passed
      const parts = repoUrl.split("/");
      if (parts.length === 2) {
        owner = parts[0]!;
        repo = parts[1]!;
      } else {
        throw new Error(`Could not parse owner/repo from ${repoUrl}`);
      }
    }

    // [STEP 2] :: TRIGGER_INGESTION
    const project = await ingestProject(
      owner,
      repo,
      OCTOKIT,
      DEFAULT_BRANCH,
      strictMode
    );

    if (!project) {
      console.error("[ERR]   :: INGEST_FAIL   :: See logs above.");
      process.exit(1);
    }

    // [STEP 3] :: PERSIST_DATA
    await saveProject(project);

    console.log(`\n[DONE]  :: SEED_COMPLETE :: Project saved successfully.`);
  } catch (err) {
    console.error("[ERR]   :: FATAL         ::", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
