#!/bin/bash

# ============================================================
# SETUP LABELS
# ============================================================
# Creates all required labels in a GitHub repository.
# Labels are sourced from:
#   - Issue templates (.github/ISSUE_TEMPLATE/) — type labels
#   - issue-triage-labels workflow              — team, severity, test-type labels
#   - pr-auto-label workflow                    — PR labels
#
# Usage:
#   ./scripts/setup-labels.sh --repo <org/repo>
#
# Requirements:
#   - GitHub CLI (gh): https://cli.github.com/
#   - Authenticated: gh auth login
#   - Token scope: repo
# ============================================================

set -e

# ── Arguments ─────────────────────────────────────────────

REPO=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "Usage: $0 --repo <org/repo>"
  exit 1
fi

# ── Preflight checks ───────────────────────────────────────

if ! command -v gh &>/dev/null; then
  echo "GitHub CLI (gh) is not installed."
  echo "Install from: https://cli.github.com/"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Not authenticated. Run: gh auth login"
  exit 1
fi

echo ""
echo "Setting up labels for: $REPO"
echo ""

# ── Helper ────────────────────────────────────────────────

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if gh label list -R "$REPO" --limit 500 2>/dev/null | grep -q "^${name}	"; then
    echo "  skip  $name (already exists)"
  else
    if gh label create "$name" -c "$color" -d "$description" -R "$REPO" 2>/dev/null; then
      echo "  ok    $name"
    else
      echo "  fail  $name"
    fi
  fi
}

# ============================================================
# TYPE LABELS
# Set automatically by issue templates on issue creation.
# ============================================================
echo "Type labels..."
create_label "type:epic"          "7C3AED" "Tracker: Epic"
create_label "type:story"         "2563EB" "Tracker: Story"
create_label "type:changerequest" "0891B2" "Tracker: Change Request"
create_label "type:uidesign"      "EC4899" "Tracker: UI Design"
create_label "type:devtask"       "059669" "Tracker: Dev Task"
create_label "type:testdesign"    "0D9488" "Tracker: Test Design"
create_label "type:testexecution" "0D9488" "Tracker: Test Execution"
create_label "type:qabug"         "DC2626" "Tracker: QA Bug"
create_label "type:uatbug"        "EA580C" "Tracker: UAT Bug"
create_label "type:productionbug" "9F1239" "Tracker: Production Bug"
create_label "type:documentation" "1D4ED8" "Tracker: Documentation"
create_label "type:investigation" "6B7280" "Tracker: Investigation"
create_label "type:operation"     "78350F" "Tracker: Operation"
create_label "type:feedback"      "6366F1" "Tracker: Feedback"
echo ""

# ============================================================
# CATEGORY LABELS
# Applied by issue-triage-labels workflow when a Dev Task
# is created and a Task Category is selected.
# ============================================================
echo "Category labels..."
create_label "category:task"    "84CC16" "Category: Task"
create_label "category:feature" "F59E0B" "Category: Feature"
echo ""

# ============================================================
# TEAM LABELS
# Applied by issue-triage-labels workflow when a Dev Task
# is created and a Task Type is selected.
# ============================================================
echo "Team labels..."
create_label "team:frontend"       "60A5FA" "Team: Frontend"
create_label "team:backend"        "34D399" "Team: Backend"
create_label "team:native-ios"     "A78BFA" "Team: NativeApp iOS"
create_label "team:native-android" "4ADE80" "Team: NativeApp Android"
create_label "team:native-multiPF" "C084FC" "Team: NativeApp MultiPlatform"
create_label "team:ai"             "F472B6" "Team: AI"
create_label "team:infrastructure" "FB923C" "Team: Infrastructure"
echo ""

# ============================================================
# SEVERITY LABELS
# Applied by issue-triage-labels workflow when a QA Bug,
# UAT Bug, or Production Bug is created.
# ============================================================
echo "Severity labels..."
create_label "severity:low"      "6B7280" "Severity: Low"
create_label "severity:medium"   "F59E0B" "Severity: Medium"
create_label "severity:high"     "EF4444" "Severity: High"
create_label "severity:critical" "7F1D1D" "Severity: Critical"
echo ""

# ============================================================
# TEST TYPE LABELS
# Applied by issue-triage-labels workflow when a QA Bug
# or UAT Bug is created and a Test Type is selected.
# ============================================================
echo "Test type labels..."
create_label "testtype:functionaltest"             "06B6D4" "Test Type: Functional Test"
create_label "testtype:layouttest"                 "0EA5E9" "Test Type: Layout Test"
create_label "testtype:performancetest"            "8B5CF6" "Test Type: Performance Test"
create_label "testtype:stresstest"                 "F97316" "Test Type: Stress Test"
create_label "testtype:accesscontrol&securitytest" "DC2626" "Test Type: Access Control & Security Test"
echo ""

echo "Labels setup complete for $REPO"
echo ""
