import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ApplicationHome } from './pages/ApplicationHome';
import { ControlTowerDashboard } from './pages/ControlTowerDashboard';
import { ControlTowerRegister } from './pages/ControlTowerRegister';
import { WorkOrderWizard } from './pages/WorkOrderWizard';
import { WorkOrderDetail } from './pages/WorkOrderDetail';
import { ActionCentrePage } from './pages/ActionCentrePage';
import { ServiceCataloguePage } from './pages/ServiceCataloguePage';
import { MilestonesPage } from './pages/MilestonesPage';
import { CalendarPage } from './pages/CalendarPage';
import { DeliverablesPage } from './pages/DeliverablesPage';
import { RAIDPage } from './pages/RAIDPage';
import { ChangeRequestsPage } from './pages/ChangeRequestsPage';
import { ReportsDashboard } from './pages/ReportsDashboard';
import { AdminPage } from './pages/AdminPage';
import { ScrollToTop } from './components/ScrollToTop';

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* 1. Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* 3. Application Home (Launcher) */}
      <Route path="/home" element={<ApplicationHome />} />

      {/* 4. Work Order Control Tower Dashboard */}
      <Route path="/control-tower/dashboard" element={<ControlTowerDashboard />} />

      {/* 5. Work Order Register */}
      <Route path="/control-tower" element={<ControlTowerRegister />} />

      {/* 6. Work Order Creation 6-Step Wizard */}
      <Route path="/control-tower/new" element={<WorkOrderWizard />} />

      {/* 7. Work Order 10-Tab Detail Workspace */}
      <Route path="/control-tower/:id" element={<WorkOrderDetail />} />

      {/* 8. Supporting Work Order Modules */}
      <Route path="/action-centre" element={<ActionCentrePage />} />
      <Route path="/services" element={<ServiceCataloguePage />} />
      <Route path="/milestones" element={<MilestonesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/deliverables" element={<DeliverablesPage />} />
      <Route path="/raid" element={<RAIDPage />} />
      <Route path="/change-requests" element={<ChangeRequestsPage />} />
      <Route path="/reports" element={<ReportsDashboard />} />
      <Route path="/admin" element={<AdminPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </>
  );
};

export default App;
