/**
 * [SCRIPT] :: SIMULATE_WEBHOOK
 * ----------------------------------------------------------------------
 * Utilidad para testear el endpoint de webhooks localmente.
 * Genera una firma HMAC válida y envía un payload simulado de GitHub.
 *
 * @module    shared/scripts
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import "dotenv/config";
import crypto from "crypto";

// =====================================================================
// [SECTION] :: CONFIGURATION
// =====================================================================

const SECRET = process.env.NUXT_GITHUB_WEBHOOK_SECRET || "tu_secreto_brutal";
const TARGET_URL = "http://localhost:3000/api/webhooks/github";
const REF_MAIN = "refs/heads/main";
const HASH_ALGO = "sha256";
const EVENT_TYPE = "push";
const DEFAULT_REPO = "tiny-showcase";
const DEFAULT_OWNER = "samuhlo";

/**
 * [DATA] :: MOCK_PAYLOAD
 * Simulación de un evento 'push' que modifica el archivo README.md.
 */
const MOCK_PAYLOAD = {
  ref: REF_MAIN,
  repository: {
    name: DEFAULT_REPO,
    full_name: `${DEFAULT_OWNER}/${DEFAULT_REPO}`,
    owner: {
      name: DEFAULT_OWNER,
    },
    html_url: `https://github.com/${DEFAULT_OWNER}/${DEFAULT_REPO}`,
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

// =====================================================================
// [SECTION] :: TEST EXECUTION
// =====================================================================

/**
 * [TEST] :: EXECUTE_WEBHOOK_TEST
 * Orquesta la petición POST firmada hacia el servidor local.
 */
async function testWebhook() {
  const body = JSON.stringify(MOCK_PAYLOAD);
  const hmac = crypto.createHmac(HASH_ALGO, SECRET);
  const signature = `${HASH_ALGO}=` + hmac.update(body).digest("hex");

  console.log(`[TEST]  -> OUTBOUND      :: target: ${TARGET_URL}`);
  console.log(`[TEST]  :: SIGNATURE     :: ${signature}`);

  try {
    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": signature,
        "x-github-event": EVENT_TYPE,
      },
      body: body,
    });

    const data = await res.json();
    console.log(`\n[TEST]  :: RESPONSE      :: status: ${res.status}`);
    console.log("[TEST]  :: BODY          ::", data);

    if (res.ok) {
      console.log("[TEST]  ++ SUCCESS       :: Webhook processed.");
    } else {
      console.error("[TEST]  :: FAILURE       :: Webhook returned error.");
    }
  } catch (err) {
    console.error("[ERR]   :: CONN_REFUSED  :: Is the server running?");
    console.error(err);
  }
}

testWebhook();
