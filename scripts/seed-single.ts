import "dotenv/config";
import { extractProjectData } from "../server/utils/deepseek";
import { prisma } from "../server/utils/prisma";

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error("Usage: npx tsx scripts/seed-single.ts <github-repo-url>");
    process.exit(1);
  }

  console.log(`\n🌱 Seeding SINGLE project: ${repoUrl} ...\n`);

  try {
    // 1. Fetch Raw Content (Same logic as test-ai.ts)
    let rawUrl = repoUrl;
    if (repoUrl.includes("github.com")) {
      const parts = repoUrl.split("github.com/")[1].split("/");
      if (parts.length >= 2) {
        const user = parts[0];
        const repo = parts[1];
        rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
      }
    }

    console.log(`> Fetching README from: ${rawUrl}`);
    const res = await fetch(rawUrl);

    if (!res.ok) {
      // Simple fallback to master if main fails
      if (rawUrl.includes("/main/")) {
        console.log("> 'main' branch not found, trying 'master'...");
        rawUrl = rawUrl.replace("/main/", "/master/");
        const res2 = await fetch(rawUrl);
        if (!res2.ok)
          throw new Error(`Failed to fetch README: ${res2.statusText}`);
        const text = await res2.text();
        await processAndSave(text, repoUrl);
        return;
      }
      throw new Error(`Failed to fetch README: ${res.statusText}`);
    }

    const text = await res.text();
    await processAndSave(text, repoUrl);
  } catch (err) {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function processAndSave(content: string, repoUrl: string) {
  console.log(`> README Size: ${content.length} chars. Analyzing with AI...`);

  // 2. Extract Data
  const projectData = await extractProjectData(content, repoUrl);

  if (!projectData.demo_url || !projectData.img_url) {
    console.warn(
      `⚠️  Warning: Missing assets (demo/img). Saving anyway for testing, but main seed would skip.`
    );
  }

  const courseInfo = projectData.origin?.is_course
    ? ` 🎓 [Course: ${projectData.origin.name || "Unknown"}]`
    : "";
  console.log(`  ✅ Extracted: "${projectData.title}"${courseInfo}`);

  // 3. Save to Prisma
  console.log(`> 💾 Saving to Neon DB...`);

  const saved = await prisma.project.upsert({
    where: { id: projectData.id },
    update: {
      title: projectData.title,
      tagline: projectData.tagline as any,
      description: projectData.description as any,
      tech_stack: projectData.tech_stack,
      img_url: projectData.img_url,
      repo_url: projectData.repo_url,
      demo_url: projectData.demo_url,
      origin: projectData.origin as any,
    },
    create: {
      id: projectData.id,
      title: projectData.title,
      tagline: projectData.tagline as any,
      description: projectData.description as any,
      tech_stack: projectData.tech_stack,
      img_url: projectData.img_url,
      repo_url: projectData.repo_url,
      demo_url: projectData.demo_url,
      origin: projectData.origin as any,
    },
  });

  console.log(`\n===================================================`);
  console.log(`✅ Success! Project saved with ID: ${saved.id}`);
  console.log(`===================================================`);
}

main();
