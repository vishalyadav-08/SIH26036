import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  InspectionTask,
  OfficerProfile,
  SyncQueueItem,
  InspectionResult,
  ChecklistItem,
  MeasurementReading,
  EvidenceItem,
  InspectionTemplate,
} from './types';
import {
  INITIAL_OFFICER_PROFILE,
  INITIAL_INSPECTIONS,
  INITIAL_SYNC_QUEUE,
  SAMPLE_CHECKLIST,
  SAMPLE_READINGS,
  SAMPLE_EVIDENCE,
} from './data/initialData';
import {
  loadSavedTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from './data/initialTemplates';

import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { InspectionsListScreen } from './components/InspectionsListScreen';
import { WizardHeader } from './components/InspectionWizard/WizardHeader';
import { Step1Checklist } from './components/InspectionWizard/Step1Checklist';
import { Step2Readings } from './components/InspectionWizard/Step2Readings';
import { Step3Evidence } from './components/InspectionWizard/Step3Evidence';
import { Step4Review } from './components/InspectionWizard/Step4Review';
import { LocationCaptureModal } from './components/LocationCaptureModal';
import { SyncCenterScreen } from './components/SyncCenterScreen';
import { ConflictResolutionScreen } from './components/ConflictResolutionScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SecuritySessionsScreen } from './components/SecuritySessionsScreen';
import { OfflineMapView } from './components/OfflineMapView';
import { InspectionHistoryScreen } from './components/InspectionHistoryScreen';
import { InspectionReportModal } from './components/InspectionReportModal';
import { InspectionTemplatesScreen } from './components/InspectionTemplatesScreen';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { SaveAsTemplateModal } from './components/SaveAsTemplateModal';
import { Toast } from './components/Toast';

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [reportModalTask, setReportModalTask] = useState<InspectionTask | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  // Connectivity Simulation
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Officer Profile
  const [profile, setProfile] = useState<OfficerProfile>(INITIAL_OFFICER_PROFILE);

  // Templates State
  const [templates, setTemplates] = useState<InspectionTemplate[]>(() => loadSavedTemplates());

  // Inspections State
  const [inspections, setInspections] = useState<InspectionTask[]>(INITIAL_INSPECTIONS);
  const [activeTask, setActiveTask] = useState<InspectionTask>(INITIAL_INSPECTIONS[0]);
  const [activeWizardStep, setActiveWizardStep] = useState<number>(1);

  // Sync Queue State
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(INITIAL_SYNC_QUEUE);

  const showToast = (
    text: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    setToastMessage({ text, type });
  };

  // Toggle online/offline mode
  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      showToast(
        next ? 'Network restored: Online mode active' : 'Network lost: Offline mode enabled',
        next ? 'success' : 'warning'
      );
      return next;
    });
  };

  // Start an inspection task
  const handleStartInspection = (task: InspectionTask) => {
    setActiveTask(task);
    setActiveWizardStep(1);
    setCurrentScreen('inspection-flow');
  };

  // Create & start a brand new inspection task
  const handleStartNewInspection = () => {
    const newId = `task_${Date.now()}`;
    const newAppId = `APP-DEMO-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: InspectionTask = {
      id: newId,
      appId: newAppId,
      title: 'Counter Scale Verification',
      businessName: 'Apex Retailer Ltd',
      sector: 'Sector 4 Commercial Zone',
      scheduledTime: 'Today 15:30 PM',
      status: 'draft',
      description: 'Routine field metrology verification and load tolerance check.',
      urgency: 'scheduled',
      checklists: JSON.parse(JSON.stringify(SAMPLE_CHECKLIST)),
      readings: JSON.parse(JSON.stringify(SAMPLE_READINGS)),
      evidence: JSON.parse(JSON.stringify(SAMPLE_EVIDENCE)),
      location: {
        lat: 28.6139,
        lng: 77.209,
        accuracy: 4.2,
        status: 'available',
        address: 'Sector 4 Commercial Hub, New Delhi',
      },
    };

    setInspections((prev) => [newTask, ...prev]);
    setActiveTask(newTask);
    setActiveWizardStep(1);
    setCurrentScreen('inspection-flow');
    showToast(`New inspection draft ${newAppId} created`, 'info');
  };

  // Start new inspection pre-populated from a Template
  const handleStartInspectionFromTemplate = (template: InspectionTemplate) => {
    const newId = `task_${Date.now()}`;
    const newAppId = `APP-TMPL-${Math.floor(100 + Math.random() * 900)}`;

    const freshChecklists: ChecklistItem[] = template.checklists.map((c, i) => ({
      id: `c_inst_${Date.now()}_${i}`,
      category: c.category,
      label: c.label,
      completed: false,
      notes: '',
    }));

    const freshReadings: MeasurementReading[] = template.readings.map((r, i) => ({
      id: `r_inst_${Date.now()}_${i}`,
      name: r.name,
      referenceWeight: r.referenceWeight,
      maxPermissibleError: r.maxPermissibleError,
      unit: r.unit,
      isRequired: r.isRequired,
      indicatedWeight: undefined,
    }));

    const newTask: InspectionTask = {
      id: newId,
      appId: newAppId,
      title: template.name,
      businessName: `New ${template.businessType} Unit`,
      sector: 'Industrial / Commercial Field Zone',
      scheduledTime: 'Field Walk-In (Today)',
      status: 'draft',
      accuracyClass: template.accuracyClass,
      description: template.description || 'Statutory verification using saved business template.',
      urgency: 'scheduled',
      checklists: freshChecklists,
      readings: freshReadings,
      evidence: [],
      location: {
        lat: 28.6139,
        lng: 77.209,
        accuracy: 4.2,
        status: 'available',
        address: 'Sector Commercial Hub',
      },
      finalAssessment: {
        result: null,
        officerNotes: template.defaultNotes || '',
      },
    };

    setInspections((prev) => [newTask, ...prev]);
    setActiveTask(newTask);
    setActiveWizardStep(1);
    setCurrentScreen('inspection-flow');
    showToast(`Pre-populated from "${template.name}"`, 'success');
  };

  // Apply template to active inspection
  const handleApplyTemplateToActive = (template: InspectionTemplate, mode: 'replace' | 'append') => {
    const freshChecklists: ChecklistItem[] = template.checklists.map((c, i) => ({
      id: `c_inst_${Date.now()}_${i}`,
      category: c.category,
      label: c.label,
      completed: false,
      notes: '',
    }));

    const freshReadings: MeasurementReading[] = template.readings.map((r, i) => ({
      id: `r_inst_${Date.now()}_${i}`,
      name: r.name,
      referenceWeight: r.referenceWeight,
      maxPermissibleError: r.maxPermissibleError,
      unit: r.unit,
      isRequired: r.isRequired,
      indicatedWeight: undefined,
    }));

    setActiveTask((prev) => {
      let mergedChecklists = freshChecklists;
      let mergedReadings = freshReadings;

      if (mode === 'append') {
        mergedChecklists = [...prev.checklists, ...freshChecklists];
        mergedReadings = [...prev.readings, ...freshReadings];
      }

      return {
        ...prev,
        accuracyClass: template.accuracyClass || prev.accuracyClass,
        checklists: mergedChecklists,
        readings: mergedReadings,
      };
    });

    setShowTemplatePicker(false);
    showToast(
      mode === 'replace'
        ? `Applied "${template.name}" configuration`
        : `Appended items from "${template.name}"`,
      'success'
    );
  };

  // Save custom template to state and persistent storage
  const handleSaveCustomTemplate = (newTemplate: InspectionTemplate) => {
    const updated = saveCustomTemplate(newTemplate);
    setTemplates(updated);
    setShowSaveAsTemplate(false);
    showToast(`Template "${newTemplate.name}" saved to library!`, 'success');
  };

  // Delete custom template
  const handleDeleteCustomTemplate = (templateId: string) => {
    const updated = deleteCustomTemplate(templateId);
    setTemplates(updated);
    showToast('Template deleted from library', 'info');
  };

  // Update Checklist Item
  const handleToggleChecklistItem = (itemId: string) => {
    setActiveTask((prev) => {
      const updatedChecklists = prev.checklists.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...prev, checklists: updatedChecklists };
    });
  };

  // Mark all checklists completed
  const handleCheckAllChecklist = () => {
    setActiveTask((prev) => {
      const updatedChecklists = prev.checklists.map((item) => ({
        ...item,
        completed: true,
      }));
      return { ...prev, checklists: updatedChecklists };
    });
    showToast('All checklist items marked passed', 'success');
  };

  // Update Measurement Reading
  const handleUpdateReading = (readingId: string, indicatedVal: number | undefined) => {
    setActiveTask((prev) => {
      const updatedReadings = prev.readings.map((r) =>
        r.id === readingId ? { ...r, indicatedWeight: indicatedVal } : r
      );
      return { ...prev, readings: updatedReadings };
    });
  };

  // Add an extra reading
  const handleAddReading = () => {
    const newReading: MeasurementReading = {
      id: `reading_${Date.now()}`,
      name: `${(activeTask.readings.length + 1) * 5}kg Load Test`,
      referenceWeight: (activeTask.readings.length + 1) * 5,
      unit: 'kg',
      isRequired: false,
      maxPermissibleError: 0.05,
    };

    setActiveTask((prev) => ({
      ...prev,
      readings: [...prev.readings, newReading],
    }));
    showToast('Additional test weight added', 'info');
  };

  // Add evidence photo
  const handleAddEvidence = (item: EvidenceItem) => {
    setActiveTask((prev) => ({
      ...prev,
      evidence: [...prev.evidence, item],
    }));
    showToast(`Photo "${item.title}" attached`, 'success');
  };

  // Remove evidence photo
  const handleRemoveEvidence = (itemId: string) => {
    setActiveTask((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== itemId),
    }));
    showToast('Evidence removed', 'info');
  };

  // Submit Inspection Review
  const handleSubmitInspection = (result: InspectionResult, notes: string) => {
    const completedTask: InspectionTask = {
      ...activeTask,
      status: isOnline ? 'completed' : 'ready_to_sync',
      finalAssessment: {
        result,
        officerNotes: notes,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };

    // Update in inspections list
    setInspections((prev) =>
      prev.map((t) => (t.id === completedTask.id ? completedTask : t))
    );

    // Add to sync queue if offline or completed
    const newQueueItem: SyncQueueItem = {
      id: `queue_${Date.now()}`,
      appId: completedTask.appId,
      title: `${completedTask.title} (${result.toUpperCase()})`,
      type: 'draft',
      status: isOnline ? 'synced' : 'pending',
      timestamp: 'Just now',
    };

    setSyncQueue((prev) => [newQueueItem, ...prev.filter((i) => i.appId !== completedTask.appId)]);

    showToast(
      isOnline
        ? `Inspection ${completedTask.appId} uploaded to central server`
        : `Inspection ${completedTask.appId} saved locally in offline queue`,
      'success'
    );

    setCurrentScreen('inspections');
  };

  // Sync All Queue Items
  const handleSyncAll = () => {
    setSyncQueue((prev) =>
      prev.map((i) => ({
        ...i,
        status: 'synced',
      }))
    );
    setInspections((prev) =>
      prev.map((t) => (t.status === 'ready_to_sync' ? { ...t, status: 'completed' } : t))
    );
    setProfile((prev) => ({
      ...prev,
      lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    showToast('All queued records synchronized with central server', 'success');
  };

  // Retry a failed item
  const handleRetryItem = (item: SyncQueueItem) => {
    if (item.appId === 'APP-DEMO-002') {
      // Trigger conflict resolution screen for demo!
      setCurrentScreen('conflict');
    } else {
      setSyncQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'synced', errorMsg: undefined } : i))
      );
      showToast(`Item ${item.appId} synced successfully`, 'success');
    }
  };

  // Confirm GPS modal coordinates
  const handleConfirmLocation = (lat: number, lng: number, address: string) => {
    setActiveTask((prev) => ({
      ...prev,
      location: {
        lat,
        lng,
        accuracy: 4.2,
        status: 'available',
        address,
      },
    }));
    showToast('GPS coordinates locked & verified', 'success');
  };

  // Top App Bar Title derivation
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'MapanSetu';
      case 'templates':
        return 'Inspection Templates';
      case 'inspections':
        return 'Assigned Inspections';
      case 'inspection-flow':
        return activeTask.appId;
      case 'map':
        return 'Offline Field Map';
      case 'history':
        return 'Inspection History';
      case 'sync':
        return 'Sync Center';
      case 'conflict':
        return 'Conflict Resolution';
      case 'profile':
        return 'Officer Profile';
      case 'security-sessions':
        return 'Security & Sessions';
      default:
        return 'MapanSetu';
    }
  };

  // Top Bar back button handler
  const handleTopBarBack = () => {
    if (currentScreen === 'inspection-flow') {
      if (activeWizardStep > 1) {
        setActiveWizardStep((s) => s - 1);
      } else {
        setCurrentScreen('inspections');
      }
    } else if (currentScreen === 'security-sessions' || currentScreen === 'conflict') {
      setCurrentScreen('profile');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const showTopBar = currentScreen !== 'splash' && currentScreen !== 'login';
  const showBottomNav =
    currentScreen === 'dashboard' ||
    currentScreen === 'inspections' ||
    currentScreen === 'sync' ||
    currentScreen === 'profile';

  const unsyncedQueueCount = syncQueue.filter((i) => i.status !== 'synced').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1b1b21] flex flex-col font-sans selection:bg-[#dcdef7] selection:text-[#000666] antialiased">
      {/* Top Application Bar */}
      {showTopBar && (
        <TopAppBar
          currentScreen={currentScreen}
          title={getScreenTitle()}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          onOpenMenu={() => setIsDrawerOpen(true)}
          onNavigateBack={
            currentScreen !== 'dashboard' ? handleTopBarBack : undefined
          }
          profile={profile}
          onOpenProfile={() => setCurrentScreen('profile')}
        />
      )}

      {/* Main Screen Router */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'splash' && (
          <SplashScreen onContinue={() => setCurrentScreen('login')} />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            profile={profile}
            onLogin={() => {
              setCurrentScreen('dashboard');
              showToast(`Welcome back, ${profile.name}`, 'success');
            }}
            onUpdateLanguage={(lang) => setProfile((p) => ({ ...p, language: lang }))}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            profile={profile}
            inspections={inspections}
            onStartInspection={handleStartInspection}
            onViewAllInspections={() => setCurrentScreen('inspections')}
            onGoToSync={() => setCurrentScreen('sync')}
            onOpenDetails={handleStartInspection}
            onOpenMap={() => setCurrentScreen('map')}
            onOpenHistory={() => setCurrentScreen('history')}
            onOpenTemplates={() => setCurrentScreen('templates')}
          />
        )}

        {currentScreen === 'templates' && (
          <InspectionTemplatesScreen
            templates={templates}
            onSelectTemplate={handleStartInspectionFromTemplate}
            onSaveTemplate={handleSaveCustomTemplate}
            onDeleteTemplate={handleDeleteCustomTemplate}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'map' && (
          <OfflineMapView
            inspections={inspections}
            onSelectInspection={(task) => {
              handleStartInspection(task);
            }}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            isOnline={isOnline}
          />
        )}

        {currentScreen === 'history' && (
          <InspectionHistoryScreen
            inspections={inspections}
            profile={profile}
            onOpenReportModal={(task) => setReportModalTask(task)}
            onStartReInspection={(task) => handleStartInspection(task)}
          />
        )}

        {currentScreen === 'inspections' && (
          <InspectionsListScreen
            inspections={inspections}
            onSelectInspection={handleStartInspection}
            onStartNewInspection={handleStartNewInspection}
            onOpenTemplates={() => setCurrentScreen('templates')}
          />
        )}

        {currentScreen === 'inspection-flow' && (
          <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 w-full">
            {/* Task Info Bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-[#c6c5d4]/60 shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#000666] tracking-wider uppercase">
                  {activeTask.appId}
                </span>
                <h2 className="text-lg font-bold text-[#1b1b21] leading-tight">
                  {activeTask.title}
                </h2>
                <p className="text-xs text-[#454652]">{activeTask.businessName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  className="px-3 py-1.5 rounded-full bg-[#f5f2fb] hover:bg-[#eae7ef] text-xs font-semibold text-[#000666] border border-[#c6c5d4] flex items-center gap-1 cursor-pointer"
                  title="Apply template"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#000666]">
                    auto_stories
                  </span>
                  <span>Templates</span>
                </button>

                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#f5f2fb] hover:bg-[#eae7ef] text-xs font-semibold text-[#1b1b21] border border-[#c6c5d4] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#000666]">
                    location_on
                  </span>
                  <span>{activeTask.location?.lat ? 'GPS Locked' : 'Add GPS'}</span>
                </button>
              </div>
            </div>

            {/* Stepper Header */}
            <WizardHeader
              currentStep={activeWizardStep}
              onStepClick={(step) => setActiveWizardStep(step)}
            />

            {/* Wizard Steps */}
            {activeWizardStep === 1 && (
              <Step1Checklist
                checklists={activeTask.checklists}
                onToggleItem={handleToggleChecklistItem}
                onCheckAll={handleCheckAllChecklist}
                onSaveAndContinue={() => setActiveWizardStep(2)}
                onApplyTemplate={() => setShowTemplatePicker(true)}
                onSaveAsTemplate={() => setShowSaveAsTemplate(true)}
              />
            )}

            {activeWizardStep === 2 && (
              <Step2Readings
                readings={activeTask.readings}
                onUpdateReading={handleUpdateReading}
                onAddReading={handleAddReading}
                onBack={() => setActiveWizardStep(1)}
                onSaveAndContinue={() => setActiveWizardStep(3)}
                onApplyTemplate={() => setShowTemplatePicker(true)}
              />
            )}

            {activeWizardStep === 3 && (
              <Step3Evidence
                evidenceList={activeTask.evidence}
                onAddEvidence={handleAddEvidence}
                onRemoveEvidence={handleRemoveEvidence}
                onBack={() => setActiveWizardStep(2)}
                onSaveAndContinue={() => setActiveWizardStep(4)}
              />
            )}

            {activeWizardStep === 4 && (
              <Step4Review
                task={activeTask}
                isOnline={isOnline}
                onEditStep={(step) => setActiveWizardStep(step)}
                onSubmit={handleSubmitInspection}
                onOpenLocation={() => setShowLocationModal(true)}
                onPreviewCertificate={() => setReportModalTask(activeTask)}
              />
            )}
          </main>
        )}

        {currentScreen === 'sync' && (
          <SyncCenterScreen
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            syncQueue={syncQueue}
            onSyncAll={handleSyncAll}
            onRetryItem={handleRetryItem}
            onTriggerConflictDemo={() => setCurrentScreen('conflict')}
          />
        )}

        {currentScreen === 'conflict' && (
          <ConflictResolutionScreen
            onResolveLocal={() => {
              showToast('Resolved: Local field value preserved', 'success');
              setCurrentScreen('sync');
            }}
            onResolveServer={() => {
              showToast('Resolved: Central server value applied', 'success');
              setCurrentScreen('sync');
            }}
            onMergeAndReview={() => {
              showToast('Merged: Ready for officer final sign-off', 'info');
              setCurrentScreen('inspection-flow');
              setActiveWizardStep(2);
            }}
            onClose={() => setCurrentScreen('sync')}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateLanguage={(lang) => {
              setProfile((p) => ({ ...p, language: lang }));
              showToast(`Language set to ${lang === 'hi' ? 'हिन्दी' : 'English'}`, 'info');
            }}
            onNavigateSecurity={() => setCurrentScreen('security-sessions')}
            onLogout={() => {
              setCurrentScreen('login');
              showToast('Logged out of officer portal', 'info');
            }}
            unsyncedCount={unsyncedQueueCount}
          />
        )}

        {currentScreen === 'security-sessions' && (
          <SecuritySessionsScreen
            profile={profile}
            onBack={() => setCurrentScreen('profile')}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          syncQueueCount={unsyncedQueueCount}
        />
      )}

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        profile={profile}
        onOpenLocationModal={() => setShowLocationModal(true)}
        onStartNewInspection={handleStartNewInspection}
      />

      {/* Location Modal */}
      {showLocationModal && (
        <LocationCaptureModal
          onClose={() => setShowLocationModal(false)}
          onConfirmLocation={handleConfirmLocation}
        />
      )}

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          templates={templates}
          onSelectTemplate={handleApplyTemplateToActive}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Save As Template Modal */}
      {showSaveAsTemplate && (
        <SaveAsTemplateModal
          task={activeTask}
          onSave={handleSaveCustomTemplate}
          onClose={() => setShowSaveAsTemplate(false)}
        />
      )}

      {/* Inspection Statutory Certificate Report Modal */}
      {reportModalTask && (
        <InspectionReportModal
          task={reportModalTask}
          profile={profile}
          onClose={() => setReportModalTask(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
