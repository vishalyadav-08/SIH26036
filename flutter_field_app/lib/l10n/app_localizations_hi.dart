// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appTitle => 'मापनसेतु';

  @override
  String get fieldOfficerPortal => 'फील्ड अधिकारी पोर्टल';

  @override
  String get sihPrototype => 'SIH 2026 प्रोटोटाइप';

  @override
  String get officerId => 'अधिकारी आईडी';

  @override
  String get password => 'पासवर्ड';

  @override
  String get forgotPassword => 'पासवर्ड भूल गए?';

  @override
  String get signIn => 'साइन इन करें';

  @override
  String get biometricQuickSignIn => 'त्वरित बायोमेट्रिक साइन इन';

  @override
  String get language => 'भाषा';

  @override
  String get english => 'English';

  @override
  String get hindi => 'हिन्दी';

  @override
  String get loginFailed => 'अमान्य अधिकारी आईडी या पासवर्ड';

  @override
  String get dashboard => 'डैशबोर्ड';

  @override
  String get welcomeBack => 'फील्ड में पुनः स्वागत है।';

  @override
  String get onlineAndSynchronized => 'ऑनलाइन और सिंक्रनाइज़्ड';

  @override
  String get connectedToSecureNetwork => 'सुरक्षित नेटवर्क से जुड़ा हुआ है';

  @override
  String get offlineMode => 'ऑफ़लाइन मोड';

  @override
  String get offlineSyncNotice =>
      'कनेक्टिविटी बहाल होने पर सिंकिंग फिर से शुरू होगी।';

  @override
  String get lastSync => 'अंतिम सिंक';

  @override
  String get startNewInspection => 'नया निरीक्षण शुरू करें';

  @override
  String get goToSyncCenter => 'सिंक केंद्र पर जाएं';

  @override
  String get workloadOverview => 'कार्यभार अवलोकन';

  @override
  String get assigned => 'सौंपा गया';

  @override
  String get inProgress => 'प्रगति पर';

  @override
  String get localDrafts => 'स्थानीय ड्राफ्ट';

  @override
  String get readyToSync => 'सिंक के लिए तैयार';

  @override
  String get pendingAction => 'लंबित कार्रवाई';

  @override
  String get currentlyActive => 'वर्तमान में सक्रिय';

  @override
  String get savedOnDevice => 'डिवाइस पर सहेजा गया';

  @override
  String get requiresConnection => 'कनेक्शन आवश्यक है';

  @override
  String get todaysWork => 'आज का कार्य';

  @override
  String get viewAll => 'सभी देखें';

  @override
  String get urgent => 'अत्यावश्यक';

  @override
  String get scheduled => 'निर्धारित';

  @override
  String get begin => 'प्रारंभ करें';

  @override
  String get details => 'विवरण';

  @override
  String get startSoon => 'जल्द शुरू करें';

  @override
  String get assignedInspections => 'सौंपे गए निरीक्षण';

  @override
  String get searchPlaceholder => 'आवेदन-आईडी या व्यवसाय खोजें...';

  @override
  String get filter => 'फ़िल्टर';

  @override
  String get completed => 'पूर्ण हुआ';

  @override
  String get today => 'आज';

  @override
  String get yesterday => 'कल';

  @override
  String get checklist => 'चेकलिस्ट';

  @override
  String get readings => 'रीडिंग्स';

  @override
  String get evidence => 'साक्ष्य';

  @override
  String get review => 'समीक्षा';

  @override
  String get loadTests => 'लोड टेस्ट';

  @override
  String get fiveKgLoadTest => '5 किग्रा लोड टेस्ट';

  @override
  String get tenKgLoadTest => '10 किग्रा लोड टेस्ट';

  @override
  String get required => 'आवश्यक';

  @override
  String get indicatedKg => 'दर्शित भार (किग्रा)';

  @override
  String get errorLabel => 'त्रुटि';

  @override
  String get errorExceedsMpe =>
      'मान अधिकतम अनुमेय त्रुटि (+0.050kg) से अधिक है।';

  @override
  String get addExtraReading => 'अतिरिक्त रीडिंग जोड़ें';

  @override
  String get back => 'वापस';

  @override
  String get saveAndContinue => 'सहेजें और जारी रखें';

  @override
  String get requiredEvidence => 'आवश्यक साक्ष्य';

  @override
  String get evidenceInstructions =>
      'कृपया मशीन नेमप्लेट, सामान्य स्थिति और किसी भी पहचानी गई त्रुटियों की तस्वीरें कैप्चर या अपलोड करें।';

  @override
  String get capturePhoto => 'फोटो लें';

  @override
  String get uploadDocument => 'दस्तावेज़ अपलोड करें';

  @override
  String get capturedItems => 'कैप्चर किए गए आइटम';

  @override
  String get localOnlyBadge => 'केवल स्थानीय';

  @override
  String get machineNameplate => 'मशीन नेमप्लेट';

  @override
  String get capturedTime => 'कैप्चर समय 10:45 AM';

  @override
  String get locationCaptured => 'स्थान: कैप्चर किया गया';

  @override
  String get fileSize => 'आकार: 2.1 MB';

  @override
  String get retake => 'पुनः फोटो लें';

  @override
  String get delete => 'हटाएं';

  @override
  String get evidenceCountProgress => 'साक्ष्य कैप्चर किए गए';

  @override
  String stepProgress(Object current, Object total) {
    return 'चरण $current / $total';
  }

  @override
  String get readyToSyncOnceOnline => 'ऑनलाइन होने पर सिंक के लिए तैयार';

  @override
  String get inspectionSummary => 'निरीक्षण सारांश';

  @override
  String get itemsAttached => '3 आइटम संलग्न हैं';

  @override
  String get finalAssessment => 'अंतिम मूल्यांकन';

  @override
  String get inspectionResult => 'निरीक्षण परिणाम';

  @override
  String get passResult => 'पास (PASS)';

  @override
  String get failResult => 'विफल (FAIL)';

  @override
  String get correctionResult => 'सुधार की आवश्यकता';

  @override
  String get officerNotes => 'अधिकारी की टिप्पणियाँ';

  @override
  String get officerNotesPlaceholder => 'कोई भी अंतिम अवलोकन जोड़ें...';

  @override
  String get submitInspection => 'निरीक्षण सबमिट करें';

  @override
  String get syncCenter => 'सिंक केंद्र';

  @override
  String get manageDataSync => 'अपना डेटा सिंक्रोनाइज़ेशन प्रबंधित करें।';

  @override
  String get itemsReady => 'आइटम तैयार';

  @override
  String get waitingForConnection =>
      'सिंक के लिए कनेक्शन की प्रतीक्षा कर रहा है।';

  @override
  String get syncAllData => 'सभी डेटा सिंक करें';

  @override
  String get pendingOperations => 'लंबित संचालन';

  @override
  String get failedUpload => 'विफल: अपलोड के दौरान कनेक्शन टाइमआउट।';

  @override
  String get retry => 'पुनः प्रयास करें';

  @override
  String get pending => 'लंबित';

  @override
  String get queue => 'कतार';

  @override
  String get conflictDetected => 'टकराव पाया गया';

  @override
  String get conflictNotice =>
      'जब आप ऑफ़लाइन काम कर रहे थे तब सर्वर पर यह निरीक्षण संशोधित किया गया था। कृपया नीचे टकराव का समाधान करें।';

  @override
  String get yourLocalVersion => 'आपका स्थानीय संस्करण';

  @override
  String get serverVersion => 'सर्वर संस्करण';

  @override
  String get lastSavedLocal => 'आपके द्वारा 5 मिनट पहले सहेजा गया';

  @override
  String get updatedBySystem => 'सिस्टम द्वारा 10 मिनट पहले अपडेट किया गया';

  @override
  String get indicatedValue => 'दर्शित मान';

  @override
  String get keepLocal => 'स्थानीय रखें';

  @override
  String get keepServer => 'सर्वर रखें';

  @override
  String get mergeAndReview => 'विलय और समीक्षा करें';

  @override
  String get profile => 'प्रोफ़ाइल';

  @override
  String get legalMetrologyOfficer => 'विधिक माप विज्ञान अधिकारी';

  @override
  String get operationalStats => 'परिचालन आँकड़े';

  @override
  String get localStorage => 'स्थानीय संग्रहण';

  @override
  String get accountSecurity => 'खाता सुरक्षा';

  @override
  String get changePassword => 'पासवर्ड बदलें';

  @override
  String get activeSessions => 'सक्रिय सत्र';

  @override
  String get devicesConnected => '2 डिवाइस जुड़े हुए हैं';

  @override
  String get appSettings => 'ऐप सेटिंग्स';

  @override
  String get offlineModeSettings => 'ऑफ़लाइन मोड सेटिंग्स';

  @override
  String get manageDownloadedRegions => 'डाउनलोड किए गए क्षेत्र प्रबंधित करें';

  @override
  String get logOut => 'लॉग आउट';

  @override
  String get unsyncedWorkTitle => 'असमन्वित कार्य (Unsynced Work)';

  @override
  String get unsyncedWorkMessage =>
      'आपके पास असमन्वित निरीक्षण हैं। लॉग आउट करने से वे इस डिवाइस पर ही रहेंगे, लेकिन जब तक आप दोबारा लॉग इन करके सिंक नहीं करेंगे, वे सर्वर पर उपलब्ध नहीं होंगे। क्या आप वाकई लॉग आउट करना चाहते हैं?';

  @override
  String get cancel => 'रद्द करें';

  @override
  String get logOutAnyway => 'फिर भी लॉग आउट करें';
}
