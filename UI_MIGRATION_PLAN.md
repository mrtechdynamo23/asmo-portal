# ASMO Work Order Control Tower — UI/UX Migration Plan
## EDGE-Inspired Enterprise UI/UX Transformation, Responsive Design, and Functional Preservation

**Document Version:** 1.0  
**Target Project:** `C:\Users\sudha\OneDrive\Desktop\ASMO Portal`  
**Reference Project (READ-ONLY):** `C:\Users\sudha\OneDrive\Desktop\EDGE Portal Final Deploy`  
**Reference Date:** 14 October 2026  

---

## 1. Current ASMO Architecture

- **Framework & Runtime:** React 18 with Vite 8.3, TypeScript 7.0, React Router DOM 6.30, Zustand 5.0, and Recharts 3.10.
- **Styling Architecture:** Vanilla CSS design tokens (`src/index.css`) with custom properties for color scales, typography, spacing, shadows, and utility classes.
- **Data Model:** Centralized state in `src/store/useStore.ts` with TypeScript interfaces in `src/types/index.ts`. 40 seeded Work Orders following canonical distribution across all 18 lifecycle statuses with 2 on-hold overlays, 14 users, and 8 service definitions.
- **Assets:** Original `logo/asmo-logo.jpg` and five hero images (`hero-control-centre.jpg`, `hero-logistics-hub.jpg`, `hero-project-delivery.jpg`, `hero-smart-warehouse.jpg`, `hero-supply-chain.jpg`).
- **Validation:** Deterministic validation script `scripts/validate-data.ts` executed via `npm run validate:data`.

---

## 2. Observed EDGE Design Patterns (Based on Inspected Files)

From an in-depth source code audit of `EDGE Portal Final Deploy`:

1. **Tokens & Theming (`src/tokens/designTokens.js`, `src/index.css`):**
   - Precise semantic separation: brand accent vs. semantic status (green = healthy, amber = warning, red = critical, blue = info).
   - Sophisticated surface hierarchy (`--bg-primary`, `--bg-card`, `--bg-tertiary`, `--border-secondary`).
   - Micro-typography: Upper-case tracking (`letter-spacing: 0.04em`, `font-size: 11px`) for section labels and table headers; bold numerical values with tight line heights (`line-height: 1.1`).
   - Restrained elevation with crisp 1px borders and subtle multi-tier box shadows.
2. **Top Header & Global Utilities (`src/components/layout/TopHeader.jsx`):**
   - Collapsible sidebar toggle button with smooth icon rotation.
   - Dynamic route-driven breadcrumbs (`Home > Control Tower > Details`).
   - Instant multi-entity global search modal with keyboard shortcut indicator (`Ctrl + K`).
   - Actionable notifications popover with unread count badge.
   - Light/Dark theme toggle.
   - Profile chip with role indicator and logout.
3. **Sidebar Navigation (`src/components/layout/Sidebar.jsx`):**
   - Collapsible panel (expanded 260px vs. collapsed 68px).
   - Grouped navigation items with active indicator bar and pill counts.
   - Keyboard accessibility and tooltips in collapsed state.
4. **Data Displays & KPI Cards (`src/components/common/KPICard.jsx`, `DataTable.jsx`):**
   - Compact KPI cards with SVG sparklines, status-colored top accent borders (2px), trend delta indicators, and click drill-down chevron.
   - Advanced DataTable: Search, column sorting, pagination controls, CSV download trigger, and responsive overflow handling.
   - Semantic Badges: Status badges with category dots, priority badges with level-specific tinting, SLA meters.
5. **Landing Page Architecture (`src/pages/LandingPage.jsx`, `LandingPage.css`):**
   - Fixed cinematic background layer with smooth crossfade and subtle Ken Burns zoom (1.045 scale).
   - High-impact operational metrics strip.
   - 4-column capability cards with glowing hover borders and descriptive metrics.
   - Prominent headline: **"One Control Tower. Every Work Order."**
   - Dedicated primary CTA: **"Enter Control Tower"** leading to Login.
   - Secondary CTA: **"Explore Capabilities"** with smooth scroll.
6. **Authentication Card (`src/pages/LoginPage.jsx`, `LoginPage.css`):**
   - Split layout: Ambient aerospace/technical command backdrop on left with geometric network grid; focused corporate sign-in card on right.
   - Prefilled demo credentials (`asmo.admin` / `Asmo@2026`) with password reveal toggle.

---

## 3. Mapping of EDGE Patterns to ASMO Components

| EDGE Pattern | ASMO Component / File | Adaptation Strategy |
|---|---|---|
| Split Login with tech grid & prefilled credentials | `src/pages/LoginPage.tsx` | Adapt layout using ASMO red (`#A21C20`) and walnut (`#3A2A25`) geometry, prefilled with `asmo.admin` / `Asmo@2026`. |
| Scrollable Landing Gateway & Hero Slideshow | `src/pages/LandingPage.tsx` | Use the 5 local ASMO hero images, Ken Burns crossfade, headline **"One Control Tower. Every Work Order."**, primary CTA **"Enter Control Tower"** to Login, secondary CTA **"Explore Capabilities"** to 4 capability blocks. |
| Application Launcher | `src/pages/ApplicationHome.tsx` | Distinct launcher screen after login with prominent **Work Order Control Tower** tile opening Dashboard. Excludes TLM/ITSM. |
| Application Shell (Header + Sidebar) | `src/components/Header.tsx`, `Sidebar.tsx` | Collapsible sidebar, breadcrumbs, search popover, notification drawer, ASMO logo on white plate, theme support. |
| Compact KPICard with sparklines & top accent | `src/components/KPICard.tsx` | Reusable card for Dashboard & Register with trend indicators and status borders. |
| Enterprise DataTable | `src/components/DataTable.tsx` | Shared table component with search, sorting, pagination, and CSV export. |
| Work Order Control Tower Dashboard | `src/pages/ControlTowerDashboard.tsx` | Dedicated dashboard with KPI cards, Recharts visualizations (lifecycle, BU spend, RAID, phases). |
| 6-Step Creation Wizard | `src/pages/WorkOrderWizard.tsx` | 6 exact steps: 1. Request Info, 2. Scope & Service, 3. Commercials & Proposal, 4. Team & Plan, 5. RAID & Deliverables, 6. Review & Submit. |
| 10-Tab Work Order Detail Workspace | `src/pages/WorkOrderDetail.tsx` | 10 exact tabs: Overview, Scope & Proposal, Approvals & Authorisation, Team & RACI, Plan & Milestones, Commercials, RAID, Deliverables/Testing/Acceptance, Deployment/Closure, Activity/Audit. |
| Supporting Work Order Modules | `src/pages/modules/...` | Action Centre, Service Catalogue, Milestones, Deliverables, RAID Register, Change Requests, Reports, Admin. |

---

## 4. Files Planned for Creation / Modification

### New / Refined Pages & Components:
- `src/index.css`: Updated with ASMO design tokens (ASMO red `#A21C20`, Walnut `#3A2A25`, neutral surfaces, elevation, sparklines, responsive rules).
- `src/components/Header.tsx`: Enhanced with breadcrumbs, command search modal, notification popover, theme toggle.
- `src/components/Sidebar.tsx`: Collapsible with 10 supporting ASMO navigation routes.
- `src/components/KPICard.tsx`: Enterprise metric card with sparklines, status indicators, and click drill-downs.
- `src/components/DataTable.tsx`: Reusable data table with sort, search, pagination, and export.
- `src/pages/LandingPage.tsx` & `LandingPage.css`: Full EDGE-level visual redesign with 5 hero images, Ken Burns effect, exact headline, and 4 capability blocks.
- `src/pages/LoginPage.tsx`: Corporate login page with prefilled credentials (`asmo.admin` / `Asmo@2026`).
- `src/pages/ApplicationHome.tsx`: Application launcher preserving the required flow.
- `src/pages/ControlTowerDashboard.tsx`: Dedicated dashboard module with actionable KPI cards and charts.
- `src/pages/ControlTowerRegister.tsx`: Register using the enterprise table with search, filters, pagination, and CSV export.
- `src/pages/WorkOrderWizard.tsx`: Upgraded to 6 steps with state retention.
- `src/pages/WorkOrderDetail.tsx`: 10-tab workspace with exact required tab order and live actions.
- Supporting module pages: Action Centre, Service Catalogue, Milestones, Deliverables, RAID Register, Change Requests, Reports, Admin.
- `src/App.tsx`: Updated route definitions reflecting the mandatory sequence.

---

## 5. Files and Workflows That Must Remain Untouched

- `logo/asmo-logo.jpg`: Original logo preserved untouched.
- `logo/hero-*.jpg`: Original five hero images preserved untouched.
- `C:\Users\sudha\OneDrive\Desktop\EDGE Portal Final Deploy`: **READ-ONLY**, zero modifications.
- Seed data integrity: 40 Work Orders across 18 lifecycle statuses, 2 on-hold overlays, 14 users, 8 service definitions.
- Golden records A (`WO-00128`), B (`WO-00131`), C (`WO-00119`), D (`WO-00140`).
- Business rules: Separation of Proposal Approval and Formal Authorisation; On Hold as non-destructive overlay.

---

## 6. Architectural Conflicts & Resolution Strategy

1. **Routing Hierarchy:** The user requested the strict flow: Landing (`/`) → Login (`/login`) → Application Home (`/home`) → Control Tower Tile → Dashboard (`/control-tower/dashboard`) → Register (`/control-tower`) → Details (`/control-tower/:id`). We will configure React Router DOM to cleanly enforce this exact sequence while keeping supporting modules accessible via sidebar.
2. **Wizard Steps:** The previous implementation used 4 steps; the new specification requires 6 exact steps. We will expand the form data structure to accommodate all 6 steps while ensuring state preservation across steps.
3. **Tab Ordering:** The 10 tabs in the Work Order detail workspace must strictly match the 10-tab order in Section 13.

---

## 7. Validation & Regression Testing Strategy

1. Run `npm run validate:data` after each data and workflow change to verify 100% compliance.
2. Execute `npm run build` to verify zero TypeScript errors and bundling success.
3. Conduct automated browser testing via browser subagent covering:
   - Landing page hero slideshow, controls, headline, and Explore Capabilities scroll.
   - Login page prefilled credentials and sign-in behavior.
   - Application Home tile navigation.
   - Control Tower Dashboard metrics, charts, and filter clicks.
   - Control Tower Register sorting, searching, pagination, and CSV export.
   - Six-step wizard completion and submission.
   - Ten detail workspace tabs on Golden Records A, B, C, D.
   - Supporting modules (Action Centre, Services, Milestones, Deliverables, RAID, Change Requests, Reports, Admin).
   - Responsive layout at mobile (375px), tablet (768px), and desktop (1440px).

---

## 8. Additional Module: EDGE-Inspired Work Order Portfolio Calendar (`/calendar`)

### 8.1 Architectural Context & Reference Alignment
- **Reference Source:** Inspected read-only `EDGE Portal Final Deploy/src/pages/GlobalCalendarPage.jsx`, adapter mechanisms, date utility helpers, and responsive layout structures.
- **Design Adaptation:** Adapted EDGE's multi-view calendar (Month, Week, Agenda) to ASMO's Red (`#A21C20`) and Walnut (`#3A2A25`) brand palette without incorporating TLM/ITSM elements.
- **Placement & Flow:** Added to ASMO Sidebar directly after Milestones (`/milestones`) and before Deliverables (`/deliverables`). Preserves the mandatory landing-to-dashboard lifecycle.

### 8.2 Data Architecture & Source Integrity
- **Canonical Derivation:** All calendar events are derived live from canonical store entities (`workOrders`, `milestones`, `deliverables`, `reviewTasks`, `changeRequests`) via `src/services/calendarEventAdapter.ts`. Zero disjointed mock datasets.
- **Event Typologies:**
  1. `milestone`: Target delivery milestones with phase tags and overdue calculations relative to 14 Oct 2026.
  2. `deliverable`: Formal contractual deliverable gates and acceptance deadlines.
  3. `review`: Architecture, Commercial, and Cybersecurity review gates.
  4. `authorisation`: Formal Release Purchase Order commitment dates.
  5. `change_request`: Scope and commercial change review gates.
  6. `closure`: UAT sign-off and contract settlement dates.
- **Data Protection:** Date updates sync directly back to source records in `useStore`. Date-only records never synthesize fake times.

### 8.3 Views & Interactive Capabilities
- **Month View:** 7-column grid with current vs neighboring days, Today highlight (14 Oct 2026), status indicators, and "+N more" overflow modal with z-index elevation.
- **Week View:** 7-column time-oriented view with day headers and scrollable event lists.
- **Agenda View:** Chronological grouped list by date with rich event cards, status pills, owner avatars, and direct links.
- **Event Detail Inspector:** Modal with event category badges, metadata, status, overdue/on-hold warnings, and direct navigation into the associated Work Order workspace.
- **Enterprise Filters:** Filter by category pills with live counts, Work Order ID, Owner, and Status. Broad search bar for instant keyword filtering.

### 8.4 Theme & Search Bar System Polish
- **Broad Inputs:** Standardized `.input` and `select` with `height: 44px`, `min-height: 44px`, and generous horizontal padding (`2.75rem` for icon inputs) across all registers (Milestones, Deliverables, RAID, Calendar, DataTable, Header).
- **Night Mode Overhauls:** Resolved hardcoded inline `#FFFFFF` backgrounds. Introduced comprehensive dark mode surface tokens (`--color-surface`, `--color-surface-raised`), `localStorage` persistence, and zero-flash early initialization in `src/main.tsx`.
