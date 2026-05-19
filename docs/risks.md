# Project Risks & Mitigation Strategies

## Risk 1 — Scope Creep

### Description

The project includes many interconnected features such as authentication, chores, calendar scheduling, issue tracking, and house rules. Additional ideas such as shared expense tracking may increase workload beyond the planned 6-week MVP timeline.

### Impact

- Delayed delivery
- Incomplete core features
- Reduced testing quality
- Increased technical debt

### Mitigation Strategy

- Strictly follow the defined MVP scope.
- Treat excluded features as post-MVP backlog items.
- Prioritize core flows first:
  1. authentication,
  2. households,
  3. chores and duties,
  4. issue tracking and house rules.
- Freeze feature scope after Week 2 unless a critical issue appears.

---

## Risk 2 — Complex Calendar Implementation

### Description

Rendering chores and multi-day duties inside a calendar UI may become more technically difficult than expected. Features such as month-grid rendering, multi-day duty bars, overdue highlighting, and click-to-create interactions increase frontend complexity.

### Impact

- Delays in frontend implementation
- Poor user experience
- Increased bug count in date handling
- Reduced testing time for other features

### Mitigation Strategy

- Use an existing calendar library instead of building the calendar from scratch.
- Implement a simplified month-only calendar for the MVP.
- Build a list-based chore and duty view before implementing the calendar UI.
- Treat advanced calendar functionality as optional if development falls behind schedule.
- Prioritize functional scheduling over advanced visual polish.

---

## Risk 3 — Task vs Duty Semantic Complexity

### Description

The application distinguishes between one-off Tasks and time-ranged Duties. These types have different status transitions, sorting rules, filters, and calendar behavior. This increases the risk of inconsistent logic between the backend, frontend, and calendar UI.

### Impact

- Inconsistent chore behavior
- Bugs in filtering and sorting
- Incorrect calendar rendering
- Increased debugging complexity

### Mitigation Strategy

- Define status state diagrams for Tasks and Duties before implementation.
- Implement status logic in a centralized backend service instead of duplicating logic across views.
- Add unit tests for all status transitions before building the calendar UI.
- Reuse shared status utilities between backend and frontend where possible.