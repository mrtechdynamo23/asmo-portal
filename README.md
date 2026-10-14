# ASMO Work Order Control Tower

Enterprise frontend application for managing end-to-end Work Orders from business demand initiation through multi-disciplinary proposal review, governance approval, formal Release Purchase Order (PO) authorization, milestone delivery, acceptance sign-off, hypercare warranty, and closure.

Refactored with enterprise UI/UX patterns adapted from **EDGE Portal Final Deploy**, while preserving ASMO's distinctive brand identity, Work Order domain terminology, and strict lifecycle governance rules.

---

## 1. Quick Start & Run Instructions

### Prerequisites
- Node.js >= 20 (Tested on Node.js v22.18.0)
- npm >= 10

### Installation & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Run data integrity validation check (Validates 40 Work Orders, 14 users, 8 services, 4 golden records)
npm run validate:data

# 3. Start local development server
npm run dev

# 4. Production build check
npm run build
```

When running `npm run dev`, Vite serves the application at **`http://localhost:5173`**.

---

## 2. Demo Credentials & Authentication

The application features enterprise-styled demo authentication:

- **Username:** `asmo.admin`
- **Password:** `Asmo@2026`
- **Password Visibility:** Toggleable via inline eye icon
- **Pre-filled:** Yes, credentials are pre-populated on the login form for immediate evaluation.

On successful sign-in, the application intentionally opens **Application Home (`/home`)**, adhering strictly to the mandatory navigation sequence.

---

## 3. Mandatory End-to-End User Flow

The application follows the required non-negotiable user journey:

```text
Landing Page (/)
    │
    ▼ (Click "Enter Control Tower")
Login Page (/login)
    │
    ▼ (Sign in with asmo.admin / Asmo@2026)
Application Home (/home)
    │
    ▼ (Click prominent "Work Order Control Tower" Tile)
Work Order Control Tower Dashboard (/control-tower/dashboard)
    │
    ▼ (Click "View All Work Orders" or Register nav)
Work Order Register (/control-tower)
    │
    ▼ (Click any row e.g. WO-ASMO-2026-00128)
Work Order Detail Workspace (/control-tower/:id)
```

---

## 4. Key Work Order Modules & Routing

| Module | Route | Purpose |
|---|---|---|
| **Landing Page** | `/` | Hero slideshow with 5 local assets, headline *"One Control Tower. Every Work Order."*, and 4 capability blocks. |
| **Login** | `/login` | EDGE-inspired split command layout with prefilled demo credentials and password toggle. |
| **Application Home** | `/home` | Enterprise application launcher with prominent Work Order Control Tower tile. |
| **Control Tower Dashboard** | `/control-tower/dashboard` | KPI cards with sparklines, Recharts lifecycle breakdown, BU spend, and RAID severity. |
| **Work Order Register** | `/control-tower` | DataTable with search, pipeline tabs, multi-criteria filters, and real CSV dataset export. |
| **6-Step Creation Wizard** | `/control-tower/new` | 1. Request Info → 2. Scope & Service → 3. Commercials → 4. Team & Plan → 5. RAID & Deliverables → 6. Review & Submit. |
| **10-Tab Detail Workspace** | `/control-tower/:id` | Full 10-tab detail view for the selected Work Order. |
| **Action Centre** | `/action-centre` | Centralized triage for pending reviews, approvals, overdue milestones, and deliverables. |
| **Service Catalogue** | `/services` | 8 enterprise service definitions with SLAs, scopes, and standard deliverables. |
| **Milestones** | `/milestones` | Global milestones tracking with progress bars and SLA overdue indicators. |
| **Deliverables** | `/deliverables` | Contractual deliverables register with inline Accept/Revise actions. |
| **RAID Register** | `/raid` | Risks, Assumptions, Issues, Dependencies tracking with severity badges. |
| **Change Requests** | `/change-requests` | Scope and commercial CR register preserving baseline audit trails. |
| **Reports & Analytics** | `/reports` | Executive portfolio analytics with exportable report metrics. |
| **Administration** | `/admin` | 14 user personas directory, 8 service definitions, and fixture reset utility. |

---

## 5. Work Order Detail Workspace — Exactly 10 Tabs (Section 13)

Every Work Order detail page (`/control-tower/:id`) implements the 10 tabs in this exact order:

1. **`Overview`**: Executive justification, business outcomes, high-level financials, delivery progress bar, and key stakeholders.
2. **`Scope & Proposal`**: In-scope activities, out-of-scope exclusions, and SI Partner proposal version history (v1, v2) with technical summaries and pricing models.
3. **`Approvals & Authorisation`**: Strict governance separation gate between Proposal Approval and Formal Authorisation; Multi-disciplinary Review Scorecard (Architecture, Commercial, Cybersecurity) and formal Release Purchase Order (PO) record with attached evidence.
4. **`Team & RACI`**: Assigned stakeholders (Business Owner, PM, SI Partner, Tech Lead, Cyber Lead, QA Lead) and complete lifecycle RACI matrix.
5. **`Plan & Milestones`**: Milestone schedule, planned dates, progress bars, overdue alerts (e.g. MS-003 overdue by 6 days relative to 14 Oct 2026), and completion controls.
6. **`Commercials`**: Pricing model (Lump Sum vs T&M), initial estimate, approved PO value, variance, and payment milestone invoice schedules.
7. **`RAID`**: Risks, Assumptions, Issues, and Dependencies table with severity badges and mitigation plans.
8. **`Deliverables / Testing / Acceptance`**: Contractual deliverables register with inline Accept/Revise actions, and Defect Tracking Log with severity filtering and resolution controls.
9. **`Deployment / Closure`**: Formal 4-pillar closure workspace: Business UAT Acceptance sign-off, Operational Handover & Runbook, Access & Credential Revocation certificate, and Final Commercial PO Settlement.
10. **`Activity / Audit`**: Associated Change Requests register with impact analysis and chronological immutable governance audit trail.

---

## 6. Seed Data & Golden Records Ground Truth

- **Fixed Deterministic Evaluation Date:** **14 October 2026**
- **Canonical Volume:** Exactly 40 Work Orders across 18 lifecycle statuses; 14 enterprise personas; 8 service definitions.
- **On-Hold Overlay Rule (15.8):** Applied to exactly 2 Work Orders (`WO-ASMO-2026-00122` and `WO-ASMO-2026-00127`). Preserves underlying lifecycle status without creating a 41st status record.

### Golden Records Verified:
- **Golden Record A (`WO-ASMO-2026-00128` — Supplier Onboarding Portal Enhancement):**
  - Lifecycle Phase: `Build`, Commercial: `Lump Sum`.
  - 4 milestones with **MS-003 overdue by 6 days** relative to 14 Oct 2026.
  - 5 deliverables, 3 RAID records.
  - Proposal v1: `Revision Required`, Proposal v2: `Approved`.
  - Formal Release PO authorized (`PO-REL-2026-00128`).
- **Golden Record B (`WO-ASMO-2026-00131` — Master Data Cleansing and Migration):**
  - Lifecycle Status: `Under Review`.
  - Commercial review: `Approved`, Architecture review: `Pending`, Cybersecurity review: `Revision Required`.
  - Formal authorisation not granted; UI strictly blocks execution kickoff.
- **Golden Record C (`WO-ASMO-2026-00119` — Finance Reporting Automation):**
  - Status: `Closed`.
  - Demonstrates full closure evidence: UAT Acceptance (`UAT-CERT-2026-00119-FINAL.pdf`), Runbook handover (`ASMO-RUNBOOK-FIN-AUTO-v2.1.docx`), and Access Revocation certificate (`CYBER-ACCESS-REVOKE-2026-10-02.log`).
- **Golden Record D (`WO-ASMO-2026-00140`):**
  - Status: `Draft`, created by Business Owner Mona Al-Ghamdi.
  - Remains draft until formal validation and submission.

---

## 7. Design Tokens & Visual Parity

- **Primary Red:** `#A21C20`
- **Walnut Dark:** `#3A2A25`
- **Warm Neutral Background:** `#F5F3F1`
- **Surface White:** `#FFFFFF`
- **Typography:** Outfit / Plus Jakarta Sans / Inter
- **Aesthetic Benchmark:** Adapted from `EDGE Portal Final Deploy` layout proportions, header/sidebar elevation, card styling, and micro-interactions while strictly maintaining ASMO business identity and Work Order terminology.
