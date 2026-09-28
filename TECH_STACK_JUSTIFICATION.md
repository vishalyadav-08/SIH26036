# Tech Stack Justification: MapanSetu (SIH26036)

This document outlines the rationale behind the technology choices for the MapanSetu platform. It is designed to answer common architectural and design questions, such as why specific frameworks, databases, and cryptographic algorithms were selected over their alternatives.

---

## 1. Cryptography & Security
**Our Choice:** SHA-256 (Hashing) and RSA-2048 (Digital Signatures)
**Alternatives Considered:** MD5, SHA-1

**Why we didn't use MD5:**
During internal evaluations, a common question is why MD5 was avoided. MD5 is a legacy cryptographic hash function that is fundamentally broken and vulnerable to **collision attacks** (where two different inputs produce the same hash). In a legal metrology system where certificates and evidence must hold up in court, using MD5 would destroy the integrity and non-repudiation of the data. 

**Why SHA-256 and RSA:**
*   **SHA-256:** Part of the SHA-2 family, it provides strong collision resistance. We use it to create immutable digital passports for equipment, ensuring the audit trail of inspections and repairs cannot be retroactively altered.
*   **RSA-2048 (with RSA-PSS padding):** We use RSA asymmetric cryptography to digitally sign legal certificates. The backend holds the private key to sign the certificate, while anyone (public verifiers, business owners) can use the public key to mathematically verify that the certificate is authentic, issued by the government, and hasn't been tampered with.

---

## 2. Core Backend API
**Our Choice:** Python, Django, and Django REST Framework (DRF)
**Alternatives Considered:** Node.js (Express), Java (Spring Boot)

**Why Django over others:**
*   **"Batteries-Included" Philosophy:** MapanSetu requires a robust admin panel, complex relational database schemas, and strict role-based access control (RBAC). Django provides a highly secure, built-in Admin interface and a powerful ORM right out of the box, saving weeks of development time.
*   **Security by Default:** Government applications require strict protection against common vulnerabilities. Django natively mitigates SQL injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Clickjacking.
*   **Python Ecosystem:** Python is the undisputed leader in data science and AI. Using a Python backend allows us to seamlessly integrate our AI Agent services (for document parsing and legal assistance) without bridging multiple languages.

---

## 3. Object & File Storage
**Our Choice:** MinIO (S3-Compatible Object Storage)
**Alternatives Considered:** Storing files in PostgreSQL as BLOBs, Local File System

**Why MinIO/S3 over Database Storage:**
MapanSetu handles a massive volume of unstructured data: field inspection photos, PDF certificates, compliance documents, and signature files. 
*   **Avoiding Database Bloat:** Storing large binary files directly in PostgreSQL severely degrades database performance, bloats backups, and slows down migrations.
*   **Scalability & Standardisation:** MinIO separates unstructured data from structured relational data. Because it uses the standard AWS S3 API, we can use MinIO for local development and seamlessly swap it out for AWS S3, Azure Blob Storage, or NIC Cloud storage in production with zero code changes.

---

## 4. Web Portal (Business, Admin, Public)
**Our Choice:** Next.js (React) and TypeScript
**Alternatives Considered:** Pure React (CRA), Angular, Vue

**Why Next.js & TypeScript:**
*   **Type Safety:** For a government-grade platform handling legal records, TypeScript is crucial. It ensures that data structures (like Inspector details and Certificate payloads) match the API perfectly, catching errors at compile time rather than runtime.
*   **Server-Side Rendering (SSR):** The public verification portal needs to be fast and SEO-friendly. Next.js allows us to pre-render pages on the server, drastically reducing the time-to-first-byte (TTFB) and improving accessibility for users on low-end devices.

---

## 5. Field Inspection Application
**Our Choice:** Flutter (Dart)
**Alternatives Considered:** React Native, Native Android (Kotlin), PWA

**Why Flutter:**
*   **Single Codebase:** Legal Metrology Officers might use a mix of provided tablets, Android phones, or iOS devices. Flutter allows us to compile native ARM code for both iOS and Android from a single codebase, halving development and maintenance costs.
*   **High Performance & Offline Capabilities:** Field officers often work in remote areas (e.g., weighing bridges, deep industrial zones) with poor network connectivity. Flutter's robust state management and local storage integrations allow the app to function offline and sync data once a connection is re-established.

---

## 6. System of Record (Database)
**Our Choice:** PostgreSQL
**Alternatives Considered:** MongoDB (NoSQL), MySQL

**Why PostgreSQL over NoSQL:**
*   **Relational Integrity:** Government records are inherently relational. A legal certificate belongs to an instrument, which is owned by a business, and verified by a specific officer. PostgreSQL enforces strict foreign key constraints, ensuring orphaned records or inconsistent data states are impossible.
*   **ACID Compliance:** PostgreSQL guarantees that complex transactions (e.g., an officer submitting a field report and generating a certificate simultaneously) are processed reliably without partial failures.

---

## 7. AI Assistant Service
**Our Choice:** FastAPI (Python)
**Alternatives Considered:** Integrating directly into Django, Flask

**Why FastAPI:**
*   **Decoupled Microservice Architecture:** By separating the AI logic from the core Django monolith, we ensure that heavy LLM inference operations or external API calls don't block the main application's HTTP threads.
*   **Asynchronous by Default:** FastAPI is built on Starlette and supports `async/await` natively. This is critical for AI services, which are heavily I/O bound (waiting for LLM provider responses). It can handle thousands of concurrent AI queries efficiently.
