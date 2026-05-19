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
- Cloud deployment on AWS EC2

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

### High Priority

These features are essential for the MVP release:

- User authentication
- Household creation and joining
- Chore management
- Chore calendar
- Issue tracker
- House rules

### Medium Priority

These features are useful but can be simplified if time is limited:

- Advanced filtering
- Calendar UI polish

### Low Priority / Post-MVP

These features are excluded from the MVP:

- Anonymous issue reporting
- Rule voting
- Shared expense tracking
- Native mobile application