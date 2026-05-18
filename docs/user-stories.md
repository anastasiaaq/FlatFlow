# FlatFlow — Functional Requirements (User Stories)

**Note 1:** The specific numbers in acceptance criteria (e.g. household name ≤ 60 characters, chore title ≤ 80, rule text ≤ 280, session expiry of 30 days) are **initial assumptions** chosen so each criterion stays testable. They will be revisited before implementation.

**Note 2:** Edit and Delete actions for the same entity (chore, issue, rule) are bundled into one story as they share the same UI surface and are typically implemented, tested together.

---

## System Constraints

Global rules that apply across the application:

- A user can belong to **at most one household** at a time.
- All members of a household have **equal permissions** over household data (chores, issues, rules and the household itself).
- Deleting the **last member** of a household deletes the household and all its data.
- When a member leaves the household, content and actions they previously authored (issues, rules, chores, completion records) **remain attributed to them**, with their name shown as **"[former member] Name"** wherever they appear.

---

## User Roles

| Role | Description |
| --- | --- |
| **Guest** | An unauthenticated visitor who does not yet have an account or is not logged in |
| **Registered user** | A user who has an account and is logged in, but does not yet belong to any household |
| **Household member** | A registered user who has joined a specific household |

---

## Epic 1. Registration & Authentication

### US-1.1 — Register a new account

**As a** guest  
**I want** to register with my email, a display name and a password  
**so that** I can create my own FlatFlow account.

**Acceptance criteria:**

- Form requires email, display name (required, 1-50 characters) and password (minimum 8 characters); empty or too-short input is rejected with an error message.
- Email must be in a **valid email format** (as accepted by HTML5 `type="email"` validation).
- Email must be unique — submitting an already-registered email shows "An account with this email already exists".
- On success, the account is created and the user is logged in automatically.

### US-1.2 — Log in

**As a** registered user  
**I want** to log in with my email and password  
**so that** I can access my household.

**Acceptance criteria:**

- Valid credentials -> successful login.
- Invalid credentials -> a generic "Invalid email or password" message (does not reveal which field is wrong).
- Session persists across page reloads; sessions expire after 30 days of inactivity.
- Post-login redirect:
  - If the user belongs to a household -> redirect to the chore list.
  - If the user does not belong to a household -> redirect to a Welcome screen with "Create household" and "Join household" actions.

### US-1.3 — Log out

**As a** registered user  
**I want** to log out of the system  
**so that** I can protect my account on a shared device.

**Acceptance criteria:**

- After clicking "Log out", the session ends and protected pages redirect to the login page.
- Logging out from an already-expired session is idempotent (no error shown).

### US-1.4 — View own profile

**As a** registered user  
**I want** to see my display name and email in my profile  
**so that** I can verify which account I am using.

**Acceptance criteria:**

- Profile page shows the current user's display name and email.

### US-1.5 — Edit my display name

**As a** registered user  
**I want** to edit my display name  
**so that** my roommates see me under the name I prefer.

**Acceptance criteria:**

- The profile has an "Edit name" action.
- New name is required, 1–50 characters; empty input is rejected with an error message.
- Updated name is immediately reflected wherever the user appears (member list, chore assignee, "marked done by", issue author, rule author / editor).

---

## Epic 2. Household Management

### US-2.1 — Create a household

**As a** registered user  
**I want** to create a new household with my own name for it  
**so that** I can bring my roommates together into a shared space.

**Acceptance criteria:**

- Name is required, 1–60 characters; empty input is rejected with an error message.
- After creation the user becomes the only member; the household name is shown on the home page.
- A permanent invite code is generated automatically for the household at the moment of creation.
- The creating user is stored as the household creator as a **display-only** attribution (e.g. "Created by Anna, 14 Mar"); no extra permissions are granted (see System Constraints — all members have equal permissions).

### US-2.2 — View the household invite code

**As a** household member  
**I want** to view and copy my household's invite code  
**so that** I can share it with my roommates so they can join.

**Acceptance criteria:**

- The household has a single, permanent invite code, generated automatically when the household is created (see US-2.1).
- The code is visible to any household member on the household page and can be copied to the clipboard with one click.
- The code does not expire and is not regenerated for the lifetime of the household.

### US-2.3 — Join a household by invite code

**As a** registered user  
**I want** to join an existing household using an invite code  
**so that** I can take part in shared living.

**Acceptance criteria:**

- Valid code -> user becomes a household member; household appears on their home page.
- **Invalid code** (does not exist) -> "Invite code not found".
- **User already in a different household** -> "You are already a member of a household. Leave it first to join another".
- **User submits the code of their own current household** -> "You are already a member of this household".

### US-2.4 — View household members

**As a** household member  
**I want** to see the list of all roommates  
**so that** I know who lives with me.

**Acceptance criteria:**

- The household page shows a list of all members with their display names.
- **Empty / solo state:** if the user is the only member, the list shows "You're the only one here yet — share your invite code to bring roommates in" with a shortcut to the invite code.

### US-2.5 — Leave a household

**As a** household member  
**I want** to leave my household  
**so that** I can stop participating in it when I move out.

**Acceptance criteria:**

- A confirmation prompt is shown before leaving.
- After leaving, the user no longer sees this household's data and other members see the updated member list.
- **Last member leaving:** per System Constraints, the household and all its data (chores, issues, rules) are deleted; the user is warned about this before confirming.
- **Chores** assigned to the leaving member become **Unassigned** (see US-3.2).
- The leaving member's prior authorship (issues, rules, chore creations, completion records) is preserved per System Constraints — they appear as **"[former member] Name"** to remaining members.

---

## Epic 3. Chore Management

### Chore types

Chores come in two types, determined at creation time:

- **Task** — a one-off chore with a single optional due date. Marked complete by clicking "Done". Examples: "Fix the leaky tap", "Take out trash by Wed", "Buy detergent".
- **Duty** — a period of responsibility, with required start and end dates. One person is on the hook for an ongoing activity during the date range. Marked complete by clicking "Mark complete" (available during or after the period) — this preserves "who actually did the work" tracking, which is the core value of the app. Examples: "Maria — dishes — Mon–Sun", "Bob — trash & recycling — this week".

Acceptance criteria below indicate where Tasks and Duties behave differently. Where a story applies equally to both, the wording uses the generic term **chore**.

### US-3.1 — Create a chore

**As a** household member  
**I want** to create a new chore (Task or Duty)  
**so that** I can add it to the shared list.

**Acceptance criteria:**

- Chore **type** (Task or Duty) is chosen at creation.
- Title is required, 1–80 characters; description is optional, up to 500 characters; empty title is rejected with an error message.
- For **Task**: due date is optional (see US-3.3).
- For **Duty**: start date and end date are both required (see US-3.3); end date must be on or after start date.
- After saving, the new chore appears in the chore list and on the calendar for all members.

### US-3.2 — Assign a chore

**As a** household member  
**I want** to assign a chore to a specific roommate  
**so that** responsibility is clearly attached to one person.

**Acceptance criteria:**

- The chore form has an assignee picker that lists all current household members; "Unassigned" is also a valid option for both Tasks and Duties.
- The assignee sees the chore highlighted as "mine" on a personal filter.
- **If the assignee leaves the household**, their active chores (both Tasks and current Duties) are automatically set to "Unassigned" (not deleted).

### US-3.3 — Set when a chore happens

**As a** household member  
**I want** to set when a chore happens  
**so that** everyone knows the schedule.

**Acceptance criteria:**

- For **Task**: due date is **optional**. Tasks without a due date are grouped under "No due date" in the list and shown in a separate panel next to the calendar.
- For **Duty**: start date and end date are both **required**; end date must be on or after start date.
- Past dates are allowed for both types (e.g. to log past work or past responsibility).
- **Overdue Tasks** (due date in the past and not Done) are marked "Overdue" with a distinct visual style and sorted first in the chore list.
- **Past Duties** (end date in the past) without confirmation become "Pending confirmation" (see US-3.4); confirmed past Duties are displayed in a muted style and sorted to the bottom.

### US-3.4 — Mark a chore as completed

**As a** household member  
**I want** to mark a chore as completed  
**so that** the household can see who actually did the work.

**Acceptance criteria:**

- Any household member can mark a chore as completed; the chore does not need to be assigned to them.
- For **Tasks**: the action is **"Done"**, available at any time.
- For **Duties**: the action is **"Mark complete"**, available during or after the duty period (i.e. from the start date onward).
- After confirmation, the chore's status becomes **"Completed"** and the chore is visually distinct in the list.
- The system records **who marked the chore completed and when**; this attribution is displayed in the chore list and chore detail view (preserving accountability tracking that is the core value of the app).
- **Duty edge case:** if a Duty's end date passes without anyone marking it complete, its status automatically becomes **"Pending confirmation"** — distinct from both Active and Completed — so the household can see the period went unaccounted-for. The Duty can still be marked complete from this state.
- To reopen a Completed chore back to Active, any member can edit the status field (see US-3.7).

### US-3.5 — View the chore list

**As a** household member  
**I want** to view the shared list of all chores with their statuses  
**so that** I can see the overall picture.

**Acceptance criteria:**

- The "Chores" page shows all chores (both Tasks and Duties) with title, type, assignee, dates (due date for Tasks; start–end for Duties) and status.
- **Default sort:** Overdue Tasks first, then Duties **Pending confirmation**, then current Duties (date range includes today), then upcoming items by date, with Completed Tasks and confirmed past Duties at the bottom.
- **Empty state:** if no chores exist yet, the page shows "No chores yet — create your first chore" with a "+ New chore" CTA.

### US-3.6 — View chores on a calendar

**As a** household member  
**I want** to view chores on a calendar  
**so that** I can plan my week and month.

**Acceptance criteria:**

- Single **Month** view.
- **Tasks** appear as chips inside their day cell.
- **Duties** appear as multi-day bars spanning their date range across cells.
- Today's date is visually highlighted; navigation between months works.
- Clicking a chore opens its detail view (or a modal); clicking an empty day opens "+ New chore" pre-filled with that date.
- Tasks without a due date are listed in a separate "No due date" panel next to the calendar.
- **Empty period:** if the visible period has no chores, the calendar shows "No chores scheduled for this period".

### US-3.7 — Edit or delete a chore

**As a** household member  
**I want** to edit or delete a chore  
**so that** I can fix a mistake, reopen a completed chore, or remove an outdated chore.

**Acceptance criteria:**

- **Any household member** can edit and delete any chore — chores are shared property of the household.
- For **Task**: editable fields are title, description, assignee, due date and status.
- For **Duty**: editable fields are title, description, assignee, start date, end date and status.
- The chore type (Task / Duty) **cannot be changed** after creation — delete and re-create if a change is needed.
- Editing the status field allows reopening a Completed chore back to Active.
- Delete requires a confirmation dialog.
- Changes are visible to all members immediately; a deleted chore disappears from both the list and the calendar.

### US-3.8 — Filter the chore list

**As a** household member  
**I want** to filter chores by assignee and status  
**so that** I can quickly find what is relevant to me right now.

**Acceptance criteria:**

- Filter controls: **assignee** (any / specific member / unassigned / me), **status** (active / completed / overdue / pending confirmation / all). Filters can be combined.
- Status semantics across types:
  - **Active** = Task not yet Done, or Duty whose date range includes today (or starts in the future).
  - **Completed** = Task marked Done, or Duty marked complete.
  - **Overdue** = Task whose due date is in the past and not yet Done (applies to Tasks only).
  - **Pending confirmation** = Duty whose end date has passed without being marked complete (applies to Duties only).
- The list updates instantly when filters change.
- **Empty filter result:** if no chore matches the active filters, the page shows "No chores match these filters" with a "Clear filters" button.

---

## Epic 4. Issue Tracker

### US-4.1 — Create an issue

**As a** household member  
**I want** to create an issue with a title and description  
**so that** I can report a household problem (e.g. a leaking tap).

**Acceptance criteria:**

- Title is required (1–80 characters) and description is required (1–1000 characters); empty input is rejected with an error message.
- After saving, the issue appears in the list with status "open", the author's name and the creation date.

### US-4.2 — View the issue list

**As a** household member  
**I want** to view the list of all issues in our household  
**so that** I am aware of current problems.

**Acceptance criteria:**

- The "Issues" page shows all issues with title, author, status and creation date.
- **Default sort:** Open issues first, then Resolved; within each group, newest first.
- **Empty state:** if no issues exist, the page shows "No issues reported — your household is running smoothly!" with a "+ Report issue" CTA.

### US-4.3 — Change issue status

**As a** household member  
**I want** to change an issue's status between "open" and "resolved"  
**so that** I can mark the problem as fixed.

**Acceptance criteria:**

- Any household member can toggle status between "open" and "resolved" (a resolved issue can be reopened).
- The updated status is visible to all members immediately.

### US-4.4 — Edit or delete own issue

**As an** issue author  
**I want** to edit or delete my own issue  
**so that** I can fix a typo or remove an irrelevant report.

**Acceptance criteria:**

- **Permission edge:** Edit and Delete buttons are visible **only to the author**; other members do not see them at all (rather than seeing a disabled button).
- Delete requires a confirmation dialog.
- Resolved issues can still be edited or deleted by their author.

### US-4.5 — Filter the issue list

**As a** household member  
**I want** to filter issues by status  
**so that** I can focus on unresolved problems.

**Acceptance criteria:**

- Filter control: status (all / open / resolved).
- **Empty filter result:** if no issue matches the selected status, the page shows "No issues match this filter — try a different status".

---

## Epic 5. House Rules

Stories that allow roommates to record their shared agreements in one place.

### US-5.1 — Add a house rule

**As a** household member  
**I want** to add a new house rule (e.g. "no noise after 23:00")  
**so that** the agreement between roommates is recorded.

**Acceptance criteria:**

- Rule text is required, 1–280 characters; empty input is rejected with an error message.
- The system records the rule's **author** (the member who added it) and the creation date.
- After saving, the rule appears in the shared list and is visible to all members.

### US-5.2 — View house rules

**As a** household member  
**I want** to view the full list of rules of our apartment  
**so that** I know the current agreements.

**Acceptance criteria:**

- The "Rules" page shows all rules in chronological order (new rules appended at the bottom).
- Each rule displays: its text, the **author**, the **last-modified date** and (when different from the author) the **last-modified-by** member.
- **Empty state:** if no rules exist, the page shows "No house rules yet — add your first agreement" with a "+ New rule" CTA.

### US-5.3 — Edit or delete a rule

**As a** household member  
**I want** to edit or delete a rule  
**so that** the list stays up to date when agreements change.

**Acceptance criteria:**

- **Any household member** can edit and delete any rule — rules are shared property of the household.
- Delete requires a confirmation dialog.
- After editing, the rule's **last-modified date and last-modified-by member** are updated and displayed to all members on the Rules page (see US-5.2).

---

This set of stories covers the **MVP scope** defined in the "Concept & MVP" section and does not include any functionality listed under **Excluded from MVP** (karma / gamification, anonymous issue reporting, voting on rules, shared expense tracking, push / email notifications, mobile application).

**Also not in MVP scope:** password recovery / "forgot password" flow is intentionally not covered by any story above and is a known MVP limitation.
