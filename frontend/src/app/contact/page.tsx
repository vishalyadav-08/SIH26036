"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Headphones,
  Send,
  CheckCircle2,
  Clock,
  Map
} from "lucide-react";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedRef = Math.floor(100000 + Math.random() * 900000).toString();
    setRefId(generatedRef);
    setSubmitted(true);
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
              {t("nav.contact")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("contact.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards & Office Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Department Contact Card */}
            <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-xs">
              <h2 className="text-base font-bold text-[#111c2d] flex items-center gap-2 border-b border-[#f0f3ff] pb-2 mb-4">
                <Building2 className="w-5 h-5 text-[#004e9f]" />
                <span>{t("contact.dept.title")}</span>
              </h2>

              <div className="space-y-4 text-xs text-[#414753]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111c2d]">Head Office</strong>
                    <span>Department of Legal Metrology, Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111c2d]">Office Telephone</strong>
                    <span>+91 11 2338 9489 / 2436 0000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111c2d]">Official Email</strong>
                    <a href="mailto:contact@legalmetrology.gov.in" className="text-[#004e9f] hover:underline">
                      contact@legalmetrology.gov.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Support Helpdesk Card */}
            <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded-lg p-5 shadow-xs">
              <h2 className="text-base font-bold text-[#111c2d] flex items-center gap-2 border-b border-[#cbd5e1] pb-2 mb-3">
                <Headphones className="w-5 h-5 text-[#004e9f]" />
                <span>{t("contact.support.title")}</span>
              </h2>

              <p className="text-xs text-[#414753] mb-3">
                For queries regarding verification applications, officer schedules, and certificate verification.
              </p>

              <div className="bg-white border border-[#cbd5e1] rounded p-3 space-y-1">
                <div className="text-[11px] font-semibold text-[#727784] uppercase tracking-wide">
                  {t("contact.tollfree")}
                </div>
                <div className="text-xl font-bold text-[#004e9f]">
                  {t("contact.tollfreeNum")}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#414753] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>{t("contact.timing")}</span>
                </div>
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs">
              <div className="h-40 bg-[#e7eeff] rounded border border-[#cbd5e1] flex flex-col items-center justify-center text-[#414753] text-xs">
                <Map className="w-7 h-7 text-[#004e9f] mb-1.5" />
                <span className="font-semibold text-[#111c2d]">National Headquarters Map View</span>
                <span className="text-[11px] text-[#727784]">Krishi Bhawan, New Delhi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#111c2d] mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#004e9f]" />
                <span>{t("contact.form.title")}</span>
              </h2>
              <p className="text-xs text-[#414753] mb-6">
                Fill in the details below. Our support team will process your query according to citizen service timelines.
              </p>

              {submitted ? (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-6 text-center space-y-3" role="alert">
                  <div className="w-12 h-12 rounded-full bg-[#15803d]/10 text-[#15803d] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-[#15803d]">Inquiry Successfully Submitted</h3>
                  <p className="text-xs text-[#166534] max-w-md mx-auto">
                    {t("contact.form.success")}
                    <strong className="font-mono">{refId}</strong>. A confirmation has been logged for tracking.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        category: "General Inquiry",
                        message: "",
                      });
                    }}
                    className="mt-2 text-xs font-semibold text-[#004e9f] hover:underline"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-[#111c2d] mb-1">
                      {t("contact.form.name")} <span className="text-[#b91c1c]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-2 text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-[#111c2d] mb-1">
                        {t("contact.form.email")} <span className="text-[#b91c1c]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-2 text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#111c2d] mb-1">
                        {t("contact.form.phone")} <span className="text-[#b91c1c]">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-2 text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-category" className="block text-xs font-semibold text-[#111c2d] mb-1">
                      {t("contact.form.category")}
                    </label>
                    <select
                      id="contact-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-2 text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white"
                    >
                      <option value="General Inquiry">General Metrology Inquiry</option>
                      <option value="Certificate Verification">Certificate Verification Assistance</option>
                      <option value="Application Status">Application &amp; Stamping Progress</option>
                      <option value="Instrument Registration">Instrument Registration Support</option>
                      <option value="Technical Issue">Portal Technical Issue / Bug</option>
                      <option value="Grievance">Citizen Grievance Redressal</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-[#111c2d] mb-1">
                      {t("contact.form.message")} <span className="text-[#b91c1c]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide specific details regarding your inquiry or certificate reference..."
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-2 text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#004e9f] hover:bg-[#003366] text-white font-semibold text-xs px-6 py-2.5 rounded transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("contact.form.submit")}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
