# MapanSetu — Complete Backend Execution Plan
> **Owner:** Backend Developer (You)
> **Stack:** Node.js + TypeScript + Express + Prisma + PostgreSQL + MinIO
> **Estimated Time:** 3–4 days if followed exactly
> **Read this fully before writing a single line of code.**

---

## ⚠️ Rules Before You Start
1. **Follow every step in order.** Do not skip to "fun" modules before foundations are ready.
2. **Test every step** with the provided `curl` commands before moving to the next.
3. **Never commit broken code** to `main`. Work in your branch.
4. **Use the exact folder structure** defined here — the AI agents and other team members depend on it.
5. If something fails, **read the error message fully** before asking for help.

---

## PHASE 0 — Prerequisites Checklist

Before writing any code, verify all tools are installed.

```powershell
# Run each line, confirm output
node --version        # Must be >= 18.0.0
npm --version         # Must be >= 9.0.0
npx --version         # Should match npm
```

**Install PostgreSQL** if not installed:
- Download: https://www.postgresql.org/download/windows/
- Default port: 5432, default user: `postgres`
- Create a database called `mapansetu_db`:
```sql
-- Open pgAdmin or psql and run:
CREATE DATABASE mapansetu_db;
```

**Install MinIO** (local S3 for photo storage):
```powershell
# Download MinIO binary for Windows from https://min.io/download
# Run it locally:
.\minio.exe server C:\minio-data --console-address ":9001"
# MinIO API will be at http://localhost:9000
# MinIO Console (UI) at http://localhost:9001
# Default credentials: minioadmin / minioadmin
```

---

## PHASE 1 — Project Scaffolding

### Step 1.1 — Create the API package.json

Navigate to the API folder and initialize:
```powershell
cd d:\Projects\Mapansetu\services\api
npm init -y
```

### Step 1.2 — Install ALL dependencies at once

```powershell
# Production dependencies
npm install express cors dotenv helmet morgan express-rate-limit
npm install jsonwebtoken bcryptjs
npm install @prisma/client
npm install minio
npm install qrcode
npm install multer
npm install zod
npm install uuid
npm install node-cron

# Dev dependencies
npm install -D typescript tsx ts-node
npm install -D @types/node @types/express @types/cors @types/morgan
npm install -D @types/jsonwebtoken @types/bcryptjs @types/multer
npm install -D @types/uuid @types/qrcode
npm install -D prisma
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

> ⚠️ Wait for full install. If you see peer dependency warnings, ignore them. If you see `ERR_`, fix it before proceeding.

### Step 1.3 — Create tsconfig.json

Create `d:\Projects\Mapansetu\services\api\tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 1.4 — Update package.json scripts

Open `services/api/package.json` and replace the `"scripts"` section:
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:seed": "tsx src/lib/seed.ts",
  "test": "jest --runInBand"
}
```

### Step 1.5 — Create the folder structure

Run these commands in PowerShell:
```powershell
cd d:\Projects\Mapansetu\services\api

# Create all directories
New-Item -ItemType Directory -Force -Path src\modules\auth
New-Item -ItemType Directory -Force -Path src\modules\user
New-Item -ItemType Directory -Force -Path src\modules\business
New-Item -ItemType Directory -Force -Path src\modules\instrument
New-Item -ItemType Directory -Force -Path src\modules\application
New-Item -ItemType Directory -Force -Path src\modules\inspection
New-Item -ItemType Directory -Force -Path src\modules\certificate
New-Item -ItemType Directory -Force -Path src\modules\notification
New-Item -ItemType Directory -Force -Path src\modules\dashboard
New-Item -ItemType Directory -Force -Path src\middleware
New-Item -ItemType Directory -Force -Path src\lib
New-Item -ItemType Directory -Force -Path src\config
New-Item -ItemType Directory -Force -Path keys
```

### Step 1.6 — Create the .env file

Copy `.env.example` to `.env` and fill in values:
```powershell
Copy-Item .env.example .env
```

Open `.env` and set:
```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mapansetu_db"

JWT_SECRET=mapansetu_jwt_super_secret_key_minimum_32_chars_long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=mapansetu_refresh_secret_key_minimum_32_chars
JWT_REFRESH_EXPIRES_IN=7d

CERT_PRIVATE_KEY_PATH=./keys/private.pem
CERT_PUBLIC_KEY_PATH=./keys/public.pem

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=mapansetu-evidence

CORS_ORIGIN=http://localhost:5173,http://localhost:5174
CERT_VERIFY_BASE_URL=http://localhost:5173/verify
CERT_VALIDITY_YEARS=1
```

---

## PHASE 2 — Database Setup

### Step 2.1 — Initialize Prisma

```powershell
cd d:\Projects\Mapansetu\services\api
npx prisma init
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

### Step 2.2 — Verify the schema

The schema file at `services/api/prisma/schema.prisma` is already written. Open it and confirm it has all these models:
- `User`, `Business`, `Instrument`, `Application`, `Inspection`, `Certificate`, `PassportLog`, `AuditLog`, `Notification`

If it only has a stub, replace it entirely with the contents from `services/api/prisma/schema.prisma` (already created).

### Step 2.3 — Run the migration

```powershell
npx prisma migrate dev --name init
```

**Expected output:**
```
Applying migration `20260828_init`...
Database changes applied.
✔ Generated Prisma Client
```

If you see an error like `Can't reach database server`, your `DATABASE_URL` is wrong. Fix the password/host in `.env`.

### Step 2.4 — Generate Prisma Client

```powershell
npx prisma generate
```

### Step 2.5 — Verify in Prisma Studio

```powershell
npx prisma studio
```

Opens browser at `http://localhost:5555`. You should see all 9 tables listed. Confirm they are empty. Close Studio when done.

---

## PHASE 3 — Generate RSA Keys for Certificate Signing

Run this ONE TIME. Store the keys securely. Never commit `private.pem` to Git.

```powershell
cd d:\Projects\Mapansetu\services\api

# Run this Node.js script to generate the key pair
node -e "
const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
});

fs.mkdirSync('./keys', { recursive: true });
fs.writeFileSync('./keys/private.pem', privateKey);
fs.writeFileSync('./keys/public.pem', publicKey);
console.log('RSA keys generated successfully in ./keys/');
"
```

**Add to .gitignore:**
```
keys/private.pem
.env
node_modules/
dist/
```

---

## PHASE 4 — Core Library Files

These are shared utilities used by all modules. Create them FIRST.

### Step 4.1 — Prisma Client Singleton

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Step 4.2 — Environment Config (with validation)

Create `src/config/env.ts`:
```typescript
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CERT_PRIVATE_KEY_PATH: z.string().default('./keys/private.pem'),
  CERT_PUBLIC_KEY_PATH: z.string().default('./keys/public.pem'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().default('9000'),
  MINIO_USE_SSL: z.string().default('false'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_NAME: z.string().default('mapansetu-evidence'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CERT_VERIFY_BASE_URL: z.string().default('http://localhost:5173/verify'),
  CERT_VALIDITY_YEARS: z.string().default('1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

### Step 4.3 — Crypto Library

Create `src/lib/crypto.ts`:
```typescript
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

// Load keys once at startup
const privateKey = fs.readFileSync(path.resolve(env.CERT_PRIVATE_KEY_PATH), 'utf-8');
const publicKey = fs.readFileSync(path.resolve(env.CERT_PUBLIC_KEY_PATH), 'utf-8');

/**
 * SHA-256 hash of a string
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Sign a certificate payload with the private RSA key.
 * Returns base64-encoded signature.
 */
export function signCertificatePayload(payloadJson: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(payloadJson);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

/**
 * Verify a certificate signature with the public RSA key.
 */
export function verifyCertificateSignature(
  payloadJson: string,
  signature: string
): boolean {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(payloadJson);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}

/**
 * Compute hash chain entry for a passport log.
 * hash = SHA256(previousHash + JSON.stringify(actionData) + timestamp)
 */
export function computePassportHash(
  previousHash: string | null,
  actionData: object,
  timestamp: string
): string {
  const input = `${previousHash ?? 'GENESIS'}${JSON.stringify(actionData)}${timestamp}`;
  return sha256(input);
}

/**
 * Get the public key as a string (for exposing via API for client-side verification)
 */
export function getPublicKey(): string {
  return publicKey;
}
```

### Step 4.4 — MinIO Client

Create `src/lib/minio.ts`:
```typescript
import * as Minio from 'minio';
import { env } from '../config/env';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

const BUCKET = env.MINIO_BUCKET_NAME;

/**
 * Ensure the MinIO bucket exists. Call this on app startup.
 */
export async function ensureBucketExists(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
    console.log(`✅ MinIO bucket '${BUCKET}' created`);
  }
}

/**
 * Upload a Buffer to MinIO and return the public URL.
 * @param objectName - e.g., 'inspections/uuid/timestamp_serial.jpg'
 * @param buffer - The file buffer
 * @param contentType - e.g., 'image/jpeg'
 */
export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await minioClient.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
  });
  // Return a pre-signed URL valid for 7 days, or a permanent URL if public
  return `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${BUCKET}/${objectName}`;
}

/**
 * Upload a base64-encoded image (used in offline sync).
 */
export async function uploadBase64Image(
  objectName: string,
  base64Data: string
): Promise<string> {
  // Strip data URI prefix if present: "data:image/jpeg;base64,..."
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  return uploadFile(objectName, buffer, 'image/jpeg');
}
```

### Step 4.5 — Standard API Response Helper

Create `src/lib/response.ts`:
```typescript
import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void {
  res.status(statusCode).json({
    success: true,
    message: message ?? 'OK',
    data,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
```

### Step 4.6 — Code Generation Utilities

Create `src/lib/codegen.ts`:
```typescript
import { prisma } from './prisma';

/**
 * Generate a unique instrument code: WM-UP-GKP-XXXXX
 * Format: {category_code}-{state_code}-{city_code}-{sequence}
 */
export async function generateInstrumentCode(
  category: string,
  city: string = 'GKP'
): Promise<string> {
  const categoryCode = getCategoryCode(category);
  const stateCode = 'UP';
  const cityCode = city.substring(0, 3).toUpperCase();

  // Count existing instruments to generate sequence
  const count = await prisma.instrument.count();
  const sequence = String(count + 1).padStart(5, '0');

  return `${categoryCode}-${stateCode}-${cityCode}-${sequence}`;
}

function getCategoryCode(category: string): string {
  const map: Record<string, string> = {
    'Electronic Weighing Scale': 'WM',
    'Platform Weighing Scale': 'PW',
    'Petrol Pump': 'PP',
    'Milk Meter': 'MM',
    'Taxi Meter': 'TM',
  };
  return map[category] ?? 'IN';
}

/**
 * Generate application number: APP-2026-XXXXX
 */
export async function generateApplicationNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.application.count();
  const sequence = String(count + 1).padStart(5, '0');
  return `APP-${year}-${sequence}`;
}

/**
 * Generate certificate number: LM-UP-2026-XXXXX
 */
export async function generateCertificateNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.certificate.count();
  const sequence = String(count + 1).padStart(5, '0');
  return `LM-UP-${year}-${sequence}`;
}
```

---

## PHASE 5 — Middleware

### Step 5.1 — Auth Guard (JWT Verification)

Create `src/middleware/auth.guard.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../lib/response';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
    businessId?: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'No token provided');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      role: UserRole;
      email: string;
      businessId?: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    sendError(res, 401, 'INVALID_TOKEN', 'Token is invalid or expired');
  }
}

/**
 * Role-based access control middleware.
 * Usage: authorize('ADMIN', 'LMO')
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action');
      return;
    }
    next();
  };
}
```

### Step 5.2 — Global Error Handler

Create `src/middleware/error-handler.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unhandled error:', err);

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_ENTRY', message: 'A record with this value already exists' },
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
      return;
    }
  }

  // Zod validation errors
  if (err.constructor.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
```

### Step 5.3 — Async Handler Wrapper

Create `src/lib/async-handler.ts`:
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to automatically catch errors
 * and pass them to the global error handler.
 * ALWAYS wrap your controllers with this!
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

## PHASE 6 — Main App Entry Point

Create `src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { ensureBucketExists } from './lib/minio';
import { globalErrorHandler } from './middleware/error-handler';

// Route imports (add as you build each module)
import { authRouter } from './modules/auth/auth.routes';
import { instrumentRouter } from './modules/instrument/instrument.routes';
import { applicationRouter } from './modules/application/application.routes';
import { inspectionRouter } from './modules/inspection/inspection.routes';
import { certificateRouter } from './modules/certificate/certificate.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { notificationRouter } from './modules/notification/notification.routes';

const app = express();

// ── Security Middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api/', limiter);

// Auth endpoint stricter limit (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});
app.use('/api/v1/auth/login', authLimiter);

// ── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // Allow larger bodies for base64 photos
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ──────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', environment: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Public key endpoint (for client-side cert verification)
app.get('/api/v1/public-key', (req, res) => {
  const { getPublicKey } = require('./lib/crypto');
  res.json({ success: true, data: { publicKey: getPublicKey() } });
});

// ── Routes ───────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/instruments', instrumentRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/inspections', inspectionRouter);
app.use('/api/v1/certificates', certificateRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/notifications', notificationRouter);

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.path} not found` } });
});

// ── Global Error Handler (must be last) ─────────────────
app.use(globalErrorHandler);

// ── Start Server ─────────────────────────────────────────
async function bootstrap() {
  // Ensure MinIO bucket exists
  try {
    await ensureBucketExists();
  } catch (err) {
    console.warn('⚠️ MinIO not available. File uploads will fail. Start MinIO if needed.');
  }

  app.listen(parseInt(env.PORT), () => {
    console.log(`\n🚀 MapanSetu API running at http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🗄️  Database: Connected via Prisma\n`);
  });
}

bootstrap();
```

### Step 6.1 — Run the server for the first time

```powershell
cd d:\Projects\Mapansetu\services\api
npm run dev
```

**Expected output:**
```
🚀 MapanSetu API running at http://localhost:3000
📊 Environment: development
🗄️  Database: Connected via Prisma
```

**Test it:**
```powershell
curl http://localhost:3000/health
```
Expected: `{"status":"OK","environment":"development",...}`

> ✅ If this works, Phase 6 is complete. Commit this as your first working checkpoint.

---

## PHASE 7 — Auth Module

This is the most critical module. All others depend on it.

### Step 7.1 — Validation Schemas

Create `src/modules/auth/auth.schemas.ts`:
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number').optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    businessName: z.string().min(2, 'Business name required'),
    address: z.string().min(5),
    city: z.string().min(2),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    gstin: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createLmoSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    password: z.string().min(8),
    city: z.string().optional(),
  }),
});

// Middleware to validate request against a schema
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          },
        });
        return;
      }
      next(error);
    }
  };
}
```

### Step 7.2 — Auth Service

Create `src/modules/auth/auth.service.ts`:
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { UserRole } from '@prisma/client';

interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  businessName: string;
  address: string;
  city: string;
  pincode: string;
  gstin?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  role: UserRole;
  email: string;
  businessId?: string;
}

function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}

export const AuthService = {
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user + business in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: UserRole.BUSINESS,
          name: input.name,
          email: input.email,
          phone: input.phone,
          passwordHash,
        },
      });

      const business = await tx.business.create({
        data: {
          userId: user.id,
          businessName: input.businessName,
          address: input.address,
          city: input.city,
          pincode: input.pincode,
          gstin: input.gstin,
        },
      });

      return { user, business };
    });

    const tokens = generateTokens({
      id: result.user.id,
      role: result.user.role,
      email: result.user.email,
      businessId: result.business.id,
    });

    return {
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
      business: result.business,
      ...tokens,
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { business: true },
    });

    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const tokens = generateTokens({
      id: user.id,
      role: user.role,
      email: user.email,
      businessId: user.business?.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.business?.id,
      },
      ...tokens,
    };
  },

  async createLmo(input: { name: string; email: string; phone?: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error('EMAIL_TAKEN');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        role: UserRole.LMO,
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
      },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  async getMe(userId: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { business: true },
      omit: { passwordHash: true },
    });
  },
};
```

### Step 7.3 — Auth Controller

Create `src/modules/auth/auth.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../lib/response';
import { asyncHandler } from '../../lib/async-handler';
import { AuthenticatedRequest } from '../../middleware/auth.guard';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    sendSuccess(res, result, 201, 'Registration successful');
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 200, 'Login successful');
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        return;
      }
      throw err;
    }
  }),

  getMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getMe(req.user!.id);
    sendSuccess(res, user);
  }),

  createLmo: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.createLmo(req.body);
    sendSuccess(res, result, 201, 'LMO account created');
  }),
};
```

### Step 7.4 — Auth Routes

Create `src/modules/auth/auth.routes.ts`:
```typescript
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth.guard';
import { validate, registerSchema, loginSchema, createLmoSchema } from './auth.schemas';

export const authRouter = Router();

// Public routes
authRouter.post('/register', validate(registerSchema), AuthController.register);
authRouter.post('/login', validate(loginSchema), AuthController.login);

// Protected routes
authRouter.get('/me', authenticate, AuthController.getMe);

// Admin only: create LMO accounts
authRouter.post(
  '/create-lmo',
  authenticate,
  authorize('ADMIN'),
  validate(createLmoSchema),
  AuthController.createLmo
);
```

### Step 7.5 — Test Auth Module

Restart dev server then test:

```powershell
# Register a business
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Sharma Owner",
    "email": "sharma@store.com",
    "password": "Demo@1234",
    "businessName": "Sharma General Store",
    "address": "12 Main Road, Civil Lines",
    "city": "Gorakhpur",
    "pincode": "273001"
  }'
```

Expected: `{ "success": true, "data": { "user": {...}, "accessToken": "eyJ..." } }`

```powershell
# Login
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email": "sharma@store.com", "password": "Demo@1234"}'
```

**Save the `accessToken` from this response. You'll need it for all future requests.**

---

## PHASE 8 — Instrument Module

### Step 8.1 — Instrument Service

Create `src/modules/instrument/instrument.service.ts`:
```typescript
import { prisma } from '../../lib/prisma';
import { generateInstrumentCode } from '../../lib/codegen';
import { computePassportHash } from '../../lib/crypto';
import { PassportEventType, UserRole } from '@prisma/client';

interface CreateInstrumentInput {
  category: string;
  manufacturer: string;
  model: string;
  serialNo: string;
  capacity: string;
  capacityUnit?: string;
  city?: string;
}

export const InstrumentService = {
  async create(businessId: string, input: CreateInstrumentInput, actorName: string) {
    const instrumentCode = await generateInstrumentCode(input.category, input.city ?? 'GKP');

    const instrument = await prisma.$transaction(async (tx) => {
      const inst = await tx.instrument.create({
        data: {
          instrumentCode,
          businessId,
          category: input.category,
          manufacturer: input.manufacturer,
          model: input.model,
          serialNo: input.serialNo,
          capacity: input.capacity,
          capacityUnit: input.capacityUnit ?? 'kg',
        },
      });

      // Create initial passport log entry
      const eventData = {
        instrumentCode,
        category: input.category,
        manufacturer: input.manufacturer,
        registeredBy: actorName,
      };
      const currentHash = computePassportHash(null, eventData, new Date().toISOString());

      await tx.passportLog.create({
        data: {
          instrumentId: inst.id,
          eventType: PassportEventType.REGISTERED,
          eventData,
          actorName,
          previousHash: null,
          currentHash,
        },
      });

      return inst;
    });

    return instrument;
  },

  async findAll(businessId?: string) {
    return prisma.instrument.findMany({
      where: businessId ? { businessId } : {},
      include: { business: { select: { businessName: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string, businessId?: string) {
    const where = businessId ? { id, businessId } : { id };
    return prisma.instrument.findUniqueOrThrow({
      where,
      include: {
        business: { select: { businessName: true, city: true } },
        certificates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  },

  async getPassport(instrumentId: string) {
    return prisma.passportLog.findMany({
      where: { instrumentId },
      orderBy: { createdAt: 'asc' },
    });
  },
};
```

### Step 8.2 — Instrument Controller & Routes

Create `src/modules/instrument/instrument.controller.ts`:
```typescript
import { Response } from 'express';
import { InstrumentService } from './instrument.service';
import { sendSuccess } from '../../lib/response';
import { asyncHandler } from '../../lib/async-handler';
import { AuthenticatedRequest } from '../../middleware/auth.guard';

export const InstrumentController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InstrumentService.create(
      req.user!.businessId!,
      req.body,
      req.user!.email
    );
    sendSuccess(res, result, 201, 'Instrument registered successfully');
  }),

  findAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.user!.role === 'BUSINESS' ? req.user!.businessId : undefined;
    const result = await InstrumentService.findAll(businessId);
    sendSuccess(res, result);
  }),

  findById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.user!.role === 'BUSINESS' ? req.user!.businessId : undefined;
    const result = await InstrumentService.findById(req.params.id, businessId);
    sendSuccess(res, result);
  }),

  getPassport: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InstrumentService.getPassport(req.params.id);
    sendSuccess(res, result);
  }),
};
```

Create `src/modules/instrument/instrument.routes.ts`:
```typescript
import { Router } from 'express';
import { InstrumentController } from './instrument.controller';
import { authenticate, authorize } from '../../middleware/auth.guard';

export const instrumentRouter = Router();

// All instrument routes require authentication
instrumentRouter.use(authenticate);

instrumentRouter.post('/', authorize('BUSINESS'), InstrumentController.create);
instrumentRouter.get('/', InstrumentController.findAll);
instrumentRouter.get('/:id', InstrumentController.findById);
instrumentRouter.get('/:id/passport', InstrumentController.getPassport);
```

---

## PHASE 9 — Application Module

Create `src/modules/application/application.service.ts`:
```typescript
import { prisma } from '../../lib/prisma';
import { generateApplicationNo } from '../../lib/codegen';
import { computePassportHash } from '../../lib/crypto';
import { PassportEventType, UserRole } from '@prisma/client';

export const ApplicationService = {
  async create(businessId: string, instrumentId: string) {
    // Verify instrument belongs to this business
    const instrument = await prisma.instrument.findFirst({
      where: { id: instrumentId, businessId },
    });
    if (!instrument) throw new Error('INSTRUMENT_NOT_FOUND');

    // Check no active pending application exists for this instrument
    const existing = await prisma.application.findFirst({
      where: { instrumentId, status: { in: ['PENDING', 'ASSIGNED'] } },
    });
    if (existing) throw new Error('APPLICATION_ALREADY_PENDING');

    const applicationNo = await generateApplicationNo();

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          applicationNo,
          instrumentId,
          businessId,
          status: 'PENDING',
        },
      });

      // Add passport log
      const prevLog = await tx.passportLog.findFirst({
        where: { instrumentId },
        orderBy: { createdAt: 'desc' },
      });
      const eventData = { applicationNo, status: 'PENDING' };
      const currentHash = computePassportHash(
        prevLog?.currentHash ?? null,
        eventData,
        new Date().toISOString()
      );
      await tx.passportLog.create({
        data: {
          instrumentId,
          eventType: PassportEventType.APPLICATION_SUBMITTED,
          eventData,
          previousHash: prevLog?.currentHash ?? null,
          currentHash,
        },
      });

      return app;
    });

    return application;
  },

  async findAll(userId: string, role: UserRole, businessId?: string) {
    if (role === 'BUSINESS') {
      return prisma.application.findMany({
        where: { businessId },
        include: {
          instrument: { select: { instrumentCode: true, category: true } },
          assignedLmo: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (role === 'LMO') {
      return prisma.application.findMany({
        where: { assignedLmoId: userId },
        include: {
          instrument: true,
          business: { select: { businessName: true, address: true, city: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    // ADMIN: all applications
    return prisma.application.findMany({
      include: {
        instrument: true,
        business: { select: { businessName: true, city: true } },
        assignedLmo: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.application.findUniqueOrThrow({
      where: { id },
      include: {
        instrument: { include: { business: true } },
        assignedLmo: { select: { id: true, name: true, email: true } },
        inspection: { include: { certificate: true } },
      },
    });
  },

  async assignLmo(applicationId: string, lmoId: string) {
    // Verify LMO exists
    const lmo = await prisma.user.findFirst({ where: { id: lmoId, role: 'LMO' } });
    if (!lmo) throw new Error('LMO_NOT_FOUND');

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { assignedLmoId: lmoId, status: 'ASSIGNED' },
      include: { instrument: true },
    });

    // Passport log
    const prevLog = await prisma.passportLog.findFirst({
      where: { instrumentId: application.instrumentId },
      orderBy: { createdAt: 'desc' },
    });
    const eventData = { lmoId, lmoName: lmo.name, applicationId };
    const currentHash = computePassportHash(
      prevLog?.currentHash ?? null,
      eventData,
      new Date().toISOString()
    );
    await prisma.passportLog.create({
      data: {
        instrumentId: application.instrumentId,
        eventType: PassportEventType.ASSIGNED_TO_LMO,
        eventData,
        actorName: lmo.name,
        previousHash: prevLog?.currentHash ?? null,
        currentHash,
      },
    });

    // Notify LMO
    await prisma.notification.create({
      data: {
        userId: lmoId,
        type: 'APPLICATION_ASSIGNED',
        title: 'New Inspection Assigned',
        message: `You have been assigned to inspect ${application.instrument.instrumentCode}`,
        metadata: { applicationId },
      },
    });

    return application;
  },

  // For LMO field app: get today's assigned inspections
  async getLmoQueue(lmoId: string) {
    return prisma.application.findMany({
      where: { assignedLmoId: lmoId, status: 'ASSIGNED' },
      include: {
        instrument: true,
        business: { select: { businessName: true, address: true, city: true, phone: true } },
      },
    });
  },
};
```

Create `src/modules/application/application.routes.ts`:
```typescript
import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { ApplicationService } from './application.service';
import { authenticate, authorize, AuthenticatedRequest } from '../../middleware/auth.guard';
import { sendSuccess } from '../../lib/response';
import { Response } from 'express';

export const applicationRouter = Router();
applicationRouter.use(authenticate);

applicationRouter.post('/', authorize('BUSINESS'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { instrumentId } = req.body;
  const result = await ApplicationService.create(req.user!.businessId!, instrumentId);
  sendSuccess(res, result, 201);
}));

applicationRouter.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await ApplicationService.findAll(req.user!.id, req.user!.role, req.user!.businessId);
  sendSuccess(res, result);
}));

applicationRouter.get('/lmo/queue', authorize('LMO'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await ApplicationService.getLmoQueue(req.user!.id);
  sendSuccess(res, result);
}));

applicationRouter.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await ApplicationService.findById(req.params.id);
  sendSuccess(res, result);
}));

applicationRouter.put('/:id/assign', authorize('ADMIN'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await ApplicationService.assignLmo(req.params.id, req.body.lmoId);
  sendSuccess(res, result);
}));
```

---

## PHASE 10 — Inspection Module (Core + Offline Sync)

This is the most complex module. Read carefully.

Create `src/modules/inspection/inspection.service.ts`:
```typescript
import { prisma } from '../../lib/prisma';
import { uploadBase64Image } from '../../lib/minio';
import { computePassportHash } from '../../lib/crypto';
import { CertificateService } from '../certificate/certificate.service';
import { PassportEventType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface ReadingRow {
  standard: string;  // e.g., "5 kg"
  observed: number;  // actual reading
  error: number;     // observed - standard_numeric
  withinTolerance: boolean;
}

interface OfflineInspectionPayload {
  local_id: string;           // UUID generated on device — for idempotency
  application_id: string;
  inspection_date: string;    // ISO 8601
  latitude?: number;
  longitude?: number;
  readings: ReadingRow[];
  result: 'PASS' | 'FAIL';
  remarks?: string;
  photos?: Array<{
    base64: string;           // "data:image/jpeg;base64,..."
    label: string;            // "Serial Plate", "Display", "Overall View", "Seal"
  }>;
}

export const InspectionService = {
  /**
   * Online inspection (Officer is connected)
   */
  async createOnline(
    lmoId: string,
    applicationId: string,
    data: Omit<OfflineInspectionPayload, 'local_id' | 'application_id'>
  ) {
    return InspectionService.processInspection(lmoId, {
      local_id: uuidv4(),
      application_id: applicationId,
      ...data,
    });
  },

  /**
   * Offline sync endpoint — processes a batch of inspections.
   * Idempotent: duplicate local_id is silently skipped.
   */
  async syncOfflineBatch(lmoId: string, inspections: OfflineInspectionPayload[]) {
    const results = [];

    for (const payload of inspections) {
      // Idempotency check: if already synced, skip
      const existing = await prisma.inspection.findUnique({
        where: { localSyncId: payload.local_id },
      });

      if (existing) {
        results.push({
          local_id: payload.local_id,
          already_synced: true,
          inspection_id: existing.id,
        });
        continue;
      }

      const result = await InspectionService.processInspection(lmoId, payload);
      results.push({
        local_id: payload.local_id,
        already_synced: false,
        ...result,
      });
    }

    return results;
  },

  /**
   * Internal: processes a single inspection (creates inspection, uploads photos,
   * generates certificate if PASS, updates passport)
   */
  async processInspection(lmoId: string, payload: OfflineInspectionPayload) {
    // Verify application is assigned to this LMO
    const application = await prisma.application.findFirst({
      where: { id: payload.application_id, assignedLmoId: lmoId, status: 'ASSIGNED' },
      include: { instrument: true },
    });
    if (!application) throw new Error('APPLICATION_NOT_FOUND_OR_NOT_ASSIGNED');

    // Upload photos to MinIO
    const evidenceUrls: string[] = [];
    if (payload.photos && payload.photos.length > 0) {
      for (const photo of payload.photos) {
        const objectName = `inspections/${payload.application_id}/${Date.now()}_${photo.label.replace(/\s/g, '_')}.jpg`;
        const url = await uploadBase64Image(objectName, photo.base64);
        evidenceUrls.push(url);
      }
    }

    // Create inspection + update application + optionally create certificate
    const result = await prisma.$transaction(async (tx) => {
      const inspection = await tx.inspection.create({
        data: {
          applicationId: payload.application_id,
          lmoId,
          inspectionDate: new Date(payload.inspection_date),
          latitude: payload.latitude,
          longitude: payload.longitude,
          readings: payload.readings,
          evidenceUrls,
          result: payload.result,
          remarks: payload.remarks,
          localSyncId: payload.local_id,
          syncedAt: new Date(),
        },
      });

      // Update application status
      await tx.application.update({
        where: { id: payload.application_id },
        data: { status: 'INSPECTED' },
      });

      // Add passport event
      const prevLog = await tx.passportLog.findFirst({
        where: { instrumentId: application.instrumentId },
        orderBy: { createdAt: 'desc' },
      });
      const eventData = {
        result: payload.result,
        inspectionId: inspection.id,
        lmoId,
        date: payload.inspection_date,
      };
      const currentHash = computePassportHash(
        prevLog?.currentHash ?? null,
        eventData,
        new Date().toISOString()
      );
      await tx.passportLog.create({
        data: {
          instrumentId: application.instrumentId,
          eventType: PassportEventType.INSPECTION_DONE,
          eventData,
          previousHash: prevLog?.currentHash ?? null,
          currentHash,
        },
      });

      return inspection;
    });

    // If PASS, generate certificate (outside transaction to avoid timeout)
    let certificate = null;
    if (payload.result === 'PASS') {
      certificate = await CertificateService.generate(
        result.id,
        application.instrumentId,
        application.businessId
      );
    }

    return { inspection: result, certificate };
  },

  async findById(id: string) {
    return prisma.inspection.findUniqueOrThrow({
      where: { id },
      include: { application: { include: { instrument: true } }, lmo: { select: { name: true } } },
    });
  },
};
```

Create `src/modules/inspection/inspection.routes.ts`:
```typescript
import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { InspectionService } from './inspection.service';
import { authenticate, authorize, AuthenticatedRequest } from '../../middleware/auth.guard';
import { sendSuccess } from '../../lib/response';
import { Response } from 'express';

export const inspectionRouter = Router();
inspectionRouter.use(authenticate);

// Online inspection
inspectionRouter.post('/', authorize('LMO'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId, ...rest } = req.body;
  const result = await InspectionService.createOnline(req.user!.id, applicationId, rest);
  sendSuccess(res, result, 201, 'Inspection recorded');
}));

// Offline sync — CRITICAL endpoint for PWA
inspectionRouter.post('/sync', authorize('LMO'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inspections } = req.body;
  if (!Array.isArray(inspections) || inspections.length === 0) {
    sendSuccess(res, { processed: [] }, 200, 'Nothing to sync');
    return;
  }
  const result = await InspectionService.syncOfflineBatch(req.user!.id, inspections);
  sendSuccess(res, { processed: result }, 200, `Synced ${result.length} inspection(s)`);
}));

inspectionRouter.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await InspectionService.findById(req.params.id);
  sendSuccess(res, result);
}));
```

---

## PHASE 11 — Certificate Module (Crypto Core)

Create `src/modules/certificate/certificate.service.ts`:
```typescript
import { prisma } from '../../lib/prisma';
import { signCertificatePayload, sha256, verifyCertificateSignature, computePassportHash } from '../../lib/crypto';
import { generateCertificateNo } from '../../lib/codegen';
import { env } from '../../config/env';
import { PassportEventType } from '@prisma/client';
import QRCode from 'qrcode';

export const CertificateService = {
  async generate(inspectionId: string, instrumentId: string, businessId: string) {
    const certNo = await generateCertificateNo();

    const issueDate = new Date();
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + parseInt(env.CERT_VALIDITY_YEARS));

    // Load required data for the certificate payload
    const [inspection, instrument, business] = await Promise.all([
      prisma.inspection.findUniqueOrThrow({ where: { id: inspectionId }, include: { lmo: { select: { name: true } } } }),
      prisma.instrument.findUniqueOrThrow({ where: { id: instrumentId } }),
      prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
    ]);

    // Build the canonical certificate payload (this exact JSON is what is signed)
    const certPayload = {
      certificateNo: certNo,
      instrumentId: instrument.instrumentCode,
      instrumentCategory: instrument.category,
      instrumentManufacturer: instrument.manufacturer,
      instrumentSerialNo: instrument.serialNo,
      ownerName: business.businessName,
      ownerCity: business.city,
      issueDate: issueDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      verifiedByLmo: inspection.lmo.name,
      inspectionDate: inspection.inspectionDate.toISOString(),
    };

    const payloadJson = JSON.stringify(certPayload, Object.keys(certPayload).sort()); // sorted keys for consistency
    const payloadHash = sha256(payloadJson);
    const digitalSignature = signCertificatePayload(payloadJson);

    const qrUrl = `${env.CERT_VERIFY_BASE_URL}?certNo=${certNo}`;

    const certificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateNo: certNo,
          instrumentId,
          inspectionId,
          issueDate,
          expiryDate,
          payloadJson,
          payloadHash,
          digitalSignature,
          qrUrl,
          status: 'ACTIVE',
        },
      });

      // Update instrument status to VERIFIED
      await tx.instrument.update({
        where: { id: instrumentId },
        data: { status: 'VERIFIED' },
      });

      // Update application status to COMPLETED
      await tx.application.update({
        where: { id: inspection.applicationId },
        data: { status: 'COMPLETED' },
      });

      // Passport log for CERTIFICATE_ISSUED
      const prevLog = await tx.passportLog.findFirst({
        where: { instrumentId },
        orderBy: { createdAt: 'desc' },
      });
      const eventData = { certificateNo: certNo, issueDate: issueDate.toISOString(), expiryDate: expiryDate.toISOString() };
      const currentHash = computePassportHash(
        prevLog?.currentHash ?? null,
        eventData,
        new Date().toISOString()
      );
      await tx.passportLog.create({
        data: {
          instrumentId,
          eventType: PassportEventType.CERTIFICATE_ISSUED,
          eventData,
          actorName: inspection.lmo.name,
          previousHash: prevLog?.currentHash ?? null,
          currentHash,
        },
      });

      // Notify business
      await tx.notification.create({
        data: {
          userId: (await tx.business.findUniqueOrThrow({ where: { id: businessId }, select: { userId: true } })).userId,
          type: 'CERTIFICATE_ISSUED',
          title: 'Certificate Issued',
          message: `Certificate ${certNo} has been issued for ${instrument.instrumentCode}`,
          metadata: { certificateNo: certNo, certId: cert.id },
        },
      });

      return cert;
    });

    return certificate;
  },

  /**
   * PUBLIC endpoint — verify a certificate by certNo.
   * Performs signature verification.
   */
  async verify(certNo: string) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNo: certNo },
      include: { instrument: { include: { business: { select: { businessName: true, city: true } } } } },
    });

    if (!cert) {
      return { isValid: false, reason: 'CERTIFICATE_NOT_FOUND' };
    }

    // Check status
    if (cert.status === 'REVOKED') {
      return { isValid: false, reason: 'CERTIFICATE_REVOKED', certificate: { certificateNo: cert.certificateNo } };
    }

    // Check expiry
    const now = new Date();
    if (cert.expiryDate < now) {
      return { isValid: false, reason: 'CERTIFICATE_EXPIRED', certificate: cert };
    }

    // Cryptographic verification
    const signatureValid = verifyCertificateSignature(cert.payloadJson, cert.digitalSignature);
    if (!signatureValid) {
      return { isValid: false, reason: 'INVALID_SIGNATURE' };
    }

    return {
      isValid: true,
      certificate: {
        certificateNo: cert.certificateNo,
        instrumentCode: cert.instrument.instrumentCode,
        ownerName: cert.instrument.business?.businessName,
        ownerCity: cert.instrument.business?.city,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        status: cert.status,
        daysRemaining: Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      },
    };
  },

  async getQrCode(certId: string): Promise<string> {
    const cert = await prisma.certificate.findUniqueOrThrow({ where: { id: certId } });
    return QRCode.toDataURL(cert.qrUrl, { errorCorrectionLevel: 'H', width: 300 });
  },

  async findById(id: string) {
    return prisma.certificate.findUniqueOrThrow({
      where: { id },
      include: { instrument: true, inspection: true },
    });
  },
};
```

Create `src/modules/certificate/certificate.routes.ts`:
```typescript
import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { CertificateService } from './certificate.service';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.guard';
import { sendSuccess, sendError } from '../../lib/response';
import { Response } from 'express';

export const certificateRouter = Router();

// PUBLIC: verify a certificate (no auth needed — used by QR scanner)
certificateRouter.get('/verify', asyncHandler(async (req, res) => {
  const certNo = req.query.certNo as string;
  if (!certNo) {
    sendError(res, 400, 'MISSING_PARAM', 'certNo query parameter is required');
    return;
  }
  const result = await CertificateService.verify(certNo);
  sendSuccess(res, result);
}));

// Protected routes
certificateRouter.use(authenticate);

certificateRouter.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await CertificateService.findById(req.params.id);
  sendSuccess(res, result);
}));

certificateRouter.get('/:id/qr', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const qrDataUrl = await CertificateService.getQrCode(req.params.id);
  sendSuccess(res, { qrDataUrl });
}));
```

---

## PHASE 12 — Dashboard & Notifications

Create `src/modules/dashboard/dashboard.routes.ts`:
```typescript
import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { authenticate, authorize, AuthenticatedRequest } from '../../middleware/auth.guard';
import { prisma } from '../../lib/prisma';
import { sendSuccess } from '../../lib/response';
import { Response } from 'express';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/business', authorize('BUSINESS'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const [total, verified, expired, pending, expiringSoon] = await Promise.all([
    prisma.instrument.count({ where: { businessId } }),
    prisma.instrument.count({ where: { businessId, status: 'VERIFIED' } }),
    prisma.instrument.count({ where: { businessId, status: 'EXPIRED' } }),
    prisma.application.count({ where: { businessId, status: { in: ['PENDING', 'ASSIGNED'] } } }),
    prisma.certificate.count({
      where: {
        instrument: { businessId },
        status: 'ACTIVE',
        expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  sendSuccess(res, { total, verified, expired, pending, expiringSoon });
}));

dashboardRouter.get('/officer', authorize('LMO'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lmoId = req.user!.id;
  const [assigned, completed, totalInspections] = await Promise.all([
    prisma.application.count({ where: { assignedLmoId: lmoId, status: 'ASSIGNED' } }),
    prisma.application.count({ where: { assignedLmoId: lmoId, status: 'COMPLETED' } }),
    prisma.inspection.count({ where: { lmoId } }),
  ]);
  sendSuccess(res, { assigned, completed, totalInspections });
}));

dashboardRouter.get('/admin', authorize('ADMIN'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [totalInstruments, verified, pending, totalCerts, activeCerts] = await Promise.all([
    prisma.instrument.count(),
    prisma.instrument.count({ where: { status: 'VERIFIED' } }),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: 'ACTIVE' } }),
  ]);
  sendSuccess(res, { totalInstruments, verified, pending, totalCerts, activeCerts });
}));
```

Create `src/modules/notification/notification.routes.ts`:
```typescript
import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.guard';
import { prisma } from '../../lib/prisma';
import { sendSuccess } from '../../lib/response';
import { Response } from 'express';

export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  sendSuccess(res, notifications);
}));

notificationRouter.put('/:id/read', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  sendSuccess(res, null, 200, 'Marked as read');
}));
```

---

## PHASE 13 — Database Seeder

Create `src/lib/seed.ts` — run this to populate demo data:
```typescript
import { PrismaClient, UserRole, PassportEventType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computePassportHash, signCertificatePayload, sha256 } from './crypto';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = await bcrypt.hash('Demo@1234', 12);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mapansetu.gov.in' },
    update: {},
    create: { role: UserRole.ADMIN, name: 'Admin User', email: 'admin@mapansetu.gov.in', passwordHash: hash },
  });

  // 2. Create LMO
  const lmo = await prisma.user.upsert({
    where: { email: 'rajesh.lmo@up.gov.in' },
    update: {},
    create: { role: UserRole.LMO, name: 'Rajesh Kumar', email: 'rajesh.lmo@up.gov.in', phone: '9876543210', passwordHash: hash },
  });

  // 3. Create Business User + Business
  const businessUser = await prisma.user.upsert({
    where: { email: 'sharma@store.com' },
    update: {},
    create: { role: UserRole.BUSINESS, name: 'Suresh Sharma', email: 'sharma@store.com', phone: '9123456789', passwordHash: hash },
  });

  const business = await prisma.business.upsert({
    where: { userId: businessUser.id },
    update: {},
    create: { userId: businessUser.id, businessName: 'Sharma General Store', address: '12 Main Road, Civil Lines', city: 'Gorakhpur', pincode: '273001', gstin: '09ABCDE1234F1Z5' },
  });

  // 4. Create Instrument with history
  let instrument = await prisma.instrument.findFirst({ where: { instrumentCode: 'WM-UP-GKP-00123' } });
  if (!instrument) {
    instrument = await prisma.instrument.create({
      data: {
        instrumentCode: 'WM-UP-GKP-00123',
        businessId: business.id,
        category: 'Electronic Weighing Scale',
        manufacturer: 'ABC Instruments',
        model: 'X200',
        serialNo: 'AX12345',
        capacity: '30',
        capacityUnit: 'kg',
        status: 'VERIFIED',
      },
    });

    // Seed passport history (2025 → 2027 timeline)
    const events = [
      { type: PassportEventType.REGISTERED, data: { instrumentCode: 'WM-UP-GKP-00123', registeredBy: 'Suresh Sharma' }, date: '2025-01-15T10:00:00Z' },
      { type: PassportEventType.APPLICATION_SUBMITTED, data: { applicationNo: 'APP-2025-00001' }, date: '2025-02-01T10:00:00Z' },
      { type: PassportEventType.ASSIGNED_TO_LMO, data: { lmoName: 'Rajesh Kumar' }, date: '2025-02-03T10:00:00Z' },
      { type: PassportEventType.INSPECTION_DONE, data: { result: 'PASS' }, date: '2025-02-10T10:00:00Z' },
      { type: PassportEventType.CERTIFICATE_ISSUED, data: { certificateNo: 'LM-UP-2025-00045', expiryDate: '2026-02-10T00:00:00Z' }, date: '2025-02-10T11:00:00Z' },
      { type: PassportEventType.CERTIFICATE_RENEWED, data: { certificateNo: 'LM-UP-2026-00001', expiryDate: '2027-02-10T00:00:00Z' }, date: '2026-02-10T10:00:00Z' },
      { type: PassportEventType.CERTIFICATE_ISSUED, data: { certificateNo: 'LM-UP-2026-00001', issueDate: '2026-02-10T00:00:00Z', expiryDate: '2027-02-10T00:00:00Z' }, date: '2026-02-10T11:00:00Z' },
    ];

    let prevHash: string | null = null;
    for (const event of events) {
      const currentHash = computePassportHash(prevHash, event.data, event.date);
      await prisma.passportLog.create({
        data: {
          instrumentId: instrument.id,
          eventType: event.type,
          eventData: event.data,
          actorName: 'Rajesh Kumar',
          previousHash: prevHash,
          currentHash,
          createdAt: new Date(event.date),
        },
      });
      prevHash = currentHash;
    }
  }

  console.log('✅ Seeding complete!');
  console.log('📋 Demo credentials:');
  console.log('   Business: sharma@store.com / Demo@1234');
  console.log('   LMO:      rajesh.lmo@up.gov.in / Demo@1234');
  console.log('   Admin:    admin@mapansetu.gov.in / Demo@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the seeder:
```powershell
npm run db:seed
```

---

## PHASE 14 — Expiry Checker (Cron Job)

Create `src/lib/expiry-checker.ts`:
```typescript
import cron from 'node-cron';
import { prisma } from './prisma';

/**
 * Runs daily at midnight. Checks for expiring certificates.
 * Creates notifications for 30 days, 7 days, 1 day before expiry.
 * Also marks expired certificates.
 */
export function startExpiryChecker() {
  // Run daily at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running expiry checker cron...');
    const now = new Date();

    // Mark expired certificates
    await prisma.certificate.updateMany({
      where: { status: 'ACTIVE', expiryDate: { lt: now } },
      data: { status: 'EXPIRED' },
    });

    // Update instrument status for expired certs
    const expiredCerts = await prisma.certificate.findMany({
      where: { status: 'EXPIRED' },
      select: { instrumentId: true },
    });
    for (const cert of expiredCerts) {
      await prisma.instrument.updateMany({
        where: { id: cert.instrumentId, status: 'VERIFIED' },
        data: { status: 'EXPIRED' },
      });
    }

    // Create expiry notifications (30/7/1 days)
    const thresholds = [
      { days: 30, type: 'EXPIRY_30_DAYS' as const },
      { days: 7, type: 'EXPIRY_7_DAYS' as const },
      { days: 1, type: 'EXPIRY_1_DAY' as const },
    ];

    for (const threshold of thresholds) {
      const targetDate = new Date(now.getTime() + threshold.days * 24 * 60 * 60 * 1000);
      const expiringCerts = await prisma.certificate.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: { instrument: { include: { business: true } } },
      });

      for (const cert of expiringCerts) {
        const userId = cert.instrument.business?.userId;
        if (!userId) continue;
        await prisma.notification.create({
          data: {
            userId,
            type: threshold.type,
            title: `Certificate Expiring in ${threshold.days} Day(s)`,
            message: `Certificate ${cert.certificateNo} for ${cert.instrument.instrumentCode} expires on ${cert.expiryDate.toDateString()}`,
            metadata: { certificateNo: cert.certificateNo, instrumentCode: cert.instrument.instrumentCode },
          },
        });
      }
    }

    console.log('✅ Expiry checker complete');
  });

  console.log('⏰ Expiry checker cron scheduled (runs daily at midnight)');
}
```

Add to `src/index.ts` (inside `bootstrap()` function, after `app.listen`):
```typescript
import { startExpiryChecker } from './lib/expiry-checker';
// ... inside bootstrap():
startExpiryChecker();
```

---

## PHASE 15 — Final Testing Sequence

Run these tests **in order** to validate the complete backend:

```powershell
# 1. Health check
curl http://localhost:3000/health

# 2. Register business
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test Owner","email":"test@biz.com","password":"Test@1234","businessName":"Test Store","address":"123 Test St","city":"Gorakhpur","pincode":"273001"}'

# 3. Login (save the token)
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@biz.com","password":"Test@1234"}'

# Set TOKEN variable (replace with actual token from above)
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Register instrument
curl -X POST http://localhost:3000/api/v1/instruments `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{"category":"Electronic Weighing Scale","manufacturer":"ABC Ltd","model":"X100","serialNo":"AB001","capacity":"30","capacityUnit":"kg"}'

# Save the instrument ID from response
$INSTRUMENT_ID = "..."

# 5. Apply for verification
curl -X POST http://localhost:3000/api/v1/applications `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{\"instrumentId\":\"$INSTRUMENT_ID\"}"

# 6. Login as LMO
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"rajesh.lmo@up.gov.in","password":"Demo@1234"}'

$LMO_TOKEN = "..."

# 7. Admin assigns LMO (login as admin first to get admin token)
$ADMIN_TOKEN = "..."
$APP_ID = "..."
$LMO_ID = "..."
curl -X PUT "http://localhost:3000/api/v1/applications/$APP_ID/assign" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $ADMIN_TOKEN" `
  -d "{\"lmoId\":\"$LMO_ID\"}"

# 8. LMO syncs offline inspection
curl -X POST http://localhost:3000/api/v1/inspections/sync `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $LMO_TOKEN" `
  -d "{\"inspections\":[{\"local_id\":\"$(New-Guid)\",\"application_id\":\"$APP_ID\",\"inspection_date\":\"$(Get-Date -Format 'o')\",\"readings\":[{\"standard\":\"5 kg\",\"observed\":5.003,\"error\":0.003,\"withinTolerance\":true}],\"result\":\"PASS\",\"remarks\":\"All checks passed\"}]}"

# 9. Verify certificate (public endpoint)
$CERT_NO = "..." # From sync response
curl "http://localhost:3000/api/v1/certificates/verify?certNo=$CERT_NO"

# 10. Get Digital Instrument Passport
curl -H "Authorization: Bearer $TOKEN" `
  "http://localhost:3000/api/v1/instruments/$INSTRUMENT_ID/passport"
```

---

## ✅ Completion Checklist

Mark each phase complete before handing over to the team:

- [ ] Phase 0: Prerequisites verified (Node 18+, PostgreSQL, MinIO running)
- [ ] Phase 1: Project scaffolded, all npm packages installed, tsconfig ready
- [ ] Phase 2: Prisma migration ran, all 9 tables visible in Prisma Studio
- [ ] Phase 3: RSA key pair generated in `./keys/`
- [ ] Phase 4: All lib files created (prisma, crypto, minio, response, codegen, async-handler)
- [ ] Phase 5: Middleware created (auth.guard, error-handler)
- [ ] Phase 6: Server starts on port 3000, `/health` returns OK
- [ ] Phase 7: Auth module — register + login returning JWT
- [ ] Phase 8: Instrument module — create returns unique code (WM-UP-GKP-XXXXX)
- [ ] Phase 9: Application module — submit + assign LMO working
- [ ] Phase 10: Inspection sync — offline payload processed, photos uploaded
- [ ] Phase 11: Certificate — PASS inspection generates signed certificate
- [ ] Phase 12: Dashboard routes returning correct stats
- [ ] Phase 13: Seed script populated demo data
- [ ] Phase 14: Expiry cron scheduled
- [ ] Phase 15: Full test sequence passed end-to-end
