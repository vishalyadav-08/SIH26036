import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'MapanSetu'**
  String get appTitle;

  /// No description provided for @fieldOfficerPortal.
  ///
  /// In en, this message translates to:
  /// **'Field Officer Portal'**
  String get fieldOfficerPortal;

  /// No description provided for @sihPrototype.
  ///
  /// In en, this message translates to:
  /// **'SIH 2026 PROTOTYPE'**
  String get sihPrototype;

  /// No description provided for @officerId.
  ///
  /// In en, this message translates to:
  /// **'Officer ID'**
  String get officerId;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// No description provided for @biometricQuickSignIn.
  ///
  /// In en, this message translates to:
  /// **'Quick Biometric Sign In'**
  String get biometricQuickSignIn;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @hindi.
  ///
  /// In en, this message translates to:
  /// **'हिन्दी'**
  String get hindi;

  /// No description provided for @loginFailed.
  ///
  /// In en, this message translates to:
  /// **'Invalid Officer ID or Password'**
  String get loginFailed;

  /// No description provided for @dashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboard;

  /// No description provided for @welcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome back to the field.'**
  String get welcomeBack;

  /// No description provided for @onlineAndSynchronized.
  ///
  /// In en, this message translates to:
  /// **'Online & Synchronized'**
  String get onlineAndSynchronized;

  /// No description provided for @connectedToSecureNetwork.
  ///
  /// In en, this message translates to:
  /// **'Connected to secure network'**
  String get connectedToSecureNetwork;

  /// No description provided for @offlineMode.
  ///
  /// In en, this message translates to:
  /// **'Offline Mode'**
  String get offlineMode;

  /// No description provided for @offlineSyncNotice.
  ///
  /// In en, this message translates to:
  /// **'Syncing will resume when connectivity returns.'**
  String get offlineSyncNotice;

  /// No description provided for @lastSync.
  ///
  /// In en, this message translates to:
  /// **'Last Sync'**
  String get lastSync;

  /// No description provided for @startNewInspection.
  ///
  /// In en, this message translates to:
  /// **'Start New Inspection'**
  String get startNewInspection;

  /// No description provided for @goToSyncCenter.
  ///
  /// In en, this message translates to:
  /// **'Go to Sync Center'**
  String get goToSyncCenter;

  /// No description provided for @workloadOverview.
  ///
  /// In en, this message translates to:
  /// **'Workload Overview'**
  String get workloadOverview;

  /// No description provided for @assigned.
  ///
  /// In en, this message translates to:
  /// **'Assigned'**
  String get assigned;

  /// No description provided for @inProgress.
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get inProgress;

  /// No description provided for @localDrafts.
  ///
  /// In en, this message translates to:
  /// **'Local Drafts'**
  String get localDrafts;

  /// No description provided for @readyToSync.
  ///
  /// In en, this message translates to:
  /// **'Ready to Sync'**
  String get readyToSync;

  /// No description provided for @pendingAction.
  ///
  /// In en, this message translates to:
  /// **'Pending action'**
  String get pendingAction;

  /// No description provided for @currentlyActive.
  ///
  /// In en, this message translates to:
  /// **'Currently active'**
  String get currentlyActive;

  /// No description provided for @savedOnDevice.
  ///
  /// In en, this message translates to:
  /// **'Saved on device'**
  String get savedOnDevice;

  /// No description provided for @requiresConnection.
  ///
  /// In en, this message translates to:
  /// **'Requires connection'**
  String get requiresConnection;

  /// No description provided for @todaysWork.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Work'**
  String get todaysWork;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// No description provided for @urgent.
  ///
  /// In en, this message translates to:
  /// **'Urgent'**
  String get urgent;

  /// No description provided for @scheduled.
  ///
  /// In en, this message translates to:
  /// **'Scheduled'**
  String get scheduled;

  /// No description provided for @begin.
  ///
  /// In en, this message translates to:
  /// **'Begin'**
  String get begin;

  /// No description provided for @details.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get details;

  /// No description provided for @startSoon.
  ///
  /// In en, this message translates to:
  /// **'Start Soon'**
  String get startSoon;

  /// No description provided for @assignedInspections.
  ///
  /// In en, this message translates to:
  /// **'Assigned Inspections'**
  String get assignedInspections;

  /// No description provided for @searchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search App-ID or Business...'**
  String get searchPlaceholder;

  /// No description provided for @filter.
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get filter;

  /// No description provided for @completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @yesterday.
  ///
  /// In en, this message translates to:
  /// **'Yesterday'**
  String get yesterday;

  /// No description provided for @checklist.
  ///
  /// In en, this message translates to:
  /// **'Checklist'**
  String get checklist;

  /// No description provided for @readings.
  ///
  /// In en, this message translates to:
  /// **'Readings'**
  String get readings;

  /// No description provided for @evidence.
  ///
  /// In en, this message translates to:
  /// **'Evidence'**
  String get evidence;

  /// No description provided for @review.
  ///
  /// In en, this message translates to:
  /// **'Review'**
  String get review;

  /// No description provided for @loadTests.
  ///
  /// In en, this message translates to:
  /// **'Load Tests'**
  String get loadTests;

  /// No description provided for @fiveKgLoadTest.
  ///
  /// In en, this message translates to:
  /// **'5kg Load Test'**
  String get fiveKgLoadTest;

  /// No description provided for @tenKgLoadTest.
  ///
  /// In en, this message translates to:
  /// **'10kg Load Test'**
  String get tenKgLoadTest;

  /// No description provided for @required.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get required;

  /// No description provided for @indicatedKg.
  ///
  /// In en, this message translates to:
  /// **'Indicated (kg)'**
  String get indicatedKg;

  /// No description provided for @errorLabel.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get errorLabel;

  /// No description provided for @errorExceedsMpe.
  ///
  /// In en, this message translates to:
  /// **'Value exceeds maximum permissible error (+0.050kg).'**
  String get errorExceedsMpe;

  /// No description provided for @addExtraReading.
  ///
  /// In en, this message translates to:
  /// **'Add Extra Reading'**
  String get addExtraReading;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @saveAndContinue.
  ///
  /// In en, this message translates to:
  /// **'Save & Continue'**
  String get saveAndContinue;

  /// No description provided for @requiredEvidence.
  ///
  /// In en, this message translates to:
  /// **'Required Evidence'**
  String get requiredEvidence;

  /// No description provided for @evidenceInstructions.
  ///
  /// In en, this message translates to:
  /// **'Please capture or upload photos of the machine nameplate, general condition, and any identified defects.'**
  String get evidenceInstructions;

  /// No description provided for @capturePhoto.
  ///
  /// In en, this message translates to:
  /// **'Capture Photo'**
  String get capturePhoto;

  /// No description provided for @uploadDocument.
  ///
  /// In en, this message translates to:
  /// **'Upload Document'**
  String get uploadDocument;

  /// No description provided for @capturedItems.
  ///
  /// In en, this message translates to:
  /// **'Captured Items'**
  String get capturedItems;

  /// No description provided for @localOnlyBadge.
  ///
  /// In en, this message translates to:
  /// **'LOCAL ONLY'**
  String get localOnlyBadge;

  /// No description provided for @machineNameplate.
  ///
  /// In en, this message translates to:
  /// **'Machine Nameplate'**
  String get machineNameplate;

  /// No description provided for @capturedTime.
  ///
  /// In en, this message translates to:
  /// **'Captured 10:45 AM'**
  String get capturedTime;

  /// No description provided for @locationCaptured.
  ///
  /// In en, this message translates to:
  /// **'Location: Captured'**
  String get locationCaptured;

  /// No description provided for @fileSize.
  ///
  /// In en, this message translates to:
  /// **'Size: 2.1 MB'**
  String get fileSize;

  /// No description provided for @retake.
  ///
  /// In en, this message translates to:
  /// **'Retake Photo'**
  String get retake;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @evidenceCountProgress.
  ///
  /// In en, this message translates to:
  /// **'Evidence Captured'**
  String get evidenceCountProgress;

  /// No description provided for @stepProgress.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String stepProgress(Object current, Object total);

  /// No description provided for @readyToSyncOnceOnline.
  ///
  /// In en, this message translates to:
  /// **'Ready to sync once online'**
  String get readyToSyncOnceOnline;

  /// No description provided for @inspectionSummary.
  ///
  /// In en, this message translates to:
  /// **'Inspection Summary'**
  String get inspectionSummary;

  /// No description provided for @itemsAttached.
  ///
  /// In en, this message translates to:
  /// **'3 items attached'**
  String get itemsAttached;

  /// No description provided for @finalAssessment.
  ///
  /// In en, this message translates to:
  /// **'Final Assessment'**
  String get finalAssessment;

  /// No description provided for @inspectionResult.
  ///
  /// In en, this message translates to:
  /// **'Inspection Result'**
  String get inspectionResult;

  /// No description provided for @passResult.
  ///
  /// In en, this message translates to:
  /// **'PASS'**
  String get passResult;

  /// No description provided for @failResult.
  ///
  /// In en, this message translates to:
  /// **'FAIL'**
  String get failResult;

  /// No description provided for @correctionResult.
  ///
  /// In en, this message translates to:
  /// **'REQUIRES CORRECTION'**
  String get correctionResult;

  /// No description provided for @officerNotes.
  ///
  /// In en, this message translates to:
  /// **'Officer Notes'**
  String get officerNotes;

  /// No description provided for @officerNotesPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Add any final observations...'**
  String get officerNotesPlaceholder;

  /// No description provided for @submitInspection.
  ///
  /// In en, this message translates to:
  /// **'Submit Inspection'**
  String get submitInspection;

  /// No description provided for @syncCenter.
  ///
  /// In en, this message translates to:
  /// **'Sync Center'**
  String get syncCenter;

  /// No description provided for @manageDataSync.
  ///
  /// In en, this message translates to:
  /// **'Manage your data synchronization.'**
  String get manageDataSync;

  /// No description provided for @itemsReady.
  ///
  /// In en, this message translates to:
  /// **'Items Ready'**
  String get itemsReady;

  /// No description provided for @waitingForConnection.
  ///
  /// In en, this message translates to:
  /// **'Waiting for connection to sync.'**
  String get waitingForConnection;

  /// No description provided for @syncAllData.
  ///
  /// In en, this message translates to:
  /// **'Sync All Data'**
  String get syncAllData;

  /// No description provided for @pendingOperations.
  ///
  /// In en, this message translates to:
  /// **'Pending Operations'**
  String get pendingOperations;

  /// No description provided for @failedUpload.
  ///
  /// In en, this message translates to:
  /// **'Failed: Connection timeout during upload.'**
  String get failedUpload;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @pending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// No description provided for @queue.
  ///
  /// In en, this message translates to:
  /// **'Queue'**
  String get queue;

  /// No description provided for @conflictDetected.
  ///
  /// In en, this message translates to:
  /// **'Conflict Detected'**
  String get conflictDetected;

  /// No description provided for @conflictNotice.
  ///
  /// In en, this message translates to:
  /// **'This inspection was modified on the server while you were working offline. Please resolve the conflict below.'**
  String get conflictNotice;

  /// No description provided for @yourLocalVersion.
  ///
  /// In en, this message translates to:
  /// **'Your Local Version'**
  String get yourLocalVersion;

  /// No description provided for @serverVersion.
  ///
  /// In en, this message translates to:
  /// **'Server Version'**
  String get serverVersion;

  /// No description provided for @lastSavedLocal.
  ///
  /// In en, this message translates to:
  /// **'Last saved by you 5 minutes ago'**
  String get lastSavedLocal;

  /// No description provided for @updatedBySystem.
  ///
  /// In en, this message translates to:
  /// **'Updated by System 10 minutes ago'**
  String get updatedBySystem;

  /// No description provided for @indicatedValue.
  ///
  /// In en, this message translates to:
  /// **'Indicated Value'**
  String get indicatedValue;

  /// No description provided for @keepLocal.
  ///
  /// In en, this message translates to:
  /// **'Keep Local'**
  String get keepLocal;

  /// No description provided for @keepServer.
  ///
  /// In en, this message translates to:
  /// **'Keep Server'**
  String get keepServer;

  /// No description provided for @mergeAndReview.
  ///
  /// In en, this message translates to:
  /// **'Merge & Review'**
  String get mergeAndReview;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @legalMetrologyOfficer.
  ///
  /// In en, this message translates to:
  /// **'Legal Metrology Officer'**
  String get legalMetrologyOfficer;

  /// No description provided for @operationalStats.
  ///
  /// In en, this message translates to:
  /// **'Operational Stats'**
  String get operationalStats;

  /// No description provided for @localStorage.
  ///
  /// In en, this message translates to:
  /// **'Local Storage'**
  String get localStorage;

  /// No description provided for @accountSecurity.
  ///
  /// In en, this message translates to:
  /// **'Account Security'**
  String get accountSecurity;

  /// No description provided for @changePassword.
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get changePassword;

  /// No description provided for @activeSessions.
  ///
  /// In en, this message translates to:
  /// **'Active Sessions'**
  String get activeSessions;

  /// No description provided for @devicesConnected.
  ///
  /// In en, this message translates to:
  /// **'2 devices connected'**
  String get devicesConnected;

  /// No description provided for @appSettings.
  ///
  /// In en, this message translates to:
  /// **'App Settings'**
  String get appSettings;

  /// No description provided for @offlineModeSettings.
  ///
  /// In en, this message translates to:
  /// **'Offline Mode Settings'**
  String get offlineModeSettings;

  /// No description provided for @manageDownloadedRegions.
  ///
  /// In en, this message translates to:
  /// **'Manage downloaded regions'**
  String get manageDownloadedRegions;

  /// No description provided for @logOut.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logOut;

  /// No description provided for @unsyncedWorkTitle.
  ///
  /// In en, this message translates to:
  /// **'Unsynced Work'**
  String get unsyncedWorkTitle;

  /// No description provided for @unsyncedWorkMessage.
  ///
  /// In en, this message translates to:
  /// **'You have unsynced inspections. Logging out will keep them on this device, but they won\'t be available on the server until you log back in and sync. Are you sure you want to log out?'**
  String get unsyncedWorkMessage;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @logOutAnyway.
  ///
  /// In en, this message translates to:
  /// **'Log Out Anyway'**
  String get logOutAnyway;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
