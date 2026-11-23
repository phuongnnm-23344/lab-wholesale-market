# Changelog

All notable changes to this template will be documented in this file.

Format: `[version] — YYYY-MM-DD`

---

## [1.0] — 2026-03-23

Initial release of the GitHub Project Management Template.

### Added

**Issue Templates**
- 14 tracker types: Epic, Story, Change Request, UI Design, Dev Task, Test Design, Test Execution, QA Bug, UAT Bug, Production Bug, Documentation, Investigation, Operation, Feedback
- GitHub Issue Forms format with structured fields (dropdowns, checkboxes, text areas)
- Auto-label system: team, severity, and test-type labels applied on issue creation

**GitHub Actions Workflows**
- `issue-triage-labels` — auto-assign labels based on issue template field selections
- `project-bootstrap` — one-command project board setup (copy template, link repo, create labels)
- `pr-auto-label` — label PRs based on checklist (db-migration, breaking-change, env-changes, infra)
- `pr-validation` — validate PR description has required sections before review
- `release-checklist-gate` — enforce release readiness checklist on PRs targeting main
- `dsx-quality-gate` — YAML lint validation for all workflows and issue templates

**Project Board Automation (n8n Webhook)**
- Real-time GitHub Project v2 Status and Quality Gate field updates via GitHub App webhook
- Supported events: `pull_request`, `issues`, `projects_v2_item`
- Status transition spec covering: Epic, Story, Change Request, Dev Task, QA Bug, UAT Bug, Production Bug
- Cascade rules: child issue status changes propagate to parent automatically
- Issue closed rules: completed → Closed, not_planned → Cancelled (with guards)
- Early-exit filtering by repository node_id and project node_id for performance

**Scripts**
- `setup-labels.sh` — create all required labels in a repository via GitHub CLI
- `bootstrap-project.sh` — bootstrap a new project board from CLI

**Documentation**
- `docs/status-transition-spec/tracker-status.csv` — status transition rules per tracker type
- `docs/status-transition-spec/github_action_spec.md` — technical spec for automation
- `webhook/README.md` — n8n webhook pipeline setup and configuration guide
