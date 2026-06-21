# Non-Functional Requirements

## 1. Supported Technologies & Platforms

### Frontend

- React (TypeScript)

### Backend

- Django REST Framework

### Database

- PostgreSQL

### Authentication

- Email/password authentication
- Password hashing using industry-standard password hashing algorithms
- Session-based authentication with secure HTTP-only cookies

### Deployment

- Docker & Docker Compose
- Cloud deployment on Hetzner Cloud VPS

### Supported Browsers

- Latest versions of:
  - Google Chrome
  - Mozilla Firefox
  - Microsoft Edge
  - Safari

---

## 2. Non-Functional Requirements

### NFR-1 — Performance

- Household pages with up to 100 chores, 50 issues, and 50 rules should load in under 2 seconds on a standard broadband connection.
- The calendar month view should render in under 1 second for households with up to 200 chores.

---

### NFR-2 — Security

- All production traffic must use HTTPS.
- Authentication must use secure HTTP-only cookies.
- CSRF protection must be enabled for authenticated state-changing requests.
- User-generated content, such as display names, chore titles, issue descriptions, and rule text, must be escaped or sanitized before rendering to prevent XSS.
- Household data must only be accessible to authenticated members of that household.
- Login endpoints must enforce rate limiting to reduce brute-force attacks (e.g. maximum 10 failed login attempts per IP address within 15 minutes).

---

### NFR-3 — Reliability

- Data entered by users must be saved immediately after successful submission.
- Failed API requests must return meaningful HTTP status codes and user-friendly error messages.

---

### NFR-4 — Usability & Responsiveness

- Main application pages must display correctly at screen widths of 360 px, 768 px, and 1280 px.
- Users must be able to complete core flows on mobile devices without horizontal scrolling.
- Navigation menus and forms must remain fully usable on touch devices.

---

### NFR-5 — Maintainability

- Backend code should follow a layered structure such as views, serializers, services, and repositories.
- Frontend components should be reusable and modular.
- The project should use Git version control with pull requests and code reviews.
- Environment-specific configuration must be stored in environment variables instead of hardcoded values.

### NFR-6 — Time Zone Handling

- All dates and times must be stored in UTC in the backend.
- The frontend should display dates according to the user’s browser local time zone.
- “Today”, “overdue”, and calendar highlighting should be calculated consistently based on the user’s local time zone.

---

### NFR-7 — Localization

- The MVP interface will be implemented in English.
- Ukrainian localization may be added after the MVP.
- User-facing text should be centralized where possible to make future translation easier.

---

### NFR-8 — Backup and Data Loss

- PostgreSQL data should be backed up regularly in production.
- For the MVP, manual backups are acceptable.
- Users should not lose submitted data after a successful save operation.

### NFR-9 — Accessibility

- Interactive elements such as buttons, forms, and navigation menus must be accessible using keyboard navigation.
- Text and interactive UI elements should meet WCAG AA contrast recommendations for normal text.

---

## 3. MVP Priorities

User Stories are sorted into four categories per the project's prioritization method: features that are essential (Critical), valuable but not minimum (Important), nice-to-have (Desirable), and consciously rejected (Deferred).

### Critical — MVP must-ship

These features are essential for the MVP release:

- Authentication: US-1.1 (register), US-1.2 (login), US-1.3 (logout)
- Household: US-2.1 (create), US-2.2 (view invite code), US-2.3 (join), US-2.4 (view members), US-2.5 (leave)
- Chores: US-3.1 (create), US-3.2 (assign), US-3.3 (set dates), US-3.4 (mark completed), US-3.5 (view list), US-3.7 (edit/delete)
- Chore calendar: US-3.6
- Issues: US-4.1 (create), US-4.2 (view list), US-4.3 (change status), US-4.4 (edit/delete own)
- House rules: US-5.1 (add), US-5.2 (view), US-5.3 (edit/delete)

### Important — ship if Critical is on track

Significant value, but not part of the absolute minimum. Implemented once Critical is confirmed achievable within the timeline.

- US-1.4 (view own profile)
- US-1.5 (edit display name)
- US-3.8 (filter chores by assignee and status)

### Desirable — only if time remains

Nice additions with minor impact on core functionality.

- US-4.5 (filter issues by status)

### Deferred — consciously rejected for this practice

Requirements that were considered and intentionally excluded from the 6-week scope, with reasoning recorded to prevent scope creep:

- Karma / gamification — outside MVP value proposition; core chore-completion tracking already covers accountability
- Anonymous issue reporting — adds permission complexity for marginal value at this scale
- Voting on rules — requires notification and consensus-UI patterns that are out of scope
- Shared expense tracking — separate domain that would constitute a full epic on its own
- Push and email notifications — requires email/push infrastructure (SMTP, FCM/APNS)
- Native mobile application — responsive web interface (see NFR-4) covers MVP mobile needs
- Password recovery / "forgot password" flow — requires email infrastructure (also noted at the end of user-stories.md as a known MVP limitation)
