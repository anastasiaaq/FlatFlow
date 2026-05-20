# FlatFlow

A shared space for roommates to coordinate chores, household issues, and house rules — without scattered group chats.

## Overview

**Problem.** People sharing apartments or dormitories struggle with coordinating household responsibilities. Without a dedicated tool, chore assignments, maintenance issues, and house rules are scattered across group chats and verbal agreements, leading to confusion and recurring conflict.

**Solution.** FlatFlow is a web application that gives roommates a single shared space to manage chores, report household issues, and store house rules — making shared living more organized and less conflict-prone.

## Target Users

Students and young adults living in shared apartments or dormitories.

## MVP Scope (6 weeks)

Included in the MVP:

- **Authentication** — registration, login, and logout via email/password
- **Households** — create a household, invite roommates via invite code, view members, leave the household
- **Chore management** — full CRUD for chores (Tasks and Duties), assign to roommates, set dates, mark completed, view as a list
- **Chore calendar** — month view with one-off Tasks shown as chips and ongoing Duties as multi-day bars
- **Issue tracker** — create and view issues, change status (open / resolved), edit or delete one's own issues
- **House rules** — create, edit, delete, and view a shared list of agreements

Explicitly **excluded** from the MVP (kept as post-MVP backlog): karma/gamification, anonymous issue reporting, rule voting, shared expense tracking, push/email notifications, native mobile app, and password recovery.

See [docs/user-stories.md](docs/user-stories.md) for the full breakdown.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React (TypeScript) |
| Backend | Django REST Framework |
| Database | PostgreSQL |
| Auth | Session-based, HTTP-only cookies |
| Containerization | Docker & Docker Compose |
| Deployment | AWS EC2 |

## Documentation

- [Team Charter](TeamCharter.md) — roles, workflow, and our Definition of Done
- [User Stories](docs/user-stories.md) — epics and acceptance criteria
- [Non-Functional Requirements](docs/nfr.md) — performance, security, accessibility, etc.
- [Project Risks](docs/risks.md) — identified risks and mitigation strategies
