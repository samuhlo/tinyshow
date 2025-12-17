import { extractProjectData } from "../../../server/utils/deepseek";
import { config } from "dotenv";

// Load environment variables locally
config();

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
    // e.g. https://github.com/user/repo -> https://raw.githubusercontent.com/user/repo/main/README.md
    // This is a naive implementation, might need 'master' or other branches.
    // Ideally, we use GitHub API, but for this test script, raw URL guessing is fine or we accept raw url.

    let rawUrl = repoUrl;
    if (repoUrl.includes("github.com")) {
      const parts = repoUrl.split("github.com/")[1]?.split("/");
      if (parts && parts.length >= 2) {
        const user = parts[0];
        const repo = parts[1];
        // Default to main, but could be master.
        rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
      }
    }

    console.log(`[HTTP]  >> FETCHING      :: url: ${rawUrl}`);
    const res = await fetch(rawUrl);

    if (!res.ok) {
      // Try master branch if main failed
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

main();
