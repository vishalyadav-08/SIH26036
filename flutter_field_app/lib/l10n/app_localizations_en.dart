// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'MapanSetu';

  @override
  String get fieldOfficerPortal => 'LMO Portal';

  @override
  String get sihPrototype => 'SIH 2026 PROTOTYPE';

  @override
  String get officerId => 'LMO ID';

  @override
  String get password => 'Password';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get signIn => 'Sign In';

  @override
  String get biometricQuickSignIn => 'Quick Biometric Sign In';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get hindi => 'हिन्दी';

  @override
  String get loginFailed => 'Invalid LMO ID or Password';

  @override
  String get dashboard => 'Dashboard';

  @override
  String get welcomeBack => 'Welcome back to the field.';

  @override
  String get onlineAndSynchronized => 'Online & Synchronized';

  @override
  String get connectedToSecureNetwork => 'Connected to secure network';

  @override
  String get offlineMode => 'Offline Mode';

  @override
  String get offlineSyncNotice =>
      'Syncing will resume when connectivity returns.';

  @override
  String get lastSync => 'Last Sync';

  @override
  String get startNewInspection => 'Start New Inspection';

  @override
  String get goToSyncCenter => 'Go to Sync Center';

  @override
  String get workloadOverview => 'Workload Overview';

  @override
  String get assigned => 'Assigned';

  @override
  String get inProgress => 'In Progress';

  @override
  String get localDrafts => 'Local Drafts';

  @override
  String get readyToSync => 'Ready to Sync';

  @override
  String get pendingAction => 'Pending action';

  @override
  String get currentlyActive => 'Currently active';

  @override
  String get savedOnDevice => 'Saved on device';

  @override
  String get requiresConnection => 'Requires connection';

  @override
  String get todaysWork => 'Today\'s Work';

  @override
  String get viewAll => 'View All';

  @override
  String get urgent => 'Urgent';

  @override
  String get scheduled => 'Scheduled';

  @override
  String get begin => 'Begin';

  @override
  String get details => 'Details';

  @override
  String get startSoon => 'Start Soon';

  @override
  String get assignedInspections => 'Assigned Inspections';

  @override
  String get searchPlaceholder => 'Search App-ID or Business...';

  @override
  String get filter => 'Filter';

  @override
  String get completed => 'Completed';

  @override
  String get today => 'Today';

  @override
  String get yesterday => 'Yesterday';

  @override
  String get checklist => 'Checklist';

  @override
  String get readings => 'Readings';

  @override
  String get evidence => 'Evidence';

  @override
  String get review => 'Review';

  @override
  String get loadTests => 'Load Tests';

  @override
  String get fiveKgLoadTest => '5kg Load Test';

  @override
  String get tenKgLoadTest => '10kg Load Test';

  @override
  String get required => 'Required';

  @override
  String get indicatedKg => 'Indicated (kg)';

  @override
  String get errorLabel => 'Error';

  @override
  String get errorExceedsMpe =>
      'Value exceeds maximum permissible error (+0.050kg).';

  @override
  String get addExtraReading => 'Add Extra Reading';

  @override
  String get back => 'Back';

  @override
  String get saveAndContinue => 'Save & Continue';

  @override
  String get requiredEvidence => 'Required Evidence';

  @override
  String get evidenceInstructions =>
      'Please capture or upload photos of the machine nameplate, general condition, and any identified defects.';

  @override
  String get capturePhoto => 'Capture Photo';

  @override
  String get uploadDocument => 'Upload Document';

  @override
  String get capturedItems => 'Captured Items';

  @override
  String get localOnlyBadge => 'LOCAL ONLY';

  @override
  String get machineNameplate => 'Machine Nameplate';

  @override
  String get capturedTime => 'Captured 10:45 AM';

  @override
  String get locationCaptured => 'Location: Captured';

  @override
  String get fileSize => 'Size: 2.1 MB';

  @override
  String get retake => 'Retake Photo';

  @override
  String get delete => 'Delete';

  @override
  String get evidenceCountProgress => 'Evidence Captured';

  @override
  String stepProgress(Object current, Object total) {
    return 'Step $current of $total';
  }

  @override
  String get readyToSyncOnceOnline => 'Ready to sync once online';

  @override
  String get inspectionSummary => 'Inspection Summary';

  @override
  String get itemsAttached => '3 items attached';

  @override
  String get finalAssessment => 'Final Assessment';

  @override
  String get inspectionResult => 'Inspection Result';

  @override
  String get passResult => 'PASS';

  @override
  String get failResult => 'FAIL';

  @override
  String get correctionResult => 'REQUIRES CORRECTION';

  @override
  String get officerNotes => 'LMO Notes';

  @override
  String get officerNotesPlaceholder => 'Add any final observations...';

  @override
  String get submitInspection => 'Submit Inspection';

  @override
  String get syncCenter => 'Sync Center';

  @override
  String get manageDataSync => 'Manage your data synchronization.';

  @override
  String get itemsReady => 'Items Ready';

  @override
  String get waitingForConnection => 'Waiting for connection to sync.';

  @override
  String get syncAllData => 'Sync All Data';

  @override
  String get pendingOperations => 'Pending Operations';

  @override
  String get failedUpload => 'Failed: Connection timeout during upload.';

  @override
  String get retry => 'Retry';

  @override
  String get pending => 'Pending';

  @override
  String get queue => 'Queue';

  @override
  String get conflictDetected => 'Conflict Detected';

  @override
  String get conflictNotice =>
      'This inspection was modified on the server while you were working offline. Please resolve the conflict below.';

  @override
  String get yourLocalVersion => 'Your Local Version';

  @override
  String get serverVersion => 'Server Version';

  @override
  String get lastSavedLocal => 'Last saved by you 5 minutes ago';

  @override
  String get updatedBySystem => 'Updated by System 10 minutes ago';

  @override
  String get indicatedValue => 'Indicated Value';

  @override
  String get keepLocal => 'Keep Local';

  @override
  String get keepServer => 'Keep Server';

  @override
  String get mergeAndReview => 'Merge & Review';

  @override
  String get profile => 'Profile';

  @override
  String get legalMetrologyOfficer => 'Legal Metrology Officer (LMO)';

  @override
  String get operationalStats => 'Operational Stats';

  @override
  String get localStorage => 'Local Storage';

  @override
  String get accountSecurity => 'Account Security';

  @override
  String get changePassword => 'Change Password';

  @override
  String get activeSessions => 'Active Sessions';

  @override
  String get devicesConnected => '2 devices connected';

  @override
  String get appSettings => 'App Settings';

  @override
  String get offlineModeSettings => 'Offline Mode Settings';

  @override
  String get manageDownloadedRegions => 'Manage downloaded regions';

  @override
  String get logOut => 'Log Out';

  @override
  String get unsyncedWorkTitle => 'Unsynced Work';

  @override
  String get unsyncedWorkMessage =>
      'You have unsynced inspections. Logging out will keep them on this device, but they won\'t be available on the server until you log back in and sync. Are you sure you want to log out?';

  @override
  String get cancel => 'Cancel';

  @override
  String get logOutAnyway => 'Log Out Anyway';
}
