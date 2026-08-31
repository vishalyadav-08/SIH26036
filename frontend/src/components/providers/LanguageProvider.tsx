"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.services": "Services",
    "nav.contact": "Contact",
    "nav.verify": "Verify Certificate",
    "nav.login": "Login",
    
    // Homepage
    "home.title": "Legal Metrology Department",
    "home.subtitle": "Department of Consumer Affairs, Government of India",
    "home.hero.title": "MapanSetu Digital Verification Portal",
    "home.hero.desc": "Ensuring accuracy, transparency, and consumer protection through digital tracking and cryptographic verification of weighing and measuring instruments across the nation.",
    "home.hero.verifyBtn": "Verify a Certificate",
    "home.hero.loginBtn": "Department / Business Login",
    
    "home.services.title": "Our Key Services",
    "home.services.registration": "Business Registration",
    "home.services.registrationDesc": "Register as a manufacturer, dealer, or repairer of weights and measures.",
    "home.services.verification": "Instrument Verification",
    "home.services.verificationDesc": "Apply for stamping and verification of commercial weighing instruments.",
    "home.services.public": "Public Verification",
    "home.services.publicDesc": "Citizens can instantly verify the authenticity of calibration certificates.",
    
    "home.stats.verified": "Instruments Verified",
    "home.stats.businesses": "Registered Businesses",
    "home.stats.districts": "Districts Covered",
    
    // Footer
    "footer.desc": "MapanSetu coordinates verification work and certificate lifecycle management. It does not perform physical statutory verification, grant legal approval, or claim live government integration in this prototype scope.",
    "footer.links": "Important Links",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.accessibility": "Accessibility Statement",
    
    // Verify Page
    "verify.title": "Public Certificate Verification",
    "verify.subtitle": "Verify the authenticity of digital calibration certificates issued by the Legal Metrology Department.",
    "verify.search": "Search",
    "verify.placeholder": "Enter Certificate Number (e.g. CERT-DEMO-001)"
  },
  hi: {
    // Header
    "nav.home": "मुख्य पृष्ठ",
    "nav.about": "हमारे बारे में",
    "nav.services": "सेवाएं",
    "nav.contact": "संपर्क करें",
    "nav.verify": "प्रमाणपत्र सत्यापित करें",
    "nav.login": "लॉग इन",

    // Homepage
    "home.title": "विधिक मापविज्ञान विभाग",
    "home.subtitle": "उपभोक्ता मामले विभाग, भारत सरकार",
    "home.hero.title": "मापनसेतु डिजिटल सत्यापन पोर्टल",
    "home.hero.desc": "देश भर में तौल और माप उपकरणों की डिजिटल ट्रैकिंग और क्रिप्टोग्राफिक सत्यापन के माध्यम से सटीकता, पारदर्शिता और उपभोक्ता संरक्षण सुनिश्चित करना।",
    "home.hero.verifyBtn": "प्रमाणपत्र सत्यापित करें",
    "home.hero.loginBtn": "विभाग / व्यवसाय लॉग इन",
    
    "home.services.title": "हमारी प्रमुख सेवाएं",
    "home.services.registration": "व्यवसाय पंजीकरण",
    "home.services.registrationDesc": "वजन और माप के निर्माता, डीलर या मरम्मतकर्ता के रूप में पंजीकरण करें।",
    "home.services.verification": "उपकरण सत्यापन",
    "home.services.verificationDesc": "वाणिज्यिक तौल उपकरणों की मुहर और सत्यापन के लिए आवेदन करें।",
    "home.services.public": "सार्वजनिक सत्यापन",
    "home.services.publicDesc": "नागरिक अंशांकन प्रमाणपत्रों की प्रामाणिकता को तुरंत सत्यापित कर सकते हैं।",
    
    "home.stats.verified": "सत्यापित उपकरण",
    "home.stats.businesses": "पंजीकृत व्यवसाय",
    "home.stats.districts": "कवर किए गए जिले",
    
    // Footer
    "footer.desc": "मापनसेतु सत्यापन कार्य और प्रमाणपत्र जीवनचक्र प्रबंधन का समन्वय करता है। यह भौतिक वैधानिक सत्यापन नहीं करता है, कानूनी अनुमोदन प्रदान नहीं करता है, या इस प्रोटोटाइप दायरे में लाइव सरकारी एकीकरण का दावा नहीं करता है।",
    "footer.links": "महत्वपूर्ण लिंक",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.accessibility": "पहुंच-योग्यता विवरण",
    
    // Verify Page
    "verify.title": "सार्वजनिक प्रमाणपत्र सत्यापन",
    "verify.subtitle": "विधिक मापविज्ञान विभाग द्वारा जारी डिजिटल अंशांकन प्रमाणपत्रों की प्रामाणिकता सत्यापित करें।",
    "verify.search": "खोजें",
    "verify.placeholder": "प्रमाणपत्र संख्या दर्ज करें (उदा. CERT-DEMO-001)"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "mapansetu_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === "hi" || stored === "en") {
      setLanguageState(stored);
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
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  // Prevent hydration mismatch by rendering children directly, but avoiding translated text mismatch
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
