import "dotenv/config";
import crypto from "crypto";

const SECRET = process.env.NUXT_GITHUB_WEBHOOK_SECRET || "tu_secreto_brutal";
const URL = "http://localhost:3000/api/webhooks/github";

// Payload simulating a push event that modifies README.md
const payload = {
  ref: "refs/heads/main",
  repository: {
    name: "tiny-showcase",
    full_name: "samuhlo/tiny-showcase",
    owner: {
      name: "samuhlo",
    },
    html_url: "https://github.com/samuhlo/tiny-showcase",
  },
  commits: [
    {
      id: "1234567890abcdef",
      added: [],
      modified: ["README.md"],
      removed: [],
    },
  ],
};

const body = JSON.stringify(payload);

// Calculate Signature
const hmac = crypto.createHmac("sha256", SECRET);
const signature = "sha256=" + hmac.update(body).digest("hex");

async function testWebhook() {
  console.log(`🚀 Sending Webhook to ${URL}...`);
  console.log(`🔑 Signature: ${signature}`);

  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": signature,
        "x-github-event": "push",
      },
      body: body,
    });

    const data = await res.json(); // Nitro handlers usually return JSON
    console.log(`\nResponse Status: ${res.status}`);
    console.log("Response Body:", data);

    if (res.ok) {
      console.log("✅ Webhook processed successfully!");
    } else {
      console.error("❌ Webhook failed.");
    }
  } catch (err) {
    console.error("❌ Connection failed (Is the server running?)");
    console.error(err);
  }
}

testWebhook();
