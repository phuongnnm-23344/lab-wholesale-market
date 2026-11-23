// ============================================================
// n8n Code Node: Step 3 - Route Event
// ============================================================
// Placed after: Step 2 (Validate Signature)
// Purpose:
//   - Classify GitHub event type
//   - Extract required context for each event type
//   - Early-exit (return []) if event does not need processing
//   - For projects_v2_item: filter by ALLOWED_PROJECT_IDS (available in payload)
//   - For pull_request / issues: filter by ALLOWED_REPOS (available in payload)
//     → avoids a GraphQL call in step-4 for repos not connected to any project
// Output: context object with fetchTargets list for step 4
// ============================================================

// Project node IDs allowed for processing (used for projects_v2_item events)
// Must match ALLOWED_PROJECT_IDS in step-5-apply-spec.js
const ALLOWED_PROJECT_IDS = [
  '',
];

// Repository node IDs whose issues/PRs are tracked in ALLOWED_PROJECT_IDS
// Used for early-exit on pull_request / issues events without a GraphQL call
// Uses node_id instead of repo name — stable across renames / org transfers
// Get node_id: gh api repos/<owner>/<repo> --jq '.node_id'
const ALLOWED_REPOS = [
  '',
];

const item = $input.first();
const { body, eventType } = item.json;

// Regex to find issue references in PR body
// Supports: closes #N, fixes #N, resolves #N (case-insensitive)
function extractLinkedIssueNumbers(prBody) {
  if (!prBody) return [];
  const pattern = /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)?#(\d+)/gi;
  const matches = new Set();
  let match;
  while ((match = pattern.exec(prBody)) !== null) {
    matches.add(parseInt(match[1], 10));
  }
  return [...matches];
}

let context = null;

// ──────────────────────────────────────────
// Event: pull_request
// ──────────────────────────────────────────
if (eventType === 'pull_request') {
  if (!ALLOWED_REPOS.includes(body.repository.node_id)) return [];

  const pr = body.pull_request;
  const action = body.action;

  // Only handle 3 cases: opened, merged, rejected
  let prAction = null;
  if (action === 'opened' || action === 'ready_for_review') {
    prAction = 'opened';
  } else if (action === 'closed' && pr.merged === true) {
    prAction = 'merged';
  } else if (action === 'closed' && pr.merged === false) {
    prAction = 'rejected';
  } else {
    // synchronize, labeled, review_requested, etc. — skip
    return [];
  }

  const linkedIssueNumbers = extractLinkedIssueNumbers(pr.body);
  if (linkedIssueNumbers.length === 0) {
    // PR has no linked issues — skip
    return [];
  }

  const repoOwner = body.repository.owner.login;
  const repoName = body.repository.name;
  const baseBranch = pr.base.ref;

  context = {
    eventType: 'pull_request',
    prAction,
    prNumber: pr.number,
    prTitle: pr.title,
    repoOwner,
    repoName,
    baseBranch,
    isMainBranch: baseBranch === 'main' || baseBranch === 'master',
    linkedIssueNumbers,
    // fetchTargets: need to resolve issue numbers → node IDs via GraphQL
    // Step 4 will query by issue number + repo
    fetchTargets: linkedIssueNumbers.map(num => ({
      type: 'issue_by_number',
      repoOwner,
      repoName,
      issueNumber: num,
    })),
  };
}

// ──────────────────────────────────────────
// Event: issues
// ──────────────────────────────────────────
else if (eventType === 'issues') {
  if (!ALLOWED_REPOS.includes(body.repository.node_id)) return [];

  const action = body.action;
  const issue = body.issue;

  const repoOwner = body.repository.owner.login;
  const repoName = body.repository.name;
  const labels = (issue.labels || []).map(l => l.name);

  if (action === 'opened') {
    // Only interested in QA bugs (type:qabug label)
    if (!labels.includes('type:qabug')) {
      return [];
    }

    context = {
      eventType: 'issues',
      action: 'opened',
      issueNumber: issue.number,
      issueNodeId: issue.node_id,
      issueLabels: labels,
      repoOwner,
      repoName,
      fetchTargets: [{
        type: 'issue_by_node_id',
        nodeId: issue.node_id,
        issueNumber: issue.number,
      }],
    };

  } else if (action === 'closed') {
    // state_reason: 'completed' → Closed, 'not_planned' → Cancelled
    const stateReason = issue.state_reason;
    if (stateReason !== 'completed' && stateReason !== 'not_planned') {
      return [];
    }

    context = {
      eventType: 'issues',
      action: 'closed',
      stateReason,
      issueNumber: issue.number,
      issueNodeId: issue.node_id,
      issueLabels: labels,
      repoOwner,
      repoName,
      fetchTargets: [{
        type: 'issue_by_node_id',
        nodeId: issue.node_id,
        issueNumber: issue.number,
      }],
    };

  } else {
    return [];
  }
}

// ──────────────────────────────────────────
// Event: projects_v2_item
// project_node_id is available in the payload → filter immediately, no GraphQL needed
// ──────────────────────────────────────────
else if (eventType === 'projects_v2_item') {
  const action = body.action;
  const pvItem = body.projects_v2_item;

  // Only handle edited (field value changed) where content_type is Issue
  if (action !== 'edited' || pvItem.content_type !== 'Issue') {
    return [];
  }

  // Check for field_value change
  const changes = body.changes || {};
  if (!changes.field_value) {
    return [];
  }

  // Early project filter: project_node_id is available in the payload
  const projectNodeId = pvItem.project_node_id;
  if (!ALLOWED_PROJECT_IDS.includes(projectNodeId)) {
    return [];
  }

  context = {
    eventType: 'projects_v2_item',
    action: 'edited',
    projectNodeId,
    itemNodeId: pvItem.node_id,
    contentNodeId: pvItem.content_node_id,
    changedFieldNodeId: changes.field_value.field_node_id,
    changedFieldType: changes.field_value.field_type,
    fetchTargets: [{
      type: 'issue_by_node_id',
      nodeId: pvItem.content_node_id,
    }],
  };
}

// ──────────────────────────────────────────
// Other events — skip
// ──────────────────────────────────────────
else {
  return [];
}

if (!context || context.fetchTargets.length === 0) {
  return [];
}

return [{ json: context }];
