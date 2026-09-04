"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi";
export type FontSize = "small" | "normal" | "large" | "larger";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  contrast: "normal" | "high";
  toggleContrast: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Utility Bar & Header
    "util.skip": "Skip to Main Content",
    "util.accessibility": "Accessibility",
    "util.contrast": "High Contrast",
    "util.lang": "English",
    "brand.name": "MapanSetu",
    "brand.dept": "Department of Legal Metrology",
    "brand.gov": "Government of India",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.verify": "Verify Certificate",
    "nav.help": "Help",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.openMenu": "Open Menu",
    "nav.closeMenu": "Close Menu",

    // P-01 Homepage
    "home.badge": "National Legal Metrology Digital Network",
    "home.hero.title": "Digital Verification for Weighing & Measuring Instruments",
    "home.hero.desc": "MapanSetu coordinates instrument registration, verification requests, officer inspection scheduling, and tamper-evident certificate lifecycle records across India.",
    "home.hero.verifyBtn": "Verify Certificate",
    "home.hero.loginBtn": "Login to Portal",
    "home.hero.howBtn": "How It Works",
    "home.quick.title": "Citizen & Business Services",
    "home.quick.verify": "Verify Certificate",
    "home.quick.verifyDesc": "Check the status, serial number, and authenticity of any MapanSetu verification certificate.",
    "home.quick.apply": "Apply for Verification",
    "home.quick.applyDesc": "Submit verification applications for newly manufactured, repaired, or commercial instruments.",
    "home.quick.track": "Track Application",
    "home.quick.trackDesc": "Monitor real-time workflow status from officer inspection scheduling to certificate issuance.",
    "home.quick.manage": "Manage Instruments",
    "home.quick.manageDesc": "Maintain digital passports, calibration history, and re-verification reminders.",
    "home.workflow.title": "How MapanSetu Works",
    "home.workflow.subtitle": "End-to-end statutory verification workflow under the Legal Metrology framework.",
    "home.workflow.step1.title": "1. Register Instrument",
    "home.workflow.step1.desc": "Business registers instruments with category, model, and serial details.",
    "home.workflow.step2.title": "2. Submit Request",
    "home.workflow.step2.desc": "Application is submitted with statutory verification fee payment reference.",
    "home.workflow.step3.title": "3. LMO Assignment",
    "home.workflow.step3.desc": "Legal Metrology Officer (LMO) is assigned and inspection schedule is generated.",
    "home.workflow.step4.title": "4. LMO Inspection",
    "home.workflow.step4.desc": "Physical tests are performed with geo-tagged verification evidence capture.",
    "home.workflow.step5.title": "5. Digital Certificate",
    "home.workflow.step5.desc": "Cryptographically signed certificate is issued with public QR verification.",
    "home.why.title": "Why MapanSetu",
    "home.why.traceable": "Traceable Records",
    "home.why.traceableDesc": "Immutable digital lifecycle history from first calibration through periodic re-verifications.",
    "home.why.transparent": "Transparent Status",
    "home.why.transparentDesc": "Clear audit stages for businesses, LMOs, and GATCs.",
    "home.why.evidence": "Evidence-Backed",
    "home.why.evidenceDesc": "Geo-stamped on-site photo evidence and standard weight testing tolerance logs.",
    "home.why.public": "Public Verification",
    "home.why.publicDesc": "Instant QR code and certificate number verification for consumer protection.",
    "home.search.heading": "Already Have a Certificate?",
    "home.search.desc": "Enter the certificate registration number printed on the physical stamp or digital document.",
    "home.search.placeholder": "e.g., CERT-DEMO-001 or CERT-2024-8849",
    "home.search.btn": "Verify Authenticity",
    "home.notice": "Prototype Notice: MapanSetu is a digital workflow coordination platform for demonstration purposes. It does not replace physical statutory verification by an authorized Legal Metrology Officer.",

    // P-02 About
    "about.title": "About MapanSetu",
    "about.subtitle": "Comprehensive digital coordination platform for Legal Metrology standardization, compliance, and consumer trust.",
    "about.platform.title": "About the Platform",
    "about.platform.p1": "MapanSetu is an integrated digital ecosystem designed to streamline and transparentize the operations of the Department of Legal Metrology. It acts as the central hub connecting businesses, LMOs, and GATCs to ensure standard weights and measures compliance across the country.",
    "about.platform.p2": "By digitizing legacy processes, MapanSetu aims to reduce bureaucratic friction, enhance accountability, and provide a single source of truth for all metrological certifications and compliance records.",
    "about.coord.title": "What MapanSetu Coordinates",
    "about.coord.desc": "The platform orchestrates critical lifecycle functions essential for maintaining metrological integrity:",
    "about.coord.biz": "Business Registration",
    "about.coord.bizDesc": "Onboarding and profiling of manufacturers, dealers, repairers, and commercial users.",
    "about.coord.inst": "Instrument Records",
    "about.coord.instDesc": "Centralized database of all registered weights, measures, weighing scales, and flow meters.",
    "about.coord.app": "Verification Applications",
    "about.coord.appDesc": "End-to-end processing of initial stamping, periodical re-verifications, and renewals.",
    "about.coord.assign": "LMO Assignment",
    "about.coord.assignDesc": "Algorithmic and jurisdiction-based routing of verification tasks to authorized LMOs.",
    "about.coord.sched": "Inspection Scheduling",
    "about.coord.schedDesc": "Dynamic calendar management for on-site field visits and verification camps.",
    "about.coord.cert": "Evidence & Certificates",
    "about.coord.certDesc": "Secure generation, cryptographic signing, and public QR lookup of compliance certificates.",
    "about.problem.title": "Problem Being Addressed",
    "about.problem.p1": "Prior to MapanSetu, legal metrology coordination relied on paper certificates, fragmented district registers, and manual scheduling. This caused:",
    "about.problem.i1": "Prolonged turnaround times for certificate renewals and verification scheduling.",
    "about.problem.i2": "Difficulty in tracking the lifecycle and re-calibration cadence of commercial instruments.",
    "about.problem.i3": "Lack of real-time visibility into field inspection outcomes and evidence for supervisors.",
    "about.problem.i4": "Consumer uncertainty regarding the authenticity of stamped weighing instruments in retail markets.",
    "about.vision.title": "Vision",
    "about.vision.desc": "To establish a transparent, efficient, and technologically advanced Legal Metrology administration that ensures consumer protection and promotes fair trade practices through seamless digital governance.",
    "about.limits.title": "Platform Limitations",
    "about.limits.p": "What MapanSetu Does NOT Do:",
    "about.limits.i1": "Does not perform automated remote calibration of physical weighing instruments.",
    "about.limits.i2": "Does not replace the statutory requirement for physical inspection by authorized Legal Metrology Officers.",
    "about.limits.i3": "Does not independently grant legal approvals without officer physical verification.",
    "about.dept.title": "Department Information",
    "about.dept.name": "Department of Legal Metrology",
    "about.dept.gov": "Ministry of Consumer Affairs, Food & Public Distribution",
    "about.dept.addr": "Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001",
    "about.dept.email": "dirwm-ca@nic.in",
    "about.dept.phone": "011-23389489",

    // P-03 Contact
    "contact.title": "Contact Us",
    "contact.subtitle": "Reach out to the Department of Legal Metrology or our Citizen Support helpdesk for inquiries, guidance, or grievance redressal.",
    "contact.dept.title": "Department Contact",
    "contact.support.title": "Citizen Support Helpdesk",
    "contact.tollfree": "Toll-Free Helpline",
    "contact.tollfreeNum": "1800-11-4000",
    "contact.timing": "Monday to Saturday, 9:00 AM – 6:00 PM IST",
    "contact.form.title": "Send a Message / Query",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email Address",
    "contact.form.phone": "Mobile Number",
    "contact.form.category": "Subject / Category",
    "contact.form.message": "Message / Inquiry Details",
    "contact.form.submit": "Submit Query",
    "contact.form.success": "Thank you! Your query has been received. Reference ID: MS-QRY-",

    // P-04 Help & FAQ
    "help.title": "Help & Frequently Asked Questions",
    "help.subtitle": "Search our knowledge base or browse topic categories for step-by-step guidance on MapanSetu services.",
    "help.search": "Search help topics...",
    "help.cat.all": "All Questions",
    "help.cat.general": "General & Overview",
    "help.cat.verify": "Certificate Verification",
    "help.cat.apps": "Applications & Workflow",
    "help.cat.instruments": "Instruments & Passports",
    "help.cat.account": "Account & Login",
    "help.stillNeed": "Still Need Assistance?",
    "help.contactBtn": "Contact Support Helpdesk",

    // P-05 Accessibility
    "access.title": "Accessibility Information",
    "access.subtitle": "MapanSetu is committed to ensuring digital accessibility for all citizens, adhering to GIGW 3.0 guidelines and WCAG 2.1 Level AA standards.",

    // P-06 Privacy Policy
    "privacy.title": "Privacy Policy",
    "privacy.subtitle": "This policy explains how information is collected, managed, and safeguarded under the MapanSetu portal.",

    // P-07 Terms & Disclaimer
    "terms.title": "Terms of Use & Disclaimer",
    "terms.subtitle": "Statutory terms, user responsibilities, and prototype coordination limitations for MapanSetu.",

    // P-08 Hyperlinking Policy
    "hyper.title": "Hyperlinking Policy",
    "hyper.subtitle": "Rules and guidelines regarding internal and external links on the MapanSetu portal.",

    // P-09 Copyright Policy
    "copy.title": "Copyright & Content Policy",
    "copy.subtitle": "Ownership of content, reproduction permissions, and attribution guidelines.",

    // P-10 Sitemap
    "sitemap.title": "Site Map",
    "sitemap.subtitle": "Hierarchical navigation overview of all public pages, policy documents, and authenticated services.",

    // P-11 404
    "notfound.title": "Page Not Found",
    "notfound.desc": "The page you are looking for might have been moved, updated, or is temporarily unavailable.",
    "notfound.home": "Go to Homepage",
    "notfound.verify": "Verify Certificate",
    "notfound.contact": "Contact Support",

    // P-12 500
    "error.title": "Service Temporarily Unavailable",
    "error.desc": "The system encountered an unexpected condition while processing your request. Please try again shortly.",
    "error.retry": "Try Again",

    // Footer
    "footer.quick": "Quick Links",
    "footer.policies": "Policies & Guidelines",
    "footer.resources": "National Resources",
    "footer.indiaPortal": "National Portal of India",
    "footer.consumerMinistry": "Ministry of Consumer Affairs",
    "footer.rights": "Department of Legal Metrology, Government of India. All rights reserved.",
    "footer.updated": "Last Updated: September 2026",
    "footer.disclaimer": "MapanSetu is an SIH 2026 prototype for digital coordination and record management. It does not replace physical statutory verification.",

    // Auth
    "auth.alreadySignedIn": "Already Signed In",
    "auth.signedInAs": "You are currently signed in as",
    "auth.continuePortal": "Continue to Portal",
    "auth.signOutSwitch": "Sign Out & Switch Account",
  },
  hi: {
    // Utility Bar & Header
    "util.skip": "मुख्य विषय पर जाएं",
    "util.accessibility": "पहुंच-योग्यता",
    "util.contrast": "उच्च कंट्रास्ट",
    "util.lang": "हिंदी",
    "brand.name": "मापनसेतु",
    "brand.dept": "विधिक मापविज्ञान विभाग",
    "brand.gov": "भारत सरकार",
    "nav.home": "मुख्य पृष्ठ",
    "nav.about": "हमारे बारे में",
    "nav.services": "सेवाएं",
    "nav.verify": "प्रमाणपत्र सत्यापित करें",
    "nav.help": "सहायता",
    "nav.contact": "संपर्क करें",
    "nav.login": "लॉग इन",
    "nav.openMenu": "मेनू खोलें",
    "nav.closeMenu": "मेनू बंद करें",

    // P-01 Homepage
    "home.badge": "राष्ट्रीय विधिक मापविज्ञान डिजिटल नेटवर्क",
    "home.hero.title": "तौल और माप उपकरणों का डिजिटल सत्यापन",
    "home.hero.desc": "मापनसेतु पूरे भारत में उपकरण पंजीकरण, सत्यापन अनुरोध, अधिकारी निरीक्षण समय-सारणी और डिजिटल प्रमाणपत्र जीवनचक्र रिकॉर्ड का समन्वय करता है।",
    "home.hero.verifyBtn": "प्रमाणपत्र सत्यापित करें",
    "home.hero.loginBtn": "पोर्टल में लॉग इन करें",
    "home.hero.howBtn": "यह कैसे काम करता है",
    "home.quick.title": "नागरिक और व्यापार सेवाएं",
    "home.quick.verify": "प्रमाणपत्र सत्यापन",
    "home.quick.verifyDesc": "किसी भी मापनसेतु सत्यापन प्रमाणपत्र की स्थिति, क्रम संख्या और प्रामाणिकता की जाँच करें।",
    "home.quick.apply": "सत्यापन के लिए आवेदन",
    "home.quick.applyDesc": "नए निर्मित, मरम्मत किए गए या वाणिज्यिक उपकरणों के सत्यापन के लिए आवेदन करें।",
    "home.quick.track": "आवेदन ट्रैक करें",
    "home.quick.trackDesc": "अधिकारी निरीक्षण शेड्यूलिंग से लेकर प्रमाणपत्र जारी होने तक की वास्तविक समय स्थिति देखें।",
    "home.quick.manage": "उपकरण प्रबंधन",
    "home.quick.manageDesc": "डिजिटल पासपोर्ट, अंशांकन इतिहास और पुनः सत्यापन अनुस्मारक प्रबंधित करें।",
    "home.workflow.title": "मापनसेतु कार्यप्रणाली",
    "home.workflow.subtitle": "विधिक मापविज्ञान ढांचे के तहत वैधानिक सत्यापन कार्यप्रवाह।",
    "home.workflow.step1.title": "1. उपकरण पंजीकृत करें",
    "home.workflow.step1.desc": "व्यवसाय श्रेणी, मॉडल और क्रम संख्या के साथ उपकरण पंजीकृत करते हैं।",
    "home.workflow.step2.title": "2. अनुरोध प्रस्तुत करें",
    "home.workflow.step2.desc": "वैधानिक सत्यापन शुल्क भुगतान संदर्भ के साथ आवेदन प्रस्तुत किया जाता है।",
    "home.workflow.step3.title": "3. एलएमओ (LMO) आवंटन",
    "home.workflow.step3.desc": "विधिक मापविज्ञान अधिकारी (LMO) आवंटित होता है और निरीक्षण कार्यक्रम निर्धारित होता है।",
    "home.workflow.step4.title": "4. एलएमओ (LMO) निरीक्षण",
    "home.workflow.step4.desc": "जियो-टैग्ड साक्ष्य के साथ भौतिक सहिष्णुता परीक्षण किया जाता है।",
    "home.workflow.step5.title": "5. डिजिटल प्रमाणपत्र",
    "home.workflow.step5.desc": "सार्वजनिक क्यूआर सत्यापन के साथ क्रिप्टोग्राफिक रूप से हस्ताक्षरित प्रमाणपत्र जारी किया जाता है।",
    "home.why.title": "मापनसेतु क्यों?",
    "home.why.traceable": "ट्रेसेबल रिकॉर्ड्स",
    "home.why.traceableDesc": "प्रथम अंशांकन से लेकर आवधिक पुनः सत्यापन तक अपरिवर्तनीय डिजिटल इतिहास।",
    "home.why.transparent": "पारदर्शी स्थिति",
    "home.why.transparentDesc": "व्यवसायों, एलएमओ (LMO) और जीएटीसी (GATCs) के लिए स्पष्ट ऑडिट चरण।",
    "home.why.evidence": "साक्ष्य-आधारित",
    "home.why.evidenceDesc": "जियो-स्टैम्प्ड ऑन-साइट फोटो साक्ष्य और मानक वजन परीक्षण सहिष्णुता लॉग।",
    "home.why.public": "सार्वजनिक सत्यापन",
    "home.why.publicDesc": "उपभोक्ता संरक्षण के लिए त्वरित क्यूआर कोड और प्रमाणपत्र संख्या सत्यापन।",
    "home.search.heading": "क्या आपके पास पहले से प्रमाणपत्र है?",
    "home.search.desc": "भौतिक मुहर या डिजिटल दस्तावेज़ पर मुद्रित प्रमाणपत्र पंजीकरण संख्या दर्ज करें।",
    "home.search.placeholder": "उदा. CERT-DEMO-001 या CERT-2024-8849",
    "home.search.btn": "प्रामाणिकता सत्यापित करें",
    "home.notice": "प्रोटोटाइप सूचना: मापनसेतु प्रदर्शन उद्देश्यों के लिए एक डिजिटल समन्वय मंच है। यह किसी अधिकृत विधिक मापविज्ञान अधिकारी द्वारा भौतिक वैधानिक सत्यापन का स्थान नहीं लेता है।",

    // P-02 About
    "about.title": "मापनसेतु के बारे में",
    "about.subtitle": "विधिक मापविज्ञान मानकीकरण, अनुपालन और उपभोक्ता विश्वास के लिए व्यापक डिजिटल समन्वय मंच।",
    "about.platform.title": "मंच के बारे में",
    "about.platform.p1": "मापनसेतु एक एकीकृत डिजिटल पारिस्थितिकी तंत्र है जिसे विधिक मापविज्ञान विभाग के कार्यों को सुव्यवस्थित और पारदर्शी बनाने के लिए डिज़ाइन किया गया है। यह देश भर में मानक वजन और माप अनुपालन सुनिश्चित करने के लिए व्यवसायों, एलएमओ (LMO) और जीएटीसी (GATCs) को जोड़ने वाले केंद्रीय केंद्र के रूप में कार्य करता है।",
    "about.platform.p2": "पारंपरिक प्रक्रियाओं को डिजिटल बनाकर, मापनसेतु का उद्देश्य प्रशासनिक बाधाओं को कम करना, जवाबदेही बढ़ाना और सभी माप-संबंधी प्रमाणपत्रों और अनुपालन रिकॉर्डों के लिए एक विश्वसनीय डिजिटल रिकॉर्ड प्रदान करना है।",
    "about.coord.title": "मापनसेतु क्या समन्वय करता है",
    "about.coord.desc": "यह मंच विधिक मापविज्ञान की अखंडता बनाए रखने के लिए आवश्यक महत्वपूर्ण कार्यों का समन्वय करता है:",
    "about.coord.biz": "व्यवसाय पंजीकरण",
    "about.coord.bizDesc": "निर्माताओं, डीलरों, मरम्मतकर्ताओं और व्यावसायिक उपयोगकर्ताओं का प्रोफाइलिंग।",
    "about.coord.inst": "उपकरण रिकॉर्ड",
    "about.coord.instDesc": "सभी पंजीकृत बाट, माप, तौल तराजू और फ्लो मीटर का केंद्रीकृत डेटाबेस।",
    "about.coord.app": "सत्यापन आवेदन",
    "about.coord.appDesc": "प्रारंभिक मुद्रांकन, आवधिक पुनः सत्यापन और नवीनीकरण की पूर्ण प्रक्रिया।",
    "about.coord.assign": "एलएमओ (LMO) आवंटन",
    "about.coord.assignDesc": "अधिकृत अधिकारियों को सत्यापन कार्यों का क्षेत्राधिकार-आधारित आवंटन।",
    "about.coord.sched": "निरीक्षण अनुसूची",
    "about.coord.schedDesc": "क्षेत्रीय दौरों और सत्यापन शिविरों के लिए गतिशील कैलेंडर प्रबंधन।",
    "about.coord.cert": "साक्ष्य और प्रमाणपत्र",
    "about.coord.certDesc": "अनुपालन प्रमाणपत्रों का सुरक्षित निर्माण, डिजिटल हस्ताक्षर और सार्वजनिक क्यूआर सत्यापन।",
    "about.problem.title": "संबोधित की जा रही समस्या",
    "about.problem.p1": "मापनसेतु से पूर्व, विधिक मापविज्ञान कागजी प्रमाणपत्रों और मैनुअल शेड्यूलिंग पर निर्भर था, जिससे ये समस्याएं उत्पन्न होती थीं:",
    "about.problem.i1": "प्रमाणपत्र नवीनीकरण और सत्यापन शेड्यूलिंग में अत्यधिक समय लगना।",
    "about.problem.i2": "वाणिज्यिक उपकरणों के जीवनचक्र और पुनः अंशांकन चक्र को ट्रैक करने में कठिनाई।",
    "about.problem.i3": "पर्यवेक्षकों के लिए क्षेत्रीय निरीक्षण परिणामों और साक्ष्यों की वास्तविक समय दृश्यता का अभाव।",
    "about.problem.i4": "खुदरा बाजारों में मुद्रांकित उपकरणों की प्रामाणिकता के संबंध में उपभोक्ताओं में अनिश्चितता।",
    "about.vision.title": "दृष्टिकोण",
    "about.vision.desc": "एक पारदर्शी, कुशल और तकनीकी रूप से उन्नत विधिक मापविज्ञान प्रशासन स्थापित करना जो उपभोक्ता संरक्षण सुनिश्चित करे और निष्पक्ष व्यापार प्रथाओं को बढ़ावा दे।",
    "about.limits.title": "मंच की सीमाएं",
    "about.limits.p": "मापनसेतु क्या नहीं करता है:",
    "about.limits.i1": "भौतिक उपकरणों का स्वचालित रिमोट अंशांकन नहीं करता है।",
    "about.limits.i2": "अधिकृत विधिक मापविज्ञान अधिकारियों द्वारा भौतिक निरीक्षण की वैधानिक आवश्यकता को प्रतिस्थापित नहीं करता है।",
    "about.limits.i3": "अधिकारी द्वारा भौतिक सत्यापन के बिना स्वतंत्र रूप से कानूनी अनुमोदन प्रदान नहीं करता है।",
    "about.dept.title": "विभागीय जानकारी",
    "about.dept.name": "विधिक मापविज्ञान विभाग",
    "about.dept.gov": "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    "about.dept.addr": "कृषि भवन, डॉ. राजेंद्र प्रसाद रोड, नई दिल्ली - 110001",
    "about.dept.email": "dirwm-ca@nic.in",
    "about.dept.phone": "011-23389489",

    // P-03 Contact
    "contact.title": "संपर्क करें",
    "contact.subtitle": "पूछताछ, मार्गदर्शन या शिकायत निवारण के लिए विधिक मापविज्ञान विभाग या हमारे नागरिक सहायता हेल्पडेस्क से संपर्क करें।",
    "contact.dept.title": "विभागीय संपर्क",
    "contact.support.title": "नागरिक सहायता हेल्पडेस्क",
    "contact.tollfree": "टोल-फ्री हेल्पलाइन",
    "contact.tollfreeNum": "1800-11-4000",
    "contact.timing": "सोमवार से शनिवार, सुबह 9:00 बजे से शाम 6:00 बजे तक",
    "contact.form.title": "संदेश / प्रश्न भेजें",
    "contact.form.name": "पूरा नाम",
    "contact.form.email": "ईमेल पता",
    "contact.form.phone": "मोबाइल नंबर",
    "contact.form.category": "विषय / श्रेणी",
    "contact.form.message": "संदेश / प्रश्न का विवरण",
    "contact.form.submit": "प्रश्न भेजें",
    "contact.form.success": "धन्यवाद! आपका प्रश्न प्राप्त हो गया है। संदर्भ संख्या: MS-QRY-",

    // P-04 Help & FAQ
    "help.title": "सहायता और अक्सर पूछे जाने वाले प्रश्न",
    "help.subtitle": "मापनसेतु सेवाओं पर चरण-दर-चरण मार्गदर्शन के लिए हमारे नॉलेज बेस में खोजें या विषय श्रेणियां ब्राउज़ करें।",
    "help.search": "सहायता विषय खोजें...",
    "help.cat.all": "सभी प्रश्न",
    "help.cat.general": "सामान्य और अवलोकन",
    "help.cat.verify": "प्रमाणपत्र सत्यापन",
    "help.cat.apps": "आवेदन और कार्यप्रवाह",
    "help.cat.instruments": "उपकरण और पासपोर्ट",
    "help.cat.account": "खाता और लॉगिन",
    "help.stillNeed": "क्या आपको अभी भी सहायता चाहिए?",
    "help.contactBtn": "सहायता हेल्पडेस्क से संपर्क करें",

    // P-05 Accessibility
    "access.title": "पहुंच-योग्यता जानकारी",
    "access.subtitle": "मापनसेतु सभी नागरिकों के लिए डिजिटल पहुंच सुनिश्चित करने के लिए प्रतिबद्ध है, जो GIGW 3.0 और WCAG 2.1 AA मानकों का पालन करता है।",

    // P-06 Privacy Policy
    "privacy.title": "गोपनीयता नीति",
    "privacy.subtitle": "यह नीति बताती है कि मापनसेतु पोर्टल पर जानकारी कैसे एकत्र, प्रबंधित और सुरक्षित रखी जाती है।",

    // P-07 Terms & Disclaimer
    "terms.title": "उपयोग की शर्तें और अस्वीकरण",
    "terms.subtitle": "मापनसेतु के लिए वैधानिक शर्तें, उपयोगकर्ता जिम्मेदारियां और प्रोटोटाइप समन्वय सीमाएं।",

    // P-08 Hyperlinking Policy
    "hyper.title": "हाइपरलिंकिंग नीति",
    "hyper.subtitle": "मापनसेतु पोर्टल पर आंतरिक और बाहरी लिंक के संबंध में नियम और दिशानिर्देश।",

    // P-09 Copyright Policy
    "copy.title": "कॉपीराइट और सामग्री नीति",
    "copy.subtitle": "सामग्री का स्वामित्व, पुनरुत्पादन अनुमतियां और श्रेय दिशानिर्देश।",

    // P-10 Sitemap
    "sitemap.title": "साइट मानचित्र",
    "sitemap.subtitle": "सभी सार्वजनिक पृष्ठों, नीति दस्तावेजों और प्रमाणित सेवाओं का श्रेणीबद्ध अवलोकन।",

    // P-11 404
    "notfound.title": "पृष्ठ नहीं मिला",
    "notfound.desc": "जिस पृष्ठ को आप खोज रहे हैं वह हटाया जा सकता है, उसका नाम बदला जा सकता है, या वह अस्थायी रूप से अनुपलब्ध है।",
    "notfound.home": "मुख्य पृष्ठ पर जाएं",
    "notfound.verify": "प्रमाणपत्र सत्यापित करें",
    "notfound.contact": "सहायता से संपर्क करें",

    // P-12 500
    "error.title": "सेवा अस्थायी रूप से अनुपलब्ध है",
    "error.desc": "आपके अनुरोध को संसाधित करते समय सिस्टम में एक अप्रत्याशित समस्या आई है। कृपया कुछ समय बाद पुनः प्रयास करें।",
    "error.retry": "पुनः प्रयास करें",

    // Footer
    "footer.quick": "त्वरित लिंक",
    "footer.policies": "नीतियां और दिशानिर्देश",
    "footer.resources": "राष्ट्रीय संसाधन",
    "footer.indiaPortal": "भारत का राष्ट्रीय पोर्टल",
    "footer.consumerMinistry": "उपभोक्ता मामले मंत्रालय",
    "footer.rights": "विधिक मापविज्ञान विभाग, भारत सरकार। सर्वाधिकार सुरक्षित।",
    "footer.updated": "अंतिम अद्यतन: सितंबर 2026",
    "footer.disclaimer": "मापनसेतु डिजिटल समन्वय के लिए एक प्रोटोटाइप प्रणाली है। यह अधिकृत अधिकारी द्वारा भौतिक सत्यापन का स्थान नहीं लेता है।",

    // Auth
    "auth.alreadySignedIn": "पहले से साइन इन हैं",
    "auth.signedInAs": "आप वर्तमान में साइन इन हैं:",
    "auth.continuePortal": "पोर्टल पर जाएं",
    "auth.signOutSwitch": "साइन आउट करें और खाता बदलें"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "mapansetu_language";
const FONT_SIZE_KEY = "mapansetu_font_size";
const CONTRAST_KEY = "mapansetu_contrast";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [contrast, setContrastState] = useState<"normal" | "high">("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (storedLang === "hi" || storedLang === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(storedLang);
    }

    const storedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
    if (storedFontSize) {
      setFontSizeState(storedFontSize);
      document.documentElement.setAttribute("data-font-size", storedFontSize);
    }

    const storedContrast = localStorage.getItem(CONTRAST_KEY) as "normal" | "high" | null;
    if (storedContrast) {
      setContrastState(storedContrast);
      document.documentElement.setAttribute("data-contrast", storedContrast);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
    if (size === "normal") {
      document.documentElement.removeAttribute("data-font-size");
    } else {
      document.documentElement.setAttribute("data-font-size", size);
    }
  };

  const toggleContrast = () => {
    const newContrast = contrast === "normal" ? "high" : "normal";
    setContrastState(newContrast);
    localStorage.setItem(CONTRAST_KEY, newContrast);
    if (newContrast === "high") {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        fontSize,
        setFontSize,
        contrast,
        toggleContrast,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
