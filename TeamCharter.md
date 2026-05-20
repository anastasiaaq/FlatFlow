# FlatFlow — Team Charter

## 1. Team & Members

| Name | Title | GitHub |
| --- | --- | --- |
| Kateryna Bratiuk | Backend Engineer | [@katerynabratiuk](https://github.com/katerynabratiuk) |
| Anastasiia Dvoilenko | Project Manager + Developer (Generalist) | [@anastasiaaq](https://github.com/anastasiaaq) |
| Milana Horalevych | Systems Analyst + Docs Lead | [@miqdok](https://github.com/miqdok) |
| Zlata Tsepkalo | Designer + Frontend Engineer | [@t-zlata](https://github.com/t-zlata) |

## 2. Work Completed So Far

The project is in the documentation and planning phase. Implementation has not yet started. Deliverables completed to date:

- Concept and MVP scope
- Epics and user stories
- Non-functional requirements
- Project risks and mitigation strategies
- Team Charter and the project README

## 3. Communication

- **Primary channel:** Discord
- **Sync meeting with mentor:** weekly, Friday 16:30–16:50
- **Reply expectation:** within 24 hours

## 4. Collaboration Workflow

- **Task Workflow:** Tasks tracked on a Kanban board. Tasks are usually assigned by the Project Manager, or members self-assign from the backlog. The weekly sync is used to align on priorities and unblock anyone who is stuck.
- **Issue Definition:** Every issue lists clear acceptance criteria before work starts on it.
- **Branching Strategy:** GitHub Flow. `main` is always stable and updated only via PRs. Branches are deleted after merge.
- **Branch Naming:** `type/#<issue-number>-short-description` (e.g., `docs/#3-teamcharter-setup`).
- **Commit Conventions:** `<type>(#<issue-number>): short message` (e.g., `docs(#3): add TeamCharter.md`).
- **Code Review:** each PR requires at least one approval. Automated review is done by [CodeRabbit](https://www.coderabbit.ai/).

## 5. Definition of Done

A task is considered done when **all** of the following are true:

- Code is written and implements every acceptance criterion from the linked issue
- The change has been reviewed and approved by at least one other team member (the reviewer reads the diff and, for non-trivial changes, pulls the branch to verify the affected flow)
- The reviewer has manually exercised each acceptance criterion and confirmed it passes; no console or backend errors observed
- Documentation is updated if user-facing behavior or setup steps have changed
- The change is merged into `main` via PR

## 6. Coding Standards

- Code should be readable and follow common conventions for the language (PEP 8 for Python, standard React/TypeScript style for the frontend)
- We do not have automated pre-commit checks yet — the code reviewer is the quality gate and flags style or readability issues during PR review
- Environment-specific values live in environment variables, not in the source code

## 7. Conflict Resolution

1. Discuss the disagreement openly within the team
2. Seek a compromise that everyone can accept
3. If consensus cannot be reached, ask the mentor for guidance

## 8. Availability & Workload

Work is distributed so the load stays balanced across the team. If workload becomes unbalanced, tasks are redistributed.

If a member is unavailable for more than three days, they notify the team in Discord and the Project Manager redistributes any blocking tasks.
