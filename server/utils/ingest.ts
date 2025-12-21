import { Octokit } from "octokit";
import { type Project } from "../../shared/types";
import { extractProjectData } from "./ai";
import { prisma } from "./prisma";

// =====================================================================
// [SECTION] :: TYPES
// =====================================================================

/**
 * [TYPE] :: INGEST_RESULT
 * Resultado de la ingesta con acción a tomar.
 */
export type IngestResult = {
  action: "save" | "delete" | "skip";
  project: Project | null;
  projectId: string;
  reason?: string;
};

// =====================================================================
// [SECTION] :: PROJECT INGESTION
// =====================================================================

/**
 * [MODULE] :: INGEST_UTILS
 * ----------------------------------------------------------------------
 * Utilidades centrales para la ingesta y procesamiento de proyectos.
 * Orquesta la extracción de datos desde GitHub y su persistencia.
 *
 * @module    server/utils/ingest
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

/**
 * [FETCH] :: INGEST_PROJECT
 * Recupera el README, extrae metadatos con IA y valida los assets.
 *
 * @param owner      - Propietario del repositorio.
 * @param repo       - Nombre del repositorio.
 * @param octokit    - Instancia del cliente GitHub.
 * @param branch     - (Optional) Rama objetivo (default: 'main').
 * @param strictMode - (Optional) Si es true, requiere demo e imagen.
 *
 * @returns IngestResult con la acción a tomar y el proyecto procesado.
 */
const DEFAULT_BRANCH = "main";
const FALLBACK_BRANCH = "master";
const MIN_README_LENGTH = 50;
const ENDPOINT_README = "GET /repos/{owner}/{repo}/readme";
const MEDIA_TYPE_RAW = "raw";
const GITHUB_BASE_URL = "https://github.com";

export async function ingestProject(
  owner: string,
  repo: string,
  octokit: Octokit,
  branch: string = DEFAULT_BRANCH,
  strictModeOverride?: boolean
): Promise<IngestResult> {
  const projectId = repo; // Project ID is the repo name

  // Read from env var, fallback to explicit override, fallback to true
  const envStrictMode = process.env.NUXT_STRICT_MODE !== "false";
  const strictMode = strictModeOverride ?? envStrictMode;

  console.log(
    `[INGEST] >> START        :: project: ${owner}/${repo} | branch: ${branch} | strict: ${strictMode}`
  );

  try {
    // 1. Fetch README
    let readmeContent = "";
    try {
      const { data: readme } = await octokit.request(ENDPOINT_README, {
        owner,
        repo,
        ref: branch,
        mediaType: {
          format: MEDIA_TYPE_RAW,
        },
      });
      readmeContent = readme as unknown as string;
    } catch (e: any) {
      // Fallback: Try 'master' if 'main' failed and we haven't tried it yet
      if (branch === DEFAULT_BRANCH && e.status === 404) {
        console.warn(
          `[WARN]  :: BRANCH_404    :: '${DEFAULT_BRANCH}' not found. Retrying with '${FALLBACK_BRANCH}'`
        );
        return ingestProject(owner, repo, octokit, FALLBACK_BRANCH, strictMode);
      }

      if (e.status === 404) {
        console.warn(`[WARN]  :: NO_README     :: Skipping ingestion.`);
        return {
          action: "skip",
          project: null,
          projectId,
          reason: "No README found",
        };
      }
      throw e;
    }

    if (!readmeContent || readmeContent.length < MIN_README_LENGTH) {
      console.warn(
        `[WARN]  :: SHORT_README  :: size: ${readmeContent.length} chars (min: 50). Skipping.`
      );
      return {
        action: "skip",
        project: null,
        projectId,
        reason: "README too short",
      };
    }

    // 2. AI Extraction
    const htmlUrl = `${GITHUB_BASE_URL}/${owner}/${repo}`;
    console.log(
      `[ANLZ]  >> README.md     :: size: ${readmeContent.length} chars | status: AI_PROCESSING`
    );

    const projectData = await extractProjectData(readmeContent, htmlUrl);

    // 3. Quality Filters
    if (!projectData.demo_url || !projectData.img_url) {
      const missing = [];
      if (!projectData.demo_url) missing.push("demo_url");
      if (!projectData.img_url) missing.push("img_url");

      if (strictMode) {
        console.warn(
          `[DATA]  :: SKIP_STRICT   :: Missing assets: ${missing.join(
            ", "
          )} -> Will DELETE if exists`
        );
        // In strict mode, signal deletion so existing projects get removed
        return {
          action: "delete",
          project: null,
          projectId,
          reason: `Missing required assets: ${missing.join(", ")}`,
        };
      } else {
        console.warn(
          `[DATA]  :: WARN_ALLOW    :: Missing assets: ${missing.join(
            ", "
          )} (Allowed by non-strict mode)`
        );
      }
    }

    const courseInfo = projectData.origin?.is_course
      ? ` | type: COURSE (${projectData.origin.name || "Unknown"})`
      : "";
    console.log(
      `[DATA]  ++ EXTRACTED     :: title: "${projectData.title}"${courseInfo}`
    );

    return { action: "save", project: projectData, projectId };
  } catch (err: any) {
    console.error(`[ERR]   :: EXTRACT_FAIL  :: ${err.message}`);
    return { action: "skip", project: null, projectId, reason: err.message };
  }
}
// =====================================================================
// [SECTION] :: DATABASE PERSISTENCE
// =====================================================================

/**
 * [PERSIST] :: SAVE_PROJECT
 * Upsert del proyecto en base de datos usando Prisma.
 *
 * @param project - Objeto de proyecto validado.
 *
 * @returns Promesa vacía al completar.
 */
export async function saveProject(project: Project): Promise<void> {
  console.log(`[DB]    >> WRITING       :: project: '${project.title}'`);

  await prisma.project.upsert({
    where: { id: project.id },
    update: {
      title: project.title,
      tagline: project.tagline as any,
      description: project.description as any,
      tech_stack: project.tech_stack,
      primary_tech: project.primary_tech.trim(),
      img_url: project.img_url,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      origin: project.origin as any,
    },
    create: {
      id: project.id,
      title: project.title,
      tagline: project.tagline as any,
      description: project.description as any,
      tech_stack: project.tech_stack,
      primary_tech: project.primary_tech.trim(),
      img_url: project.img_url,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      origin: project.origin as any,
    },
  });
  console.log(`[DB]    ++ SAVED         :: id: ${project.id}`);
}

/**
 * [DELETE] :: DELETE_PROJECT
 * Elimina un proyecto de la base de datos.
 *
 * @param projectId - ID del proyecto a eliminar.
 *
 * @returns true si se eliminó, false si no existía.
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  console.log(`[DB]    >> DELETING      :: project: '${projectId}'`);

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    console.log(`[DB]    -- DELETED       :: id: ${projectId}`);
    return true;
  } catch (err: any) {
    // P2025 = Record not found (Prisma error code)
    if (err.code === "P2025") {
      console.log(
        `[DB]    :: NOT_FOUND     :: id: ${projectId} (nothing to delete)`
      );
      return false;
    }
    throw err;
  }
}
