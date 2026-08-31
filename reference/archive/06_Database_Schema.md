# Database Schema (PostgreSQL)

```sql
-- Users (Admin, LMO, Business Owners)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL, -- 'ADMIN', 'LMO', 'BUSINESS'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Businesses (Linked to User)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    gstin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instruments (The Weighing Machines)
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., WM-UP-GKP-00123
    business_id UUID REFERENCES businesses(id),
    category VARCHAR(100), -- 'Electronic Weighing Scale'
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_no VARCHAR(100),
    capacity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'VERIFIED', 'EXPIRED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications for Verification
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_no VARCHAR(50) UNIQUE NOT NULL,
    instrument_id UUID REFERENCES instruments(id),
    business_id UUID REFERENCES businesses(id),
    assigned_lmo_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ASSIGNED', 'INSPECTED', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections (Field Data)
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    lmo_id UUID REFERENCES users(id),
    inspection_date TIMESTAMP NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    readings JSONB, -- Store matrix of test weights vs observed weights
    evidence_url VARCHAR(255), -- S3 link to photo
    result VARCHAR(20), -- 'PASS', 'FAIL'
    remarks TEXT
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_no VARCHAR(50) UNIQUE NOT NULL,
    instrument_id UUID REFERENCES instruments(id),
    inspection_id UUID REFERENCES inspections(id),
    issue_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    qr_payload TEXT,
    digital_signature TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' -- 'ACTIVE', 'REVOKED', 'EXPIRED'
);

-- Digital Instrument Passport (Audit Hash Chain)
CREATE TABLE passport_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID REFERENCES instruments(id),
    action_type VARCHAR(100), -- 'REGISTERED', 'VERIFIED', 'RENEWED'
    action_data JSONB,
    previous_hash VARCHAR(255),
    current_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
