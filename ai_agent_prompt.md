# AI Agent Prompt: Flutter App Business Workflow Update

**Instructions for the User:** Copy the text below and paste it as a prompt to your AI coding agent (like me, or in a new session/chat) when you are ready to start the implementation.

***

**System Role & Objective:**
You are an expert full-stack developer and Flutter specialist. Your objective is to update our existing Flutter mobile application to include the newly added business features that are currently only available on our web application. The goal is to allow businesses to register, manage their profiles, and execute their entire workflow natively within the mobile app, ensuring feature parity with the web platform.

---

### 1. Project Context & Directory Structure
- **Frontend (Web):** Located in `frontend/` (Next.js/React). This contains the latest business features and UI logic.
- **Backend (API):** Located in `backend/` (Node.js/Express or similar). The APIs for business registration and workflows already exist and are used by the web frontend.
- **Mobile App:** Located in `flutter_field_app/` (Flutter/Dart). This is the target application you will be updating.

---

### 2. Core Task Description
Implement the complete "Business User Workflow" in the Flutter app. This involves:
1. **Business Registration & Authentication:** Allow business users to sign up, log in, and verify their accounts directly from the app.
2. **Business Dashboard:** Create a landing screen for logged-in business users showing an overview of their activities.
3. **Core Business Workflows:** Replicate the data entry, form submissions, and management tools currently available on the website's business portal.
4. **API Integration:** Connect these new Flutter screens to the existing backend endpoints used by the web frontend.

---

### 3. Step-by-Step Implementation Plan

Please execute this task step-by-step. Do not move to the next step until the current one is completed and verified.

**Step 1: Codebase Analysis**
- Analyze the `frontend/` directory (specifically routing/pages related to business registration and workflows) to understand the required fields, UI flow, and state management.
- Analyze the `backend/` directory to identify the exact API endpoints, request payloads, and response formats required for the business features.
- Review the current state of `flutter_field_app/` to understand the existing navigation, state management (e.g., Provider, Riverpod, BLoC), and API integration patterns.

**Step 2: Define Data Models & API Services**
- In `flutter_field_app/lib/`, create or update Dart data models to represent business users and workflow entities.
- Implement the API service methods in Flutter to handle HTTP requests (POST, GET, PUT) for business registration and workflow actions. Ensure proper error handling and token-based authentication.

**Step 3: Implement Business Registration & Login Flow**
- Build the UI screens for Business Registration (matching the fields on the website).
- Integrate form validation.
- Connect the registration and login forms to the backend API services.
- Update the app's routing/navigation so users can choose to log in as a standard user or a business user (if applicable).

**Step 4: Implement Core Business Workflows**
- Build the Business Dashboard screen.
- Replicate the forms and lists from the website into Flutter screens.
- Implement state management to handle loading states, success messages, and data fetching.

---

### 4. Guidelines & Constraints
- **UI/UX Consistency:** Ensure the new Flutter screens follow the existing design language of the mobile app while adopting the logical flow of the web platform.
- **State Management:** Use the state management solution already established in `flutter_field_app`. Do not introduce a new one unless strictly necessary.
- **Error Handling:** Implement graceful error handling for network requests. Show clear SnackBars or Dialogs to the user if an API call fails.
- **Do NOT alter the backend:** The backend APIs are already working for the web. Adapt the Flutter app to consume what is already there. If an endpoint seems missing, thoroughly check the web frontend's network calls before assuming it needs to be created.

### 5. Start Execution
To begin, please start with **Step 1: Codebase Analysis**. Investigate the `frontend/src/app` and `backend` routes to map out the exact features we need to build in Flutter. Let me know what you find before writing the Flutter code.
