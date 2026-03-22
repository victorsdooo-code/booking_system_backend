# Render Deployment Fix Instructions

## Problem

Render deployment is returning 404 for all admin endpoints:
- `https://booking-system-backend-2t8v.onrender.com/api/admin/clinics` → 404
- `https://booking-system-backend-2t8v.onrender.com/api/admin/doctors` → 404
- All other endpoints → 404

## Root Cause

The repository structure has the backend code in a **subdirectory**:
```
booking_system_backend/  ← Backend code is HERE
├── server.js
├── routes/
├── models/
├── package.json
└── ...
```

But Render is configured to deploy from the **repository root**, which doesn't contain `server.js`.

## Solution

### Option 1: Update Render Dashboard (Recommended - Fastest)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service: **booking-system-backend**
3. Click **Settings** tab
4. Find **Root Directory** field
5. Set it to: `booking_system_backend`
6. Click **Save Changes**
7. Go to **Manual Deploy** section
8. Click **Deploy latest commit**

### Option 2: Use render.yaml (Automatic for future deploys)

A `render.yaml` file has been created with the correct configuration:

```yaml
services:
  - type: web
    name: booking-system-backend
    env: node
    rootDir: booking_system_backend
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

This file is now in the repository. Render should pick it up on next deploy.

## Verification

After fixing, test these endpoints:

```bash
# Should return JSON, NOT 404
curl https://booking-system-backend-2t8v.onrender.com/api/admin/clinics -H "X-Admin-Token: admin123"
# Expected: {"success":true,"count":N,"clinics":[...]}

curl https://booking-system-backend-2t8v.onrender.com/api/admin/doctors -H "X-Admin-Token: admin123"
# Expected: {"success":true,"count":N,"doctors":[...]}

curl https://booking-system-backend-2t8v.onrender.com/api/health
# Expected: {"status":"ok","timestamp":"...","version":"0.3.0"}
```

## Local Testing Confirmed

All 7 endpoints are **verified working locally**:
- ✅ `/api/admin/clinics`
- ✅ `/api/admin/doctors`
- ✅ `/api/admin/services`
- ✅ `/api/admin/schedules`
- ✅ `/api/admin/doctor-types`
- ✅ `/api/admin/doctor-services`
- ✅ `/api/admin/appointments`

The code is correct. Only Render configuration needs to be fixed.

## Current Status

- **GitHub:** Latest code pushed (commit 0b80b54)
- **Local:** All endpoints working ✅
- **Render:** Needs Root Directory config fix ❌

---

**Date:** 2026-03-21  
**Fixed by:** developer2 (subagent)
