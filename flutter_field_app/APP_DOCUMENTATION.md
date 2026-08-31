# MapanSetu Field App Documentation

## 1. App Features
*   **Offline-First Architecture**: Built around Hive NoSQL local storage, allowing officers to conduct full inspections, save drafts, and capture evidence entirely offline.
*   **Multi-Lingual Support**: Seamless toggling between English and Hindi (`hi` and `en` locales).
*   **Inspection Wizard**: A robust, multi-step dynamic form (Overview, Checklist, Measurements, Evidence) for executing standardized field checks.
*   **Hardware Integration**: Utilizes native device hardware for core functionality (Camera for evidence, GPS for geotagging).
*   **Sync Center Engine**: Dedicated synchronization dashboard that queues completed inspections, drafts, and evidence, automatically pushing them to the backend when connectivity is restored.
*   **Dashboard & Workload Management**: Provides an at-a-glance view of pending, in-progress, and urgent tasks.
*   **Biometric Quick Sign-In**: Allows returning officers to quickly authenticate using their device's fingerprint or face scanner.

## 2. Security Measures
*   **JWT Token Authentication**: Uses Dio interceptors to automatically inject Bearer tokens into all authorized API requests.
*   **Encrypted Storage**: Uses `flutter_secure_storage` (backed by Android Keystore and iOS Keychain) to securely store sensitive JWT Access and Refresh tokens.
*   **Biometric Hardware Security**: Implements `local_auth` to ensure only the physically authorized officer can access the app session.
*   **HTTPS Strictness**: The base URL is configured to strictly communicate over `https://` ensuring all data in transit is encrypted.

## 3. API Endpoints
The app is currently configured to connect to `https://api.mapansetu.gov.in/v1`. The primary endpoints defined in the data layer are:
*   `POST /auth/login` - Authenticates the officer using Officer ID and PIN, returning JWT `access` and `refresh` tokens.
*   `GET /inspections` - Retrieves the assigned inspection tasks, schedules, and templates for the authenticated officer.
*   `POST /sync` - Uploads completed offline inspection payloads (checklists, readings, GPS, evidence) back to the server. Handles conflict resolution (409) and queue management.

## 4. How Testing Can Be Done
*   **Mock Backend Mode**: Open `lib/config/app_config.dart` and set `useMockBackend = true`. This bypasses all network calls, injecting dummy data into the Hive database and simulating network latency. This is perfect for UI/UX testing without needing a live backend.
*   **Simulated Offline Mode**: Navigate to the "Sync Center" inside the app and tap "Simulate Offline". This allows testers to verify the offline queueing behavior and UI state changes without actually turning off the device's Wi-Fi.
*   **Hardware Testing**: To test the Camera, GPS, and Biometrics, the app must be compiled and deployed to a physical Android device using `flutter run`. (Note: Android Emulators can simulate GPS, but physical devices are recommended for Camera and Biometric testing).

## 5. Permissions Required
The following permissions are requested in the `AndroidManifest.xml` and at runtime:
*   `android.permission.INTERNET`: Required to communicate with the REST API.
*   `android.permission.CAMERA`: Required to launch the `image_picker` and capture photographic evidence during inspections.
*   `android.permission.ACCESS_FINE_LOCATION`: Required by `geolocator` to capture highly accurate real-world GPS coordinates for evidence geotagging.
*   `android.permission.ACCESS_COARSE_LOCATION`: Required as a fallback for faster, tower-based location approximation.
*   `android.permission.USE_BIOMETRIC`: Required to access the device's native fingerprint or face scanning hardware for Quick Sign-In.
