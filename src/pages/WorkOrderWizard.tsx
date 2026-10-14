import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2, Calendar,
  FileText, CheckCircle2, AlertCircle, Building, DollarSign,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Priority, CommercialModel } from '../types';

export const WorkOrderWizard: React.FC = () => {
  const navigate = useNavigate();
  const { serviceDefinitions, users, currentUser, addWorkOrder } = useStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request Information
  const [title, setTitle] = useState('');
  const [requestingBU, setRequestingBU] = useState('Supply Chain Operations');
  const [businessJustification, setBusinessJustification] = useState('');
  const [businessOutcome, setBusinessOutcome] = useState('');
  const [priority, setPriority] = useState<Priority>('High');

  // Step 2: Scope and Service
  const [serviceCategoryId, setServiceCategoryId] = useState('SVC-001');
  const [scopeDescription, setScopeDescription] = useState('Comprehensive design, implementation, and deployment of the core integration module.');
  const [inScopeItems, setInScopeItems] = useState<string[]>([
    'High-Level and Low-Level architecture specifications',
    'Core business logic implementation & unit tests',
    'Integration with ASMO internal API gateway',
  ]);
  const [newInScope, setNewInScope] = useState('');
  const [outOfScopeItems, setOutOfScopeItems] = useState<string[]>([
    'Physical hardware procurement and on-premise cabling',
    'Third-party commercial licensing fees',
  ]);
  const [newOutOfScope, setNewOutOfScope] = useState('');

  // Step 3: Commercials and Proposal
  const [commercialModel, setCommercialModel] = useState<CommercialModel>('Lump Sum');
  const [proposedValue, setProposedValue] = useState<number>(350000);
  const [pricingBasis, setPricingBasis] = useState('Fixed deliverable milestones with standard payment terms');

  // Step 4: Team and Delivery Plan
  const [plannedStartDate, setPlannedStartDate] = useState('2026-11-01');
  const [plannedEndDate, setPlannedEndDate] = useState('2027-04-30');
  const [businessOwnerId, setBusinessOwnerId] = useState(currentUser.id);
  const [projectManagerId, setProjectManagerId] = useState('USR-008'); // Amit Sharma
  const [siPartnerName, setSiPartnerName] = useState('Nexus Consulting');

  // Step 5: Risk, Dependencies and Deliverables
  const [initialRisks, setInitialRisks] = useState<string[]>([
    'Client API specifications availability in sprint 1',
    'Staging environment access provisioning lead time',
  ]);
  const [newRisk, setNewRisk] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([
    'Zero critical or high defects open in UAT',
    'System performance within defined SLA tolerances',
    'Operational handover documentation signed off',
  ]);

  const selectedService = serviceDefinitions.find(s => s.id === serviceCategoryId);

  // Auto-fill template values when service changes
  const handleServiceChange = (svcId: string) => {
    setServiceCategoryId(svcId);
    const svc = serviceDefinitions.find(s => s.id === svcId);
    if (svc) {
      setScopeDescription(svc.scopeTemplate);
      setInScopeItems([...svc.standardDeliverables]);
    }
  };

  const handleAddInScope = () => {
    if (newInScope.trim()) {
      setInScopeItems([...inScopeItems, newInScope.trim()]);
      setNewInScope('');
    }
  };

  const handleRemoveInScope = (index: number) => {
    setInScopeItems(inScopeItems.filter((_, i) => i !== index));
  };

  const handleAddOutOfScope = () => {
    if (newOutOfScope.trim()) {
      setOutOfScopeItems([...outOfScopeItems, newOutOfScope.trim()]);
      setNewOutOfScope('');
    }
  };

  const handleRemoveOutOfScope = (index: number) => {
    setOutOfScopeItems(outOfScopeItems.filter((_, i) => i !== index));
  };

  const handleAddRisk = () => {
    if (newRisk.trim()) {
      setInitialRisks([...initialRisks, newRisk.trim()]);
      setNewRisk('');
    }
  };

  const handleRemoveRisk = (index: number) => {
    setInitialRisks(initialRisks.filter((_, i) => i !== index));
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!title.trim()) {
        setError('Work Order Title is required.');
        return false;
      }
      if (!businessJustification.trim()) {
        setError('Business Justification is required.');
        return false;
      }
      if (!businessOutcome.trim()) {
        setError('Expected Business Outcome is required.');
        return false;
      }
    } else if (step === 2) {
      if (!scopeDescription.trim()) {
        setError('Scope description is required.');
        return false;
      }
      if (inScopeItems.length === 0) {
        setError('At least one in-scope item must be specified.');
        return false;
      }
    } else if (step === 3) {
      if (proposedValue <= 0) {
        setError('Estimated value must be greater than zero.');
        return false;
      }
    } else if (step === 4) {
      if (!plannedStartDate || !plannedEndDate) {
        setError('Planned start and completion dates are required.');
        return false;
      }
      if (new Date(plannedEndDate) <= new Date(plannedStartDate)) {
        setError('Planned completion date must be after planned start date.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleSave = (isSubmit: boolean) => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);

    const newWO = addWorkOrder({
      title: title.trim(),
      requestingBusinessUnit: requestingBU,
      serviceCategoryId,
      businessJustification: businessJustification.trim(),
      businessOutcome: businessOutcome.trim(),
      priority,
      commercialModel,
      proposedValue: Number(proposedValue),
      scopeDescription: scopeDescription.trim(),
      inScopeActivities: inScopeItems,
      outOfScopeActivities: outOfScopeItems,
      assumptions: ['Client infrastructure readiness', 'API documentation delivered'],
      dependencies: initialRisks,
      expectedDeliverables: inScopeItems,
      acceptanceCriteria: acceptanceCriteria,
      plannedStartDate,
      plannedEndDate,
      businessOwnerId,
      projectManagerId,
      siPartnerName,
      lifecycleStatus: isSubmit ? 'Submitted' : 'Draft',
    });

    navigate(`/control-tower/${newWO.id}`);
  };

  const wizardSteps = [
    { num: 1, title: 'Request Info', desc: 'Demand & Business Case' },
    { num: 2, title: 'Scope & Service', desc: 'Catalogue & Boundaries' },
    { num: 3, title: 'Commercials', desc: 'Model & Pricing' },
    { num: 4, title: 'Team & Plan', desc: 'Schedule & Stakeholders' },
    { num: 5, title: 'Risk & Deliverables', desc: 'RAID & Acceptance' },
    { num: 6, title: 'Review & Submit', desc: 'Validation & Submission' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', fontSize: '12px' }}>
            <Link to="/control-tower" style={{ color: 'var(--asmo-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={13} /> Back to Register
            </Link>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>6-Step Creation Wizard</span>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Initiate Work Order Demand
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Create and classify a new Work Order from the standardized ASMO Service Catalogue.
            </p>
          </div>

          {/* Stepper Progress Bar (6 Steps) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
              marginBottom: '2rem',
            }}
          >
            {wizardSteps.map(s => {
              const isActive = step === s.num;
              const isPassed = step > s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num)}
                  style={{
                    backgroundColor: isActive ? 'var(--asmo-primary-light)' : 'var(--color-surface)',
                    border: isActive ? '2px solid var(--asmo-primary)' : isPassed ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: s.num < step ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--color-success)' : isActive ? 'var(--asmo-primary)' : 'var(--color-border)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                  >
                    {isPassed ? <Check size={14} /> : s.num}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isActive ? 'var(--asmo-primary)' : 'var(--color-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: REQUEST INFORMATION ── */}
          {step === 1 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 1: Request Information & Business Demand
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Work Order Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Automated Warehouse Dispatch Orchestration Module"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Requesting Business Unit *
                  </label>
                  <select
                    value={requestingBU}
                    onChange={(e) => setRequestingBU(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Supply Chain Operations">Supply Chain Operations</option>
                    <option value="Warehouse Operations">Warehouse Operations</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Procurement Operations">Procurement Operations</option>
                    <option value="IT Governance">IT Governance</option>
                    <option value="Facilities & Security">Facilities & Security</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Business Justification *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain why this demand is required, operational pain points, or compliance mandate..."
                    value={businessJustification}
                    onChange={(e) => setBusinessJustification(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Expected Business Outcome & Benefits *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Measurable outcomes (e.g. 15% faster turnaround, SLA compliance)..."
                    value={businessOutcome}
                    onChange={(e) => setBusinessOutcome(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ width: '240px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 2: SCOPE AND SERVICE ── */}
          {step === 2 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 2: Scope Boundaries & Service Catalogue
              </h2>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Service Catalogue Category *
                </label>
                <select
                  value={serviceCategoryId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                >
                  {serviceDefinitions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — Indicative duration: {s.indicativeDuration}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Scope Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                />
              </div>

              {/* In-Scope */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  In-Scope Activities ({inScopeItems.length})
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add an in-scope item..."
                    value={newInScope}
                    onChange={(e) => setNewInScope(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInScope())}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                  <button type="button" onClick={handleAddInScope} className="btn btn-secondary btn-sm">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {inScopeItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#F0FDF4', borderRadius: '4px', border: '1px solid #BBF7D0', fontSize: '12px', color: '#166534' }}>
                      <span>✓ {item}</span>
                      <button type="button" onClick={() => handleRemoveInScope(i)} style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Out-of-Scope */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Explicit Out-of-Scope Exclusions ({outOfScopeItems.length})
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add an exclusion..."
                    value={newOutOfScope}
                    onChange={(e) => setNewOutOfScope(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOutOfScope())}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                  <button type="button" onClick={handleAddOutOfScope} className="btn btn-secondary btn-sm">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {outOfScopeItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#FEF2F2', borderRadius: '4px', border: '1px solid #FECACA', fontSize: '12px', color: '#991B1B' }}>
                      <span>✕ {item}</span>
                      <button type="button" onClick={() => handleRemoveOutOfScope(i)} style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: COMMERCIALS AND PROPOSAL ── */}
          {step === 3 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 3: Commercial Model & Financial Estimations
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Commercial Model *
                  </label>
                  <select
                    value={commercialModel}
                    onChange={(e) => setCommercialModel(e.target.value as CommercialModel)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Lump Sum">Lump Sum (Milestone-based Deliverables)</option>
                    <option value="Time & Materials">Time & Materials (Standard Rate Card)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Estimated Commercial Value (SAR) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={proposedValue}
                    onChange={(e) => setProposedValue(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Pricing Basis & Billing Schedule
                </label>
                <textarea
                  rows={3}
                  value={pricingBasis}
                  onChange={(e) => setPricingBasis(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: TEAM AND DELIVERY PLAN ── */}
          {step === 4 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 4: Delivery Schedule & Team Governance
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Planned Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={plannedStartDate}
                    onChange={(e) => setPlannedStartDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Planned Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={plannedEndDate}
                    onChange={(e) => setPlannedEndDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Business Owner *
                  </label>
                  <select
                    value={businessOwnerId}
                    onChange={(e) => setBusinessOwnerId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Assigned Project Manager *
                  </label>
                  <select
                    value={projectManagerId}
                    onChange={(e) => setProjectManagerId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
                  >
                    {users.filter(u => u.role === 'Project Manager' || u.role === 'Admin' || u.role === 'Work Order Manager').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Contracted SI Partner
                  </label>
                  <input
                    type="text"
                    value={siPartnerName}
                    onChange={(e) => setSiPartnerName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: 'var(--color-bg)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: RISK, DEPENDENCIES AND DELIVERABLES ── */}
          {step === 5 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 5: RAID Items & Acceptance Criteria
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Identified Risks & Dependencies ({initialRisks.length})
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add a risk or key dependency..."
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRisk())}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                  <button type="button" onClick={handleAddRisk} className="btn btn-secondary btn-sm">
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {initialRisks.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
                      <span>⚠️ {item}</span>
                      <button type="button" onClick={() => handleRemoveRisk(i)} style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Mandated Acceptance Verification Criteria
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {acceptanceCriteria.map((crit, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', fontSize: '12px' }}>
                      ✓ {crit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 6: REVIEW AND SUBMIT ── */}
          {step === 6 && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Step 6: Review Summary & Demand Submission
              </h2>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  border: '1px solid var(--color-border)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Title</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px' }}>{title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Service Category</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>{selectedService?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Value</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--asmo-primary)', marginTop: '2px' }}>SAR {proposedValue.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Requesting BU</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px' }}>{requestingBU}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Timeline</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px' }}>{plannedStartDate} to {plannedEndDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Commercial Model</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px' }}>{commercialModel}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#065F46' }}>
                  All 6 creation stages validated. Save as <strong>Draft</strong> for ongoing editing, or <strong>Submit</strong> to initiate qualification immediately.
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(prev => prev - 1)}
              className="btn btn-secondary"
              style={{ opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous Step
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Continue to Step {step + 1}</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(false)}
                    className="btn btn-secondary"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Check size={16} />
                    <span>Submit Work Order</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
