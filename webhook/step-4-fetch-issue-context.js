// ============================================================
// n8n Code Node: Step 4 - GitHub App Auth + Fetch Issue Context
// ============================================================
// Required in docker-compose.yml:
//   NODE_FUNCTION_ALLOW_BUILTIN: crypto,https
// ============================================================

const crypto = require('crypto');
const https  = require('https');

// ── GitHub App configuration ────────────────────────────────
const GITHUB_APP_ID          = '';
const GITHUB_INSTALLATION_ID = '';
const GITHUB_PRIVATE_KEY     = ``;

// ── HTTP helper using the https module ─────────────────────

function parseHttpsUrl(url) {
  const s = url.replace("https://", "");
  const i = s.indexOf("/");
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
            if (res.statusCode >= 400) {
              return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
            try { resolve(JSON.parse(data)); }
            catch { resolve(data); }
          });
        }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── GitHub App JWT ─────────────────────────────────────────

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

async function graphql(token, query, variables) {
  const data = await httpsPost(
      'https://api.github.com/graphql',
      {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'dsx-ai-workflow',
      },
      { query, variables }
  );
  if (data.errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  return data.data;
}

// ── GraphQL Queries ────────────────────────────────────────

const QUERY_BY_NODE_ID = `
query($issueId: ID!) {
  node(id: $issueId) {
    ... on Issue {
      id number title state
      labels(first: 20) { nodes { name } }
      projectItems(first: 10) {
        nodes {
          id
          project { id title }
          status: fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
          }
          qualityGate: fieldValueByName(name: "Quality Gate") {
            ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
            ... on ProjectV2ItemFieldTextValue { text }
          }
        }
      }
      parent {
        id number title state
        labels(first: 10) { nodes { name } }
        projectItems(first: 10) {
          nodes {
            id
            project { id title }
            status: fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
            }
          }
        }
        subIssues(first: 50) {
          nodes {
            id number state
            labels(first: 10) { nodes { name } }
            projectItems(first: 5) {
              nodes {
                id
                project { id }
                status: fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue { name }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const QUERY_BY_NUMBER = `
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    issue(number: $number) {
      id number title state
      labels(first: 20) { nodes { name } }
      projectItems(first: 10) {
        nodes {
          id
          project { id title }
          status: fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
          }
          qualityGate: fieldValueByName(name: "Quality Gate") {
            ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
            ... on ProjectV2ItemFieldTextValue { text }
          }
        }
      }
      parent {
        id number title state
        labels(first: 10) { nodes { name } }
        projectItems(first: 10) {
          nodes {
            id
            project { id title }
            status: fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name optionId }
            }
          }
        }
        subIssues(first: 50) {
          nodes {
            id number state
            labels(first: 10) { nodes { name } }
            projectItems(first: 5) {
              nodes {
                id
                project { id }
                status: fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue { name }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

// Query to fetch field IDs and option IDs for a project
const QUERY_PROJECT_FIELDS = `
query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      fields(first: 30) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
        }
      }
    }
  }
}`;

// Fetch and parse a project's field config into an easy-to-use map:
// { 'Status': { fieldId, options: { 'In Progress': 'opt_id', ... } }, ... }
async function fetchProjectFieldConfig(token, projectId) {
  const data = await graphql(token, QUERY_PROJECT_FIELDS, { projectId });
  const fields = data?.node?.fields?.nodes || [];
  const config = {};
  for (const field of fields) {
    if (field.id && field.options) {
      config[field.name] = {
        fieldId: field.id,
        options: field.options.reduce((acc, o) => { acc[o.name] = o.id; return acc; }, {}),
      };
    }
  }
  return config;
}

// ── Main ──────────────────────────────────────────────────

const context = $input.first().json;

const jwt   = createJWT(GITHUB_APP_ID, GITHUB_PRIVATE_KEY);
const token = await getInstallationToken(jwt, GITHUB_INSTALLATION_ID);

const results = [];
// Cache field configs to avoid duplicate queries for the same project
const fieldConfigCache = {};

for (const target of context.fetchTargets) {
  let issue = null;

  if (target.type === 'issue_by_node_id') {
    const data = await graphql(token, QUERY_BY_NODE_ID, { issueId: target.nodeId });
    issue = data?.node;
  } else if (target.type === 'issue_by_number') {
    const data = await graphql(token, QUERY_BY_NUMBER, {
      owner:  target.repoOwner,
      repo:   target.repoName,
      number: target.issueNumber,
    });
    issue = data?.repository?.issue;
  }

  if (!issue) {
    console.log(`[step-4] Not found: ${JSON.stringify(target)}`);
    continue;
  }

  // Fetch field config for all projects this issue belongs to
  const projectFieldConfig = {};
  const projectIds = (issue.projectItems?.nodes || []).map(pi => pi.project?.id).filter(Boolean);

  // For projects_v2_item events: projectNodeId is already known — include it if not present
  if (context.projectNodeId && !projectIds.includes(context.projectNodeId)) {
    projectIds.push(context.projectNodeId);
  }

  for (const projectId of projectIds) {
    if (!fieldConfigCache[projectId]) {
      fieldConfigCache[projectId] = await fetchProjectFieldConfig(token, projectId);
    }
    projectFieldConfig[projectId] = fieldConfigCache[projectId];
  }

  results.push({ json: { originalContext: context, issue, projectFieldConfig } });
}

return results;
