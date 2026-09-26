# Product Related Document: Use Case for Bhashini Services

**Project Name:** MapanSetu (SIH26036)  
**Project Objective:** A Unified Digital Lifecycle Management Platform for Legal Metrology (Weights & Measures) across India ("One Nation, One Process").  
**Target Audience:** Micro, Small, and Medium Enterprises (MSMEs), Local Shopkeepers, Instrument Repairers/Dealers, General Consumers, and Government Legal Metrology Officers (LMOs).

---

## 1. Executive Summary
MapanSetu is a nationwide digital platform designed to unite the Legal Metrology processes of all 36 States and UTs into a single seamless portal. Because the platform's primary users are grassroots-level traders, rural shopkeepers, local instrument repairers, and everyday consumers, English-only or Hindi-only interfaces create a significant barrier to statutory compliance. 

To achieve true digital inclusion and ensure 100% compliance nationwide, **MapanSetu is integrating the Bhashini API (National Language Translation Mission)**. Bhashini will power real-time localization, transliteration, and multilingual data processing across the platform.

---

## 2. Detailed Use Cases for Bhashini Integration

### Use Case 1: Real-Time Multilingual User Interface (UI Localization)
* **Problem:** A local dealer in Tamil Nadu or a packer in West Bengal may struggle to navigate complex legal metrology registration forms in English.
* **Bhashini Service Used:** **NMT (Neural Machine Translation)**
* **Description:** The MapanSetu Next.js frontend will dynamically hit the Bhashini API to translate standard UI elements, application forms (Form LM-1, LD-1, LR-1), and legal guidelines into 22 scheduled Indian languages. This allows a user to fully navigate the portal and understand compliance requirements in their native tongue.

### Use Case 2: Consumer Grievance Redressal Translation
* **Problem:** Consumers frequently face short-weighment or packaging violations (Rule 27). A consumer from rural Maharashtra will likely file a complaint in Marathi, but the reviewing Legal Metrology Officer (LMO) at a central or state desk might require the text in Hindi or English for official records.
* **Bhashini Service Used:** **NMT (Text-to-Text Translation)**
* **Description:** When a consumer files a complaint on MapanSetu using their regional language, the Bhashini API will instantly translate the complaint payload into the administrative language (English/Hindi) for the backend dashboard. Conversely, the officer's resolution response is translated back into the consumer's regional language before being sent via SMS/Email.

### Use Case 3: Form Transliteration for Rural Businesses
* **Problem:** Many local traders are comfortable speaking their language but struggle with exact English spelling of complex Indian names or addresses (e.g., street names, local commodities).
* **Bhashini Service Used:** **Xlit (Transliteration)**
* **Description:** While filling out Business Registration or Instrument Verification forms, users can type in English phonetics, and the Bhashini Transliteration API will convert it to the accurate local script (e.g., typing "Kiran" translates directly to the Hindi/Tamil equivalent). This ensures high data quality in the central database while remaining user-friendly.

### Use Case 4: Voice-Assisted Form Filling for Less Tech-Savvy Users
* **Problem:** Marginalized vendors (e.g., vegetable cart owners using standard weights) often lack the digital literacy to type out long registration forms on a mobile device.
* **Bhashini Service Used:** **ASR (Automatic Speech Recognition) + NMT**
* **Description:** MapanSetu will implement a "Mic" button on critical input fields (like Complaint Description or Address). The user can speak in their native language; Bhashini's ASR will convert the speech to text, and NMT will translate it to the standard system language, making digital compliance accessible to illiterate or semi-literate users.

### Use Case 5: Dual-Language Certificate Generation
* **Problem:** Legal Metrology verification certificates must be legally enforceable across India but easily readable by the local business owner.
* **Bhashini Service Used:** **NMT (Text Translation)**
* **Description:** When the Django backend generates the digitally signed PDF verification certificate (after successful officer inspection), the Bhashini API translates the key certificate parameters. The final PDF is generated in a Dual-Language format (English + the Business's registered local language).

---

## 3. Technical Implementation Flow
1. **Frontend (Next.js):** Maintains a central `LanguageContext`. When a user switches their preferred language from the global header, the app fetches translated content via Bhashini API endpoints.
2. **Backend (Django):** Acts as a secure proxy to the Bhashini API. Incoming regional text from databases (like user complaints or addresses) is sent to Bhashini securely using our registered API keys, translated, and stored/served accordingly.
3. **Caching:** To minimize API calls and latency, static UI translations returned by Bhashini will be cached locally using Redis.

## 4. Expected Impact
By utilizing Bhashini, MapanSetu will:
* Remove language barriers, increasing nationwide Legal Metrology compliance by an estimated 40% in tier-2 and tier-3 cities.
* Drastically reduce the rate of rejected applications caused by misunderstanding English compliance forms.
* Empower consumers across all 36 States/UTs to report fraudulent weighing practices in their mother tongue.
