#!/bin/bash

# ============================================================
# REMOVE LABELS
# ============================================================
# Deletes ALL existing labels from a GitHub repository.
# Use this to clean up before re-running setup-labels.sh,
# ensuring all labels are recreated with the correct
# names, colors, and descriptions.
#
# Usage:
#   ./scripts/remove-labels.sh --repo <org/repo>
#   ./scripts/remove-labels.sh --repo sun-asterisk/my-project
#
# Requirements:
#   - GitHub CLI (gh): https://cli.github.com/
#   - Authenticated: gh auth login
#   - Token scope: repo
#
# Warning:
#   This permanently deletes ALL labels from the repository,
#   including GitHub defaults (bug, enhancement, etc.).
#   Issues and PRs that have these labels will lose them.
#   Run setup-labels.sh afterward to recreate the managed set.
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
echo "Removing ALL labels from: $REPO"
echo ""
echo "Warning: This will permanently delete every label in the repository,"
echo "including GitHub defaults. Issues and PRs will lose their labels."
echo ""
read -r -p "Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi
echo ""

# ── Fetch all label names ──────────────────────────────────

echo "Fetching all labels..."
LABELS=$(gh label list -R "$REPO" --limit 500 --json name --jq '.[].name' 2>/dev/null)

if [[ -z "$LABELS" ]]; then
  echo "No labels found in $REPO."
  exit 0
fi

TOTAL=$(echo "$LABELS" | wc -l | tr -d ' ')
echo "Found $TOTAL label(s). Deleting..."
echo ""

# ── Delete all labels ──────────────────────────────────────

FAILED=0
while IFS= read -r label; do
  if gh label delete "$label" -R "$REPO" --yes 2>/dev/null; then
    echo "  ok    $label"
  else
    echo "  fail  $label"
    FAILED=$((FAILED + 1))
  fi
done <<< "$LABELS"

echo ""
if [[ "$FAILED" -gt 0 ]]; then
  echo "Done. $FAILED label(s) could not be deleted."
else
  echo "All labels removed from $REPO."
fi
echo "Run ./scripts/setup-labels.sh --repo $REPO to recreate them."
echo ""
