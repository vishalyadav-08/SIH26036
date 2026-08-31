# Technology Stack

To ensure a fast, robust, and scalable prototype within 1 week, we choose the following stack:

## 1. Frontend (Web & Admin Portal)
*   **Framework:** React 18 with Vite (Fast builds, excellent AI agent support).
*   **Routing:** React Router v6.
*   **Styling:** Tailwind CSS + Shadcn UI (Provides high-quality, accessible pre-built components to save time).
*   **State Management:** Zustand (Simpler than Redux for a 1-week build) + React Query (for API data fetching and caching).

## 2. Field App (Offline PWA)
*   **Framework:** React + Vite + Vite PWA Plugin.
*   **Offline Database:** IndexedDB wrapped with `dexie.js` for easy offline data storage.
*   **Camera/QR:** `react-webcam` and `html5-qrcode` library.

## 3. Backend (API)
*   **Language/Framework:** Node.js with Express OR Java with Spring Boot. *(Recommendation: Node.js/TypeScript with Express/NestJS is often faster for 1-week prototypes and heavily supported by AI coding assistants).* Let's default to **Node.js (TypeScript) + Express**.
*   **ORM:** Prisma (Excellent type-safety and AI context generation) OR Drizzle.
*   **Authentication:** JWT (JSON Web Tokens).

## 4. Database & Storage
*   **Database:** PostgreSQL (Relational integrity is crucial for government records).
*   **Object Storage:** MinIO (Local S3 compatible) or direct AWS S3 for storing inspection photos.

## 5. Tooling
*   **Monorepo:** Turborepo or npm/yarn workspaces.
*   **API Docs:** Swagger / OpenAPI.
