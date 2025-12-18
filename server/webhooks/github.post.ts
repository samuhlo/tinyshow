import { Octokit } from "octokit";
import crypto from "crypto";
import { ingestProject, saveProject } from "../utils/ingest";

/**
 * [WEBHOOK] :: GITHUB_PUSH_HANDLER
 * ----------------------------------------------------------------------
 * Endpoint reactivo para eventos 'push' de GitHub.
 * Valida firmas, detecta cambios en README y dispara la ingesta.
 *
 * @module    server/api/webhooks
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */
const WEBHOOK_SECRET = process.env.NUXT_GITHUB_WEBHOOK_SECRET;
const GITHUB_TOKEN = process.env.GITHUB_SEED_TOKEN;

export default defineEventHandler(async (event) => {
  // [STEP 1] :: VERIFY_METHOD
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  // [STEP 2] :: VERIFY_SIGNATURE
  const signature = getHeader(event, "x-hub-signature-256");
  const body = await readRawBody(event);

  if (!WEBHOOK_SECRET) {
    console.warn(
      "[WARN]  :: SIG_MISSING   :: Webhook Secret not set. Skipping verification (UNSAFE)."
    );
  } else if (!signature || !body) {
    throw createError({
      statusCode: 401,
      statusMessage: "Missing signature or body",
    });
  } else {
    // Verify HMAC
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
    const digest = "sha256=" + hmac.update(body).digest("hex");
    if (signature !== digest) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid signature",
      });
    }
  }

  // [STEP 3] :: PARSE_PAYLOAD
  const payload = JSON.parse(body || "{}");
  const eventType = getHeader(event, "x-github-event");

  if (eventType === "ping") {
    return { status: "pong" };
  }

  if (eventType !== "push") {
    return { status: "ignored", message: "Not a push event" };
  }

  // [STEP 4] :: DETECT_CHANGES
  const commits = payload.commits || [];
  let readmeChanged = false;

  for (const commit of commits) {
    const changes = [...commit.added, ...commit.modified];
    if (changes.some((file: string) => file === "README.md")) {
      readmeChanged = true;
      break; // One change is enough
    }
  }

  if (!readmeChanged) {
    return { status: "skipped", message: "No README changes detected" };
  }

  // [STEP 5] :: TRIGGER_INGESTION
  const repo = payload.repository;
  if (!repo) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing repository info",
    });
  }

  const owner = repo.owner.name || repo.owner.login; // GitHub payload can vary
  const repoName = repo.name;
  const branch = payload.ref.replace("refs/heads/", "");

  console.log(
    `[HOOK]  :: TRIGGER_REC   :: source: ${owner}/${repoName} | branch: ${branch}`
  );

  // Instantiate Octokit
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // Ingest
  const project = await ingestProject(owner, repoName, octokit, branch);

  if (project) {
    await saveProject(project);
    return { status: "success", project: project.title };
  } else {
    return {
      status: "skipped",
      message: "Ingestion failed or returned null (see server logs)",
    };
  }
});
