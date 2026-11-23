#!/bin/bash

# Setup GitHub Wiki for DEX Platform - Operational Documentation
# This script creates the Wiki structure for operational procedures

set -e

echo "================================================"
echo "  DEX Platform - Wiki Setup (Operational Docs)"
echo "================================================"

# Check if wiki repo exists
read -p "Enter GitHub organization: " GITHUB_ORG
read -p "Enter repository name [ai-native-workflow]: " REPO_NAME
REPO_NAME=${REPO_NAME:-ai-native-workflow}

WIKI_REPO="https://github.com/$GITHUB_ORG/$REPO_NAME.wiki.git"

echo ""
echo "Setting up Wiki for: $GITHUB_ORG/$REPO_NAME"
echo ""

# Clone or create wiki repo
if [ -d "$REPO_NAME.wiki" ]; then
    echo "→ Wiki directory exists, pulling latest..."
    cd "$REPO_NAME.wiki"
    git pull
else
    echo "→ Cloning wiki repository..."
    git clone "$WIKI_REPO" || {
        echo "Wiki not initialized. Creating first..."
        mkdir "$REPO_NAME.wiki"
        cd "$REPO_NAME.wiki"
        git init
        git remote add origin "$WIKI_REPO"
    }
fi

# Create Home page
echo "→ Creating Home page..."
cat > Home.md << 'EOF'
# DEX Platform - Operational Documentation

> Complete guide for creating and managing work items in GitHub Projects

## Quick Navigation

### Creating Work Items
- [[Create-Epic|Creating an Epic]] - Business objectives and large features
- [[Create-Story|Creating a User Story]] - User requirements and acceptance criteria
- [[Create-Task|Creating a Task]] - Implementation work items
- [[Create-Bug|Creating a Bug Report]] - Reporting defects
- [[Create-Incident|Creating an Incident]] - Production issues

### Managing Work Items
- [[Status-Transitions|Status Transitions]] - Moving items through workflow
- [[Priority-Management|Priority and Severity]] - Setting priorities
- [[Assignment-Rules|Assignment and Ownership]] - Who works on what
- [[Linking-Items|Linking Related Items]] - Dependencies and relationships
- [[Labels-Usage|Using Labels Effectively]] - Categorization system

### Project Board Management
- [[Board-Setup|Setting Up Project Board]] - Initial configuration
- [[Board-Views|Creating Custom Views]] - Filters and grouping
- [[Sprint-Planning|Sprint Planning Process]] - Planning iterations
- [[Daily-Standup|Daily Standup Process]] - Team synchronization
- [[Sprint-Review|Sprint Review and Retrospective]] - Closing sprints

### Workflows
- [[Development-Workflow|Development Workflow]] - From ticket to deployment
- [[QA-Workflow|QA Testing Workflow]] - Testing process
- [[Release-Workflow|Release Process]] - Production deployment
- [[Hotfix-Workflow|Hotfix Process]] - Emergency fixes

### Metrics and Reporting
- [[Project-Metrics|Project Metrics]] - Key performance indicators
- [[Generate-Reports|Generating Reports]] - Weekly and monthly reports
- [[Velocity-Tracking|Velocity and Burndown]] - Sprint progress
- [[Quality-Metrics|Quality Metrics]] - Defect rates and test coverage

### Team Processes
- [[Team-Onboarding|New Team Member Onboarding]] - Getting started
- [[Role-Responsibilities|Roles and Responsibilities]] - Who does what
- [[Communication-Guidelines|Communication Guidelines]] - Slack, meetings
- [[Escalation-Process|Escalation Process]] - Handling blockers

## Quick Start: Your First Ticket

1. **Choose ticket type**:
   - Epic: Business objective spanning multiple sprints
   - Story: User-facing functionality
   - Task: Technical work item

2. **Create the ticket**:
   - Go to Issues → New Issue
   - Select appropriate template
   - Fill required fields

3. **Set properties**:
   - Priority (P0-P4)
   - Labels (component, type)
   - Sprint/Milestone
   - Assignee

4. **Track progress**:
   - Update status as work progresses
   - Add comments for important updates
   - Link related items

## Status Workflow

```
Backlog → Todo → In Progress → In Review → Testing → Done
```

See [[Status-Transitions|Status Transitions Guide]] for detailed rules.

## Support

- **Slack**: #project-support
- **Wiki Issues**: Create issue with 'documentation' label
- **Training**: Weekly new user sessions

---

*Last Updated: $(date +%Y-%m-%d)*
*Version: 1.0.0*
EOF

# Create Epic creation guide
echo "→ Creating Epic guide..."
cat > Create-Epic.md << 'EOF'
# Creating an Epic

> Step-by-step guide for creating Epic work items

## What is an Epic?

An Epic represents a large business objective or feature that:
- Spans multiple sprints (typically 2-6)
- Contains multiple User Stories
- Delivers significant business value
- Has measurable success criteria

## When to Create an Epic

Create an Epic when you have:
- Major new feature requiring multiple stories
- Large technical initiative (e.g., migration, refactoring)
- Business objective requiring cross-team work
- Customer request requiring significant development

## Step-by-Step Process

### 1. Navigate to Issue Creation

```
GitHub Repository → Issues → New Issue → Choose "Epic" template
```

### 2. Fill Required Fields

**Title Format**: `[EPIC] Brief descriptive title`

Example: `[EPIC] User Authentication System`

**Description Structure**:

```markdown
## Business Objective
Clear statement of what this Epic will achieve

## Success Criteria
- Measurable outcome 1
- Measurable outcome 2
- Measurable outcome 3

## User Stories
- [ ] Story 1: User registration
- [ ] Story 2: Login/logout
- [ ] Story 3: Password recovery
- [ ] Story 4: Two-factor authentication

## Dependencies
- External API availability
- Security review completion

## Risks
- Risk 1: Third-party service reliability
- Risk 2: Compliance requirements
```

### 3. Set Metadata

**Required Labels**:
- `epic` (automatically added)
- Component: `frontend`, `backend`, `infrastructure`
- Priority: `P0-critical`, `P1-high`, `P2-medium`, `P3-low`

**Project Board**:
- Add to current project
- Set to "Backlog" column initially

**Milestone**:
- Assign to target release

### 4. Link Related Items

After creation:
1. Create child User Stories
2. Link stories to Epic using "Linked Issues"
3. Add Epic number to story descriptions

### 5. Track Progress

**Weekly Updates**:
- Update description with progress percentage
- Add comment summarizing completed work
- Adjust timeline if needed

**Status Transitions**:
- `Backlog`: Not started, pending prioritization
- `Todo`: Prioritized for upcoming sprints
- `In Progress`: Active development
- `Done`: All child stories completed

## Best Practices

### DO:
- Keep scope focused on single objective
- Define clear success metrics
- Break down into 3-8 stories
- Include acceptance criteria
- Set realistic timelines

### DON'T:
- Create Epics for single-sprint work
- Mix unrelated features
- Leave success criteria vague
- Forget dependencies
- Skip risk assessment

## Examples

### Good Epic Title:
- `[EPIC] Customer Self-Service Portal`
- `[EPIC] Payment Gateway Integration`
- `[EPIC] Mobile App MVP`

### Poor Epic Title:
- `[EPIC] Fix bugs` (too vague)
- `[EPIC] Improvements` (not specific)
- `[EPIC] Q1 Work` (not objective-focused)

## Automation

When Epic is created:
- GitHub Actions adds to project board
- Notifies product owner
- Creates tracking metrics
- Generates Epic ID

## Related Documentation

- [[Create-Story|Creating User Stories]]
- [[Epic-Management|Managing Epics]]
- [[Status-Transitions|Status Transitions]]

[[Home|← Back to Home]]
EOF

# Create Story creation guide
echo "→ Creating Story guide..."
cat > Create-Story.md << 'EOF'
# Creating a User Story

> Guide for creating User Story work items with acceptance criteria

## What is a User Story?

A User Story represents functionality from the user's perspective:
- Delivers value to end user
- Can be completed in one sprint
- Has clear acceptance criteria
- Testable and demonstrable

## Story Format

```
As a [type of user]
I want [functionality]
So that [benefit/value]
```

## Step-by-Step Process

### 1. Navigate to Issue Creation

```
GitHub Repository → Issues → New Issue → Choose "User Story" template
```

### 2. Write the Story

**Title Format**: `[STORY] As a [user], I want [feature]`

Example: `[STORY] As a customer, I want to reset my password`

**Description Template**:

```markdown
## User Story
As a [type of user]
I want [functionality]
So that [benefit/value]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
Implementation considerations

## Test Scenarios
1. Happy path scenario
2. Error scenario
3. Edge case scenario

## Dependencies
- API endpoint X must be ready
- Design mockups approved

## Parent Epic
#123 - Link to parent Epic
```

### 3. Define Acceptance Criteria

**Good Criteria**:
- User can click "Forgot Password" link
- Email with reset link is sent within 60 seconds
- Reset link expires after 24 hours
- User receives confirmation after password change

**Poor Criteria**:
- Works correctly
- Fast performance
- Good user experience

### 4. Set Properties

**Required Fields**:
- Assignee: Developer who will implement
- Sprint: Target sprint
- Story Points: Complexity estimate (1, 2, 3, 5, 8)
- Priority: Based on business value

**Labels**:
- `story` (auto-added)
- Component label
- Feature area label

### 5. Link to Epic

1. Add Epic number in description
2. Use "Linked Issues" feature
3. Mention Epic in comments: "Part of #123"

## Estimation Guidelines

| Points | Description | Example |
|--------|-------------|---------|
| 1 | Simple change, well understood | Update button text |
| 2 | Straightforward, some complexity | Add form validation |
| 3 | Moderate complexity, standard pattern | CRUD operations |
| 5 | Complex, multiple components | Integration with external service |
| 8 | Very complex, unknowns | New authentication system |

## Status Workflow

1. **Backlog**: Story created, not ready
2. **Todo**: Ready for development
3. **In Progress**: Development active
4. **In Review**: Code review
5. **Testing**: QA validation
6. **Done**: Deployed to production

## Quality Checklist

Before marking "Todo":
- [ ] Acceptance criteria clear
- [ ] No external dependencies blocking
- [ ] Mockups/designs attached
- [ ] Test scenarios defined
- [ ] Story points estimated

## Common Mistakes

### Mistake 1: Technical Stories
Wrong: "As a developer, I want to refactor code"
Right: "As a user, I want faster page load times"

### Mistake 2: Vague Criteria
Wrong: "System should be fast"
Right: "Page loads within 2 seconds on 3G connection"

### Mistake 3: Too Large
Wrong: Complete user management system
Right: User registration flow only

## Related Documentation

- [[Create-Task|Creating Tasks]]
- [[Acceptance-Criteria|Writing Acceptance Criteria]]
- [[Story-Splitting|Splitting Large Stories]]

[[Home|← Back to Home]]
EOF

# Create Task creation guide
echo "→ Creating Task guide..."
cat > Create-Task.md << 'EOF'
# Creating a Task

> Guide for creating technical Task work items

## What is a Task?

A Task represents technical work that:
- Supports a User Story
- Can be completed by one person
- Has clear definition of done
- Usually takes hours to few days

## Types of Tasks

- **Development**: Code implementation
- **Testing**: Write test cases
- **Documentation**: Update docs
- **DevOps**: Infrastructure setup
- **Research**: Technical investigation

## Step-by-Step Process

### 1. Create the Task

```
GitHub Repository → Issues → New Issue → Choose "Task" template
```

### 2. Write Clear Title

**Format**: `[TASK] Action verb + specific description`

Examples:
- `[TASK] Implement password validation logic`
- `[TASK] Write unit tests for UserService`
- `[TASK] Update API documentation for auth endpoints`

### 3. Provide Details

**Description Template**:

```markdown
## Description
What needs to be done and why

## Parent Story
#456 - Link to User Story

## Implementation Details
- Step 1
- Step 2
- Step 3

## Definition of Done
- [ ] Code implemented
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

## Time Estimate
4 hours

## Notes
Any additional context
```

### 4. Set Properties

**Required**:
- Assignee: Person responsible
- Sprint: Current or next
- Parent story: Link in description

**Optional**:
- Time estimate
- Component label
- Technical label (frontend, backend, database)

## Task Lifecycle

### Creation Rules
- Create tasks during sprint planning
- One task = one pull request
- Break down if > 2 days work

### Status Transitions

```
Todo → In Progress → In Review → Done
```

**Todo**: Ready to start
- All requirements clear
- No blockers
- Dependencies resolved

**In Progress**: Active work
- Update daily
- Mention blockers immediately
- Link branch/PR when created

**In Review**: Code review
- PR created and linked
- Tests passing
- Reviewer assigned

**Done**: Complete
- PR merged
- Story updated
- No remaining work

## Best Practices

### Good Tasks:
- Specific and measurable
- Single responsibility
- Clear completion criteria
- Estimated in hours

### Poor Tasks:
- Vague: "Fix bugs"
- Too large: "Implement feature"
- Multiple responsibilities
- No clear done criteria

## Examples

### Development Task
```
Title: [TASK] Add email validation to registration form

Description:
Implement client-side and server-side validation for email field

Definition of Done:
- Valid email formats accepted
- Invalid emails show error message
- Unit tests cover edge cases
- Works on all browsers
```

### Testing Task
```
Title: [TASK] Create E2E tests for login flow

Description:
Write Playwright tests covering login scenarios

Definition of Done:
- Happy path test
- Invalid credentials test
- Forgot password test
- All tests passing in CI
```

### DevOps Task
```
Title: [TASK] Configure staging environment

Description:
Set up staging environment matching production

Definition of Done:
- Environment provisioned
- CI/CD pipeline configured
- Monitoring enabled
- Documentation updated
```

## Quick Actions

### Converting Story to Tasks
1. Open User Story
2. Identify technical components
3. Create task for each component
4. Link all tasks to story

### Daily Updates
Add comment with:
- What was completed
- What's next
- Any blockers

## Common Patterns

### Frontend Story Tasks:
1. Create UI components
2. Implement state management
3. Add API integration
4. Write component tests
5. Update storybook

### Backend Story Tasks:
1. Create data models
2. Implement business logic
3. Create API endpoints
4. Write unit tests
5. Update API docs

## Related Documentation

- [[Create-Story|Creating User Stories]]
- [[Task-Estimation|Estimating Tasks]]
- [[Pull-Requests|Creating Pull Requests]]

[[Home|← Back to Home]]
EOF

# Create Status Transitions guide
echo "→ Creating Status Transitions guide..."
cat > Create-Transitions.md << 'EOF'
# Status Transitions

> Complete guide for moving work items through the workflow

## Status Definitions

### Backlog
- **Description**: Not yet ready for work
- **Entry Criteria**: Item created
- **Exit Criteria**: All dependencies resolved, requirements clear

### Todo
- **Description**: Ready for development
- **Entry Criteria**: Requirements complete, prioritized
- **Exit Criteria**: Developer assigned and starts work

### In Progress
- **Description**: Active development
- **Entry Criteria**: Work begun
- **Exit Criteria**: Implementation complete, PR created

### In Review
- **Description**: Code review phase
- **Entry Criteria**: PR created, tests passing
- **Exit Criteria**: PR approved by reviewers

### Testing
- **Description**: QA validation
- **Entry Criteria**: Code merged to test environment
- **Exit Criteria**: All test cases pass

### Done
- **Description**: Complete and deployed
- **Entry Criteria**: Testing complete
- **Exit Criteria**: None (terminal state)

## Transition Rules

### Who Can Transition

| From | To | Who |
|------|----|-----|
| Backlog | Todo | Product Owner, Team Lead |
| Todo | In Progress | Assigned Developer |
| In Progress | In Review | Developer (PR creator) |
| In Review | Testing | Reviewer (after approval) |
| Testing | Done | QA Engineer |
| Any | Blocked | Anyone |
| Blocked | Previous Status | Person who resolves block |

### Required Actions

#### Backlog → Todo
Before moving:
1. Verify acceptance criteria defined
2. Check dependencies resolved
3. Confirm designs attached (if needed)
4. Add sprint assignment

#### Todo → In Progress
When starting:
1. Assign yourself
2. Create feature branch
3. Add estimated completion date
4. Comment: "Starting work on this"

#### In Progress → In Review
Before review:
1. Create pull request
2. Link PR to issue
3. Run all tests locally
4. Self-review code
5. Add PR link as comment

#### In Review → Testing
After approval:
1. Address review comments
2. Get required approvals (usually 2)
3. Merge to test branch
4. Deploy to test environment

#### Testing → Done
After testing:
1. All test cases executed
2. No critical bugs
3. Product owner approval
4. Deploy to production

## Automation

### Automatic Transitions

GitHub Actions automatically moves items when:

| Trigger | Transition |
|---------|------------|
| PR created | In Progress → In Review |
| PR approved | In Review → Testing |
| PR merged to main | Testing → Done |
| Issue closed | Any → Done |
| 'blocked' label added | Any → Blocked |

### Manual Transitions

Use Project Board to drag cards between columns for:
- Planning transitions (Backlog → Todo)
- Starting work (Todo → In Progress)
- QA decisions (Testing → Done or back)

## Special States

### Blocked
- Add 'blocked' label
- Add comment explaining blocker
- Assign to person who can unblock
- Moves back to original state when unblocked

### On Hold
- Business decision pending
- Waiting for external dependency
- Add 'on-hold' label
- Remove from sprint

### Won't Fix
- Decided not to implement
- Close issue with explanation
- Add 'wontfix' label

## Rollback Scenarios

### Failed Code Review
```
In Review → In Progress
Actions:
1. Address review feedback
2. Update PR
3. Request re-review
```

### Failed Testing
```
Testing → In Progress
Actions:
1. Create bug ticket
2. Link to original story
3. Fix issues
4. Restart review cycle
```

### Production Issue
```
Done → Hotfix (new issue)
Actions:
1. Create incident ticket
2. Implement fix
3. Emergency deployment
```

## Best Practices

### DO:
- Update status immediately when work state changes
- Add comments when transitioning
- Verify criteria before moving forward
- Use labels for additional context

### DON'T:
- Skip states in workflow
- Move items without meeting criteria
- Leave items in wrong status
- Forget to update related items

## Metrics

Status transitions are tracked for:
- Cycle time (In Progress → Done)
- Review time (In Review duration)
- Test time (Testing duration)
- Blocked time (time in Blocked state)

## Troubleshooting

### Issue: Can't move to next status
- Check: Are all required fields filled?
- Check: Do you have permission?
- Check: Are automated checks passing?

### Issue: Item stuck in status
- Check: Is it actually blocked?
- Check: Is assignee active?
- Check: Are there hidden dependencies?

## Related Documentation

- [[Board-Views|Project Board Views]]
- [[Automation-Rules|Automation Configuration]]
- [[Workflow-Customization|Customizing Workflows]]

[[Home|← Back to Home]]
EOF

# Create navigation sidebar
echo "→ Creating navigation sidebar..."
cat > _Sidebar.md << 'EOF'
**Navigation**

**Work Items**
- [[Home]]
- [[Create-Epic|Create Epic]]
- [[Create-Story|Create Story]]
- [[Create-Task|Create Task]]
- [[Create-Bug|Report Bug]]

**Workflow**
- [[Status-Transitions|Status Transitions]]
- [[Priority-Management|Priorities]]
- [[Assignment-Rules|Assignment]]
- [[Labels-Usage|Labels]]

**Project Board**
- [[Board-Setup|Board Setup]]
- [[Board-Views|Custom Views]]
- [[Sprint-Planning|Sprint Planning]]
- [[Daily-Standup|Daily Standup]]

**Processes**
- [[Development-Workflow|Development]]
- [[QA-Workflow|Testing]]
- [[Release-Workflow|Release]]
- [[Hotfix-Workflow|Hotfix]]

**Metrics**
- [[Project-Metrics|Metrics]]
- [[Generate-Reports|Reports]]
- [[Velocity-Tracking|Velocity]]

**Support**
- [[Team-Onboarding|Onboarding]]
- [[Troubleshooting|Help]]
- [[FAQ|FAQ]]
EOF

# Create footer
echo "→ Creating footer..."
cat > _Footer.md << 'EOF'
---
DEX Platform Operational Guide | [GitHub](https://github.com/$GITHUB_ORG/$REPO_NAME) | [Support](mailto:support@company.com)
EOF

# Commit and push
echo "→ Committing Wiki structure..."
git add -A
git commit -m "Initialize DEX Platform operational documentation" || echo "No changes to commit"

read -p "Push to GitHub? (y/n): " PUSH_WIKI
if [ "$PUSH_WIKI" = "y" ]; then
    echo "→ Pushing to GitHub..."
    git push origin master || git push origin main
fi

echo ""
echo "================================================"
echo "  Wiki Setup Complete"
echo "================================================"
echo ""
echo "Wiki URL: https://github.com/$GITHUB_ORG/$REPO_NAME/wiki"
echo ""
echo "Wiki Contents:"
echo "- Creating work items (Epic, Story, Task)"
echo "- Status transitions and workflow"
echo "- Project board management"
echo "- Sprint processes"
echo "- Metrics and reporting"
echo ""
echo "Next steps:"
echo "1. Visit the Wiki URL above"
echo "2. Review operational guides"
echo "3. Customize for your team's process"
echo "4. Train team on procedures"
echo ""