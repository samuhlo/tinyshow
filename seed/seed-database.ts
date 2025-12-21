/**
 * [SCRIPT] :: SEED_DATABASE
 * ----------------------------------------------------------------------
 * Script de inicialización de datos.
 * Escanea repositorios de usuario y puebla la base de datos local.
 *
 * @module    seed/seed-database
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import "dotenv/config";
import { Octokit } from "octokit";
import { ingestProject } from "../server/utils/ingest";
import { type Project } from "../shared/types";
import { prisma } from "../server/utils/prisma";

// =====================================================================
// [SECTION] :: CONFIGURATION
// =====================================================================

const GITHUB_TOKEN = process.env.GITHUB_SEED_TOKEN;
const GITHUB_USERNAME = process.argv[2] || process.env.GITHUB_USERNAME;

const DEFAULT_PER_PAGE = 100;
const DEFAULT_BRANCH = "main";

if (!GITHUB_TOKEN) {
  console.error(
    "[ERR]   :: MISSING_ENV   :: GITHUB_SEED_TOKEN is missing in .env"
  );
  process.exit(1);
}

const USERNAME = GITHUB_USERNAME as string;
const OCTOKIT = new Octokit({ auth: GITHUB_TOKEN });

// =====================================================================
// [SECTION] :: MAIN EXECUTION
// =====================================================================

async function main() {
  console.log(`\n[SEED]  >> START         :: user: @${USERNAME}\n`);

  // Read strict mode from env var (default: true)
  const strictMode = process.env.NUXT_STRICT_MODE !== "false";

  console.log(
    `[CONF]  >> MODE          :: ${strictMode ? "STRICT" : "LENIENT"}`
  );
  console.log(
    `[WARN]  >> SYNC_INFO     :: El webhook usará este mismo modo (NUXT_STRICT_MODE=${strictMode})`
  );
  console.log(
    `        >> Para cambiar el modo, modifica NUXT_STRICT_MODE en .env y re-ejecuta este seed.\n`
  );

  try {
    // [STEP 1] :: FETCH_REPOS
    const { data: repos } = await OCTOKIT.request(
      "GET /users/{username}/repos",
      {
        username: USERNAME,
        type: "owner",
        sort: "updated",
        direction: "desc",
        per_page: DEFAULT_PER_PAGE,
      }
    );

    const sources = repos.filter((r) => !r.fork && !r.archived);

    console.log(
      `[REPO]  >> DISCOVERED    :: count: ${repos.length} | filtered: ${sources.length} (non-forks)`
    );

    const projects: Project[] = [];

    // [STEP 2] :: PROCESS_SEQUENCE
    for (const repo of sources) {
      const result = await ingestProject(
        USERNAME,
        repo.name,
        OCTOKIT,
        DEFAULT_BRANCH,
        strictMode
      );

      if (result.action === "save" && result.project) {
        projects.push(result.project);
      }
    }

    // [STEP 3] :: PERSIST_DATA
    console.log(`\n[DB]    >> CLEANING      :: Removing existing projects...`);
    await prisma.project.deleteMany({});

    console.log(`[DB]    >> BATCH_SAVE    :: count: ${projects.length}`);

    const projectsToInsert = projects.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline as any,
      description: p.description as any,
      tech_stack: p.tech_stack,
      primary_tech: p.primary_tech,
      img_url: p.img_url,
      repo_url: p.repo_url,
      demo_url: p.demo_url,
      origin: p.origin as any,
    }));

    await prisma.project.createMany({
      data: projectsToInsert,
      skipDuplicates: true,
    });

    console.log(`\n[DONE]  :: SEED_COMPLETE :: DB sync finished.`);
    if (projects.length === 0) {
      console.warn(
        `[WARN]  :: NO_PROJECTS   :: No projects found or processed.`
      );
    }
  } catch (error) {
    console.error("[ERR]   :: FATAL_SEED    ::", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
