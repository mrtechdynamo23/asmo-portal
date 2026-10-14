# ASMO Work Order Control Tower — Implementation Assumptions & Design Tokens

**Reference Date:** 14 October 2026  
**Target:** `C:\Users\sudha\OneDrive\Desktop\ASMO Portal`  
**Reference (READ-ONLY):** `C:\Users\sudha\OneDrive\Desktop\EDGE Portal Final Deploy`  

---

## 1. Brand Tokens & Color System (Section 4)

In accordance with Section 4 of the master prompt, the color palette centers around the official ASMO corporate identity:

- **Primary ASMO Red:** `#A21C20` (used purposefully for primary actions, active navigation, badges, and brand highlights).
- **Walnut / Dark Chocolate:** `#3A2A25` (sidebar navigation, technical backdrops, deep accents).
- **White Surface:** `#FFFFFF` (cards, elevated modals, data tables).
- **Warm Neutral Background:** `#F5F3F1` (main application body background).
- **Primary Text:** `#292524` (high contrast, WCAG AAA compliant text).
- **Secondary Text:** `#78716C` (metadata, subheadings, labels).
- **Border Neutral:** `#E7E2DE` (subtle 1px container dividers).
- **Semantic Green (Success):** `#237A52` (approved, authorised, completed).
- **Semantic Amber (Warning):** `#A66A13` (at risk, revision required, on hold).
- **Semantic Critical (Red):** `#B42318` (rejected, breached SLA, critical defect).
- **Semantic Blue (Info):** `#315DA8` (in review, standard service info).

---

## 2. Authentication & Demo Mode (Section 7)

- **Authentication Paradigm:** The application implements simulated enterprise single sign-on / corporate login with prefilled credentials:
  - Username: `asmo.admin`
  - Password: `Asmo@2026`
- **Navigation Flow Post-Login:** Successful login strictly navigates to **Application Home** (`/home`). It does not bypass Application Home or jump directly to the dashboard.

---

## 3. End-to-End Navigation Journey (Section 5)

The application enforces the exact mandatory sequence:
1. **Landing Page (`/`):** Full-width Ken Burns slideshow with 5 local images, exact headline **"One Control Tower. Every Work Order."**, primary CTA **"Enter Control Tower"** (navigates to `/login`), secondary CTA **"Explore Capabilities"** (scrolls to capabilities).
2. **Login Page (`/login`):** Split layout with technical background on left, corporate authentication card on right.
3. **Application Home (`/home`):** Clean launcher with one prominent tile: **Work Order Control Tower** (opens dashboard). No TLM or ITSM.
4. **Work Order Control Tower Dashboard (`/control-tower/dashboard`):** KPI cards with sparklines and click drill-downs, Recharts charts derived from shared store.
5. **Work Order Register (`/control-tower`):** Enterprise data table with search, status filters, sorting, pagination, and CSV export. Clicking any row opens details.
6. **Work Order Details (`/control-tower/:id`):** 10 tabs in exact specified order with operational governance actions.

---

## 4. Work Order Detail Workspace (10 Tabs) (Section 13)

Tabs must strictly follow this exact order:
1. Overview
2. Scope & Proposal
3. Approvals & Authorisation
4. Team & RACI
5. Plan & Milestones
6. Commercials
7. RAID
8. Deliverables / Testing / Acceptance
9. Deployment / Closure
10. Activity / Audit

---

## 5. Work Order Creation Wizard (6 Steps) (Section 12)

Steps follow the exact sequence:
1. Request Information
2. Scope and Service
3. Commercials and Proposal
4. Team and Delivery Plan
5. Risk, Dependencies and Deliverables
6. Review and Submit

---

## 6. Golden Records Specification (Section 17)

- **Golden Record A (`WO-ASMO-2026-00128`):** Supplier Onboarding Portal Enhancement — Build phase, Lump Sum, 4 milestones (1 overdue by 6 days relative to 14 Oct 2026), 5 deliverables, 3 RAID records, Proposal v1 Revision Required, Proposal v2 Approved, Authorisation completed.
- **Golden Record B (`WO-ASMO-2026-00131`):** Master Data Cleansing and Migration — Under Review, Commercial review completed, Architecture review pending, Cybersecurity review requesting changes, Authorisation not granted.
- **Golden Record C (`WO-ASMO-2026-00119`):** Finance Reporting Automation — Closed status with acceptance, handover, and access-revocation evidence.
- **Golden Record D (`WO-ASMO-2026-00140`):** Draft status created by Business Owner.
