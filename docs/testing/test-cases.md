# FlatFlow — Test Cases

Goes with [`test-plan.md`](./test-plan.md). Each case is one table. During a run fill `Status`; on `Fail` fill `Actual result` and a suggested `Severity` (then turned into a bug card with assigned Priority).

- **Status:** `Not Run` / `Pass` / `Fail` / `Blocked`
- **Type:** `Positive` (happy path) / `Negative` (invalid input rejected) / `Edge` (boundary / special state)
- **ID:** `TC-<MODULE>-<NN>` — `AUTH`, `PROF`, `HOUSE`, `CHORE`, `ISSUE`, `RULE`
- **Execution surface:** pure API-verifiable outcomes state the assertion directly (run via Swagger now). Pure UI-only outcomes (rendering, dialogs, button visibility, empty-state copy, clipboard) are tagged `UI (deferred)` and their `Status` is `Blocked` until the frontend exists. Mixed outcomes are split into `API (now)` / `UI (deferred)`, with `Status` tracking the API part.

Acceptance criteria source: [`user-stories.md`](../user-stories.md).

---

## Epic 1 — Registration & Authentication

### TC-AUTH-01 — Successful registration with valid data

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Positive |
| Preconditions | Email `new@flat.com` is not registered |
| Steps | 1. Open the registration form. 2. email = `new@flat.com`, name = `Anna`, password = `correct-horse-staple-7`. 3. Submit. |
| Expected result | **API (now):** account created (HTTP 201), session established, `has_household = false`. **UI (deferred):** user is auto-logged-in and routed to the Welcome screen. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-02 — Registration with an already-registered email

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Negative |
| Preconditions | Email `anna@flat.com` is already registered |
| Steps | 1. Open the registration form. 2. email = `anna@flat.com`, valid name and password. 3. Submit. |
| Expected result | Error **"An account with this email already exists"**; no account created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-03 — Registration with an invalid email format

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Negative |
| Preconditions | — |
| Steps | 1. Open the registration form. 2. email = `not-an-email`, valid name and password. 3. Submit. |
| Expected result | **API (now):** HTTP 400 with an email-format validation error; no account created. **UI (deferred):** HTML5 `type="email"` blocks the submit client-side. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-04 — Registration with a password shorter than 8 characters

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Negative |
| Preconditions | — |
| Steps | 1. Open the registration form. 2. valid email and name, password = `1234`. 3. Submit. |
| Expected result | Submission rejected with an error; no account created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-05 — Registration with empty or too-long display name

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Edge |
| Preconditions | — |
| Steps | 1. Submit once with name empty. 2. Submit once with name = 51 characters. |
| Expected result | Both rejected with an error (name required, 1–50 chars); no account created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-06 — Login with valid credentials, user in a household

| Field | Value |
| --- | --- |
| User Story | US-1.2 |
| Type | Positive |
| Preconditions | Registered user who belongs to a household |
| Steps | 1. Open login. 2. Enter valid email and password. 3. Submit. |
| Expected result | **API (now):** login succeeds (HTTP 200), `has_household = true`. **UI (deferred):** routed to the chore list. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-07 — Login with valid credentials, user without a household

| Field | Value |
| --- | --- |
| User Story | US-1.2 |
| Type | Edge |
| Preconditions | Registered user not in any household |
| Steps | 1. Open login. 2. Enter valid email and password. 3. Submit. |
| Expected result | **API (now):** login succeeds (HTTP 200), `has_household = false`. **UI (deferred):** routed to the Welcome screen with "Create household" / "Join household" actions. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-08 — Login with invalid credentials

| Field | Value |
| --- | --- |
| User Story | US-1.2 |
| Type | Negative |
| Preconditions | — |
| Steps | 1. Open login. 2. Enter a valid email with a wrong password. 3. Submit. |
| Expected result | HTTP 401 with the generic error **"Invalid email or password"** (does not reveal which field is wrong); not logged in |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-09 — Session persists across a page reload

| Field | Value |
| --- | --- |
| User Story | US-1.2 |
| Type | Positive |
| Preconditions | User is logged in |
| Steps | 1. Reload the page. |
| Expected result | **API (now):** the existing session cookie still authenticates a follow-up request. **UI (deferred):** user stays logged in after a page reload. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-10 — Logout ends the session

| Field | Value |
| --- | --- |
| User Story | US-1.3 |
| Type | Positive |
| Preconditions | User is logged in |
| Steps | 1. Click "Log out". 2. Try to open a protected page (e.g. chore list). |
| Expected result | **API (now):** logout returns HTTP 200; a subsequent request to a protected endpoint (e.g. profile) is rejected as unauthenticated. **UI (deferred):** redirect to login. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-11 — Logout from an already-expired session is idempotent

| Field | Value |
| --- | --- |
| User Story | US-1.3 |
| Type | Edge |
| Preconditions | Session already expired / ended |
| Steps | 1. Trigger logout again. |
| Expected result | **API (now):** repeating logout on an ended session returns HTTP 200 with no error (idempotent). **UI (deferred):** user ends on the login page. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-AUTH-12 — Session cookie expiry is set to 30 days

| Field | Value |
| --- | --- |
| User Story | US-1.2 |
| Type | Edge |
| Preconditions | — |
| Steps | 1. Log in. 2. Inspect the session `Set-Cookie` header in the login response (Swagger / browser devtools). |
| Expected result | The session cookie is `HttpOnly` with `Max-Age` ≈ 2592000 s (30 days). Because `SESSION_SAVE_EVERY_REQUEST` is on, the window refreshes on each request (inactivity-based expiry). Full 30-day expiry behaviour is covered by config review plus an optional time-mocked automated test. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 1 — User Profile

### TC-PROF-01 — View own profile

| Field | Value |
| --- | --- |
| User Story | US-1.4 |
| Type | Positive |
| Preconditions | User is logged in |
| Steps | 1. Open the profile page. |
| Expected result | **API (now):** the profile endpoint returns the current user's display name and email. **UI (deferred):** the profile page displays them. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-PROF-02 — Edit display name with a valid value

| Field | Value |
| --- | --- |
| User Story | US-1.5 |
| Type | Positive |
| Preconditions | User is logged in |
| Steps | 1. Open profile. 2. Click "Edit name". 3. Enter `Anna B.`. 4. Save. |
| Expected result | **API (now):** name updated (HTTP 200) and returned by the profile endpoint. **UI (deferred):** new name reflected wherever the user appears (member list, chore assignee, "marked done by", issue/rule author). |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-PROF-03 — Edit display name with empty or too-long value

| Field | Value |
| --- | --- |
| User Story | US-1.5 |
| Type | Negative |
| Preconditions | User is logged in |
| Steps | 1. Edit name to empty. 2. Edit name to 51 characters. |
| Expected result | Both rejected with an error (required, 1–50 chars); name unchanged |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 2 — Household Management

### TC-HOUSE-01 — Create a household with a valid name

| Field | Value |
| --- | --- |
| User Story | US-2.1 |
| Type | Positive |
| Preconditions | Registered user not in any household |
| Steps | 1. Open "Create household". 2. name = `Flat 12`. 3. Submit. |
| Expected result | **API (now):** create returns HTTP 201; the user is the only member, an invite code is generated automatically, and `created_by` (display-only) is the user. **UI (deferred):** the household name and "Created by …" attribution are shown on the home page. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-02 — Create a household with empty or too-long name

| Field | Value |
| --- | --- |
| User Story | US-2.1 |
| Type | Negative |
| Preconditions | Registered user not in any household |
| Steps | 1. Submit with name empty. 2. Submit with name = 61 characters. |
| Expected result | Both rejected with an error (required, 1–60 chars); no household created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-03 — Create a household while already a member of one

| Field | Value |
| --- | --- |
| User Story | US-2.1 (System Constraint: at most one household) |
| Type | Edge |
| Preconditions | User already belongs to a household |
| Steps | 1. Attempt to create a new household. |
| Expected result | HTTP 409 with **"You are already a member of a household. Leave it first to create a new one"**; user stays in their current household (a user can belong to at most one household) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-04 — View and copy the invite code

| Field | Value |
| --- | --- |
| User Story | US-2.2 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. Open the household page. 2. Click the copy button next to the invite code. |
| Expected result | **API (now):** the invite code is present/returned to the member. **UI (deferred):** one click copies it to the clipboard. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-05 — Invite code is permanent and not regenerated

| Field | Value |
| --- | --- |
| User Story | US-2.2 |
| Type | Edge |
| Preconditions | Household exists with a known invite code |
| Steps | 1. Note the code. 2. Reload / revisit the household page later. |
| Expected result | The same code is shown; it does not expire and is not regenerated |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-06 — Join a household with a valid invite code

| Field | Value |
| --- | --- |
| User Story | US-2.3 |
| Type | Positive |
| Preconditions | User is logged in and not in a household; a valid code exists |
| Steps | 1. Open "Join household". 2. Enter the valid code. 3. Confirm. |
| Expected result | **API (now):** user becomes a member (membership persisted, household returned). **UI (deferred):** the household appears on their home page. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-07 — Join with a non-existent invite code

| Field | Value |
| --- | --- |
| User Story | US-2.3 |
| Type | Negative |
| Preconditions | User is logged in and not in a household |
| Steps | 1. Open "Join household". 2. Enter code `ZZZ999`. 3. Confirm. |
| Expected result | Error **"Invite code not found"**; user not added to any household |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-08 — Join while already in a different household

| Field | Value |
| --- | --- |
| User Story | US-2.3 |
| Type | Edge |
| Preconditions | User is already a member of household A; a valid code for household B exists |
| Steps | 1. Enter household B's code. 2. Confirm. |
| Expected result | Error **"You are already a member of a household. Leave it first to join another"** |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-09 — Join using own current household's code

| Field | Value |
| --- | --- |
| User Story | US-2.3 |
| Type | Edge |
| Preconditions | User is a member of a household and knows its code |
| Steps | 1. Enter own household's code. 2. Confirm. |
| Expected result | Error **"You are already a member of this household"** |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-10 — View household members

| Field | Value |
| --- | --- |
| User Story | US-2.4 |
| Type | Positive |
| Preconditions | Household has 2+ members |
| Steps | 1. Open the household page. |
| Expected result | **API (now):** GET `/households/current` returns the household with its `members` array (all members' display names). **UI (deferred):** the list is shown on the household page. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-11 — Member list, solo state

| Field | Value |
| --- | --- |
| User Story | US-2.4 |
| Type | Edge |
| Preconditions | User is the only member |
| Steps | 1. Open the household page. |
| Expected result | **API (now):** GET `/households/current` returns a `members` array containing only the current user. **UI (deferred):** shows "You're the only one here yet — share your invite code to bring roommates in" with a shortcut to the invite code. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-12 — Leave a household (not the last member)

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Positive |
| Preconditions | User is a member of a household with other members |
| Steps | 1. Click "Leave household". 2. Confirm in the prompt. |
| Expected result | **API (now):** after leaving, the user's membership is removed and the member list updates (re-fetch confirms the user no longer sees the household's data). **UI (deferred):** a confirmation prompt is shown before leaving. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-13 — Last member leaving deletes the household

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Edge |
| Preconditions | User is the only member; household has chores/issues/rules |
| Steps | 1. Click "Leave household". 2. Read the warning. 3. Confirm. |
| Expected result | **API (now):** on confirm the household and all its data (chores, issues, rules) are deleted. **UI (deferred):** the user is warned data will be deleted before confirming. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-14 — Leaving member's chores become Unassigned

| Field | Value |
| --- | --- |
| User Story | US-2.5 / US-3.2 |
| Type | Edge |
| Preconditions | User has active chores (a Task and a current Duty) assigned to them; household has other members |
| Steps | 1. Leave the household. 2. A remaining member opens the chore list. |
| Expected result | The leaving member's active Task and current Duty are set to "Unassigned" (not deleted) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-15 — Former member's authorship is preserved

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Edge |
| Preconditions | User authored a rule and completed a chore, then left the household (issues excluded — no API yet) |
| Steps | 1. A remaining member views those items. |
| Expected result | Authorship is preserved and shown as "[former member] Name" |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HOUSE-16 — Household data isolation (cross-household access denied)

| Field | Value |
| --- | --- |
| User Story | NFR-2 / System Constraint (household data only accessible to members) |
| Type | Negative |
| Preconditions | User is a member of household A; a chore with a known id exists in household B |
| Steps | 1. As the household A member, request household B's chore by its id via the API. |
| Expected result | HTTP 404; household B's data is not returned (a member cannot access another household's chores) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 3 — Chore Management

> **Note on chore statuses:** "Overdue" and "Pending confirmation" are *derived display statuses* returned in the API `status` field, computed from the dates at read time. The persisted `stored_status` only ever holds `ACTIVE` or `COMPLETED`. When verifying via the API, read the `status` field (not `stored_status`).

### TC-CHORE-01 — Create a Task with a valid title

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New chore. 2. type = Task, title = `Buy detergent`. 3. Save (no due date). |
| Expected result | **API (now):** the Task is created and returned. **UI (deferred):** it appears in the chore list and on the calendar for all members. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-02 — Create a Duty with start and end dates

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New chore. 2. type = Duty, title = `Dishes`, start = today, end = today+6. 3. Save. |
| Expected result | **API (now):** the Duty is created and returned. **UI (deferred):** it appears in the list and on the calendar as a multi-day item. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-03 — Create a chore with an empty title

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. New chore. 2. Leave title empty. 3. Save. |
| Expected result | Rejected with an error; chore not created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-04 — Create a chore with a title over 80 characters

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. New chore. 2. title = 81 characters. 3. Save. |
| Expected result | Rejected with an error (title 1–80 chars) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-05 — Create a Duty with end date before start date

| Field | Value |
| --- | --- |
| User Story | US-3.1 / US-3.3 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. New Duty. 2. start = `2026-06-10`, end = `2026-06-05`. 3. Save. |
| Expected result | Rejected with a validation error (end date must be on or after start date) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-06 — Create a Duty missing a required date

| Field | Value |
| --- | --- |
| User Story | US-3.1 / US-3.3 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. New Duty. 2. Provide only a start date (no end). 3. Save. |
| Expected result | Rejected with an error (both start and end are required for a Duty) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-07 — Assign a chore to a member

| Field | Value |
| --- | --- |
| User Story | US-3.2 |
| Type | Positive |
| Preconditions | Household has 2+ members; a chore exists |
| Steps | 1. Edit the chore. 2. Set assignee to `Bob`. 3. Save. 4. As Bob, apply the "me" filter. |
| Expected result | **API (now):** the assignee (Bob) is persisted and the chore is returned by the "me" filter for that user. **UI (deferred):** it is visually highlighted as "mine". |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-08 — Assign a chore to "Unassigned"

| Field | Value |
| --- | --- |
| User Story | US-3.2 |
| Type | Edge |
| Preconditions | A Task and a Duty exist |
| Steps | 1. Set assignee = "Unassigned" on both. 2. Save. |
| Expected result | "Unassigned" is accepted for both Task and Duty |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-09 — Task without a due date is grouped under "No due date"

| Field | Value |
| --- | --- |
| User Story | US-3.3 |
| Type | Edge |
| Preconditions | A Task without a due date exists |
| Steps | 1. Open the chore list / calendar. |
| Expected result | **API (now):** the Task is returned with no due date (in the "No due date" grouping). **UI (deferred):** shown in the separate "No due date" panel next to the calendar. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-10 — Past dates are allowed

| Field | Value |
| --- | --- |
| User Story | US-3.3 |
| Type | Edge |
| Preconditions | User is a household member |
| Steps | 1. Create a Task with a past due date. 2. Create a Duty with a past date range. |
| Expected result | Both are accepted (past dates allowed to log past work/responsibility) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-11 — Overdue Task is flagged and sorted first

| Field | Value |
| --- | --- |
| User Story | US-3.3 / US-3.5 |
| Type | Edge |
| Preconditions | A Task with a past due date that is not Done |
| Steps | 1. Open the chore list. |
| Expected result | **API (now):** the Task's `status` is `OVERDUE` and it is sorted first in the returned list. **UI (deferred):** distinct "Overdue" visual style. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-12 — Mark a Task as Done

| Field | Value |
| --- | --- |
| User Story | US-3.4 |
| Type | Positive |
| Preconditions | A Task exists; user is any household member (need not be assignee) |
| Steps | 1. Click "Done" on the Task. |
| Expected result | **API (now):** `status` becomes COMPLETED and completed-by/at are recorded and returned. **UI (deferred):** the chore is visually distinct. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-13 — Mark a Duty complete during its period

| Field | Value |
| --- | --- |
| User Story | US-3.4 |
| Type | Positive |
| Preconditions | A Duty whose period includes today |
| Steps | 1. Click "Mark complete". |
| Expected result | **API (now):** `status` becomes COMPLETED and completed-by/at are recorded and returned. **UI (deferred):** the completion (who/when) is shown in the list and detail. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-14 — "Mark complete" unavailable before a Duty's start date

| Field | Value |
| --- | --- |
| User Story | US-3.4 |
| Type | Edge |
| Preconditions | A Duty whose start date is in the future |
| Steps | 1. Open the Duty. |
| Expected result | **API (now):** POST complete on a not-yet-started Duty returns HTTP 400 ("Duties can only be completed from their start date onward"); the Duty stays ACTIVE. **UI (deferred):** the "Mark complete" control is not available before the start date. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-15 — Past Duty without completion becomes "Pending confirmation"

| Field | Value |
| --- | --- |
| User Story | US-3.4 |
| Type | Edge |
| Preconditions | A Duty whose end date has passed and was never marked complete |
| Steps | 1. Open the chore list. |
| Expected result | Status is automatically "Pending confirmation" (distinct from Active and Completed); it can still be marked complete from this state |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-16 — Reopen a Completed chore to Active

| Field | Value |
| --- | --- |
| User Story | US-3.4 / US-3.7 |
| Type | Edge |
| Preconditions | A Completed chore exists |
| Steps | 1. Edit the chore. 2. Change status to Active. 3. Save. |
| Expected result | **API (now):** editing the status field sets it back to ACTIVE (confirmed on re-fetch). **UI (deferred):** the chore is shown as Active again. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-17 — View the chore list with default sort

| Field | Value |
| --- | --- |
| User Story | US-3.5 |
| Type | Positive |
| Preconditions | Household has a mix of overdue tasks, pending-confirmation duties, current duties, upcoming items and completed items |
| Steps | 1. Open the chore list. |
| Expected result | **API (now):** all chores are returned with title, type, assignee, dates and status, in the sort order: overdue Tasks → Duties Pending confirmation → current Duties → upcoming by date → completed Tasks and confirmed past Duties at the bottom. **UI (deferred):** completed Tasks and confirmed past Duties are shown muted/distinct. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-18 — Chore list empty state

| Field | Value |
| --- | --- |
| User Story | US-3.5 |
| Type | Edge |
| Preconditions | Household has no chores |
| Steps | 1. Open the chore list. |
| Expected result | **API (now):** the chores list is empty. **UI (deferred):** shows "No chores yet — create your first chore" with a "+ New chore" CTA. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-19 — Calendar shows Tasks as chips and Duties as bars

| Field | Value |
| --- | --- |
| User Story | US-3.6 |
| Type | Positive |
| Preconditions | A Task with a due date and a multi-day Duty exist in the visible month |
| Steps | 1. Open the calendar (Month view). |
| Expected result | **UI (deferred):** the Task appears as a chip in its day cell; the Duty appears as a multi-day bar spanning its range; today is highlighted; month navigation works. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-20 — Calendar interactions

| Field | Value |
| --- | --- |
| User Story | US-3.6 |
| Type | Positive |
| Preconditions | A chore exists in the visible month |
| Steps | 1. Click a chore. 2. Click an empty day cell. |
| Expected result | **UI (deferred):** clicking a chore opens its detail/modal; clicking an empty day opens "+ New chore" pre-filled with that date. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-21 — Calendar empty period

| Field | Value |
| --- | --- |
| User Story | US-3.6 |
| Type | Edge |
| Preconditions | Visible month has no chores |
| Steps | 1. Navigate to a month with no chores. |
| Expected result | **UI (deferred):** calendar shows "No chores scheduled for this period". |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-22 — Edit a chore (any member)

| Field | Value |
| --- | --- |
| User Story | US-3.7 |
| Type | Positive |
| Preconditions | A chore created by another member exists |
| Steps | 1. Open the chore. 2. Change title/description/assignee/dates/status. 3. Save. |
| Expected result | **API (now):** any member can edit; the update persists and is returned to any member's fetch. **UI (deferred):** changes are reflected for all members without a refresh. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-23 — Chore type cannot be changed after creation

| Field | Value |
| --- | --- |
| User Story | US-3.7 |
| Type | Edge |
| Preconditions | A Task exists |
| Steps | 1. Open the chore in edit mode. 2. Look for a type switch. |
| Expected result | The Task/Duty type cannot be changed after creation |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-24 — Delete a chore with confirmation

| Field | Value |
| --- | --- |
| User Story | US-3.7 |
| Type | Positive |
| Preconditions | A chore exists |
| Steps | 1. Click delete. 2. Confirm in the dialog. |
| Expected result | **API (now):** the chore is removed (gone from the list and calendar data for all members). **UI (deferred):** a confirmation dialog is shown before deletion. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-25 — Filter chores by assignee and status (combined)

| Field | Value |
| --- | --- |
| User Story | US-3.8 |
| Type | Positive |
| Preconditions | Household has chores of various assignees and statuses |
| Steps | 1. Set assignee = "me". 2. Set status = "active". |
| Expected result | **API (now):** the filtered query returns only the current user's active chores; combined filters apply correctly. **UI (deferred):** the list updates instantly as filters change. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-26 — Filter result is empty

| Field | Value |
| --- | --- |
| User Story | US-3.8 |
| Type | Edge |
| Preconditions | No chore matches the chosen filters |
| Steps | 1. Apply a filter combination that matches nothing. |
| Expected result | **API (now):** the filtered result is empty. **UI (deferred):** shows "No chores match these filters" with a "Clear filters" button. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-27 — Create a chore with a description over 500 characters

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. New chore (Task or Duty). 2. title = `Clean`, description = 501 characters. 3. Save. |
| Expected result | Rejected with a validation error (description 0–500 chars); chore not created |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 4 — Issue Tracker

> **Note:** the Issues API is not yet implemented (the `issues` app currently has only a model). All cases below are `Blocked` until the API is merged.

### TC-ISSUE-01 — Create an issue with valid data

| Field | Value |
| --- | --- |
| User Story | US-4.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New issue. 2. title = `Leaking tap`, description = `Kitchen tap drips`. 3. Save. |
| Expected result | **API (now):** the issue is created with status "open", the author's name and the creation date. **UI (deferred):** it appears in the list. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-02 — Create an issue with empty title or description

| Field | Value |
| --- | --- |
| User Story | US-4.1 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. Save with empty title. 2. Save with empty description. |
| Expected result | Both rejected with an error (title 1–80, description 1–1000 required) |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-03 — View the issue list with default sort

| Field | Value |
| --- | --- |
| User Story | US-4.2 |
| Type | Positive |
| Preconditions | Household has open and resolved issues |
| Steps | 1. Open the Issues page. |
| Expected result | **API (now):** issues are returned with title, author, status and creation date, sorted Open first then Resolved, newest first within each group. **UI (deferred):** the list is shown. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-04 — Issue list empty state

| Field | Value |
| --- | --- |
| User Story | US-4.2 |
| Type | Edge |
| Preconditions | Household has no issues |
| Steps | 1. Open the Issues page. |
| Expected result | **API (now):** the issues list is empty. **UI (deferred):** shows "No issues reported — your household is running smoothly!" with a "+ Report issue" CTA. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-05 — Toggle issue status

| Field | Value |
| --- | --- |
| User Story | US-4.3 |
| Type | Positive |
| Preconditions | An open issue exists |
| Steps | 1. Change status to "resolved". 2. Change it back to "open". |
| Expected result | Any member can toggle; the updated status is visible to all members immediately |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-06 — Author edits and deletes own issue

| Field | Value |
| --- | --- |
| User Story | US-4.4 |
| Type | Positive |
| Preconditions | User is the author of an issue |
| Steps | 1. Edit the issue and save. 2. Delete it and confirm. |
| Expected result | **API (now):** the author can edit (200) and delete the issue. **UI (deferred):** delete shows a confirmation dialog. |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-07 — Edit/Delete hidden from non-authors

| Field | Value |
| --- | --- |
| User Story | US-4.4 |
| Type | Edge |
| Preconditions | An issue authored by another member |
| Steps | 1. As a different member, open that issue. |
| Expected result | **API (now):** a non-author edit/delete request is rejected (403). **UI (deferred):** the Edit/Delete buttons are not visible at all to non-authors (not merely disabled). |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-08 — Resolved issue can still be edited/deleted by author

| Field | Value |
| --- | --- |
| User Story | US-4.4 |
| Type | Edge |
| Preconditions | User authored an issue now marked "resolved" |
| Steps | 1. Edit the resolved issue. 2. Delete it. |
| Expected result | Author can still edit and delete a resolved issue |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-09 — Filter issues by status

| Field | Value |
| --- | --- |
| User Story | US-4.5 |
| Type | Positive |
| Preconditions | Household has open and resolved issues |
| Steps | 1. Set the status filter to "open", then "resolved", then "all". |
| Expected result | The list shows only issues matching the selected status |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-10 — Issue filter empty result

| Field | Value |
| --- | --- |
| User Story | US-4.5 |
| Type | Edge |
| Preconditions | No issue matches the selected status |
| Steps | 1. Select a status with no matching issues. |
| Expected result | **API (now):** the filtered result is empty. **UI (deferred):** shows "No issues match this filter — try a different status". |
| Status | Blocked |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 5 — House Rules

### TC-RULE-01 — Add a rule with valid text

| Field | Value |
| --- | --- |
| User Story | US-5.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New rule. 2. text = `No noise after 23:00`. 3. Save. |
| Expected result | **API (now):** the rule is created and returned in the shared list with its author and creation date. **UI (deferred):** it appears in the list for all members. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-RULE-02 — Add a rule with empty or too-long text

| Field | Value |
| --- | --- |
| User Story | US-5.1 |
| Type | Negative |
| Preconditions | User is a household member |
| Steps | 1. Save with empty text. 2. Save with text = 281 characters. |
| Expected result | Both rejected with an error (required, 1–280 chars) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-RULE-03 — View rules with metadata

| Field | Value |
| --- | --- |
| User Story | US-5.2 |
| Type | Positive |
| Preconditions | Household has several rules, one edited by a different member than its author |
| Steps | 1. Open the Rules page. |
| Expected result | **API (now):** rules are returned in chronological order (newest at the bottom); each includes text, author (`created_by`), `last_modified_at`, and `last_modified_by`. **UI (deferred):** last-modified-by is displayed only when it differs from the author. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-RULE-04 — Rules empty state

| Field | Value |
| --- | --- |
| User Story | US-5.2 |
| Type | Edge |
| Preconditions | Household has no rules |
| Steps | 1. Open the Rules page. |
| Expected result | **API (now):** the rules list is empty. **UI (deferred):** shows "No house rules yet — add your first agreement" with a "+ New rule" CTA. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-RULE-05 — Edit a rule (any member) updates metadata

| Field | Value |
| --- | --- |
| User Story | US-5.3 |
| Type | Positive |
| Preconditions | A rule authored by another member exists |
| Steps | 1. Edit the rule text. 2. Save. |
| Expected result | **API (now):** any member can edit; `last_modified_at` and `last_modified_by` are updated and returned. **UI (deferred):** the change is shown to all members. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-RULE-06 — Delete a rule with confirmation

| Field | Value |
| --- | --- |
| User Story | US-5.3 |
| Type | Positive |
| Preconditions | A rule exists |
| Steps | 1. Click delete. 2. Confirm in the dialog. |
| Expected result | **API (now):** the rule is removed for all members. **UI (deferred):** a confirmation dialog is shown before deletion. |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |
