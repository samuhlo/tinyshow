import { Octokit } from "octokit";
import { type Project } from "../../shared/types";
import { extractProjectData } from "./ai";
import { prisma } from "./prisma";

// Re-export specific types if needed, or just use Project from shared/types

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
 * @param   {String}   owner       - Propietario del repositorio.
 * @param   {String}   repo        - Nombre del repositorio.
 * @param   {Octokit}  octokit     - Instancia del cliente GitHub.
 * @param   {String}   [branch='main'] - Rama objetivo (fallback automático).
 *
 * @returns {Promise<Project|null>} - Proyecto procesado o null si falla.
 */
export async function ingestProject(
  owner: string,
  repo: string,
  octokit: Octokit,
  branch: string = "main"
): Promise<Project | null> {
  console.log(
    `[INGEST] >> START        :: project: ${owner}/${repo} | branch: ${branch}`
  );

  try {
    // 1. Fetch README
    let readmeContent = "";
    try {
      const { data: readme } = await octokit.request(
        "GET /repos/{owner}/{repo}/readme",
        {
          owner,
          repo,
          ref: branch,
          mediaType: {
            format: "raw",
          },
        }
      );
      readmeContent = readme as unknown as string;
    } catch (e: any) {
      // Fallback: Try 'master' if 'main' failed and we haven't tried it yet
      if (branch === "main" && e.status === 404) {
        console.warn(
          `[WARN]  :: BRANCH_404    :: 'main' not found. Retrying with 'master'`
        );
        return ingestProject(owner, repo, octokit, "master");
      }

      if (e.status === 404) {
        console.warn(`[WARN]  :: NO_README     :: Skipping ingestion.`);
        return null;
      }
      throw e;
    }

    if (!readmeContent || readmeContent.length < 50) {
      console.warn(
        `[WARN]  :: SHORT_README  :: size: ${readmeContent.length} chars (min: 50). Skipping.`
      );
      return null;
    }

    // 2. AI Extraction
    const htmlUrl = `https://github.com/${owner}/${repo}`;
    console.log(
      `[ANLZ]  >> README.md     :: size: ${readmeContent.length} chars | status: AI_PROCESSING`
    );

    const projectData = await extractProjectData(readmeContent, htmlUrl);

    // 3. Quality Filters
    if (!projectData.demo_url || !projectData.img_url) {
      console.warn(
        `[DATA]  :: MISSING_ASSETS:: demo: ${!!projectData.demo_url} | img: ${!!projectData.img_url}`
      );
      return null;
    }

    const courseInfo = projectData.origin?.is_course
      ? ` | type: COURSE (${projectData.origin.name || "Unknown"})`
      : "";
    console.log(
      `[DATA]  ++ EXTRACTED     :: title: "${projectData.title}"${courseInfo}`
    );

    return projectData;
  } catch (err: any) {
    console.error(`[ERR]   :: EXTRACT_FAIL  :: ${err.message}`);
    // We strictly return null on failure to allow caller to continue
    return null;
  }
}

/**
 * [PERSIST] :: SAVE_PROJECT
 * Upsert del proyecto en base de datos usando Prisma.
 *
 * @param   {Project}  project     - Objeto de proyecto validado.
 *
 * @returns {Promise<void>}        - Promesa vacía al completar.
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
      img_url: project.img_url,
      repo_url: project.repo_url,
      demo_url: project.demo_url,
      origin: project.origin as any,
    },
  });
  console.log(`[DB]    ++ SAVED         :: id: ${project.id}`);
}
