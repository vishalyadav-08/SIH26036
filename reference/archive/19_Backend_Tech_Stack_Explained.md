# Backend Technology Stack Explained

This document provides a detailed overview of the technologies and libraries used in the backend of the **MapanSetu** project (SIH26036 - Legal Metrology System). It is intended to help team members understand *what* tools we are using and, more importantly, *why* we have chosen them for this specific government-grade digital platform.

## 1. Node.js & TypeScript
### What it is:
*   **Node.js** is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows us to run JavaScript on the server side.
*   **TypeScript** is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

### Why we use it in MapanSetu:
*   **Node.js** provides an asynchronous, event-driven architecture, which is excellent for handling many concurrent I/O operations (like database queries and API requests).
*   **TypeScript** is crucial for our project because it catches errors at compile time rather than runtime. For a government-grade platform handling legal records, type safety ensures that data structures (like Inspector details, Certificate data, and Equipment logs) are exactly what we expect, reducing bugs and improving code maintainability.

## 2. Express.js
### What it is:
*   **Express.js** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### Why we use it in MapanSetu:
*   It simplifies the process of creating APIs, defining routes, and handling HTTP requests and responses.
*   **Middleware:** Express allows us to use middleware for tasks like logging, authentication (checking JWTs before letting users access specific routes), and error handling in a clean, organized manner.

## 3. Prisma ORM
### What it is:
*   **Prisma** is a next-generation Object-Relational Mapper (ORM) for Node.js and TypeScript.

### Why we use it in MapanSetu:
*   **Type Safety:** Prisma auto-generates a type-safe client based on our database schema. When we query the database in TypeScript, we get auto-completion and compile-time checks, ensuring we don't query non-existent columns or pass the wrong data types.
*   **Schema Management:** Prisma makes it easy to define our database schema in a readable format (`schema.prisma`) and manage database migrations (schema changes) systematically over time.

## 4. PostgreSQL
### What it is:
*   **PostgreSQL** is a powerful, open-source object-relational database system known for reliability, feature robustness, and performance.

### Why we use it in MapanSetu:
*   **Relational Integrity:** Government records require strict data integrity and relationships. A legal certificate is tied to an equipment, which is tied to an owner, and verified by an inspector. A relational database enforces these foreign key constraints natively.
*   **ACID Compliance:** PostgreSQL ensures transactions are processed reliably, which is critical when updating sensitive records (like changing a certificate status from pending to approved).

## 5. MinIO
### What it is:
*   **MinIO** is a high-performance, S3-compatible object storage server.

### Why we use it in MapanSetu:
*   We use MinIO to store files such as equipment photos, PDF certificates, and inspector signatures.
*   **Why not the database?** Storing large binary files (BLOBs) directly in PostgreSQL can bloat the database, slowing down queries and backups. Storing them in a dedicated object storage like MinIO separates structured data from unstructured files, making the system more scalable and performant. The database simply stores the URL or path to the file in MinIO.

## 6. JWT (jsonwebtoken) & bcryptjs
### What they are:
*   **JWT (JSON Web Tokens):** A compact, URL-safe means of representing claims to be transferred between two parties.
*   **bcryptjs:** A library to help hash passwords securely.

### Why we use them in MapanSetu:
*   **Authentication & Authorization:** When a user (e.g., an Inspector or Shop Owner) logs in, we hash the provided password using `bcryptjs` and compare it to the stored hash. If valid, we issue a **JWT**.
*   **Stateless Security:** JWTs allow our API to be stateless. The token contains the user's ID and role securely signed. The server doesn't need to look up a session in the database for every request; it just verifies the token's signature.

## 7. Zod
### What it is:
*   **Zod** is a TypeScript-first schema declaration and validation library.

### Why we use it in MapanSetu:
*   **Data Validation:** Before our API processes a request (like creating a new inspection report), we use Zod to validate the incoming JSON payload.
*   It ensures that required fields are present, strings meet length requirements, and numbers are within valid ranges. This prevents malformed or malicious data from reaching our controllers or database, adding a critical layer of defense.

## 8. Node's native `crypto` module
### What it is:
*   A built-in Node.js module providing cryptographic functionality.

### Why we use it in MapanSetu:
*   **Digital Trust:** We use this module for high-security cryptographic operations essential for legal metrology.
*   **RSA Signing:** We use public/private key pairs to digitally sign issued certificates. This allows anyone to verify that a certificate was genuinely issued by the MapanSetu system and hasn't been tampered with.
*   **SHA-256 Hash Chains:** For the Digital Passport of equipment, we use cryptographic hashing to create an immutable log of events (inspections, repairs, transfers), ensuring the audit trail cannot be retroactively altered.

## 9. node-cron
### What it is:
*   A task scheduler in pure JavaScript for node.js based on GNU crontab.

### Why we use it in MapanSetu:
*   **Background Jobs:** Legal certificates have expiration dates. We use `node-cron` to schedule automated background jobs.
*   For example, a job can run every night at midnight to check the database for certificates expiring in the next 30 days and automatically trigger notification emails or SMS alerts to shop owners, ensuring timely renewals and compliance.
