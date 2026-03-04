# Abeja -- Figma Redesign Test Cases

**Project:** Abeja
**Scope:** Figma redesign QA -- Inbox View, Tab System, Priority System, Task Rows, Sidebar, Responsive Layout
**Dev URL:** http://localhost:3000
**Auth:** Cookie `abeja_auth`, password `abeja2026`
**Date:** 2026-02-26

---

## Current State Reference

Before the redesign, the application uses:
- **Tabs:** "Abiertas" / "Completadas" / "Todas" (via query param `?status=open|done|all`)
- **Task rows:** StatusIcon (circle) | TypeBadge | title + TagPills | Initials avatar | date
- **Sidebar:** Inicio, Tareas nav items; collapsible DomainGroups with SpaceLinks showing hex icon + name + count
- **Data model:** Task has `status` (open/done), `type`, `assignee` (nullable string), `tags[]`, `deadline`, `createdAt`. No `priority` field exists in schema yet.
- **Mobile:** Drawer sidebar (280px) toggled via hamburger; desktop sidebar at 220px.

---

## 1. Inbox View

### TC-001: Inbox loads and displays tasks from all spaces
**Feature:** Inbox View
**Priority:** P0
**Preconditions:** User is authenticated. Multiple spaces exist with open tasks.
**Steps:**
1. Navigate to http://localhost:3000/inbox (or click "Inbox" in sidebar)
2. Wait for page to fully load
**Expected Result:** The Inbox view renders with the header text "Inbox". Tasks from all spaces are listed together in a single unified list, ordered by creation date descending. Tasks from different domains/spaces are interleaved based on recency, not grouped by space.
**Devices:** All

### TC-002: Inbox header displays dropdown chevron
**Feature:** Inbox View
**Priority:** P1
**Preconditions:** User is authenticated.
**Steps:**
1. Navigate to Inbox view
2. Observe the page header
**Expected Result:** The header shows the text "Inbox" accompanied by a downward-pointing chevron icon to the right, indicating a dropdown menu is available.
**Devices:** All

### TC-003: Inbox empty state when no tasks exist
**Feature:** Inbox View
**Priority:** P1
**Preconditions:** User is authenticated. All spaces have zero open tasks (all tasks are completed or no tasks exist).
**Steps:**
1. Navigate to Inbox view
**Expected Result:** An empty state is displayed with a meaningful message (e.g., "Sin tareas pendientes" or equivalent). No broken layout, no empty table, no console errors.
**Devices:** All

### TC-004: Inbox count in sidebar matches actual task count
**Feature:** Inbox View
**Priority:** P0
**Preconditions:** User is authenticated. There are exactly N open tasks across all spaces.
**Steps:**
1. Count the total open tasks across all spaces (via API: `GET /api/task?status=open`)
2. Observe the Inbox item in the sidebar
3. Navigate to Inbox and count visible tasks
**Expected Result:** The sidebar Inbox badge count matches the total open tasks returned by the API. The number of task rows rendered in the Inbox view also matches.
**Devices:** All

### TC-005: Inbox sidebar item shows envelope icon
**Feature:** Inbox View
**Priority:** P1
**Preconditions:** User is authenticated.
**Steps:**
1. Look at the sidebar navigation
2. Locate the "Inbox" item
**Expected Result:** The Inbox nav item displays an envelope icon to the left of the text "Inbox", consistent with the Figma design. The icon is properly sized (14x14 or similar) and uses the correct color token.
**Devices:** All

### TC-006: Inbox count updates when a new task is created
**Feature:** Inbox View
**Priority:** P0
**Preconditions:** User is authenticated. Current Inbox count is N.
**Steps:**
1. Note the current Inbox badge count in the sidebar
2. Create a new task via the "Nueva tarea" button or API POST
3. Navigate back to Inbox (or observe if count updates live)
**Expected Result:** After page refresh or navigation, the Inbox sidebar count increments to N+1. The new task appears at the top of the Inbox task list.
**Devices:** All

### TC-007: Inbox count updates when a task is completed
**Feature:** Inbox View
**Priority:** P0
**Preconditions:** User is authenticated. There is at least one open task. Current Inbox count is N.
**Steps:**
1. Note the current Inbox count
2. Mark a task as done (change status to "done")
3. Return to Inbox
**Expected Result:** The Inbox sidebar count decrements to N-1. The completed task no longer appears in the default Inbox view (assuming Inbox defaults to showing active tasks).
**Devices:** All

### TC-008: Inbox loads tasks across spaces with correct space attribution
**Feature:** Inbox View
**Priority:** P1
**Preconditions:** Tasks exist in at least 3 different spaces (e.g., "Finca Legal", "Blog", "SEO").
**Steps:**
1. Navigate to Inbox
2. Identify tasks from each space
**Expected Result:** Each task row includes sufficient context to identify its originating space (via color coding, breadcrumb, or label). Tasks from all spaces are present.
**Devices:** All

### TC-009: Inbox handles large task volumes without performance degradation
**Feature:** Inbox View
**Priority:** P2
**Preconditions:** 200+ open tasks exist across all spaces.
**Steps:**
1. Navigate to Inbox
2. Observe load time and scroll performance
**Expected Result:** The page loads within 3 seconds. Scrolling is smooth (60fps). If pagination or virtualization is implemented, it functions correctly.
**Devices:** Desktop

### TC-010: Inbox is accessible via direct URL
**Feature:** Inbox View
**Priority:** P1
**Preconditions:** User is authenticated.
**Steps:**
1. Type http://localhost:3000/inbox directly in the browser address bar
2. Press Enter
**Expected Result:** The Inbox view loads correctly without requiring prior navigation through the sidebar. The sidebar "Inbox" item is highlighted as active.
**Devices:** All

### TC-011: Inbox header dropdown chevron is interactive
**Feature:** Inbox View
**Priority:** P2
**Preconditions:** User is authenticated. Inbox view is loaded.
**Steps:**
1. Click the chevron icon next to "Inbox" in the header
**Expected Result:** A dropdown menu appears (per Figma). If the dropdown is not yet implemented, the chevron should still render correctly and not throw errors on click.
**Devices:** All

### TC-012: Inbox respects authentication -- unauthenticated access redirected
**Feature:** Inbox View
**Priority:** P0
**Preconditions:** User is NOT authenticated (no `abeja_auth` cookie).
**Steps:**
1. Open a private/incognito browser window
2. Navigate to http://localhost:3000/inbox
**Expected Result:** The user is redirected to a login page or shown an authentication prompt. The Inbox data is not exposed.
**Devices:** All

---

## 2. Tab System

### TC-100: "Activas" tab is displayed and active by default
**Feature:** Tab System
**Priority:** P0
**Preconditions:** User is authenticated. Inbox or Tasks view is loaded.
**Steps:**
1. Navigate to the Inbox or Tasks view
2. Observe the tab bar
**Expected Result:** Three tabs are visible: "Activas", "Delegadas", "Finalizadas". The "Activas" tab is active/highlighted by default, showing open tasks.
**Devices:** All

### TC-101: Tab labels match Figma spec exactly
**Feature:** Tab System
**Priority:** P1
**Preconditions:** User is authenticated.
**Steps:**
1. Navigate to Inbox/Tasks view
2. Read tab labels
**Expected Result:** Tabs read "Activas", "Delegadas", and "Finalizadas" exactly. The old labels "Abiertas", "Completadas", "Todas" no longer appear.
**Devices:** All

### TC-102: Each tab shows count in parentheses
**Feature:** Tab System
**Priority:** P0
**Preconditions:** User is authenticated. Tasks exist with varying statuses and assignee states.
**Steps:**
1. Navigate to Inbox
2. Observe each tab label
**Expected Result:** Each tab displays its label followed by a count in parentheses, e.g., "Activas (12)", "Delegadas (5)", "Finalizadas (8)". Counts are numeric and reflect real data.
**Devices:** All

### TC-103: Switching to "Activas" tab shows only open tasks
**Feature:** Tab System
**Priority:** P0
**Preconditions:** Both open and completed tasks exist.
**Steps:**
1. Navigate to Inbox
2. Click "Finalizadas" tab first
3. Click "Activas" tab
**Expected Result:** Only tasks with status "open" (and no completion) are displayed. The task list updates without a full page reload. The "Activas" tab is visually highlighted.
**Devices:** All

### TC-104: Switching to "Delegadas" tab shows only tasks with an assignee
**Feature:** Tab System
**Priority:** P0
**Preconditions:** Some tasks have an assignee set, others do not.
**Steps:**
1. Navigate to Inbox
2. Click "Delegadas" tab
**Expected Result:** Only tasks that have a non-null, non-empty `assignee` field are displayed. Tasks without an assignee are excluded. Each visible task row shows the assignee full name.
**Devices:** All

### TC-105: Switching to "Finalizadas" tab shows only completed tasks
**Feature:** Tab System
**Priority:** P0
**Preconditions:** Some tasks have status "done".
**Steps:**
1. Navigate to Inbox
2. Click "Finalizadas" tab
**Expected Result:** Only tasks with status "done" are displayed. Task text appears with completed styling (e.g., muted color, strikethrough, or other visual indicator). The "Finalizadas" tab is highlighted.
**Devices:** All

### TC-106: Tab counts are accurate for "Delegadas"
**Feature:** Tab System
**Priority:** P0
**Preconditions:** Database contains exactly M tasks with assignee and N tasks without assignee.
**Steps:**
1. Navigate to Inbox
2. Read the count next to "Delegadas"
3. Click "Delegadas" and count displayed rows
**Expected Result:** The count in "Delegadas (M)" matches the number of task rows shown. Verify M equals the count of tasks where `assignee IS NOT NULL AND assignee != ''`.
**Devices:** All

### TC-107: Tab counts update after task mutation
**Feature:** Tab System
**Priority:** P1
**Preconditions:** Activas count is N.
**Steps:**
1. Note the "Activas" tab count
2. Complete one task (mark as done)
3. Observe tab counts
**Expected Result:** "Activas" count decrements by 1. "Finalizadas" count increments by 1. If the completed task had an assignee, "Delegadas" count may also update accordingly.
**Devices:** All

### TC-108: Rapid tab switching does not cause race conditions
**Feature:** Tab System
**Priority:** P1
**Preconditions:** User is authenticated. Tasks exist in all categories.
**Steps:**
1. Click "Activas" tab
2. Immediately click "Delegadas" tab (within 200ms)
3. Immediately click "Finalizadas" tab (within 200ms)
4. Wait for final render
**Expected Result:** The view settles on "Finalizadas" showing only completed tasks. No stale data from "Activas" or "Delegadas" is displayed. No console errors. No flickering or mixed content.
**Devices:** All

### TC-109: Tab active state is visually distinct
**Feature:** Tab System
**Priority:** P1
**Preconditions:** User is authenticated.
**Steps:**
1. Navigate to Inbox
2. Click each tab one at a time
**Expected Result:** The active tab has a clearly different visual state (e.g., bold text, background highlight, underline, or accent color) compared to inactive tabs. The inactive tabs are visually muted.
**Devices:** All

### TC-110: "Delegadas" tab with zero delegated tasks shows empty state
**Feature:** Tab System
**Priority:** P1
**Preconditions:** No tasks have an assignee (all assignee fields are null).
**Steps:**
1. Navigate to Inbox
2. Click "Delegadas" tab
**Expected Result:** The tab shows "Delegadas (0)" and the task list area shows an empty state message. No broken layout.
**Devices:** All

### TC-111: Tab state persists across navigation
**Feature:** Tab System
**Priority:** P2
**Preconditions:** User is on "Delegadas" tab.
**Steps:**
1. Click "Delegadas" tab
2. Click a task to view its detail
3. Press browser back button
**Expected Result:** The user returns to the Inbox with "Delegadas" tab still active (or the URL params reflect the previously selected tab).
**Devices:** All

### TC-112: Tabs work with search/filter combination
**Feature:** Tab System
**Priority:** P2
**Preconditions:** Tasks exist matching a search query in both "Activas" and "Delegadas" categories.
**Steps:**
1. Enter a search term in the search box
2. Switch between tabs
**Expected Result:** The search filter is applied in conjunction with the tab filter. Switching tabs retains the search query and refines results per the selected tab.
**Devices:** All

---

## 3. Priority System

### TC-200: Priority diamond indicator is displayed in task row
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with a priority value set.
**Steps:**
1. Navigate to Inbox or Tasks view
2. Observe the first column of a task row
**Expected Result:** A diamond-shaped indicator appears as the first element in the task row, before the creation date. The diamond is small, visually consistent with Figma (approximately 10-12px).
**Devices:** All

### TC-201: Red diamond for "urgent" priority
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with priority = "urgent".
**Steps:**
1. Locate the urgent-priority task in the list
**Expected Result:** The diamond indicator is filled/colored red (`#d4636c` or similar). The color is clearly distinguishable from other priorities.
**Devices:** All

### TC-202: Yellow diamond for "high" priority
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with priority = "high".
**Steps:**
1. Locate the high-priority task in the list
**Expected Result:** The diamond indicator is colored yellow/amber.
**Devices:** All

### TC-203: Blue diamond for "normal" priority
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with priority = "normal".
**Steps:**
1. Locate the normal-priority task in the list
**Expected Result:** The diamond indicator is colored blue.
**Devices:** All

### TC-204: Green diamond for "low" priority
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with priority = "low".
**Steps:**
1. Locate the low-priority task in the list
**Expected Result:** The diamond indicator is colored green.
**Devices:** All

### TC-205: Purple diamond for "review" priority
**Feature:** Priority System
**Priority:** P0
**Preconditions:** A task exists with priority = "review".
**Steps:**
1. Locate the review-priority task in the list
**Expected Result:** The diamond indicator is colored purple.
**Devices:** All

### TC-206: Task with no priority set shows default diamond
**Feature:** Priority System
**Priority:** P1
**Preconditions:** A task exists with no priority field set (null/undefined). Note: the current schema has no `priority` column, so all existing tasks will have no priority.
**Steps:**
1. Locate a task without a priority value
**Expected Result:** The diamond indicator either does not render, renders in a neutral/gray color, or defaults to "normal" (blue). No error is thrown. The layout does not shift or break.
**Devices:** All

### TC-207: All five priority colors are visually distinct
**Feature:** Priority System
**Priority:** P1
**Preconditions:** Tasks exist with each of the five priority levels.
**Steps:**
1. View a list containing tasks of all five priority levels
**Expected Result:** All five diamond colors (red, yellow, blue, green, purple) are clearly distinguishable from each other. Colors pass WCAG contrast requirements against the background.
**Devices:** All

### TC-208: Priority diamond aligns vertically within the task row
**Feature:** Priority System
**Priority:** P1
**Preconditions:** Tasks with varying priority values exist.
**Steps:**
1. View the task list
2. Observe vertical alignment of diamond indicators
**Expected Result:** All diamond indicators are vertically centered within their 40px-height task rows. They align in a consistent column across all rows.
**Devices:** All

### TC-209: Priority field is persisted via API
**Feature:** Priority System
**Priority:** P0
**Preconditions:** The `priority` field has been added to the Task model (schema migration required).
**Steps:**
1. Create a task via API: `POST /api/task` with `{ body: "Test", priority: "urgent" }`
2. Retrieve the task via API: `GET /api/task?status=open`
**Expected Result:** The created task is returned with `priority: "urgent"`. The field persists correctly in the database.
**Devices:** N/A (API test)

---

## 4. Task Row Redesign

### TC-300: Task row layout matches new column order
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task exists with priority, creation date, description, assignee, and due date all populated.
**Steps:**
1. Navigate to Inbox or Tasks view
2. Examine a fully-populated task row
**Expected Result:** The columns appear in this exact order from left to right: priority diamond | creation date | vertical separator | task description | assignee full name | due date. No type badge or tag pills are visible.
**Devices:** Desktop

### TC-301: Creation date is displayed in task row
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task was created on a known date (e.g., Feb 15, 2026).
**Steps:**
1. Locate the task in the list
**Expected Result:** The creation date appears after the priority diamond, formatted in Spanish locale (e.g., "feb 15" using `es-CO` locale). It uses a monospace font and muted color.
**Devices:** All

### TC-302: Vertical separator between date and description
**Feature:** Task Row
**Priority:** P1
**Preconditions:** Any task row is visible.
**Steps:**
1. Observe the space between the creation date and the task description
**Expected Result:** A thin vertical line or pipe character separates the creation date from the description text, matching the Figma design.
**Devices:** Desktop, Tablet

### TC-303: Task description text truncates with ellipsis
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task exists with a very long title/body (80+ characters).
**Steps:**
1. Locate the long-titled task in the list
**Expected Result:** The description text truncates with an ellipsis ("...") when it exceeds the available width. The row height remains fixed at 40px. No text wrapping occurs.
**Devices:** All

### TC-304: Assignee full name is displayed when present
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task has `assignee = "Maria Garcia Lopez"`.
**Steps:**
1. Locate the task in the list
**Expected Result:** The full name "Maria Garcia Lopez" appears in the assignee column position (between description and due date). No initials avatar is shown -- the redesign uses plain text full names.
**Devices:** All

### TC-305: Unassigned task shows "--" instead of name
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task has `assignee = null`.
**Steps:**
1. Locate the unassigned task in the list
**Expected Result:** The assignee column shows "--" (double dash) as a placeholder. The "--" uses muted text color. The layout does not shift compared to rows with assignee names.
**Devices:** All

### TC-306: Due date is displayed when present
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task has a deadline set (e.g., March 10, 2026).
**Steps:**
1. Locate the task in the list
**Expected Result:** The due date appears as the last column element, formatted in Spanish locale (e.g., "mar 10"). Overdue dates show in red, today's date in accent color, future dates in muted color.
**Devices:** All

### TC-307: Due date absent shows no date in that column
**Feature:** Task Row
**Priority:** P1
**Preconditions:** A task has `deadline = null`.
**Steps:**
1. Locate the task with no deadline
**Expected Result:** The due date column area is empty or shows a placeholder dash. The row layout remains consistent with other rows that do have due dates.
**Devices:** All

### TC-308: Type badges and tag pills are NOT rendered
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task has `type = "urgent"` and `tags = ["legal", "pending"]`.
**Steps:**
1. Locate the task in the list
**Expected Result:** No TypeBadge component or TagPills component is rendered. The old uppercase type badge and colored tag pills are completely removed from the task row. Only the new column layout is visible.
**Devices:** All

### TC-309: Task row is clickable and navigates to detail
**Feature:** Task Row
**Priority:** P0
**Preconditions:** A task with id=42 exists.
**Steps:**
1. Click anywhere on the task row
**Expected Result:** The browser navigates to `/task/42` (the task detail page). The entire row acts as a link (not just the title text).
**Devices:** All

### TC-310: Task row hover state
**Feature:** Task Row
**Priority:** P1
**Preconditions:** Any task row is visible.
**Steps:**
1. Hover the mouse cursor over a task row
**Expected Result:** The row background changes to `var(--surface-hover)` (a subtle highlight). The cursor changes to pointer. The transition is smooth.
**Devices:** Desktop

### TC-311: Completed task row has visual distinction
**Feature:** Task Row
**Priority:** P1
**Preconditions:** A completed task exists (status = "done").
**Steps:**
1. Switch to "Finalizadas" tab
2. Observe a completed task row
**Expected Result:** The task description text appears in a muted color (`var(--text-tertiary)`). The creation date and due date also use muted styling. The row is clearly distinguishable from active tasks.
**Devices:** All

### TC-312: Date formatting uses Spanish (es-CO) locale
**Feature:** Task Row
**Priority:** P1
**Preconditions:** Tasks exist with various dates.
**Steps:**
1. Observe date columns in task rows
**Expected Result:** Dates are formatted in Spanish locale (e.g., "feb 26", "mar 10", "ene 5"). Month names are in lowercase Spanish. The format uses `toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })`.
**Devices:** All

---

## 5. Sidebar

### TC-400: Inbox item appears in sidebar navigation
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** User is authenticated.
**Steps:**
1. Observe the sidebar navigation section
**Expected Result:** An "Inbox" item appears in the top navigation group (alongside or replacing "Inicio" and "Tareas"). It has an envelope icon and a count badge showing the number of unread/new tasks.
**Devices:** Desktop

### TC-401: Inbox sidebar item highlights when active
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** User is on the Inbox page.
**Steps:**
1. Navigate to /inbox
2. Observe the sidebar
**Expected Result:** The Inbox item in the sidebar is highlighted (bold text, `var(--surface-hover)` background) indicating it is the current active route. Other nav items are in their default state.
**Devices:** Desktop

### TC-402: New spaces appear in sidebar under correct domain sections
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** The following spaces exist in the database: Finca Legal, Finca Contable, Propiedad, Analisis, Blog, Redes, Lanzamiento, SEO, Empleado, Nomina, Beneficios, Expediente, Nodo IA, Agente, Caja, Automatizacion.
**Steps:**
1. Observe the sidebar domain groups
**Expected Result:** Each space appears under its correct domain section with the proper hex icon, name, and task count. Spaces are ordered by `sortOrder`.
**Devices:** Desktop

### TC-403: Domain section collapse/expand works
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** A domain with multiple spaces is visible.
**Steps:**
1. Click on a domain header (e.g., the chevron or domain name)
2. Observe the spaces list
3. Click the domain header again
**Expected Result:** First click collapses the domain section -- spaces are hidden, chevron rotates to point right. Second click expands -- spaces reappear, chevron rotates to point down. Transition is animated (150ms).
**Devices:** All

### TC-404: Domain collapse state persists in localStorage
**Feature:** Sidebar
**Priority:** P1
**Preconditions:** User has collapsed a domain section.
**Steps:**
1. Collapse the "Legal" domain section
2. Refresh the page (F5)
**Expected Result:** After refresh, the "Legal" domain section remains collapsed. The state is stored in `localStorage` under key `sidebar-domain-{slug}`.
**Devices:** Desktop

### TC-405: Space link shows task count
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** A space "Blog" has 7 open tasks.
**Steps:**
1. Locate "Blog" in the sidebar
**Expected Result:** The space link shows "Blog" with the number "7" right-aligned in a monospace font, matching `space._count.tasks`.
**Devices:** All

### TC-406: Space link active state on navigation
**Feature:** Sidebar
**Priority:** P1
**Preconditions:** Multiple spaces are visible.
**Steps:**
1. Click on "SEO" space link in sidebar
**Expected Result:** The browser navigates to `/space/seo`. The "SEO" item in the sidebar is highlighted with bold text and hover background. Other space links are in default state.
**Devices:** All

### TC-407: "Sistema Activo" green dot indicator is visible at bottom
**Feature:** Sidebar
**Priority:** P1
**Preconditions:** User is authenticated. Application is running.
**Steps:**
1. Scroll to the bottom of the sidebar (or observe the footer area)
**Expected Result:** A small green dot indicator with the text "Sistema Activo" (or equivalent) is displayed at the bottom of the sidebar, indicating the system is online/operational. The dot is green and pulsing or static per Figma design.
**Devices:** Desktop

### TC-408: Sidebar domains with zero tasks are hidden
**Feature:** Sidebar
**Priority:** P1
**Preconditions:** A domain exists where all its spaces have zero open tasks.
**Steps:**
1. Observe the sidebar
**Expected Result:** The domain group with zero total tasks does not appear in the sidebar. This matches the current behavior where `spacesWithTasks.length === 0` causes `return null`.
**Devices:** All

### TC-409: "Nueva tarea" button is present in sidebar footer
**Feature:** Sidebar
**Priority:** P0
**Preconditions:** User is authenticated.
**Steps:**
1. Observe the bottom of the sidebar
**Expected Result:** A "Nueva tarea" button with a "+" icon is present at the bottom of the sidebar, styled with accent background and dark text. It is always visible (sticky footer).
**Devices:** All

### TC-410: Edit icon appears on domain hover
**Feature:** Sidebar
**Priority:** P2
**Preconditions:** A domain is visible in the sidebar.
**Steps:**
1. Hover over a domain header row
**Expected Result:** A small edit icon (pencil) fades in on the right side of the domain header. Clicking it navigates to `/domain/{slug}/edit`. The icon disappears when the mouse leaves.
**Devices:** Desktop

### TC-411: Edit icon appears on space hover
**Feature:** Sidebar
**Priority:** P2
**Preconditions:** A space is visible under an expanded domain.
**Steps:**
1. Hover over a space link
**Expected Result:** A small edit icon fades in. Clicking it navigates to `/space/{slug}/edit`.
**Devices:** Desktop

### TC-412: Sidebar scroll works for many domain sections
**Feature:** Sidebar
**Priority:** P1
**Preconditions:** 16+ spaces exist across multiple domains, enough to overflow the sidebar height.
**Steps:**
1. Observe the sidebar
2. Scroll down within the sidebar nav area
**Expected Result:** The sidebar nav section scrolls independently from the main content. The header ("Abeja") and footer ("Nueva tarea" button) remain fixed/sticky. The domain sections scroll smoothly.
**Devices:** Desktop

---

## 6. Responsive Layout

### TC-500: Desktop full layout at 1280px+
**Feature:** Responsive
**Priority:** P0
**Preconditions:** Browser window is >= 1280px wide.
**Steps:**
1. Set viewport to 1280px width
2. Navigate to Inbox
**Expected Result:** Full sidebar is visible (220px width). Task rows show all columns: priority diamond, creation date, separator, full description, assignee name, due date. No truncation of assignee name. The layout uses `flex` with sidebar + content columns.
**Devices:** Desktop

### TC-501: Tablet layout at 768px truncates descriptions
**Feature:** Responsive
**Priority:** P0
**Preconditions:** Browser window is set to 768px width.
**Steps:**
1. Set viewport to 768px width
2. Navigate to Inbox
**Expected Result:** The sidebar is visible (desktop sidebar, as `md:flex` breakpoint is 768px). Task row descriptions truncate earlier with ellipsis due to reduced available width. Assignee names may also truncate. All columns remain visible but compressed.
**Devices:** Tablet

### TC-502: Mobile layout at 375px uses drawer sidebar
**Feature:** Responsive
**Priority:** P0
**Preconditions:** Browser window is set to 375px width (iPhone SE size).
**Steps:**
1. Set viewport to 375px width
2. Navigate to Inbox
**Expected Result:** The sidebar is hidden. A hamburger menu icon appears in the mobile header. The main content spans full width. Task rows adapt to narrow width with aggressive description truncation.
**Devices:** Mobile

### TC-503: Mobile drawer opens and closes
**Feature:** Responsive
**Priority:** P0
**Preconditions:** Viewport is < 768px.
**Steps:**
1. Tap the hamburger menu button
2. Observe the drawer
3. Tap the X close button
**Expected Result:** Step 2: A 280px-wide sidebar drawer slides in from the left with a semi-transparent backdrop (`rgba(0,0,0,0.55)`). The animation takes 200ms (`ease-out`). Step 3: The drawer slides back out and the backdrop fades away.
**Devices:** Mobile

### TC-504: Mobile drawer closes on backdrop tap
**Feature:** Responsive
**Priority:** P1
**Preconditions:** Mobile drawer is open.
**Steps:**
1. Open the mobile drawer
2. Tap on the dark backdrop area (outside the drawer panel)
**Expected Result:** The drawer closes. The backdrop fades away. The main content is interactable again.
**Devices:** Mobile

### TC-505: Mobile drawer closes on route change
**Feature:** Responsive
**Priority:** P1
**Preconditions:** Mobile drawer is open.
**Steps:**
1. Open the mobile drawer
2. Tap on a space link inside the drawer (e.g., "Blog")
**Expected Result:** The drawer closes automatically. The browser navigates to `/space/blog`. The `useEffect` watching `pathname` triggers `close()`.
**Devices:** Mobile

### TC-506: Mobile header shows centered "Abeja" brand
**Feature:** Responsive
**Priority:** P1
**Preconditions:** Viewport is < 768px.
**Steps:**
1. Observe the mobile header bar
**Expected Result:** The "Abeja" brand text is centered horizontally in the header using `absolute left-1/2 -translate-x-1/2`. A hamburger icon is on the left. The header respects `safe-area-inset-top` for notched devices.
**Devices:** Mobile

### TC-507: Task row adapts to mobile width
**Feature:** Responsive
**Priority:** P0
**Preconditions:** Viewport is 375px. Tasks with long descriptions exist.
**Steps:**
1. View task list on mobile
**Expected Result:** Task rows remain functional. The priority diamond is visible. The description truncates aggressively. The assignee and date may stack or use abbreviated formats. The row height remains consistent. Touch targets are at least 44px tall.
**Devices:** Mobile

### TC-508: Tablet landscape (1024px) renders correctly
**Feature:** Responsive
**Priority:** P2
**Preconditions:** Viewport is 1024px wide.
**Steps:**
1. Set viewport to 1024px
2. Navigate to Inbox
**Expected Result:** Full sidebar is visible. Task rows show all columns with moderate description truncation. Layout is proportional and no content overflows.
**Devices:** Tablet

### TC-509: Safe area insets respected on iOS
**Feature:** Responsive
**Priority:** P2
**Preconditions:** Testing on an iOS device with a notch/Dynamic Island, or Safari simulator.
**Steps:**
1. Open the app in Safari on iPhone
2. Observe the header and drawer bottom padding
**Expected Result:** The mobile header uses `paddingTop: 'max(0.75rem, env(safe-area-inset-top))'`. The drawer uses `paddingBottom: 'env(safe-area-inset-bottom)'`. Content does not render under the notch or home indicator.
**Devices:** Mobile (iOS)

---

## 7. Corner Cases and Edge Scenarios

### TC-600: Empty space shows zero count and no task rows
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** A space "Caja" exists with zero tasks.
**Steps:**
1. Navigate to `/space/caja`
**Expected Result:** The page loads without errors. An empty state message is displayed. The sidebar shows "Caja" with count "0". No broken layout or undefined errors.
**Devices:** All

### TC-601: Task with very long title (80 character max from normalizeTitle)
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** A task is created via API with a body that generates a title of exactly 80 characters.
**Steps:**
1. View the task in the list
**Expected Result:** The title truncates cleanly with ellipsis via CSS `text-overflow: ellipsis`. No overflow breaks the row layout. The full title is accessible on click (task detail page).
**Devices:** All

### TC-602: Task with special characters in title
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** A task exists with title containing: `Revisar contrato "Acuerdo <2026>" & factura #123`.
**Steps:**
1. View the task in the list
**Expected Result:** Special characters render correctly. No XSS vulnerability (React auto-escapes). Quotes, angle brackets, ampersands, and hash symbols display as literal text.
**Devices:** All

### TC-603: Task with unicode/emoji in assignee name
**Feature:** Corner Cases
**Priority:** P2
**Preconditions:** A task has `assignee = "Jose Maria Hernandez"` (with accented characters).
**Steps:**
1. View the task in the list
**Expected Result:** The accented characters render correctly in the assignee full name column. No encoding issues or question mark replacements.
**Devices:** All

### TC-604: Rapid tab switching does not leave stale data
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** All three tabs have different task counts.
**Steps:**
1. Click "Activas" -> "Delegadas" -> "Finalizadas" -> "Activas" in rapid succession (< 1 second total)
**Expected Result:** The final view shows "Activas" tasks only. No mixed data from other tabs is visible. The count in the active tab matches the visible rows.
**Devices:** All

### TC-605: Task count displays "0" correctly (not blank or NaN)
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** A tab or space has exactly 0 matching tasks.
**Steps:**
1. View a space or tab with zero tasks
**Expected Result:** The count displays as "0" or "(0)" -- not as an empty string, "NaN", "undefined", or "null".
**Devices:** All

### TC-606: Very long assignee name does not break layout
**Feature:** Corner Cases
**Priority:** P2
**Preconditions:** A task has `assignee = "Maria Alejandra Gutierrez de la Vega Hernandez"` (very long name).
**Steps:**
1. View the task in the list
**Expected Result:** The assignee name truncates with ellipsis or is abbreviated. The task row height remains fixed at 40px. The due date column is not pushed off-screen.
**Devices:** All

### TC-607: Concurrent task creation and Inbox viewing
**Feature:** Corner Cases
**Priority:** P2
**Preconditions:** Inbox is loaded.
**Steps:**
1. While Inbox is open, use a second tab or API call to create a new task
2. Refresh or navigate back to Inbox
**Expected Result:** The new task appears in the Inbox. The count updates. No duplicate rendering or stale cache issues.
**Devices:** Desktop

### TC-608: Browser back/forward navigation preserves state
**Feature:** Corner Cases
**Priority:** P2
**Preconditions:** User has navigated: Inbox -> Task Detail -> Back.
**Steps:**
1. Navigate to Inbox
2. Click a task to view detail
3. Press browser back button
**Expected Result:** The Inbox view restores with the correct tab selected, scroll position retained (or close to it), and correct task list displayed.
**Devices:** All

### TC-609: Task without a title falls back to body text
**Feature:** Corner Cases
**Priority:** P1
**Preconditions:** A task has `title = null` and `body = "Enviar documentos al notario antes del viernes"`.
**Steps:**
1. View the task in the list
**Expected Result:** The task row shows the body text "Enviar documentos al notario antes del viernes" as the description. This matches the current fallback logic: `t.title || t.body`.
**Devices:** All

### TC-610: Sidebar handles domain with 20+ spaces
**Feature:** Corner Cases
**Priority:** P2
**Preconditions:** A single domain has 20 spaces with tasks.
**Steps:**
1. Expand the domain section
**Expected Result:** All 20 spaces are listed and scrollable within the sidebar. The sidebar's internal scroll works independently. No layout overflow into the main content area.
**Devices:** Desktop

---

## Traceability: Figma Design vs. Current Codebase Delta

| Figma Feature | Current State | Change Required |
|---|---|---|
| Inbox view | Does not exist | New `/inbox` route, new data query across all spaces |
| Tab: "Activas" | "Abiertas" tab exists | Rename label, verify filter logic |
| Tab: "Delegadas" | Does not exist | New tab filtering on `assignee IS NOT NULL` |
| Tab: "Finalizadas" | "Completadas" tab exists | Rename label, verify filter logic |
| Tab counts in parentheses | No counts on tabs | Add count queries per tab category |
| Priority diamond | No priority field in schema | Add `priority` column to Task model, add diamond SVG component |
| Priority colors (5) | N/A | Implement color mapping: urgent=red, high=yellow, normal=blue, low=green, review=purple |
| Task row: creation date column | Date shows but only as deadline fallback | Always show `createdAt` as a separate column |
| Task row: vertical separator | Does not exist | Add CSS border or pipe element |
| Task row: assignee full name | Shows initials avatar | Replace Initials component with plain text full name |
| Task row: "--" for unassigned | Shows nothing | Add "--" fallback |
| Task row: no type badges | TypeBadge renders | Remove TypeBadge from row |
| Task row: no tag pills | TagPills renders | Remove TagPills from row |
| Sidebar: Inbox with envelope | Does not exist | Add nav item with envelope SVG |
| Sidebar: Inbox count badge | Does not exist | Add count badge component |
| Sidebar: new spaces (16) | Depends on DB seed | Seed or migrate new spaces |
| Sidebar: "Sistema Activo" | Does not exist | Add footer status indicator |
| Responsive: 1280+ full | Partially implemented | Verify all new columns render |
| Responsive: 768 truncation | Partially implemented | Verify truncation with new layout |
| Responsive: 375 drawer | Implemented (280px drawer) | Verify new Inbox and tabs work in drawer context |
