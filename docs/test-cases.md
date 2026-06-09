# FlatFlow — Test Cases

Goes with [`test-plan.md`](./test-plan.md). Each case is one table. During a run fill `Status`; on `Fail` fill `Actual result` and a suggested `Severity` (then turned into a bug card with assigned Priority).

- **Status:** `Not Run` / `Pass` / `Fail` / `Blocked`
- **Type:** `Positive` (happy path) / `Negative` (invalid input rejected) / `Edge` (boundary / special state)
- **ID:** `TC-<MODULE>-<NN>` — `AUTH`, `PROF`, `HH`, `CHORE`, `ISSUE`, `RULE`

Acceptance criteria source: [`user-stories.md`](./user-stories.md).

---

## Epic 1 — Registration & Authentication

### TC-AUTH-01 — Successful registration with valid data

| Field | Value |
| --- | --- |
| User Story | US-1.1 |
| Type | Positive |
| Preconditions | Email `new@flat.com` is not registered |
| Steps | 1. Open the registration form. 2. email = `new@flat.com`, name = `Anna`, password = `password123`. 3. Submit. |
| Expected result | Account created, user logged in automatically, redirected to the Welcome screen (no household yet) |
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
| Expected result | Submission rejected with a validation error (HTML5 `type="email"`); no account created |
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
| Expected result | Login succeeds; redirected to the chore list |
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
| Expected result | Login succeeds; redirected to the Welcome screen with "Create household" and "Join household" actions |
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
| Expected result | Generic error **"Invalid email or password"** (does not reveal which field is wrong); not logged in |
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
| Expected result | User remains logged in (session persists) |
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
| Expected result | Session ends; protected page redirects to login |
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
| Expected result | No error shown; user ends on the login page |
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
| Expected result | Profile shows the current user's display name and email |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-PROF-02 — Edit display name with a valid value

| Field | Value |
| --- | --- |
| User Story | US-1.5 |
| Type | Positive |
| Preconditions | User is logged in and is a member of a household |
| Steps | 1. Open profile. 2. Click "Edit name". 3. Enter `Anna B.`. 4. Save. |
| Expected result | Name updated and reflected everywhere the user appears (member list, chore assignee, "marked done by", issue author, rule author) |
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

### TC-HH-01 — Create a household with a valid name

| Field | Value |
| --- | --- |
| User Story | US-2.1 |
| Type | Positive |
| Preconditions | Registered user not in any household |
| Steps | 1. Open "Create household". 2. name = `Flat 12`. 3. Submit. |
| Expected result | User becomes the only member; household name shown on home page; an invite code is generated automatically; "Created by … " attribution is shown (display-only) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-02 — Create a household with empty or too-long name

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

### TC-HH-03 — Create a household while already a member of one

| Field | Value |
| --- | --- |
| User Story | US-2.1 (System Constraint: at most one household) |
| Type | Edge |
| Preconditions | User already belongs to a household |
| Steps | 1. Attempt to create a new household. |
| Expected result | Action blocked with an error; user stays in their current household (a user can belong to at most one household) |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-04 — View and copy the invite code

| Field | Value |
| --- | --- |
| User Story | US-2.2 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. Open the household page. 2. Click the copy button next to the invite code. |
| Expected result | Invite code is visible; one click copies it to the clipboard |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-05 — Invite code is permanent and not regenerated

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

### TC-HH-06 — Join a household with a valid invite code

| Field | Value |
| --- | --- |
| User Story | US-2.3 |
| Type | Positive |
| Preconditions | User is logged in and not in a household; a valid code exists |
| Steps | 1. Open "Join household". 2. Enter the valid code. 3. Confirm. |
| Expected result | User becomes a member; the household appears on their home page |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-07 — Join with a non-existent invite code

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

### TC-HH-08 — Join while already in a different household

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

### TC-HH-09 — Join using own current household's code

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

### TC-HH-10 — View household members

| Field | Value |
| --- | --- |
| User Story | US-2.4 |
| Type | Positive |
| Preconditions | Household has 2+ members |
| Steps | 1. Open the household page. |
| Expected result | A list of all members with their display names is shown |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-11 — Member list, solo state

| Field | Value |
| --- | --- |
| User Story | US-2.4 |
| Type | Edge |
| Preconditions | User is the only member |
| Steps | 1. Open the household page. |
| Expected result | Shows "You're the only one here yet — share your invite code to bring roommates in" with a shortcut to the invite code |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-12 — Leave a household (not the last member)

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Positive |
| Preconditions | User is a member of a household with other members |
| Steps | 1. Click "Leave household". 2. Confirm in the prompt. |
| Expected result | After leaving, the user no longer sees the household's data; remaining members see the updated member list |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-13 — Last member leaving deletes the household

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Edge |
| Preconditions | User is the only member; household has chores/issues/rules |
| Steps | 1. Click "Leave household". 2. Read the warning. 3. Confirm. |
| Expected result | User is warned data will be deleted; on confirm the household and all its data (chores, issues, rules) are deleted |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-HH-14 — Leaving member's chores become Unassigned

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

### TC-HH-15 — Former member's authorship is preserved

| Field | Value |
| --- | --- |
| User Story | US-2.5 |
| Type | Edge |
| Preconditions | User authored an issue/rule and completed a chore, then left the household |
| Steps | 1. A remaining member views those items. |
| Expected result | Authorship is preserved and shown as "[former member] Name" |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 3 — Chore Management

### TC-CHORE-01 — Create a Task with a valid title

| Field | Value |
| --- | --- |
| User Story | US-3.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New chore. 2. type = Task, title = `Buy detergent`. 3. Save (no due date). |
| Expected result | Task is created and appears in the chore list and on the calendar for all members |
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
| Expected result | Duty is created and appears in the list and on the calendar as a multi-day item |
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
| Expected result | Bob sees the chore highlighted as "mine" on the personal filter |
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
| Expected result | The Task is grouped under "No due date" in the list and shown in the separate panel next to the calendar |
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
| Expected result | The Task is marked "Overdue" with a distinct style and sorted first |
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
| Expected result | Status becomes "Completed", the chore is visually distinct, and the system records who marked it and when (shown in list and detail) |
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
| Expected result | Status becomes "Completed"; who/when is recorded and displayed |
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
| Expected result | The "Mark complete" action is not available before the start date |
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
| Expected result | The chore returns to Active and is shown accordingly |
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
| Expected result | All chores show title, type, assignee, dates and status; sort order is: overdue Tasks → Duties Pending confirmation → current Duties → upcoming by date → completed Tasks and confirmed past Duties at the bottom |
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
| Expected result | Shows "No chores yet — create your first chore" with a "+ New chore" CTA |
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
| Expected result | The Task appears as a chip in its day cell; the Duty appears as a multi-day bar spanning its range; today is highlighted; month navigation works |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-20 — Calendar interactions

| Field | Value |
| --- | --- |
| User Story | US-3.6 |
| Type | Positive |
| Preconditions | A chore exists in the visible month |
| Steps | 1. Click a chore. 2. Click an empty day cell. |
| Expected result | Clicking a chore opens its detail/modal; clicking an empty day opens "+ New chore" pre-filled with that date |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-21 — Calendar empty period

| Field | Value |
| --- | --- |
| User Story | US-3.6 |
| Type | Edge |
| Preconditions | Visible month has no chores |
| Steps | 1. Navigate to a month with no chores. |
| Expected result | Calendar shows "No chores scheduled for this period" |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-CHORE-22 — Edit a chore (any member)

| Field | Value |
| --- | --- |
| User Story | US-3.7 |
| Type | Positive |
| Preconditions | A chore created by another member exists |
| Steps | 1. Open the chore. 2. Change title/description/assignee/dates/status. 3. Save. |
| Expected result | Any member can edit; changes are visible to all members immediately |
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
| Expected result | A confirmation dialog appears; after confirming, the chore disappears from both the list and the calendar for all members |
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
| Expected result | List updates instantly to show only the current user's active chores; filters combine correctly |
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
| Expected result | Shows "No chores match these filters" with a "Clear filters" button |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

---

## Epic 4 — Issue Tracker

### TC-ISSUE-01 — Create an issue with valid data

| Field | Value |
| --- | --- |
| User Story | US-4.1 |
| Type | Positive |
| Preconditions | User is a household member |
| Steps | 1. New issue. 2. title = `Leaking tap`, description = `Kitchen tap drips`. 3. Save. |
| Expected result | Issue appears in the list with status "open", the author's name and the creation date |
| Status | Not Run |
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
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-03 — View the issue list with default sort

| Field | Value |
| --- | --- |
| User Story | US-4.2 |
| Type | Positive |
| Preconditions | Household has open and resolved issues |
| Steps | 1. Open the Issues page. |
| Expected result | All issues show title, author, status and creation date; sort is Open first then Resolved, newest first within each group |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-04 — Issue list empty state

| Field | Value |
| --- | --- |
| User Story | US-4.2 |
| Type | Edge |
| Preconditions | Household has no issues |
| Steps | 1. Open the Issues page. |
| Expected result | Shows "No issues reported — your household is running smoothly!" with a "+ Report issue" CTA |
| Status | Not Run |
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
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-06 — Author edits and deletes own issue

| Field | Value |
| --- | --- |
| User Story | US-4.4 |
| Type | Positive |
| Preconditions | User is the author of an issue |
| Steps | 1. Edit the issue and save. 2. Delete it and confirm. |
| Expected result | Author can edit; delete requires a confirmation dialog and removes the issue |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-07 — Edit/Delete hidden from non-authors

| Field | Value |
| --- | --- |
| User Story | US-4.4 |
| Type | Edge |
| Preconditions | An issue authored by another member |
| Steps | 1. As a different member, open that issue. |
| Expected result | Edit and Delete buttons are not visible at all to non-authors (not merely disabled) |
| Status | Not Run |
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
| Status | Not Run |
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
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |

### TC-ISSUE-10 — Issue filter empty result

| Field | Value |
| --- | --- |
| User Story | US-4.5 |
| Type | Edge |
| Preconditions | No issue matches the selected status |
| Steps | 1. Select a status with no matching issues. |
| Expected result | Shows "No issues match this filter — try a different status" |
| Status | Not Run |
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
| Expected result | Rule appears in the shared list, visible to all members, with its author and creation date recorded |
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
| Expected result | Rules shown in chronological order (newest at the bottom); each shows text, author, last-modified date, and last-modified-by (when different from the author) |
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
| Expected result | Shows "No house rules yet — add your first agreement" with a "+ New rule" CTA |
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
| Expected result | Any member can edit; the last-modified date and last-modified-by are updated and shown to all members |
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
| Expected result | A confirmation dialog appears; after confirming, the rule is removed for all members |
| Status | Not Run |
| Actual result (if Fail) | |
| Severity (if Fail) | |
