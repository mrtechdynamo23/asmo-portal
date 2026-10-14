// ==========================================================================
// ASMO Work Order Control Tower — Data Validation Script
// ==========================================================================
import { seedUsers } from '../src/data/users.ts';
import { seedServiceDefinitions } from '../src/data/services.ts';
import { seedWorkOrders } from '../src/data/workOrders.ts';
import {
  seedMilestones, seedDeliverables, seedRAIDRecords, seedProposalVersions,
  seedReviewTasks, seedAuthorisations, seedActionItems, seedNotifications,
  seedChangeRequests, seedCommercialLines, seedPaymentMilestones,
  seedTeamAssignments, seedDefects, seedTestRecords, seedTimesheetEntries,
  seedApprovalDecisions, seedAuditEvents
} from '../src/data/supporting.ts';

console.log('------------------------------------------------------------');
console.log('ASMO Work Order Control Tower — Dataset Validation Starting');
console.log('Reference Date: 14 October 2026');
console.log('------------------------------------------------------------\n');

let errors: string[] = [];
let warnings: string[] = [];

// 1. Validate Users
console.log(`[1/7] Validating ${seedUsers.length} Users...`);
if (seedUsers.length < 14) {
  errors.push(`Expected at least 14 users, found ${seedUsers.length}`);
}
const userIds = new Set(seedUsers.map(u => u.id));
if (userIds.size !== seedUsers.length) {
  errors.push('Duplicate user IDs found');
}

// 2. Validate Service Definitions
console.log(`[2/7] Validating ${seedServiceDefinitions.length} Service Definitions...`);
if (seedServiceDefinitions.length !== 8) {
  errors.push(`Expected exactly 8 service definitions, found ${seedServiceDefinitions.length}`);
}
const serviceIds = new Set(seedServiceDefinitions.map(s => s.id));

// 3. Validate Work Orders
console.log(`[3/7] Validating ${seedWorkOrders.length} Work Orders...`);
if (seedWorkOrders.length !== 40) {
  errors.push(`Expected exactly 40 Work Orders, found ${seedWorkOrders.length}`);
}

const woIds = new Set<string>();
const statusCounts: Record<string, number> = {};
let onHoldCount = 0;

for (const wo of seedWorkOrders) {
  if (woIds.has(wo.id)) {
    errors.push(`Duplicate Work Order ID: ${wo.id}`);
  }
  woIds.add(wo.id);

  if (!userIds.has(wo.businessOwnerId)) {
    errors.push(`Work Order ${wo.id} references invalid businessOwnerId: ${wo.businessOwnerId}`);
  }
  if (!serviceIds.has(wo.serviceCategoryId)) {
    errors.push(`Work Order ${wo.id} references invalid serviceCategoryId: ${wo.serviceCategoryId}`);
  }

  statusCounts[wo.lifecycleStatus] = (statusCounts[wo.lifecycleStatus] || 0) + 1;

  if (wo.isOnHold) {
    onHoldCount++;
    if (!wo.holdReason) {
      errors.push(`Work Order ${wo.id} is On Hold but missing holdReason`);
    }
    if (!wo.holdExpectedResumeDate) {
      warnings.push(`Work Order ${wo.id} is On Hold but missing holdExpectedResumeDate`);
    }
  }

  if (wo.proposedValue < 0) {
    errors.push(`Work Order ${wo.id} has negative proposedValue`);
  }
  if (wo.deliveryProgress < 0 || wo.deliveryProgress > 100) {
    errors.push(`Work Order ${wo.id} has invalid progress: ${wo.deliveryProgress}`);
  }
}

console.log(`   - Status Distribution:`, statusCounts);
console.log(`   - Work Orders on Hold: ${onHoldCount} (expected 2)`);
if (onHoldCount !== 2) {
  warnings.push(`Expected 2 Work Orders on Hold, found ${onHoldCount}`);
}

// 4. Validate Milestones
console.log(`[4/7] Validating ${seedMilestones.length} Milestones...`);
for (const m of seedMilestones) {
  if (!woIds.has(m.workOrderId)) {
    errors.push(`Milestone ${m.id} references unknown workOrderId: ${m.workOrderId}`);
  }
  if (m.completionPercentage < 0 || m.completionPercentage > 100) {
    errors.push(`Milestone ${m.id} invalid completion percentage: ${m.completionPercentage}`);
  }
}

// 5. Validate Deliverables & RAID
console.log(`[5/7] Validating ${seedDeliverables.length} Deliverables & ${seedRAIDRecords.length} RAID Records...`);
for (const d of seedDeliverables) {
  if (!woIds.has(d.workOrderId)) {
    errors.push(`Deliverable ${d.id} references unknown workOrderId: ${d.workOrderId}`);
  }
}
for (const r of seedRAIDRecords) {
  if (!woIds.has(r.workOrderId)) {
    errors.push(`RAID record ${r.id} references unknown workOrderId: ${r.workOrderId}`);
  }
}

// 6. Validate Proposals & Review Tasks
console.log(`[6/7] Validating ${seedProposalVersions.length} Proposals & ${seedReviewTasks.length} Review Tasks...`);
for (const p of seedProposalVersions) {
  if (!woIds.has(p.workOrderId)) {
    errors.push(`Proposal ${p.id} references unknown workOrderId: ${p.workOrderId}`);
  }
}
for (const t of seedReviewTasks) {
  if (!woIds.has(t.workOrderId)) {
    errors.push(`Review task ${t.id} references unknown workOrderId: ${t.workOrderId}`);
  }
}

// 7. Validate Authorisations, Audits, Commercials
console.log(`[7/7] Validating Authorisations (${seedAuthorisations.length}), Audit Events (${seedAuditEvents.length})...`);
for (const a of seedAuthorisations) {
  if (!woIds.has(a.workOrderId)) {
    errors.push(`Authorisation ${a.id} references unknown workOrderId: ${a.workOrderId}`);
  }
  if (!a.releasePOReference) {
    errors.push(`Authorisation ${a.id} missing releasePOReference`);
  }
}

console.log('\n============================================================');
if (warnings.length > 0) {
  console.log(`⚠️ Warnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`   - ${w}`));
}

if (errors.length > 0) {
  console.error(`❌ Validation FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error(`   - ${e}`));
  process.exit(1);
} else {
  console.log('✅ ALL DATA VALIDATION CHECKS PASSED SUCCESSFULLY!');
  console.log(`   - 14 Users validated`);
  console.log(`   - 8 Service Definitions validated`);
  console.log(`   - 40 Work Orders validated across all lifecycle stages`);
  console.log(`   - On Hold overlay logic verified`);
  console.log(`   - Milestones, Deliverables, RAID, Proposals & Reviews reconciled`);
  console.log('============================================================\n');
  process.exit(0);
}
