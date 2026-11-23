// ============================================================
// n8n Code Node: Step 6 - Execute GraphQL Mutation
// ============================================================
// n8n configuration: "Run Once for Each Item" mode
// Required: NODE_FUNCTION_ALLOW_BUILTIN: crypto,https
// ============================================================

const crypto = require('crypto');
const https  = require('https');

// ── GitHub App config (must match step-4) ──────────────────
const GITHUB_APP_ID          = '';
const GITHUB_INSTALLATION_ID = '';
const GITHUB_PRIVATE_KEY     = ``;

// ── Helpers (copied from step-4) ───────────────────────────

function parseHttpsUrl(url) {
  const s = url.replace('https://', '');
  const i = s.indexOf('/');
  return { hostname: s.substring(0, i), path: s.substring(i) };
}

function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = parseHttpsUrl(url);
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.path,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function b64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function createJWT(appId, privateKey) {
  const now     = Math.floor(Date.now() / 1000);
  const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId }));
  const input   = `${header}.${payload}`;
  const sign    = crypto.createSign('RSA-SHA256');
  sign.update(input);
  const sig = sign.sign(privateKey, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${input}.${sig}`;
}

async function getInstallationToken(jwt, installationId) {
  const data = await httpsPost(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      'Authorization': `Bearer ${jwt}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dsx-ai-workflow',
    },
    ''
  );
  if (!data.token) throw new Error(`No token in response: ${JSON.stringify(data)}`);
  return data.token;
}

// ── Mutation ───────────────────────────────────────────────

const UPDATE_FIELD_MUTATION = `
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId
    itemId: $itemId
    fieldId: $fieldId
    value: $value
  }) {
    projectV2Item { id }
  }
}`;

const raw = $input.first().json;

// No mutations from step-5 → skip
if (!raw || raw._skip || !raw._data) {
  return [];
}

const mutation = JSON.parse(raw._data);

console.log(`[step-6] Executing: ${mutation.description}`);

const jwt   = createJWT(GITHUB_APP_ID, GITHUB_PRIVATE_KEY);
const token = await getInstallationToken(jwt, GITHUB_INSTALLATION_ID);

const data = await httpsPost(
  'https://api.github.com/graphql',
  {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'dsx-ai-workflow',
  },
  {
    query: UPDATE_FIELD_MUTATION,
    variables: {
      projectId: mutation.projectId,
      itemId:    mutation.itemId,
      fieldId:   mutation.fieldId,
      value:     mutation.value,
    },
  }
);

if (data.errors?.length) {
  throw new Error(`GraphQL mutation error: ${JSON.stringify(data.errors)}`);
}

console.log(`[step-6] Done: ${mutation.description}`);

return [{
  json: {
    success: true,
    description: mutation.description,
    updatedItemId: data.data?.updateProjectV2ItemFieldValue?.projectV2Item?.id,
  }
}];
