import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Play, Pause, ArrowRight, ShieldCheck,
  CheckCircle2, Layers, Award, Sparkles, Activity, FileCheck,
  AlertTriangle, Eye, ArrowDown
} from 'lucide-react';
import './LandingPage.css';

interface HeroSlide {
  src: string;
  title: string;
  subtitle: string;
  tag: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/images/hero-control-centre.jpg',
    title: 'Advanced Operations Control Centre',
    subtitle: 'Real-time multi-tier governance, demand triage, and milestone execution across enterprise supply chains.',
    tag: 'Control Tower',
  },
  {
    src: '/images/hero-logistics-hub.jpg',
    title: 'Integrated Logistics Network',
    subtitle: 'Streamlining contractor engagements and service delivery with end-to-end contractual visibility.',
    tag: 'Logistics Network',
  },
  {
    src: '/images/hero-project-delivery.jpg',
    title: 'Precision Project Delivery',
    subtitle: 'Accelerating digital initiatives from demand qualification through release PO authorization and hypercare.',
    tag: 'Delivery Excellence',
  },
  {
    src: '/images/hero-smart-warehouse.jpg',
    title: 'Smart Automated Warehousing',
    subtitle: 'Optimizing warehouse automation projects, inventory integration, and operational handover criteria.',
    tag: 'Smart Warehousing',
  },
  {
    src: '/images/hero-supply-chain.jpg',
    title: 'End-to-End Supply Chain Orchestration',
    subtitle: 'Standardized service catalogue, automated SLA verification, and single-pane-of-glass financials.',
    tag: 'Supply Chain',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Slideshow auto-rotation: ~6 seconds per slide
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const handlePrev = () => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="asmo-landing">
      {/* ── 1. Cinematic Background Layer with Ken Burns Effect ── */}
      <div className="landing-bg-layer">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className={`landing-bg-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.src})` }}
          />
        ))}
        <div className="landing-overlay-vignette" />
        <div className="landing-overlay-grid" />
      </div>

      {/* ── 2. Top Header Utility Bar ── */}
      <header className="landing-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo on elevated white plate */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <img src="/brand/asmo-logo.jpg" alt="ASMO Logo" style={{ height: '36px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              ASMO <span style={{ color: 'var(--asmo-primary)' }}>Work Order Control Tower</span>
            </div>
            <div style={{ fontSize: '11px', color: '#A89E96', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Advanced Supply Management Operations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px' }}
          >
            <span>Enter Control Tower</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* ── 3. Hero Section ── */}
      <section className="landing-hero">
        <div style={{ maxWidth: '840px' }}>
          {/* Active slide pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(162, 28, 32, 0.25)',
              border: '1px solid rgba(162, 28, 32, 0.5)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#FF6B6E',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={13} />
            <span>{HERO_SLIDES[currentSlide].tag}</span>
          </div>

          {/* Exact Required Headline */}
          <h1 className="landing-hero-headline">
            One Control Tower. Every Work Order.
          </h1>

          {/* Exact Required Supporting Message */}
          <p className="landing-hero-subtitle">
            Bring work orders, approvals, delivery milestones, risks, deliverables and governance into one connected control tower.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', padding: '12px 28px' }}
            >
              <span>Enter Control Tower</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={scrollToCapabilities}
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                padding: '12px 24px',
              }}
            >
              <span>Explore Capabilities</span>
              <ArrowDown size={16} />
            </button>
          </div>
        </div>

        {/* Operational Metrics Strip */}
        <div className="landing-metrics-strip">
          <div className="landing-metric-card">
            <div style={{ fontSize: '11px', color: '#A89E96', textTransform: 'uppercase', fontWeight: 700 }}>Active Portfolio</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>40 Work Orders</div>
            <div style={{ fontSize: '11px', color: '#34D399', marginTop: '2px' }}>18-Stage Canonical Lifecycle</div>
          </div>

          <div className="landing-metric-card">
            <div style={{ fontSize: '11px', color: '#A89E96', textTransform: 'uppercase', fontWeight: 700 }}>Role Governance</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>14 Personas</div>
            <div style={{ fontSize: '11px', color: '#60A5FA', marginTop: '2px' }}>Separation of Review & Authorisation</div>
          </div>

          <div className="landing-metric-card">
            <div style={{ fontSize: '11px', color: '#A89E96', textTransform: 'uppercase', fontWeight: 700 }}>Service Catalogue</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>8 Pre-Configured</div>
            <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '2px' }}>Standard Deliverables & Gates</div>
          </div>

          <div className="landing-metric-card">
            <div style={{ fontSize: '11px', color: '#A89E96', textTransform: 'uppercase', fontWeight: 700 }}>On-Hold Integrity</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>2 Overlay Orders</div>
            <div style={{ fontSize: '11px', color: '#F87171', marginTop: '2px' }}>Preserves underlying execution state</div>
          </div>
        </div>

        {/* Carousel Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '2rem',
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '6px 14px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex' }}
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? '24px' : '8px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: i === currentSlide ? 'var(--asmo-primary)' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
            <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNext} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Capabilities Section (4 Exact Blocks) ── */}
      <section id="capabilities" className="landing-capabilities">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: 'var(--asmo-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Enterprise Architecture
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>
            Four Connected Control Dimensions
          </h2>
          <p style={{ fontSize: '14px', color: '#A89E96', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Eliminate operational silos across procurement, architecture, cybersecurity, and vendor delivery teams.
          </p>
        </div>

        <div className="capabilities-grid">
          {/* Block 1: Work Order Governance */}
          <div className="capability-card">
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(162, 28, 32, 0.15)',
                  color: 'var(--asmo-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                1. Work Order Governance
              </h3>
              <p style={{ fontSize: '13px', color: '#C7BFB8', lineHeight: 1.5 }}>
                Lifecycle visibility, multi-disciplinary proposal reviews, strict separation of Proposal Approval and formal Release PO Authorisation.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#A89E96' }}>
              18 Sequential Stages • Role Gating
            </div>
          </div>

          {/* Block 2: Delivery Management */}
          <div className="capability-card">
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                2. Delivery Management
              </h3>
              <p style={{ fontSize: '13px', color: '#C7BFB8', lineHeight: 1.5 }}>
                Milestone tracking, deliverable submission gates, defect triage, and formal UAT acceptance sign-off with audit evidence.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#A89E96' }}>
              Execution Gates • Defect Blocking
            </div>
          </div>

          {/* Block 3: Risk and Change Control */}
          <div className="capability-card">
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                3. Risk and Change Control
              </h3>
              <p style={{ fontSize: '13px', color: '#C7BFB8', lineHeight: 1.5 }}>
                RAID register management, Change Request (CR) impact analysis across schedule, cost, and scope, with baseline retention.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#A89E96' }}>
              CR Impact Analysis • Baseline Audit
            </div>
          </div>

          {/* Block 4: Operational Visibility */}
          <div className="capability-card">
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(13, 148, 136, 0.15)',
                  color: '#2DD4BF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Activity size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                4. Operational Visibility
              </h3>
              <p style={{ fontSize: '13px', color: '#C7BFB8', lineHeight: 1.5 }}>
                Single-pane-of-glass dashboards, spend analytics by business unit, action centre notifications, and immutable audit history.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#A89E96' }}>
              Executive Analytics • CSV Data Export
            </div>
          </div>
        </div>

        {/* Enter CTA Banner */}
        <div
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 24px',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
            Ready to Explore the Control Tower?
          </h3>
          <p style={{ fontSize: '14px', color: '#A89E96', marginTop: '0.5rem', maxWidth: '540px', margin: '0.5rem auto 1.5rem auto' }}>
            Sign in with demo credentials to access live Work Orders, approval workflows, and delivery tracking.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── 5. Enterprise Footer ── */}
      <footer
        style={{
          padding: '24px 40px',
          backgroundColor: '#070605',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '11px',
          color: '#78716C',
        }}
      >
        ASMO Work Order Control Tower Prototype • Fixed Reference Date: 14 October 2026 • Enterprise Production Prototype
      </footer>
    </div>
  );
};
