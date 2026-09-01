"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Scale,
  LogIn,
  Layers,
  PhoneCall,
  Info
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "general" | "verify" | "apps" | "instruments" | "account";
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    questionEn: "What is MapanSetu?",
    questionHi: "मापनसेतु क्या है?",
    answerEn: "MapanSetu is an integrated digital platform for the Department of Legal Metrology that coordinates the lifecycle of weighing and measuring instruments—from registration and verification scheduling to inspection evidence and public certificate verification.",
    answerHi: "मापनसेतु विधिक मापविज्ञान विभाग के लिए एक एकीकृत डिजिटल मंच है जो पंजीकरण और सत्यापन शेड्यूलिंग से लेकर निरीक्षण साक्ष्य और सार्वजनिक प्रमाणपत्र सत्यापन तक उपकरणों के जीवनचक्र का समन्वय करता है।"
  },
  {
    id: "faq-2",
    category: "verify",
    questionEn: "How can I verify the authenticity of a certificate?",
    questionHi: "मैं किसी प्रमाणपत्र की प्रामाणिकता कैसे सत्यापित कर सकता हूँ?",
    answerEn: "You can verify a certificate by clicking 'Verify Certificate' on the navigation bar and entering the Certificate Number (e.g. CERT-2024-8849) or scanning the QR code printed on the physical stamp/document.",
    answerHi: "आप नेविगेशन बार पर 'प्रमाणपत्र सत्यापित करें' पर क्लिक करके और प्रमाणपत्र संख्या (उदा. CERT-2024-8849) दर्ज करके या भौतिक मुहर/दस्तावेज़ पर मुद्रित क्यूआर कोड को स्कैन करके सत्यापित कर सकते हैं।"
  },
  {
    id: "faq-3",
    category: "verify",
    questionEn: "What information is displayed during certificate verification?",
    questionHi: "प्रमाणपत्र सत्यापन के दौरान क्या जानकारी प्रदर्शित होती है?",
    answerEn: "Public verification displays the Certificate Number, Issue Date, Validity Expiry Date, Instrument Type/Model, Business/Establishment Name, Assigned Legal Metrology Officer, and Verification Status.",
    answerHi: "सार्वजनिक सत्यापन में प्रमाणपत्र संख्या, जारी करने की तिथि, वैधता समाप्ति तिथि, उपकरण प्रकार/मॉडल, व्यापारिक प्रतिष्ठान का नाम, आवंटित अधिकारी और सत्यापन स्थिति प्रदर्शित होती है।"
  },
  {
    id: "faq-4",
    category: "apps",
    questionEn: "How do I apply for periodic re-verification of my instruments?",
    questionHi: "मैं अपने उपकरणों के आवधिक पुनः सत्यापन के लिए कैसे आवेदन करूं?",
    answerEn: "Log in with your registered Business account, navigate to 'Verification Applications', select the instruments due for re-verification, and submit the statutory request with fee details.",
    answerHi: "अपने पंजीकृत व्यवसाय खाते से लॉग इन करें, 'सत्यापन आवेदन' पर जाएं, पुनः सत्यापन के लिए नियत उपकरणों का चयन करें और शुल्क विवरण के साथ अनुरोध प्रस्तुत करें।"
  },
  {
    id: "faq-5",
    category: "apps",
    questionEn: "How is an inspection officer assigned and scheduled?",
    questionHi: "निरीक्षण अधिकारी कैसे आवंटित और निर्धारित होता है?",
    answerEn: "Once an application is submitted, the system routes the request to an authorized Legal Metrology Officer within the respective district jurisdiction and assigns a scheduled inspection slot.",
    answerHi: "आवेदन प्रस्तुत होने के बाद, प्रणाली संबंधित जिला क्षेत्राधिकार में एक अधिकृत विधिक मापविज्ञान अधिकारी को अनुरोध अग्रेषित करती है और एक निर्धारित निरीक्षण समय आवंटित करती है।"
  },
  {
    id: "faq-6",
    category: "instruments",
    questionEn: "How do I register a new commercial weighing instrument?",
    questionHi: "मैं एक नया वाणिज्यिक तौल उपकरण कैसे पंजीकृत करूं?",
    answerEn: "Business users can log in, open 'Instruments' tab, click 'Register Instrument', and input the serial number, model approval details, maximum capacity, and installation location.",
    answerHi: "व्यवसायिक उपयोगकर्ता लॉग इन करके 'उपकरण' टैब खोल सकते हैं, 'उपकरण पंजीकृत करें' पर क्लिक कर सकते हैं और क्रम संख्या, मॉडल अनुमोदन विवरण, अधिकतम क्षमता और स्थापना स्थान दर्ज कर सकते हैं।"
  },
  {
    id: "faq-7",
    category: "account",
    questionEn: "Who can register an account on the MapanSetu portal?",
    questionHi: "मापनसेतु पोर्टल पर कौन खाता पंजीकृत कर सकता है?",
    answerEn: "Manufacturers, dealers, repairers, commercial establishments, and authorized departmental personnel can access their respective role-based dashboards through login credentials.",
    answerHi: "निर्माता, डीलर, मरम्मतकर्ता, वाणिज्यिक प्रतिष्ठान और अधिकृत विभागीय कर्मी लॉगिन क्रेडेंशियल के माध्यम से अपने भूमिका-आधारित डैशबोर्ड तक पहुंच सकते हैं।"
  },
  {
    id: "faq-8",
    category: "general",
    questionEn: "Can I use the MapanSetu portal in Hindi?",
    questionHi: "क्या मैं मापनसेतु पोर्टल का उपयोग हिंदी में कर सकता हूँ?",
    answerEn: "Yes. The portal fully supports bilingual operation (English and Hindi). You can switch languages at any time using the language selector located in the top utility bar.",
    answerHi: "हाँ। पोर्टल द्विभाषी संचालन (अंग्रेजी और हिंदी) का पूरी तरह से समर्थन करता है। आप शीर्ष उपयोगिता पट्टी में स्थित भाषा चयनकर्ता का उपयोग करके किसी भी समय भाषा बदल सकते हैं।"
  }
];

export default function HelpFAQPage() {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const categories = [
    { id: "all", labelEn: "All Questions", labelHi: "सभी प्रश्न", icon: HelpCircle },
    { id: "general", labelEn: "General & Overview", labelHi: "सामान्य और अवलोकन", icon: Info },
    { id: "verify", labelEn: "Certificate Verification", labelHi: "प्रमाणपत्र सत्यापन", icon: FileCheck },
    { id: "apps", labelEn: "Applications & Workflow", labelHi: "आवेदन और कार्यप्रवाह", icon: Layers },
    { id: "instruments", labelEn: "Instruments & Passports", labelHi: "उपकरण और पासपोर्ट", icon: Scale },
    { id: "account", labelEn: "Account & Login", labelHi: "खाता और लॉगिन", icon: LogIn },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const qText = language === "hi" ? faq.questionHi : faq.questionEn;
    const aText = language === "hi" ? faq.answerHi : faq.answerEn;
    const matchesSearch = !query || qText.toLowerCase().includes(query) || aText.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none" tabIndex={-1}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[#414753]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#004e9f] focus:outline-none focus:ring-1 focus:ring-[#004e9f] rounded px-1">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#727784]" />
            </li>
            <li aria-current="page" className="font-semibold text-[#111c2d]">
              {t("nav.help")}
            </li>
          </ol>
        </nav>

        {/* Page Header & Search Bar */}
        <header className="mb-8 text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f]">
            {t("help.title")}
          </h1>
          <p className="text-xs sm:text-sm text-[#414753]">
            {t("help.subtitle")}
          </p>

          <div className="relative max-w-xl mx-auto pt-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none pt-2">
              <Search className="w-4 h-4 text-[#727784]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("help.search")}
              aria-label="Search help topics"
              className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-10 pr-4 py-3 text-xs sm:text-sm text-[#111c2d] placeholder-[#727784] focus:outline-none focus:ring-2 focus:ring-[#004e9f] shadow-xs"
            />
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Categories Sidebar (3 Cols) */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-[#cbd5e1] p-4 sticky top-24 shadow-xs space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111c2d] pb-2 border-b border-[#cbd5e1] mb-2">
                Topic Categories
              </h2>
              <nav className="space-y-1" aria-label="Help categories">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  const label = language === "hi" ? cat.labelHi : cat.labelEn;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                        active
                          ? "bg-[#e7eeff] text-[#004e9f] font-bold"
                          : "text-[#414753] hover:bg-[#f8fafc] hover:text-[#111c2d]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Accordion FAQ List (9 Cols) */}
          <div className="lg:col-span-9 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e1]">
              <h2 className="text-sm font-bold text-[#111c2d]">
                Showing {filteredFaqs.length} question{filteredFaqs.length !== 1 ? "s" : ""}
              </h2>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#004e9f] hover:underline"
                >
                  Clear search filter
                </button>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-8 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-[#727784] mx-auto" />
                <h3 className="font-bold text-sm text-[#111c2d]">No questions match your query</h3>
                <p className="text-xs text-[#414753]">
                  Try searching with different terms or select &ldquo;All Questions&rdquo; from the categories list.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedId === faq.id;
                const question = language === "hi" ? faq.questionHi : faq.questionEn;
                const answer = language === "hi" ? faq.answerHi : faq.answerEn;

                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-[#cbd5e1] rounded-lg overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-inset hover:bg-[#f8fafc]"
                    >
                      <span className="font-semibold text-xs sm:text-sm text-[#111c2d]">
                        {question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#004e9f] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#727784] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${faq.id}`}
                        className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#414753] leading-relaxed border-t border-[#f0f3ff] bg-[#f8fafc]/50"
                      >
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Bottom Support Callout */}
            <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded-lg p-5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded bg-white text-[#004e9f] flex items-center justify-center shrink-0 border border-[#cbd5e1]">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111c2d]">{t("help.stillNeed")}</h3>
                  <p className="text-xs text-[#414753]">Our citizen support helpdesk is available Mon–Sat, 9AM to 6PM.</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="bg-[#004e9f] text-white hover:bg-[#003366] text-xs font-semibold px-4 py-2 rounded transition-colors shrink-0 shadow-xs"
              >
                {t("help.contactBtn")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
