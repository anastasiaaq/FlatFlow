# FlatFlow — Test Plan

Verifies the MVP before Code Freeze: find, document and prioritise defects against written test cases. Bugs are tracked as cards on the [Kanban board](https://github.com/users/anastasiaaq/projects/1/views/1) (GitHub Issues labelled `bug`).

## Scope

In scope:

| Module | User Stories | How it is tested |
| --- | --- | --- |
| Registration & Auth | US-1.1 – US-1.3 | API (Swagger) |
| User Profile | US-1.4 – US-1.5 | API (Swagger) |
| Household | US-2.1 – US-2.5 | API (Swagger) |
| Chores (Task / Duty) | US-3.1 – US-3.8 | API (Swagger); US-3.6 calendar is browser-only (deferred) |
| Issue tracker | US-4.1 – US-4.5 | API (Swagger), once `issues` API is merged |
| House rules | US-5.1 – US-5.3 | API (Swagger) |

UI-specific criteria (empty states, redirects, button visibility, copy-to-clipboard) are tested in the browser once the corresponding screen exists.

Out of scope (not part of the MVP): password recovery, notifications (push / email), mobile app, gamification / karma, anonymous issues, rule voting, expense tracking.

## Approach

- Manual functional testing — positive (happy path) and negative / edge cases. Each acceptance criterion in `user-stories.md` maps to at least one case.
- Two execution surfaces: **API via Swagger** (`/api/docs/`), available now and independent of the UI; and the **browser UI** for UI-only criteria once screens exist. UI-dependent cases stay `Blocked` until then.
- Automated tests are out of scope this sprint (optional: a few API smoke tests later, if backend has spare time).

## Test environment

- Local Docker: `cd src && docker compose up -d --build`
- Interactive API: `http://localhost:<port>/api/docs/` (Swagger)
- Browser: Chrome (latest)

## Exit criteria

- Every planned case is executed, or marked `Blocked` with a reason.
- No open defects with Severity = **Blocker** or **Critical**.
- The demo path (auth → household → chores) runs without crashing.

## Defect handling — Severity vs Priority

- **Severity** — technical impact of the defect, set by the tester: `Blocker` › `Critical` › `Major` › `Minor` › `Trivial`.
- **Priority** — urgency of fixing for the release, set by the PM: `High` › `Medium` › `Low`.
- They are independent — e.g. a typo in the app name is Severity `Trivial`, Priority `High`.
- Workflow: a `Fail` case becomes a bug card on the Kanban board, labelled `bug` + `severity:<level>` + `priority:<level>`, with reproduction steps, expected and actual result.

---

## Test Cases

The full set of test cases lives in [`test-cases.md`](./test-cases.md) — one table per case (fields: User Story, Type, Preconditions, Steps, Expected result, Status; plus Actual result and Severity, filled on a failure). Coverage — all 5 epics, 74 cases:

| Epic | Cases | Count | Edge / negative cases included |
| --- | --- | --- | --- |
| Auth (US-1.1–1.3) | TC-AUTH-01…12 | 12 | duplicate email, invalid format, short password, name-length bounds, generic login error, idempotent logout, session cookie 30-day expiry |
| Profile (US-1.4–1.5) | TC-PROF-01…03 | 3 | empty / too-long name |
| Household (US-2.1–2.5) | TC-HOUSE-01…16 | 16 | create while already in a household, code permanence, 3 invalid-join cases, solo state, last-member deletion, auto-Unassign, "[former member]", cross-household isolation |
| Chores (US-3.1–3.8) | TC-CHORE-01…27 | 27 | end<start, missing Duty date, description >500, "No due date", past dates, Overdue, Pending confirmation, type lock, reopen, empty states/filters, sort order |
| Issues (US-4.1–4.5) | TC-ISSUE-01…10 | 10 | field bounds, sort order, author-only buttons, edit resolved, empty filter |
| Rules (US-5.1–5.3) | TC-RULE-01…06 | 6 | text bounds, last-modified-by, empty state |
| **Total** | | **74** | |

Issues cases (TC-ISSUE-*) are currently `Blocked` — the Issues API is not yet implemented.
