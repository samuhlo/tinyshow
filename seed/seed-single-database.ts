import "dotenv/config";
import { Octokit } from "octokit";
import { ingestProject, saveProject } from "../server/utils/ingest";
import { prisma } from "../server/utils/prisma";

const GITHUB_TOKEN = process.env.GITHUB_SEED_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error(
      "Usage: npx tsx seed/seed-single-database.ts <github-repo-url>"
    );
    process.exit(1);
  }

  console.log(`\n[SEED]  >> START         :: target: ${repoUrl}\n`);

  try {
    // 1. Parse Owner/Repo from URL
    let owner = "";
    let repo = "";

    if (repoUrl.includes("github.com")) {
      const parts = repoUrl.split("github.com/")[1].split("/");
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }

    if (!owner || !repo) {
      // Fallback for just "owner/repo" string if passed
      const parts = repoUrl.split("/");
      if (parts.length === 2) {
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error(`Could not parse owner/repo from ${repoUrl}`);
      }
    }

    // 2. Ingest
    const project = await ingestProject(owner, repo, octokit);

    if (!project) {
      console.error("[ERR]   :: INGEST_FAIL   :: See logs above.");
      process.exit(1);
    }

    // 3. Save
    await saveProject(project);
  } catch (err) {
    console.error("[ERR]   :: FATAL         ::", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
