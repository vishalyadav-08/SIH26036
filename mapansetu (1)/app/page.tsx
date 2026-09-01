'use client';

import React, { useState } from 'react';
import { 
  UserRole, 
  Instrument, 
  VerificationApplication, 
  VerificationCertificate, 
  Officer, 
  AuditLog, 
  NotificationItem 
} from '@/lib/types';
import { Language } from '@/lib/translations';
import { 
  initialInstruments, 
  initialCertificates, 
  initialApplications, 
  initialOfficers, 
  initialAuditLogs, 
  initialNotifications 
} from '@/lib/mockData';

// Components
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PublicVerifyView } from '@/components/PublicVerifyView';
import { LoginView } from '@/components/LoginView';
import { MerchantDashboardView } from '@/components/MerchantDashboardView';
import { InstrumentsView } from '@/components/InstrumentsView';
import { InstrumentPassportView } from '@/components/InstrumentPassportView';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { RegisterInstrumentView } from '@/components/RegisterInstrumentView';
import { ApplicationQueueView } from '@/components/ApplicationQueueView';
import { 
  OfficersView, 
  SchedulesView, 
  AuditView, 
  ResourcesView, 
  HelpView, 
  SettingsView 
} from '@/components/SecondaryViews';
import { 
  AssignOfficerModal, 
  ScheduleInspectionModal, 
  NewApplicationModal, 
  CertificatePdfModal, 
  GalleryModal, 
  QrScannerModal 
} from '@/components/Modals';

export default function Home() {
  // Navigation & Role State
  const [currentView, setCurrentView] = useState<string>('public_verify');
  const [userRole, setUserRole] = useState<UserRole>('public');
  const [language, setLanguage] = useState<Language>('en');

  // Application Data States
  const [instruments, setInstruments] = useState<Instrument[]>(initialInstruments);
  const [applications, setApplications] = useState<VerificationApplication[]>(initialApplications);
  const [certificates, setCertificates] = useState<Record<string, VerificationCertificate>>(initialCertificates);
  const [officers, setOfficers] = useState<Officer[]>(initialOfficers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Selected Entities for Detail Views
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>('INST-2026-98241');
  const [selectedCertNumber, setSelectedCertNumber] = useState<string>('CERT-DEMO-001');
  const [selectedAppForAction, setSelectedAppForAction] = useState<VerificationApplication | null>(null);

  // Modal States
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showNewAppModal, setShowNewAppModal] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [activePdfCert, setActivePdfCert] = useState<VerificationCertificate | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [activeGalleryInstrument, setActiveGalleryInstrument] = useState<Instrument | null>(null);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);

  // Unread notifications
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Handlers
  const handleSelectInstrument = (id: string) => {
    setSelectedInstrumentId(id);
    setCurrentView('instrument_passport');
  };

  const handleSelectCertificate = (certNumber: string) => {
    setSelectedCertNumber(certNumber);
    setCurrentView('public_verify');
  };

  const handleOpenPdfModal = (cert: VerificationCertificate) => {
    setActivePdfCert(cert);
    setShowPdfModal(true);
  };

  const handleOpenGallery = (inst: Instrument) => {
    setActiveGalleryInstrument(inst);
    setShowGalleryModal(true);
  };

  const handleQrScanResult = (scannedCert: string) => {
    setSelectedCertNumber(scannedCert);
    setCurrentView('public_verify');
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    if (role === 'officer') {
      setCurrentView('admin_dashboard');
    } else if (role === 'merchant') {
      setCurrentView('merchant_dashboard');
    } else {
      setCurrentView('public_verify');
    }
  };

  const handleAssignOfficer = (appId: string, officerName: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, state: 'ASSIGNED', officer: officerName } : app
      )
    );
    // Add audit log
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      title: 'Officer Assigned',
      description: `${officerName} assigned to application ${appId}.`,
      timestamp: 'Just now',
      actor: 'Admin',
      category: 'assignment',
      severity: 'info',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleScheduleInspection = (appId: string, date: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, state: 'SCHEDULED', scheduledDate: date } : app
      )
    );
  };

  const handleNewApplicationSubmit = (newApp: VerificationApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Application Filed',
      message: `Application ${newApp.id} for ${newApp.instrumentType} received.`,
      timeAgo: 'Just now',
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRegisterInstrumentSubmit = (newInst: Instrument) => {
    setInstruments((prev) => [newInst, ...prev]);
    setSelectedInstrumentId(newInst.id);
    setCurrentView('instrument_passport');
  };

  const currentInstrument =
    instruments.find((i) => i.id === selectedInstrumentId) || instruments[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#1E293B]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
        language={language}
        setLanguage={setLanguage}
        unreadNotifsCount={unreadNotifsCount}
        onOpenQrScanner={() => setShowQrScanner(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {/* Screen 1 & Screen 2: Public Verification Portal */}
        {currentView === 'public_verify' && (
          <PublicVerifyView
            language={language}
            certificates={certificates}
            onSelectInstrument={handleSelectInstrument}
            onOpenQrScanner={() => setShowQrScanner(true)}
            onOpenPdfModal={handleOpenPdfModal}
            initialCertNumber={selectedCertNumber}
          />
        )}

        {/* Screen 3: Sign-In Screen */}
        {currentView === 'login' && (
          <LoginView
            language={language}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* Screen 4: Merchant Dashboard */}
        {currentView === 'merchant_dashboard' && (
          <MerchantDashboardView
            language={language}
            applications={applications}
            notifications={notifications}
            onOpenNewApplication={() => setShowNewAppModal(true)}
            onOpenRegisterInstrument={() => setCurrentView('register_instrument')}
            onViewAllApplications={() => setCurrentView('application_queue')}
            onViewInstruments={() => setCurrentView('instruments')}
            onSelectApplication={(appId) => {
              const found = applications.find((a) => a.id === appId);
              if (found) {
                setSelectedAppForAction(found);
                setShowScheduleModal(true);
              }
            }}
            onSelectCertificate={handleSelectCertificate}
          />
        )}

        {/* Screen 5: Instruments List */}
        {currentView === 'instruments' && (
          <InstrumentsView
            language={language}
            instruments={instruments}
            onSelectInstrument={handleSelectInstrument}
            onOpenRegisterInstrument={() => setCurrentView('register_instrument')}
          />
        )}

        {/* Screen 6: Instrument Passport */}
        {currentView === 'instrument_passport' && (
          <InstrumentPassportView
            language={language}
            instrument={currentInstrument}
            onBack={() => setCurrentView('instruments')}
            onOpenPdfModal={handleOpenPdfModal}
            onOpenGallery={handleOpenGallery}
            onOpenNewApplication={(instId) => {
              setSelectedInstrumentId(instId);
              setShowNewAppModal(true);
            }}
            certificates={certificates}
          />
        )}

        {/* Screen 7: Operational Admin Dashboard */}
        {currentView === 'admin_dashboard' && (
          <AdminDashboardView
            language={language}
            applications={applications}
            auditLogs={auditLogs}
            onOpenNewApplication={() => setShowNewAppModal(true)}
            onNavigate={(view) => setCurrentView(view)}
            onAssignOfficer={(app) => {
              setSelectedAppForAction(app);
              setShowAssignModal(true);
            }}
            onReviewApplication={(app) => {
              setSelectedAppForAction(app);
              setShowScheduleModal(true);
            }}
          />
        )}

        {/* Screen 8: Register New Instrument 5-Step Wizard */}
        {currentView === 'register_instrument' && (
          <RegisterInstrumentView
            language={language}
            onCancel={() => setCurrentView('instruments')}
            onSubmitSuccess={handleRegisterInstrumentSubmit}
          />
        )}

        {/* Screen 9: Application Queue */}
        {currentView === 'application_queue' && (
          <ApplicationQueueView
            language={language}
            applications={applications}
            officers={officers}
            onAssignOfficer={(app) => {
              setSelectedAppForAction(app);
              setShowAssignModal(true);
            }}
            onScheduleInspection={(app) => {
              setSelectedAppForAction(app);
              setShowScheduleModal(true);
            }}
            onReviewApplication={(app) => {
              setSelectedAppForAction(app);
              setShowScheduleModal(true);
            }}
            onOpenNewApplication={() => setShowNewAppModal(true)}
          />
        )}

        {/* Officers View */}
        {currentView === 'officers' && <OfficersView officers={officers} />}

        {/* Schedules View */}
        {currentView === 'schedules' && <SchedulesView />}

        {/* Audit View */}
        {currentView === 'audit' && <AuditView auditLogs={auditLogs} />}

        {/* Resources View */}
        {currentView === 'resources' && <ResourcesView />}

        {/* Help Center View */}
        {currentView === 'help' && <HelpView />}

        {/* Settings View */}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <AssignOfficerModal
        application={selectedAppForAction}
        officers={officers}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedAppForAction(null);
        }}
        onAssign={handleAssignOfficer}
      />

      <ScheduleInspectionModal
        application={selectedAppForAction}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedAppForAction(null);
        }}
        onSchedule={handleScheduleInspection}
      />

      <NewApplicationModal
        isOpen={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        instruments={instruments}
        selectedInstrumentId={selectedInstrumentId}
        onSubmit={handleNewApplicationSubmit}
      />

      <CertificatePdfModal
        certificate={activePdfCert}
        onClose={() => {
          setShowPdfModal(false);
          setActivePdfCert(null);
        }}
      />

      <GalleryModal
        instrument={activeGalleryInstrument}
        onClose={() => {
          setShowGalleryModal(false);
          setActiveGalleryInstrument(null);
        }}
      />

      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanResult={handleQrScanResult}
      />

      {/* Footer */}
      <Footer
        language={language}
        onOpenHelp={() => setCurrentView('help')}
        onOpenResources={() => setCurrentView('resources')}
      />
    </div>
  );
}
