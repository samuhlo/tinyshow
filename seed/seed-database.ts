import "dotenv/config";
import { Octokit } from "octokit";
import { extractProjectData } from "../server/utils/deepseek";
import { ingestProject } from "../server/utils/ingest";
import { type Project } from "../shared/types";
import { prisma } from "../server/utils/prisma";

const GITHUB_TOKEN = process.env.GITHUB_SEED_TOKEN;
// Get username from args or env, default to 'samuhlo' (user's ID in test) or error
const GITHUB_USERNAME = process.argv[2] || process.env.GITHUB_USERNAME;

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_SEED_TOKEN is missing in .env");
  process.exit(1);
}

// User check removed as we have a default now

// Safe cast because we validated earlier
const username = GITHUB_USERNAME as string;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function main() {
  console.log(`\n🌱 Seeding projects for user: @${username}...\n`);

  try {
    // 1. Fetch all public repositories (excluding forks by default for cleaner showcase)
    // Pagination is handled by octokit iterator or we valid up to 100 for now.
    const { data: repos } = await octokit.request(
      "GET /users/{username}/repos",
      {
        username: username,
        type: "owner", // Repos owned by the user
        sort: "updated",
        direction: "desc",
        per_page: 100, // Limit for V1
      }
    );

    // Filter: Not forks, has description (optional), public
    const sources = repos.filter((r) => !r.fork && !r.archived); // Maybe include archived? User had an archived one in test. Let's keep archived.
    // User test repo 'diet-planner-alpha' was archived and processed successfully.
    // Let's just filter forks for now.

    console.log(
      `> Found ${repos.length} repos. processing ${sources.length} sources (non-forks)...`
    );

    const projects: Project[] = [];

    // 2. Iterate and Process
    // Serial execution to be nice to DeepSeek/GitHub APIs
    for (const repo of sources) {
      const project = await ingestProject(username, repo.name, octokit);

      if (project) {
        projects.push(project);
      } else {
        // ingestProject logs its own skips/errors, but we can track count here if needed
      }
    }

    // 3. Save Data (Prisma)

    // Transform data for Prisma (if needed) or direct insert.
    // The Zod types match well, but JSON fields might strictly require InputJsonValue.
    // Prisma's createMany is efficient.

    console.log(`\n> 🧹 Clearing existing projects...`);
    await prisma.project.deleteMany({});

    console.log(`> 💾 Saving ${projects.length} projects to Neon DB...`);

    // We map explicitly to ensure type compatibility with Prisma's auto-generated types
    const projectsToInsert = projects.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline as any, // Cast to any to satisfy InputJsonValue (it's valid JSON)
      description: p.description as any,
      tech_stack: p.tech_stack,
      img_url: p.img_url,
      repo_url: p.repo_url,
      demo_url: p.demo_url,
      origin: p.origin as any,
    }));

    await prisma.project.createMany({
      data: projectsToInsert,
      skipDuplicates: true, // Just in case
    });

    console.log(`\n===================================================`);
    console.log(`🌱 Seed Complete: DB sync done.`);
    if (projects.length === 0) {
      console.log(`⚠️  No projects found/processed.`);
    }
  } catch (error) {
    console.error("Fatal Seed Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
