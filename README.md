 # GitHub Project Management Template

**Version 1.0** — Maintained by PEC (Process Elevation Consultant), Sun Asterisk

A standardized project management template for Sun Asterisk engineering teams, designed to replace Pherusa with GitHub Projects as the unified work tracking platform.

This repository serves as the **source template** for all new projects. When Infra bootstraps a new repository, they use this template to provision a fully configured GitHub Project board, issue templates, and workflow automations in minutes.

---

## 📖 Documentation

Full guidelines live on dedicated pages — use the one that matches your audience:

| 👤 Audience | 📚 Docs | 🔗 Link |
| :--- | :--- | :--- |
| **Internal (Sun\* members)** | Wiki — complete guidelines for company members | **[📘 GitHub Wiki](https://github.com/framgia/management_template/wiki)** |
| **External / Customer** | Public GitHub Page (EN / VI / Customer) | **[🌐 GitHub Page](https://framgia.github.io/management_template/)** |

> 💡 If you are a customer or an external partner, use the **GitHub Page**. If you are a Sun\* member, use the **Wiki**. The sections below are a quick technical reference for this template.

---

## What is included 

### Issue Templates (14 tracker types)

| # | Template | Purpose |
|---|---|---|
| 01 | Epic | Large initiatives grouping multiple stories |
| 02 | Story | User-facing feature or requirement |
| 03 | Change Request | Scope change within an ongoing project |
| 04 | UI Design | Design task |
| 05 | Dev Task | Development implementation task |
| 06 | Test Design | Test case design |
| 07 | Test Execution | Test execution record |
| 08 | QA Bug | Bug found during QA testing |
| 09 | UAT Bug | Bug found during UAT |
| 10 | Production Bug | Bug found in production |
| 11 | Documentation | Documentation task |
| 12 | Investigation | Research or spike |
| 13 | Operation | Operational or infrastructure task |
| 14 | Feedback | General feedback or improvement idea |

### Requirement & Spec Documents

Folder structure follows **QC-01 — Quy chuẩn Cấu trúc Thư mục Spec trên GitHub**. Each folder has an `_index.md` listing its documents; `_templates/` holds the blank templates — copy, do not edit in place.

| Folder | Contains | Template | Index |
|---|---|---|---|
| [`requirements/`](requirements/) | **WHAT** — requirement documents, `REQ-{Story number}-{slug}.md` | `BM-2-901-63` | [`requirements/_index.md`](requirements/_index.md) |
| [`specs/`](specs/) | **HOW** — Screen Specification · Function Specifications · Technical Design in `specs/{screen-or-feature}/`; Database Design · API Design in `specs/system-design/`; shared docs in `specs/_common/` | `BM-2-901-50` … `BM-2-901-54` | [`specs/_index.md`](specs/_index.md) |

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `issue-triage-labels.yml` | Issue opened | Auto-assign team, severity, test-type labels based on template fields |
| `project-bootstrap.yml` | Manual (workflow_dispatch) | Copy template project board, link to repo, create labels |
| `pr-auto-label.yml` | PR opened/edited | Auto-label PRs based on checklist (db-migration, breaking-change, etc.) |
| `pr-validation.yml` | PR opened/edited | Validate PR description has required sections |
| `release-checklist-gate.yml` | PR to main, tag push | Enforce release readiness checklist before merge to main |
| `dsx-quality-gate.yml` | PR to main/develop | Validate YAML syntax of all workflow and template files |

### Project Status Automation (n8n Webhook)

The `webhook/` folder contains n8n Code Node scripts that automatically update GitHub Project v2 **Status** and **Quality Gate** custom fields in real-time based on GitHub App events.

Status transitions are defined in `docs/status-transition-spec/tracker-status.csv`.

See [`webhook/README.md`](webhook/README.md) for full setup details.

---

## Project Structure

```
.github/
  ISSUE_TEMPLATE/         ← 14 issue templates
  workflows/              ← 6 GitHub Actions workflows
  pull_request_template.md
requirements/
  _index.md               ← Requirement document index
  _templates/             ← BM-2-901-63 requirement document template
specs/
  _index.md               ← Spec index (SPEC · FUNC · TECH)
  _common/                ← Docs shared by two or more features
  _templates/             ← BM-2-901-50 … BM-2-901-54 spec templates
  system-design/
    database-design/      ← Database Design (+ _index.md)
    api-design/           ← API Design (+ _index.md)
docs/
  status-transition-spec/
    tracker-status.csv    ← Status transition rules
    github_action_spec.md ← Technical spec for automation
scripts/
  setup-labels.sh         ← Create all labels in a repo (CLI)
  bootstrap-project.sh    ← Bootstrap a new project board (CLI)
webhook/
  step-2-validate-signature.js
  step-3-route-event.js
  step-4-fetch-issue-context.js
  step-5-apply-spec.js
  step-6-execute-mutation.js
  README.md               ← n8n webhook setup guide
```

---

## Setting Up a New Project

### Step 1 — Create repository from template

Go to this repository on GitHub and click **"Use this template"** to create a new repository.

Do not clone and copy manually — use the template button to preserve the correct repository structure and settings.

### Step 2 — Bootstrap the project board

Run the **Project Bootstrap** workflow from GitHub Actions UI:

```
Actions → Project Bootstrap → Run workflow
  - repo_name: <new-repo-name>
  - project_board_name: <display name for the board>
```

Or use the CLI:

```bash
export GH_TOKEN=<PROJECT_TOKEN>
./scripts/bootstrap-project.sh \
  --org sun-asterisk \
  --repo <repo-name> \
  --project-name "<Board Name>" \
  --template-project-number <TEMPLATE_PROJECT_NUMBER>
```

Bootstrap will:
1. Copy the template GitHub Project board (all views and custom fields)
2. Link the new board to the repository
3. Create all required labels (~30 labels)

### Step 3 — Enable webhook automation (optional)

To enable real-time project status transitions, configure the n8n webhook integration for the new repository.
See [`webhook/README.md`](webhook/README.md) for instructions.

---

## Status Transitions

Project Status and Quality Gate fields are updated automatically based on pull request and issue events.

| Tracker | Event | Transition |
|---|---|---|
| Dev Task | PR opened | In Progress → In Review |
| Dev Task | PR merged | In Review → Closed + Quality Gate: Technical Review Passed |
| Dev Task | PR rejected | In Review → In Progress + Quality Gate: Technical Review Failed |
| QA / UAT / Production Bug | PR merged | → QA Testing + Quality Gate: Technical Review Passed |
| Any tracker | PR merged to main | → Closed |
| Story / Change Request | All Dev Tasks closed | In Progress → QA Testing |
| Story / Change Request | All subtasks closed | QA Testing → UAT In Progress + Quality Gate: QA Testing Passed |
| Story / Change Request | QA Bug opened | QA Testing → In Progress + Quality Gate: QA Testing Failed |
| Epic | Story is In Progress | New → In Progress |
| Epic | All Stories closed | In Progress → Closed |
| Any tracker | Issue closed as completed | → Closed (guarded) |
| Any tracker | Issue closed as not planned | → Cancelled (guarded) |

Full spec: [`docs/status-transition-spec/tracker-status.csv`](docs/status-transition-spec/tracker-status.csv)

---

## Label System

Labels are created automatically by the bootstrap workflow and maintained by `scripts/setup-labels.sh`.

| Group | Labels |
|---|---|
| Type | `type:epic`, `type:story`, `type:changerequest`, `type:devtask`, `type:qabug`, `type:uatbug`, `type:productionbug`, `type:uidesign`, `type:testdesign`, `type:testexecution`, `type:documentation`, `type:investigation`, `type:operation`, `type:feedback` |
| Team | `team:frontend`, `team:backend`, `team:native-ios`, `team:native-android`, `team:native-multiPF`, `team:ai`, `team:infrastructure` |
| Severity | `severity:low`, `severity:medium`, `severity:high`, `severity:critical` |
| Test Type | `testtype:functionaltest`, `testtype:layouttest`, `testtype:performancetest`, `testtype:stresstest`, `testtype:accesscontrol&securitytest` |
---

## One-time Org Setup

The following must be configured once at the organization level by Infra before any project can use this template.

**Mark this repo as a Template Repository:**
Repository Settings → check "Template repository"

**Organization Secret: `PROJECT_TOKEN`**
Fine-grained PAT with permissions:
- Repository: Issues (Write), Pull requests (Read), Variables (Write)
- Organization: Projects (Read and Write)

Set at: Org Settings → Secrets → Actions → New organization secret → Access: All repositories

**Organization Variable: `TEMPLATE_PROJECT_NUMBER`**
The number of the master GitHub Project to copy from (visible in the URL: `github.com/orgs/sun-asterisk/projects/NUMBER`).

Set at: Org Settings → Variables → Actions → New organization variable

---

## Support and Contact

For questions, issues, or improvement proposals related to this template:

- **Slack:** [#con_pec-github-project-support](https://sun-asterisk.slack.com/channels/con_pec-github-project-support)
- **GitHub Issues:** Open an issue in this repository with a description of the problem or request

This template is owned and maintained by the **PEC (Process Elevation Consultant)** team at Sun Asterisk. Contributions from project teams are welcome via pull request.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
