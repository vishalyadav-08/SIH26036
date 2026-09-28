# MapanSetu - Comprehensive Features Document

**MapanSetu** is a unified digital platform for pan-India map approval and land record management, developed for SIH 2026. This document details the platform's features across its web portal, mobile application, administrative interfaces, and backend capabilities.

---

## 1. WEBSITE FEATURES

### 1.1 Authentication & User Management

#### Aadhaar-based Registration and Verification
- **Description**: Secure onboarding using India's national identity system.
- **Technical Implementation**: Integrates with UIDAI API for demographic and biometric verification. Uses e-KYC for instant profile population.
- **Government Benefit**: Ensures 100% verified users, preventing fraud and duplicate accounts.
- **User Benefit**: Frictionless sign-up process without manual document uploads.
- **API Endpoints**: `POST /api/v1/auth/aadhaar-init`, `POST /api/v1/auth/aadhaar-verify`

#### Multi-factor Authentication (TOTP)
- **Description**: Two-step verification using authenticator apps.
- **Technical Implementation**: Generates a TOTP secret via `otplib`, stored securely. Users verify using Google/Microsoft Authenticator.
- **Government Benefit**: Protects sensitive government data from unauthorized access.
- **User Benefit**: Enhanced security for personal and land assets.
- **API Endpoints**: `POST /api/v1/auth/mfa/setup`, `POST /api/v1/auth/mfa/verify`

#### Role-based Access Control (RBAC)
- **Description**: Strict authorization mechanism with 6 distinct roles (Super Admin, State Admin, District Officer, Surveyor, Citizen, Developer).
- **Technical Implementation**: Middleware intercepts requests, checks JWT role claims against endpoint requirements.
- **Government Benefit**: Hierarchical access mimicking government administrative structures.
- **User Benefit**: Clean UI showing only relevant tools and actions.
- **API Endpoints**: Enforced across all authenticated endpoints.

#### JWT with Refresh Token Rotation
- **Description**: Secure session management.
- **Technical Implementation**: Short-lived access tokens (15m) and long-lived refresh tokens (7d). Refresh tokens are rotated on use and stored in HttpOnly cookies.
- **Government Benefit**: Minimizes the risk of token theft and replay attacks.
- **User Benefit**: Seamless sessions without constant re-login prompts.
- **API Endpoints**: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`

#### Login History Tracking
- **Description**: Audit trail of user access.
- **Technical Implementation**: Captures IP, User-Agent, location, and timestamp for every login event in PostgreSQL.
- **Government Benefit**: Crucial for security audits and tracking unauthorized access attempts.
- **User Benefit**: Users can review their login history to detect suspicious activity.
- **API Endpoints**: `GET /api/v1/users/me/sessions`

#### Profile Management with Linked Services
- **Description**: Unified dashboard for user details and connected services (DigiLocker, PAN).
- **Technical Implementation**: CRUD operations on the User model. OAuth2 integrations for linked services.
- **Government Benefit**: Centralized view of citizen data.
- **User Benefit**: Single place to manage identity and connected accounts.
- **API Endpoints**: `GET /api/v1/users/me`, `PATCH /api/v1/users/me`

#### Biometric Authentication Support
- **Description**: Support for fingerprint and facial recognition.
- **Technical Implementation**: WebAuthn API for browser-based biometrics.
- **Government Benefit**: High-assurance authentication for critical approvals.
- **User Benefit**: Passwordless, fast login.
- **API Endpoints**: `POST /api/v1/auth/webauthn/register`, `POST /api/v1/auth/webauthn/authenticate`

#### Password Reset with Secure Tokens
- **Description**: Self-service account recovery.
- **Technical Implementation**: Generates a cryptographic hash stored in the DB with an expiration time, sent via email/SMS.
- **Government Benefit**: Reduces IT helpdesk overhead.
- **User Benefit**: Quick recovery of lost access.
- **API Endpoints**: `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`

---

### 1.2 Map Management

#### Multi-format Upload
- **Description**: Ingests GeoTIFF, Shapefile, KML/KMZ, GeoJSON, DWG/DXF.
- **Technical Implementation**: Multer for file upload, GDAL/OGR bindings for format conversion and validation. Stored in AWS S3 / MinIO.
- **Government Benefit**: Interoperability with existing legacy systems and external contractor submissions.
- **User Benefit**: Surveyors can upload data directly from their specialized software.
- **API Endpoints**: `POST /api/v1/maps/upload`

#### AI-powered Map Analysis
- **Description**: Automated scoring, issue detection, and suggestions.
- **Technical Implementation**: Python microservice running OpenCV and specialized geospatial ML models for anomaly detection and boundary conflict checks.
- **Government Benefit**: Drastically reduces manual review time and catches human errors.
- **User Benefit**: Instant feedback on map quality before formal submission.
- **API Endpoints**: `POST /api/v1/maps/{id}/analyze`

#### Interactive Map Viewer
- **Description**: Web-based GIS viewer.
- **Technical Implementation**: React Leaflet / Mapbox GL JS for rendering vector and raster tiles.
- **Government Benefit**: Democratizes access to geospatial data without desktop GIS software.
- **User Benefit**: Smooth zooming, panning, and interaction on any device.
- **API Endpoints**: `GET /api/v1/maps/{id}/tiles/{z}/{x}/{y}`

#### Layer Management
- **Description**: Add, toggle, and style map layers.
- **Technical Implementation**: Client-side state management for layer visibility. Geoserver backend for dynamic styling via SLD.
- **Government Benefit**: Ability to overlay administrative boundaries, utilities, and land parcels for context.
- **User Benefit**: Customizable viewing experience based on task requirements.
- **API Endpoints**: `GET /api/v1/maps/{id}/layers`, `PUT /api/v1/maps/{id}/layers`

#### Map Versioning and History
- **Description**: Git-like version control for maps.
- **Technical Implementation**: PostGIS time-travel or append-only tables with parent-child relationships for map iterations.
- **Government Benefit**: Legal traceability of boundary changes over time.
- **User Benefit**: Safe experimentation and easy rollback to previous map states.
- **API Endpoints**: `GET /api/v1/maps/{id}/versions`

#### Map Comparison
- **Description**: Side-by-side, overlay, and difference views.
- **Technical Implementation**: Syncing map instances in UI. Turf.js for client-side difference calculations or PostGIS `ST_Difference` on backend.
- **Government Benefit**: Easy identification of encroachments or unauthorized changes.
- **User Benefit**: Visual clarity on what changed between submissions.
- **API Endpoints**: `GET /api/v1/maps/compare?id1={x}&id2={y}`

#### Export in Multiple Formats
- **Description**: Download maps as PDF, GeoTIFF, Shapefile, KML, PNG.
- **Technical Implementation**: GDAL for spatial formats, Puppeteer for high-res PDF/PNG generation.
- **Government Benefit**: Standardized output for offline records and reports.
- **User Benefit**: Easy sharing with stakeholders who don't have platform access.
- **API Endpoints**: `GET /api/v1/maps/{id}/export`

#### Map Sharing with Granular Permissions
- **Description**: Share maps with specific users or via public links.
- **Technical Implementation**: ACL (Access Control List) table linking users/roles to map resources with specific rights (view, edit, approve).
- **Government Benefit**: Secure inter-departmental collaboration.
- **User Benefit**: Controlled dissemination of sensitive survey data.
- **API Endpoints**: `POST /api/v1/maps/{id}/share`

#### Thumbnail Auto-generation
- **Description**: Generates preview images for maps.
- **Technical Implementation**: Background queue (BullMQ/Redis) triggers Mapnik or headless browser to render and save a PNG.
- **Government Benefit**: Visually appealing and quick-to-scan administrative dashboards.
- **User Benefit**: Quick identification of maps in galleries.
- **API Endpoints**: N/A (Internal Background Task)

#### Geospatial Tools
- **Description**: Buffer, intersection, coordinate transform in browser.
- **Technical Implementation**: Turf.js for client-side spatial operations to reduce server load.
- **Government Benefit**: Rapid preliminary analysis (e.g., finding parcels within 100m of a new highway).
- **User Benefit**: Powerful analysis tools available without specialized software.
- **API Endpoints**: `POST /api/v1/spatial/buffer`, `POST /api/v1/spatial/intersect`

---

### 1.3 Approval Workflow

#### Configurable Multi-stage Approval Pipeline
- **Description**: Define custom routing for approvals.
- **Technical Implementation**: JSON-based workflow definitions evaluated by a workflow engine.
- **Government Benefit**: Adapts to varying state-specific bureaucratic processes.
- **User Benefit**: Transparent process where applicants see exactly where their application is.
- **API Endpoints**: `GET /api/v1/workflows`, `POST /api/v1/workflows`

#### State-machine based Status Management
- **Description**: Strict transitions (e.g., Draft -> Submitted -> Under Review -> Approved).
- **Technical Implementation**: XState on client, explicit transition logic in Express controllers.
- **Government Benefit**: Prevents skipping required verification steps.
- **User Benefit**: Clear, unambiguous application status.
- **API Endpoints**: `POST /api/v1/approvals/{id}/transition`

#### Auto-assignment to Reviewers
- **Description**: Intelligent routing based on jurisdiction and workload.
- **Technical Implementation**: Spatial query to determine district/tehsil, followed by round-robin or load-balanced assignment to available officers.
- **Government Benefit**: Prevents bottlenecks and ensures fair distribution of work.
- **User Benefit**: Faster processing times.
- **API Endpoints**: N/A (Triggered automatically)

#### Priority Levels
- **Description**: Low, medium, high, urgent tagging.
- **Technical Implementation**: Enum field, powers sorting algorithms in the reviewer dashboard.
- **Government Benefit**: Enables expediting critical infrastructure projects.
- **User Benefit**: Mechanism to flag urgent requests (e.g., dispute resolution).
- **API Endpoints**: `PATCH /api/v1/approvals/{id}/priority`

#### SLA Tracking with Deadlines
- **Description**: Monitors time taken at each step.
- **Technical Implementation**: Scheduled cron jobs check for overdue tasks and trigger escalations.
- **Government Benefit**: Ensures accountability and adherence to Right to Service acts.
- **User Benefit**: Guaranteed response times.
- **API Endpoints**: `GET /api/v1/approvals/slas`

#### Comments and Discussion Threads
- **Description**: Contextual messaging on applications.
- **Technical Implementation**: Nested comments stored in MongoDB/PostgreSQL, real-time updates via Socket.io.
- **Government Benefit**: Keeps all communication regarding a file centralized.
- **User Benefit**: Direct line to reviewers to clarify doubts quickly.
- **API Endpoints**: `POST /api/v1/approvals/{id}/comments`

#### Document Attachment Requirements
- **Description**: Mandatory supporting files (NOCs, identity proofs).
- **Technical Implementation**: Validation layer checking against required document types defined in the workflow before allowing transition.
- **Government Benefit**: Complete digital files prevent physical paper trails.
- **User Benefit**: Clear checklist prevents multiple trips to government offices.
- **API Endpoints**: `POST /api/v1/approvals/{id}/documents`

#### Escalation Mechanism
- **Description**: Auto-forwarding of delayed applications to higher authorities.
- **Technical Implementation**: RabbitMQ delayed queues or Redis time-series to trigger events when SLA expires.
- **Government Benefit**: Systemic unblocking of stalled administrative processes.
- **User Benefit**: Automatic resolution of deliberate or accidental delays.
- **API Endpoints**: N/A (Internal automated)

#### Complete Audit Trail
- **Description**: Immutable log of every action.
- **Technical Implementation**: Event sourcing pattern or triggers in PostgreSQL capturing user, action, timestamp, and changes.
- **Government Benefit**: Crucial for anti-corruption and legal proceedings.
- **User Benefit**: Proof of submission and transparency.
- **API Endpoints**: `GET /api/v1/approvals/{id}/audit`

#### Timeline Visualization
- **Description**: Visual progress tracker.
- **Technical Implementation**: Frontend component rendering audit events as a Stepper or vertical timeline.
- **Government Benefit**: Quick overview of a file's history for senior officials.
- **User Benefit**: Easy-to-understand progress updates.
- **API Endpoints**: Derived from audit endpoint.

---

### 1.4 Land Records

#### ULPIN (Unique Land Parcel Identification Number) System
- **Description**: 14-digit alphanumeric Aadhaar-like ID for land.
- **Technical Implementation**: Generation algorithm based on geographic coordinates (longitude/latitude of vertices).
- **Government Benefit**: Standardized identification across departments and states.
- **User Benefit**: Universal reference number for all land-related transactions.
- **API Endpoints**: `POST /api/v1/land/ulpin/generate`

#### GeoJSON Boundary Storage
- **Description**: Precise spatial representation of parcels.
- **Technical Implementation**: Stored in PostGIS `geometry` column with spatial indexing (GIST).
- **Government Benefit**: Allows advanced spatial queries and analytics.
- **User Benefit**: Exact visual representation of property boundaries.
- **API Endpoints**: `GET /api/v1/land/{id}/boundary`

#### Ownership Tracking with Shares
- **Description**: Joint ownership and fractional shares.
- **Technical Implementation**: Relational mapping between Parcels and Citizens with a 'share_percentage' field.
- **Government Benefit**: Accurate reflection of complex Indian inheritance and ownership models.
- **User Benefit**: Clear legal standing of fractional ownership.
- **API Endpoints**: `GET /api/v1/land/{id}/owners`

#### Mutation History
- **Description**: Track changes in ownership over time.
- **Technical Implementation**: Historical tables tracking transfer deeds, dates, and previous owners.
- **Government Benefit**: Preserves the chain of title natively.
- **User Benefit**: Provides clear title history for buyers and banks.
- **API Endpoints**: `GET /api/v1/land/{id}/mutations`

#### Encumbrance Tracking
- **Description**: Mortgages, liens, and legal disputes on a parcel.
- **Technical Implementation**: Association of legal document references and flags to specific ULPINs.
- **Government Benefit**: Prevents fraudulent registration of disputed land.
- **User Benefit**: Protects buyers from purchasing encumbered property.
- **API Endpoints**: `GET /api/v1/land/{id}/encumbrances`

#### Land Transfer Workflow
- **Description**: Digital process for buying/selling land.
- **Technical Implementation**: Integration with the Approval Workflow engine, requiring digital signatures (e-Sign).
- **Government Benefit**: Eliminates intermediary corruption and speeds up registrations.
- **User Benefit**: Seamless, transparent property transactions.
- **API Endpoints**: `POST /api/v1/land/transfer`

#### Market Value Tracking
- **Description**: Government guidance value (circle rate) mapping.
- **Technical Implementation**: Spatial joins linking parcels to valuation zones.
- **Government Benefit**: Automated stamp duty calculation and revenue forecasting.
- **User Benefit**: Transparent property valuation for taxation.
- **API Endpoints**: `GET /api/v1/land/{id}/value`

#### Tax Details Management
- **Description**: Property tax assessment and payment history.
- **Technical Implementation**: Integration with municipal tax systems via APIs.
- **Government Benefit**: Improves tax collection efficiency.
- **User Benefit**: Single portal to view and pay property taxes.
- **API Endpoints**: `GET /api/v1/land/{id}/taxes`

#### Verification Workflow
- **Description**: Ground-truthing of digital records.
- **Technical Implementation**: Surveyor task generation triggered when records have low confidence scores.
- **Government Benefit**: Continuous improvement of land record accuracy.
- **User Benefit**: Rectification of historical recording errors.
- **API Endpoints**: `POST /api/v1/land/{id}/verify`

#### Search by Multiple Criteria
- **Description**: Find land by ULPIN, owner name, village, or map click.
- **Technical Implementation**: Full-text search (Elasticsearch/PostgreSQL TSVECTOR) combined with spatial queries.
- **Government Benefit**: Rapid information retrieval for administrative tasks.
- **User Benefit**: Easy access to public land records.
- **API Endpoints**: `GET /api/v1/land/search`

---

### 1.5 Analytics & Reporting

#### Real-time Dashboard with KPIs
- **Description**: Live metrics on platform usage and performance.
- **Technical Implementation**: Redis caching for fast aggregation, WebSockets for live updates.
- **Government Benefit**: Immediate situational awareness for decision-makers.
- **User Benefit**: Transparency on overall system performance.
- **API Endpoints**: `GET /api/v1/analytics/dashboard`

#### Map Statistics
- **Description**: Data on map submissions, formats, and sizes.
- **Technical Implementation**: Aggregation queries on the maps table.
- **Government Benefit**: Helps in capacity planning for storage and compute.
- **User Benefit**: N/A
- **API Endpoints**: `GET /api/v1/analytics/maps`

#### Approval Pipeline Analytics
- **Description**: Bottleneck identification and throughput tracking.
- **Technical Implementation**: Statistical analysis of workflow transition timestamps.
- **Government Benefit**: Identifies underperforming districts or departments.
- **User Benefit**: Indirect benefit through process optimization.
- **API Endpoints**: `GET /api/v1/analytics/pipeline`

#### Land Record Statistics
- **Description**: Area summaries, ownership demographics.
- **Technical Implementation**: PostGIS spatial aggregations (e.g., `ST_Area`).
- **Government Benefit**: Macro-level insights for urban planning and policy making.
- **User Benefit**: Public data access for research.
- **API Endpoints**: `GET /api/v1/analytics/land`

#### Trend Analysis
- **Description**: Historical comparisons and forecasting.
- **Technical Implementation**: Time-series databases or materialized views storing daily snapshots.
- **Government Benefit**: Proactive rather than reactive governance.
- **User Benefit**: N/A
- **API Endpoints**: `GET /api/v1/analytics/trends`

#### Custom Report Generation
- **Description**: Drag-and-drop report builder.
- **Technical Implementation**: Dynamic SQL generation based on user-selected dimensions and metrics.
- **Government Benefit**: Reduces dependency on IT for ad-hoc data requests.
- **User Benefit**: N/A
- **API Endpoints**: `POST /api/v1/reports/custom`

#### Report Download (PDF, CSV)
- **Description**: Exporting analytics.
- **Technical Implementation**: Fast-csv for tabular data, Puppeteer for PDF reports.
- **Government Benefit**: Easy sharing of statistics in physical meetings or emails.
- **User Benefit**: Data available for offline analysis.
- **API Endpoints**: `GET /api/v1/reports/download`

#### Government-level Aggregate Views
- **Description**: Roll-ups from Village -> Tehsil -> District -> State -> National.
- **Technical Implementation**: Hierarchical data modeling with pre-computed materialized views for higher levels.
- **Government Benefit**: Scalable reporting structure matching administrative divisions.
- **User Benefit**: N/A
- **API Endpoints**: `GET /api/v1/analytics/aggregate`

---

### 1.6 Notifications

#### In-app Notifications
- **Description**: Bell icon alerts within the portal.
- **Technical Implementation**: Socket.io for real-time delivery, PostgreSQL for persistence.
- **Government Benefit**: Immediate attention to critical tasks while users are logged in.
- **User Benefit**: Real-time updates on application status.
- **API Endpoints**: `GET /api/v1/notifications`, `PATCH /api/v1/notifications/read`

#### Email Notifications
- **Description**: Transactional emails.
- **Technical Implementation**: Integration with SMTP/AWS SES or government email gateways.
- **Government Benefit**: Formal, legally recognized communication channel.
- **User Benefit**: Persistent record of updates and receipts.
- **API Endpoints**: N/A (Triggered internally)

#### SMS Notifications
- **Description**: Alerts via text message.
- **Technical Implementation**: Integration with NIC SMS Gateway or external providers (Twilio).
- **Government Benefit**: Reaches citizens without internet access or smartphones.
- **User Benefit**: High-visibility alerts for OTPs and critical status changes.
- **API Endpoints**: N/A (Triggered internally)

#### Push Notifications
- **Description**: Alerts on mobile devices.
- **Technical Implementation**: Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs).
- **Government Benefit**: High engagement rate for surveyors in the field.
- **User Benefit**: Immediate updates directly on the lock screen.
- **API Endpoints**: `POST /api/v1/notifications/device-token`

#### Priority-based Delivery
- **Description**: Routing based on urgency.
- **Technical Implementation**: Queueing system (BullMQ) prioritizing high-urgency alerts (e.g., OTP > Daily Summary).
- **Government Benefit**: Ensures critical messages aren't delayed by bulk broadcasts.
- **User Benefit**: Timely receipt of sensitive information.
- **API Endpoints**: N/A

#### Preference Management
- **Description**: User control over notification channels.
- **Technical Implementation**: Bitmask or boolean flags in user profile.
- **Government Benefit**: Reduces SMS/Email cost by allowing users to opt-out of non-essentials.
- **User Benefit**: Prevents alert fatigue.
- **API Endpoints**: `PATCH /api/v1/users/me/preferences`

#### Bulk Notifications
- **Description**: Broadcasting messages to groups.
- **Technical Implementation**: Batch processing workers fetching target user segments and fanning out messages.
- **Government Benefit**: Efficient communication of policy changes or system downtimes.
- **User Benefit**: Kept informed of platform-wide events.
- **API Endpoints**: `POST /api/v1/notifications/broadcast` (Admin only)

---

### 1.7 GeoSpatial Services

#### Forward Geocoding
- **Description**: Address to Coordinates.
- **Technical Implementation**: Custom geocoder built on OSM/government data or integration with MapmyIndia API.
- **Government Benefit**: Standardizes location data entry.
- **User Benefit**: Easy pin-pointing of locations by typing an address.
- **API Endpoints**: `GET /api/v1/geo/geocode`

#### Reverse Geocoding
- **Description**: Coordinates to Address/Administrative units.
- **Technical Implementation**: PostGIS spatial joins (e.g., `ST_Contains`) finding the polygon containing the point.
- **Government Benefit**: Automatically determines jurisdiction from a map click.
- **User Benefit**: Discovers details about a specific location on the map.
- **API Endpoints**: `GET /api/v1/geo/reverse-geocode`

#### Administrative Boundary Queries
- **Description**: Fetching state, district, tehsil, village polygons.
- **Technical Implementation**: GeoJSON API serving simplified geometries from PostGIS.
- **Government Benefit**: Base layers for all thematic mapping.
- **User Benefit**: Contextualizes land parcels within official boundaries.
- **API Endpoints**: `GET /api/v1/geo/boundaries`

#### Spatial Queries (within, intersects, near)
- **Description**: Complex geographic searches.
- **Technical Implementation**: PostGIS functions (`ST_DWithin`, `ST_Intersects`).
- **Government Benefit**: Enables advanced use cases like "find all government land within 500m of the river".
- **User Benefit**: Powerful search capabilities.
- **API Endpoints**: `POST /api/v1/geo/query`

#### Tile Serving (z/x/y)
- **Description**: Serving map data as image or vector tiles.
- **Technical Implementation**: Martin (Rust) or PostServe for dynamic vector tiles (MVT) directly from PostGIS.
- **Government Benefit**: Highly scalable map rendering handling millions of parcels.
- **User Benefit**: Fast map loading regardless of dataset size.
- **API Endpoints**: `GET /api/v1/tiles/{layer}/{z}/{x}/{y}.pbf`

#### Buffer Analysis
- **Description**: Creating zones around features.
- **Technical Implementation**: `ST_Buffer` on the backend or Turf.js on the frontend.
- **Government Benefit**: Environmental impact assessments and clearance zones.
- **User Benefit**: Visualizing impact areas.
- **API Endpoints**: `POST /api/v1/geo/buffer`

#### Intersection Analysis
- **Description**: Finding overlapping areas.
- **Technical Implementation**: `ST_Intersection`.
- **Government Benefit**: Identifying encroachments on public land.
- **User Benefit**: Dispute resolution.
- **API Endpoints**: `POST /api/v1/geo/intersect`

#### Coordinate System Transformation
- **Description**: Converting between spatial reference systems (e.g., WGS84 to local projected).
- **Technical Implementation**: Proj4js on frontend or `ST_Transform` in PostGIS.
- **Government Benefit**: Harmonizes legacy local coordinate data with modern global standards.
- **User Benefit**: seamless upload of data regardless of coordinate system.
- **API Endpoints**: `POST /api/v1/geo/transform`

---

### 1.8 Internationalization

#### 22 Indian Language Support
- **Description**: Pan-India localization.
- **Technical Implementation**: `i18next` framework with JSON dictionary files for Hindi, Bengali, Telugu, Marathi, Tamil, etc.
- **Government Benefit**: True digital inclusion for all citizens.
- **User Benefit**: Access to complex land concepts in native languages.

#### RTL Support for Urdu
- **Description**: Right-to-left layout rendering.
- **Technical Implementation**: CSS logical properties and HTML `dir="rtl"` attribute toggling.
- **Government Benefit**: Serves significant demographics in specific regions.
- **User Benefit**: Native reading experience.

#### Dynamic Language Switching
- **Description**: Instant UI translation without page reload.
- **Technical Implementation**: React context triggering re-renders with new localization keys.

#### Localized Content
- **Description**: Translating dynamic database content (e.g., status names, error messages).
- **Technical Implementation**: Backend returns localized strings based on `Accept-Language` header.

---

### 1.9 Accessibility

#### WCAG 2.1 AA Compliance
- **Description**: Web Content Accessibility Guidelines adherence.
- **Technical Implementation**: Semantic HTML, ARIA labels, contrast checks during CI/CD.
- **Government Benefit**: Meets legal mandates for accessible government websites.
- **User Benefit**: Usable by citizens with disabilities.

#### Screen Reader Support
- **Description**: Compatibility with NVDA, JAWS, VoiceOver.
- **Technical Implementation**: Proper `aria-live` regions for map updates and form errors.

#### Keyboard Navigation
- **Description**: Full functionality without a mouse.
- **Technical Implementation**: Careful management of `tabindex` and focus states, especially on map interfaces.

#### High Contrast Mode
- **Description**: UI theme for low vision users.
- **Technical Implementation**: CSS variables toggling to high-contrast color palettes.

#### Text Scaling
- **Description**: Support for browser-based text enlargement.
- **Technical Implementation**: Use of `rem` units instead of fixed `px` for typography.

---

## 2. MOBILE APP FEATURES

#### Cross-platform (iOS/Android) via React Native + Expo
- **Description**: Single codebase for both mobile platforms.
- **Technical Implementation**: Expo managed workflow for rapid development and OTA updates.
- **Benefit**: Reduces development and maintenance costs significantly while reaching maximum users.

#### Offline-first Architecture with Sync Queue
- **Description**: App functions without internet.
- **Technical Implementation**: WatermelonDB or SQLite for local storage, Redux Offline for queuing actions to sync when online.
- **Benefit**: Crucial for surveyors working in remote rural areas with poor connectivity.

#### GPS-based Location Services
- **Description**: Capturing accurate field coordinates.
- **Technical Implementation**: Expo Location API with high accuracy configuration.
- **Benefit**: Enables precise geo-tagging of surveys and dispute sites.

#### Camera Integration for Document/Map Capture
- **Description**: Scanning physical documents in the field.
- **Technical Implementation**: Expo Camera, integrated with edge-detection and perspective correction libraries.
- **Benefit**: Digitizes legacy paper maps and captures field evidence instantly.

#### Biometric Authentication
- **Description**: Fingerprint/FaceID login.
- **Technical Implementation**: Expo Local Authentication.
- **Benefit**: Secure, fast access for field officers without typing passwords on mobile devices.

#### Offline Map Caching
- **Description**: Pre-downloading map tiles for specific areas.
- **Technical Implementation**: Storing mapbox/leaflet tiles locally in the device file system.
- **Benefit**: Surveyors can view reference maps even without internet.

#### Field Survey Tools
- **Description**: Drawing polygons by walking perimeters.
- **Technical Implementation**: Background location tracking recording points at intervals to generate GeoJSON.
- **Benefit**: Democratizes surveying, reducing reliance on expensive specialized equipment.

#### Barcode/QR Scanning
- **Description**: Scanning physical document IDs.
- **Technical Implementation**: Expo Barcode Scanner.
- **Benefit**: Quick retrieval of digital records from physical receipts or notices.

#### Secure Token Storage
- **Description**: Encrypted storage for JWTs.
- **Technical Implementation**: Expo SecureStore (Keychain on iOS, Keystore on Android).
- **Benefit**: Prevents session hijacking if the device is lost or compromised.

---

## 3. PLATFORM CAPABILITIES

#### Microservices Architecture
- **Description**: Decoupled backend services (Auth, Maps, Land, Workflow).
- **Technical Implementation**: Dockerized Node.js/Python services communicating via gRPC or message queues.
- **Benefit**: Independent scaling of map processing (heavy compute) vs auth (high IO).

#### Kong API Gateway
- **Description**: Single entry point for all API requests.
- **Technical Implementation**: Kong handles routing, SSL termination, and global plugins.
- **Benefit**: Centralized traffic management and security policies.

#### Rate Limiting (Tiered by Role)
- **Description**: Preventing API abuse.
- **Technical Implementation**: Redis-based sliding window algorithm configured at the Gateway level.
- **Benefit**: Protects infrastructure. Developers get higher limits, public IPs get strict limits.

#### Webhook System for Integrations
- **Description**: Outbound HTTP callbacks.
- **Technical Implementation**: Delivery system that retries failed pushes to registered endpoints.
- **Benefit**: Allows external state departments to react to MapanSetu events (e.g., land transfer approved).

#### SDK Support (JavaScript, Python, Java)
- **Description**: Client libraries for external integrators.
- **Technical Implementation**: Auto-generated from OpenAPI specifications using Swagger Codegen.
- **Benefit**: Accelerates integration by third-party government agencies.

#### RESTful API Design
- **Description**: Standardized, predictable HTTP interfaces.
- **Technical Implementation**: Resource-oriented URLs, standard HTTP verbs, and consistent JSON responses.
- **Benefit**: Easy learning curve for developers.

#### Real-time Updates
- **Description**: Server-sent events or WebSockets.
- **Technical Implementation**: Socket.io cluster with Redis adapter for horizontal scaling.
- **Benefit**: Live dashboard updates without polling.

#### File Processing Pipeline
- **Description**: Asynchronous handling of large map files.
- **Technical Implementation**: AWS S3 trigger -> SQS -> Worker Node -> DB update.
- **Benefit**: Main API remains responsive while heavy GIS processing happens in the background.

---

## 4. ADMIN FEATURES

#### User Management
- **Description**: CRUD for users and roles.
- **Benefit**: Centralized control over who has access to the platform.

#### System Health Monitoring
- **Description**: CPU, memory, database connection tracking.
- **Benefit**: Proactive identification of infrastructure issues before downtime occurs.

#### Audit Log Viewer
- **Description**: Searchable interface for system events.
- **Benefit**: Enables security officers to investigate incidents.

#### Configuration Management
- **Description**: UI for changing system parameters (e.g., SLA days, file size limits).
- **Benefit**: No code deployments needed for policy changes.

#### Role and Permission Management
- **Description**: Granular feature toggling for roles.
- **Benefit**: Adaptable security model.

#### Bulk Operations
- **Description**: Mass import/export of users or base data.
- **Benefit**: Saves administrative time during initial setup or restructuring.

#### Inter-department Collaboration Tools
- **Description**: Secure sharing of internal notes and files.
- **Benefit**: Breaks down government silos.

---

## 5. INTEGRATION CAPABILITIES

#### Aadhaar Authentication
- **Description**: e-KYC and digital signing.
- **Benefit**: Establishes undeniable identity for land owners.

#### DigiLocker Integration
- **Description**: Fetching and storing official documents.
- **Benefit**: Citizens don't need to manually upload proofs of identity or address.

#### State GIS System Adapters
- **Description**: Custom connectors for legacy state systems.
- **Benefit**: Ensures MapanSetu acts as a unifier, not a disruptor, of existing functional state nodes.

#### Payment Gateway
- **Description**: Processing stamp duties and processing fees (e.g., Razorpay / CCAvenue / BillDesk).
- **Benefit**: End-to-end digital transaction without physical challans.

#### SMS/Email Services
- **Description**: Integration with NIC infrastructure.
- **Benefit**: Utilizes secure, government-approved communication channels.

#### NSDI (National Spatial Data Infrastructure)
- **Description**: Two-way sync with India's central spatial repository.
- **Benefit**: Ensures MapanSetu data contributes to the national map master database.
