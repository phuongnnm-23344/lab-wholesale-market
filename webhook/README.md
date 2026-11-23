# Webhook — GitHub Project Status Automation

An n8n workflow that listens to GitHub App webhook events and automatically updates GitHub Projects v2 custom field values (Status, Quality Gate) according to the spec defined in [`docs/status-transition-spec/`](../docs/status-transition-spec/).

## Overview

```
GitHub App webhook
        │
        ▼
[Step 1] n8n Webhook node  ← receives raw HTTP request
        │
        ▼
[Step 2] Validate Signature  ← HMAC-SHA256, rejects forged requests
        │
        ▼
[Step 3] Route Event  ← classify event, early-exit for irrelevant events
        │
        ▼
[Step 4] Fetch Issue Context  ← GitHub App auth + GraphQL query
        │
        ▼
[Step 5] Apply Spec Rules  ← determine which field mutations are needed
        │
        ▼
[Step 6] Execute Mutation  ← call GitHub GraphQL API to update project fields
```

## Supported Events

| GitHub Event | Actions handled | What triggers it |
|---|---|---|
| `pull_request` | `opened`, `ready_for_review`, `closed` | PR linked to a tracked issue is opened, merged, or rejected |
| `issues` | `opened` (qabug only), `closed` | QA bug is created, or any issue is closed |
| `projects_v2_item` | `edited` (field_value changed) | A project item's field is manually changed — triggers cascade rules |

## Step-by-step Description

### Step 2 — Validate Signature (`step-2-validate-signature.js`)

Verifies the `x-hub-signature-256` header using a pure JavaScript HMAC-SHA256 implementation (no `crypto` module needed in this step). Throws an error if the signature is invalid, stopping the workflow.

**Config:** `WEBHOOK_SECRET` — must match the secret set in the GitHub App webhook settings.

> **Tip:** Enable **Raw Body** in the n8n Webhook node options so the exact bytes are available for signature verification.

### Step 3 — Route Event (`step-3-route-event.js`)

Classifies the incoming event and performs early-exit filtering to avoid unnecessary downstream API calls.

- **`projects_v2_item`**: filtered by `ALLOWED_PROJECT_IDS` — the project node ID is present in the payload, so no GraphQL call is needed.
- **`pull_request` / `issues`**: filtered by `ALLOWED_REPOS` — the repository node ID is present in the payload. Using `node_id` (not `owner/repo` name) ensures filters remain valid after repo renames or org transfers.

**Config:**

```js
// Project node IDs to process
const ALLOWED_PROJECT_IDS = [
  'PVT_kwDOD_KlZ84BRoQA',
];

// Repository node IDs whose issues/PRs are tracked in the above projects
// Get node_id: gh api repos/<owner>/<repo> --jq '.node_id'
const ALLOWED_REPOS = [
  'R_kgDORl89jw', // hoaibn-org/example-repo
];
```

Output: a `context` object containing `eventType`, event-specific fields, and a `fetchTargets` list for step 4.

### Step 4 — Fetch Issue Context (`step-4-fetch-issue-context.js`)

Authenticates as the GitHub App and fetches full issue context via GraphQL, including:

- Issue labels, state, project items with current Status/Quality Gate field values
- Parent issue (for cascade rules) with its sub-issues list
- Project field configuration (field IDs + option IDs) for all projects the issue belongs to — cached per execution to avoid duplicate queries

**n8n node mode:** Run Once for All Items

**Required docker-compose env:**
```yaml
NODE_FUNCTION_ALLOW_BUILTIN: crypto,https
```

**Config:** `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_PRIVATE_KEY`

### Step 5 — Apply Spec Rules (`step-5-apply-spec.js`)

Evaluates spec rules against the fetched issue context and produces a list of field mutations.

| Event | Rule function | Spec |
|---|---|---|
| `pull_request` | `applyPRRules` | PR opened → In Review; merged → Closed or QA Testing + Quality Gate; rejected → In Progress + Quality Gate Failed |
| `issues` opened | `applyIssueOpenedRules` | QA bug created → parent story/change-request moves back to In Progress + QA Testing Failed |
| `issues` closed | `applyIssueClosedRules` | `completed` → Closed (guarded); `not_planned` → Cancelled (guarded) |
| `projects_v2_item` | `applyCascadeRules` | Child moves to In Progress → parent advances; all children Closed/Cancelled → parent advances to next stage |

**Guard rules for `issues.closed`:**
- `completed → Closed` is blocked when current status is `QA Testing`, `UAT In Progress`, `Ready for Delivery`, `Closed`, or `Cancelled` (those states are owned by PR/cascade rules).
- `not_planned → Cancelled` is skipped when already `Closed` or `Cancelled`.

Output: each mutation is serialized as `{ _data: JSON.stringify(mutation) }` to safely pass through n8n's task runner serialization. Returns `{ _skip: true, diagnostics }` when no mutations are needed.

**Config:** `ALLOWED_PROJECT_IDS` — same list as step 3, used when the event payload does not include project info.

### Step 6 — Execute Mutation (`step-6-execute-mutation.js`)

Authenticates as the GitHub App and executes a single `updateProjectV2ItemFieldValue` GraphQL mutation per item.

**n8n node mode:** Run Once for Each Item

Skips silently when `_skip: true` or `_data` is absent (no-op from step 5).

**Config:** Same GitHub App credentials as step 4.

## Configuration Checklist

### GitHub App settings

- [ ] **Webhook URL** points to the n8n webhook endpoint
- [ ] **Webhook secret** matches `WEBHOOK_SECRET` in step 2
- [ ] **Permissions (Repository):** Issues → Read-only, Pull requests → Read-only
- [ ] **Permissions (Organization):** Projects → Read & write
- [ ] **Subscribe to events:** Issues, Pull requests, Projects v2 item

### n8n Code node settings

- [ ] Step 4 and Step 6: `NODE_FUNCTION_ALLOW_BUILTIN: crypto,https` in docker-compose
- [ ] Step 6: node mode set to **Run Once for Each Item**
- [ ] Step 1 Webhook node: **Raw Body** enabled in Options

### Per-project / per-repo config

Update `ALLOWED_PROJECT_IDS` and `ALLOWED_REPOS` in **both step 3 and step 5** when adding a new project or repository.

To look up a repository's stable node ID:
```bash
gh api repos/<owner>/<repo> --jq '.node_id'
```

## Label Naming Convention

Tracker type detection in step 5 relies on exact label names:

| Tracker type | GitHub label |
|---|---|
| Epic | `type:epic` |
| Story | `type:story` |
| Change Request | `type:changerequest` |
| Dev Task | `type:task` |
| QA Bug | `type:qabug` |
| UAT Bug | `type:uatbug` |
| Production Bug | `type:productionbug` |

## Files

| File | Description |
|---|---|
| `step-2-validate-signature.js` | HMAC-SHA256 signature verification |
| `step-3-route-event.js` | Event classification and early-exit filtering |
| `step-4-fetch-issue-context.js` | GitHub App auth + GraphQL data fetching |
| `step-5-apply-spec.js` | Spec rule evaluation → mutation list |
| `step-6-execute-mutation.js` | GraphQL mutation execution |
| `input.json` | Sample raw webhook payload for local testing |
| `step-4-output.json` | Sample step-4 output for local testing of step-5 |
