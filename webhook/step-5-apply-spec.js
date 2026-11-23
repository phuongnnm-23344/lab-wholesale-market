// ============================================================
// n8n Code Node: Step 5 - Filter Project + Apply Spec Rules
// ============================================================
// Placed after: Step 4 (Fetch Issue Context)
// Purpose:
//   1. Determine the active project based on event type:
//      - projects_v2_item → use projectNodeId from originalContext (already filtered in step-3)
//      - pull_request / issues → filter by ALLOWED_PROJECT_IDS
//   2. Apply spec from docs/status-transition-spec/github_action_spec.md
//   3. Output: list of mutations to execute
//
// Field IDs and Option IDs are fetched dynamically from projectFieldConfig (queried by step-4).
// No manual configuration needed.
// ============================================================

// Used for pull_request / issues events (payload does not include project info)
const ALLOWED_PROJECT_IDS = [
  '',
];

// ── Helper functions ───────────────────────────────────────

function getTrackerType(issue) {
  const names = (issue.labels?.nodes || []).map(l => l.name);
  if (names.includes('type:epic'))            return 'epic';
  if (names.includes('type:story'))           return 'story';
  if (names.includes('type:changerequest'))   return 'change-request';
  if (names.includes('type:devtask'))         return 'dev-task';
  if (names.includes('type:qabug'))           return 'qa-bug';
  if (names.includes('type:uatbug'))          return 'uat-bug';
  if (names.includes('type:productionbug'))   return 'production-bug';
  return null;
}

function getProjectItem(issue, projectIds) {
  for (const item of (issue.projectItems?.nodes || [])) {
    if (projectIds.includes(item.project?.id)) return item;
  }
  return null;
}

function getCurrentStatus(issue, projectIds) {
  return getProjectItem(issue, projectIds)?.status?.name || null;
}

// Get field config (fieldId + options map) for one project from projectFieldConfig
function getFieldConfig(projectFieldConfig, projectId, fieldName) {
  return projectFieldConfig?.[projectId]?.[fieldName] || null;
}

function buildMutation(projectId, itemId, fieldId, value, description) {
  console.log(`[step-5] buildMutation args: projectId=${projectId}, itemId=${itemId}, fieldId=${fieldId}, value=${JSON.stringify(value)}`);
  return { projectId, itemId, fieldId, value, description };
}

function buildStatusMutations(projectId, itemId, projectFieldConfig, { status, qualityGate }) {
  const mutations = [];

  if (status) {
    const statusConf = getFieldConfig(projectFieldConfig, projectId, 'Status');
    if (!statusConf) {
      console.log(`[step-5] No Status field config for project ${projectId}`);
    } else {
      const optionId = statusConf.options[status];
      if (!optionId) {
        console.log(`[step-5] Unknown status option: "${status}"`);
      } else {
        mutations.push(buildMutation(projectId, itemId, statusConf.fieldId,
          { singleSelectOptionId: optionId },
          `Set Status = "${status}"`
        ));
      }
    }
  }

  if (qualityGate) {
    const qgConf = getFieldConfig(projectFieldConfig, projectId, 'Quality Gate');
    if (!qgConf) {
      console.log(`[step-5] No Quality Gate field config for project ${projectId}`);
    } else if (qgConf.options && Object.keys(qgConf.options).length > 0) {
      // single_select — use startsWith to match even when option name has minor variations
      const matchedKey = Object.keys(qgConf.options).find(k => k.startsWith(qualityGate));
      const optionId = matchedKey ? qgConf.options[matchedKey] : null;
      if (!optionId) {
        console.log(`[step-5] Unknown quality gate option: "${qualityGate}"`);
      } else {
        mutations.push(buildMutation(projectId, itemId, qgConf.fieldId,
          { singleSelectOptionId: optionId },
          `Set Quality Gate = "${qualityGate}"`
        ));
      }
    } else {
      // text field
      mutations.push(buildMutation(projectId, itemId, qgConf.fieldId,
        { text: qualityGate },
        `Set Quality Gate = "${qualityGate}"`
      ));
    }
  }

  return mutations;
}

function createMutationsForIssue(issue, targetAction, activeProjectIds, projectFieldConfig) {
  const item = getProjectItem(issue, activeProjectIds);
  if (!item) return [];
  console.log(`[step-5] createMutations: projectId=${item.project?.id}, itemId=${item.id}, action=${JSON.stringify(targetAction)}`);
  console.log(`[step-5] projectFieldConfig keys: ${JSON.stringify(Object.keys(projectFieldConfig || {}))}`);
  const projectId = item.project?.id;
  const projectConf = projectFieldConfig?.[projectId];
  console.log(`[step-5] projectConf for ${projectId}: ${JSON.stringify(projectConf ? Object.keys(projectConf) : null)}`);
  return buildStatusMutations(projectId, item.id, projectFieldConfig, targetAction);
}

function allSiblingsInStatus(siblings, allowedStatuses, projectIds) {
  if (!siblings || siblings.length === 0) return false;
  return siblings.every(s => {
    const status = getCurrentStatus(s, projectIds);
    return status && allowedStatuses.includes(status);
  });
}

// ── PR rules ───────────────────────────────────────────────

function applyPRRules(issue, context, activeProjectIds, projectFieldConfig) {
  const trackerType  = getTrackerType(issue);
  const currentStatus = getCurrentStatus(issue, activeProjectIds);
  const { prAction, isMainBranch } = context;

  if (!trackerType || !currentStatus) return [];

  const PR_TYPES = ['dev-task', 'qa-bug', 'uat-bug', 'production-bug'];

  if (prAction === 'opened') {
    if (PR_TYPES.includes(trackerType) && currentStatus === 'In Progress') {
      return createMutationsForIssue(issue, { status: 'In Review' }, activeProjectIds, projectFieldConfig);
    }
  }

  if (prAction === 'merged') {
    // Do not check "from state" — a merged PR means GitHub has already closed the issue;
    // we need to ensure the Project Status field reflects the correct final state.
    // Skip only if status is already correct (avoid unnecessary mutations).
    if (!isMainBranch) {
      if (trackerType === 'dev-task' && currentStatus !== 'Closed') {
        return createMutationsForIssue(issue, { status: 'Closed', qualityGate: 'Technical Review Passed' }, activeProjectIds, projectFieldConfig);
      }
      if (['qa-bug', 'uat-bug', 'production-bug'].includes(trackerType) && currentStatus !== 'QA Testing') {
        return createMutationsForIssue(issue, { status: 'QA Testing', qualityGate: 'Technical Review Passed' }, activeProjectIds, projectFieldConfig);
      }
    } else {
      // Merge into main: all related ticket types move to Closed
      const MAIN_BRANCH_TYPES = ['dev-task', 'qa-bug', 'uat-bug', 'production-bug', 'story', 'change-request'];
      if (MAIN_BRANCH_TYPES.includes(trackerType) && currentStatus !== 'Closed') {
        return createMutationsForIssue(issue, { status: 'Closed' }, activeProjectIds, projectFieldConfig);
      }
    }
  }

  if (prAction === 'rejected') {
    // PR rejected: only update if currently In Review (closed PR without merge = rejected)
    // Do not force if status is Closed/Cancelled (PR may be closed after work is done)
    const TERMINAL = ['Closed', 'Cancelled'];
    if (PR_TYPES.includes(trackerType) && !TERMINAL.includes(currentStatus)) {
      return createMutationsForIssue(issue, { status: 'In Progress', qualityGate: 'Technical Review Failed' }, activeProjectIds, projectFieldConfig);
    }
  }

  return [];
}

// ── Issues closed rules ───────────────────────────────────
// Guard: do not override statuses already set by PR rules
// - completed → Closed  (only when status is New / Issued Task / In Progress / In Review)
// - not_planned → Cancelled (only when status is not already Closed / Cancelled)

const ISSUE_CLOSED_PROTECTED = ['QA Testing', 'UAT In Progress', 'Ready for Delivery', 'Closed', 'Cancelled'];
const ISSUE_CANCELLED_SKIP   = ['Closed', 'Cancelled'];

function applyIssueClosedRules(issue, stateReason, activeProjectIds, projectFieldConfig) {
  const currentStatus = getCurrentStatus(issue, activeProjectIds);
  if (!currentStatus) return [];

  if (stateReason === 'completed') {
    if (ISSUE_CLOSED_PROTECTED.includes(currentStatus)) {
      console.log(`[step-5] issues closed(completed): skip — status "${currentStatus}" is protected`);
      return [];
    }
    return createMutationsForIssue(issue, { status: 'Closed' }, activeProjectIds, projectFieldConfig);
  }

  if (stateReason === 'not_planned') {
    if (ISSUE_CANCELLED_SKIP.includes(currentStatus)) {
      console.log(`[step-5] issues closed(not_planned): skip — already terminal "${currentStatus}"`);
      return [];
    }
    return createMutationsForIssue(issue, { status: 'Cancelled' }, activeProjectIds, projectFieldConfig);
  }

  return [];
}

// ── Issues opened (QA bug created) rules ─────────────────

function applyIssueOpenedRules(issue, activeProjectIds, projectFieldConfig) {
  if (getTrackerType(issue) !== 'qa-bug') return [];
  const parent = issue.parent;
  if (!parent || !['story', 'change-request'].includes(getTrackerType(parent))) return [];
  if (getCurrentStatus(parent, activeProjectIds) !== 'QA Testing') return [];
  return createMutationsForIssue(parent, { status: 'In Progress', qualityGate: 'QA Testing Failed' }, activeProjectIds, projectFieldConfig);
}

// ── Cascade rules (projects_v2_item edited) ───────────────

function applyCascadeRules(issue, activeProjectIds, projectFieldConfig) {
  const mutations = [];
  const currentStatus = getCurrentStatus(issue, activeProjectIds);
  const parent = issue.parent;
  if (!currentStatus || !parent) return [];

  const parentType   = getTrackerType(parent);
  const parentItem   = getProjectItem(parent, activeProjectIds);
  const parentStatus = getCurrentStatus(parent, activeProjectIds);
  if (!parentItem || !parentStatus) return [];

  const parentProjectId = parentItem.project.id;

  if (currentStatus === 'In Progress') {
    if (['story', 'change-request'].includes(parentType) && ['New', 'Issued Task'].includes(parentStatus)) {
      mutations.push(...buildStatusMutations(parentProjectId, parentItem.id, projectFieldConfig, { status: 'In Progress' }));
    } else if (parentType === 'epic' && parentStatus === 'New') {
      mutations.push(...buildStatusMutations(parentProjectId, parentItem.id, projectFieldConfig, { status: 'In Progress' }));
    }
  }

  if (['Closed', 'Cancelled'].includes(currentStatus)) {
    const siblings = parent.subIssues?.nodes || [];

    if (['story', 'change-request'].includes(parentType)) {
      const devTasks = siblings.filter(s => (s.labels?.nodes || []).some(l => l.name === 'type:devtask'));
      if (allSiblingsInStatus(devTasks, ['Closed', 'Cancelled'], activeProjectIds) && parentStatus === 'In Progress') {
        mutations.push(...buildStatusMutations(parentProjectId, parentItem.id, projectFieldConfig, { status: 'QA Testing' }));
      }
      if (allSiblingsInStatus(siblings, ['Closed', 'Cancelled'], activeProjectIds) && parentStatus === 'QA Testing') {
        mutations.push(...buildStatusMutations(parentProjectId, parentItem.id, projectFieldConfig, { status: 'UAT In Progress', qualityGate: 'QA Testing Passed' }));
      }
    } else if (parentType === 'epic') {
      const stories = siblings.filter(s => (s.labels?.nodes || []).some(l => l.name === 'type:story'));
      if (allSiblingsInStatus(stories, ['Closed'], activeProjectIds) && parentStatus === 'In Progress') {
        mutations.push(...buildStatusMutations(parentProjectId, parentItem.id, projectFieldConfig, { status: 'Closed' }));
      }
    }
  }

  return mutations;
}

// ── Main ──────────────────────────────────────────────────

const allMutations = [];
const diagList = [];

for (const item of $input.all()) {
  const { originalContext, issue, projectFieldConfig } = item.json;

  const activeProjectIds = originalContext.projectNodeId
    ? [originalContext.projectNodeId]
    : ALLOWED_PROJECT_IDS;

  const diag = {
    issueNumber: issue?.number,
    eventType: originalContext?.eventType,
    prAction: originalContext?.prAction,
    isMainBranch: originalContext?.isMainBranch,
    trackerType: getTrackerType(issue),
    currentStatus: getCurrentStatus(issue, activeProjectIds),
    activeProjectIds,
    projectFieldConfigKeys: Object.keys(projectFieldConfig || {}),
    inProject: !!getProjectItem(issue, activeProjectIds),
  };
  diagList.push(diag);

  const projectItem = getProjectItem(issue, activeProjectIds);
  if (!projectItem) continue;

  let mutations = [];

  if (originalContext.eventType === 'pull_request') {
    mutations = applyPRRules(issue, originalContext, activeProjectIds, projectFieldConfig);
  } else if (originalContext.eventType === 'issues') {
    if (originalContext.action === 'opened') {
      mutations = applyIssueOpenedRules(issue, activeProjectIds, projectFieldConfig);
    } else if (originalContext.action === 'closed') {
      mutations = applyIssueClosedRules(issue, originalContext.stateReason, activeProjectIds, projectFieldConfig);
    }
  } else if (originalContext.eventType === 'projects_v2_item') {
    mutations = applyCascadeRules(issue, activeProjectIds, projectFieldConfig);
  }

  allMutations.push(...mutations);
}

// Always return at least one item so diagnostics are visible in the n8n UI
if (allMutations.length === 0) {
  return [{ json: { _skip: true, diagnostics: diagList } }];
}

return allMutations.map(mutation => ({ json: { _data: JSON.stringify(mutation) } }));
