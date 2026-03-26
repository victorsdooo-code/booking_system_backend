# Sprint 3 (v0.4.0) - Backend Development Summary

**Date:** 2026-03-26  
**Status:** ✅ Complete  
**Deadline:** 2-3 hours (accelerated sprint)

---

## 📋 Scope

Doctor Setup + Services + Schedule-based Available Slots

### Default Parameters (10+ days blocker resolved)
1. **Doctor Types:** TCM (中醫師), Physio (物理治療師), Western (西醫) - 3 types only
2. **Photo Upload:** Local storage (no Cloudinary API)
3. **Service Pricing:** Optional field (can add later)

---

## ✅ P0 Features Completed

### 1. Doctor APIs (CRUD + Photo Storage)

**Model Updates (`models/Doctor.js`):**
- Added `type` field (required, enum: ['TCM', 'Physio', 'Western'])
- Added enumTranslate for Chinese labels
- Added index on type + isActive for efficient filtering

**Route Updates (`routes/admin.js`):**
- `GET /api/admin/doctors` - Now supports `?type=` filter
- `POST /api/admin/doctors` - Now requires `type` field, supports photo upload via multipart/form-data
- `PUT /api/admin/doctors/:id` - Supports photo upload

**Photo Upload:**
- Middleware: `middleware/upload.js` (multer configuration)
- Storage: `/uploads/avatars/` directory
- File limit: 5MB, image types only (jpeg, jpg, png, gif, webp)
- URL format: `/uploads/avatars/doctor-{timestamp}-{random}.{ext}`

**Example - Create Doctor with Photo:**
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -F "name=陳醫師" \
  -F "type=TCM" \
  -F "specialty=內科" \
  -F "description=專長：中醫內科" \
  -F "photo=@doctor.jpg"
```

**Example - Create Doctor without Photo:**
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"陳醫師","type":"TCM","specialty":"內科"}'
```

**Example - Filter by Type:**
```bash
curl "http://localhost:3000/api/admin/doctors?type=TCM" \
  -H "X-Admin-Token: admin123"
```

---

### 2. Service APIs (CRUD + Duration + Pricing)

**Model (`models/Service.js`):**
- Already has `duration` (Number, default: 30, min: 5)
- Already has `price` (Number, default: 0, optional)
- Fields are optional for flexibility

**Routes:**
- `GET /api/admin/services` - List all services
- `POST /api/admin/services` - Create service (duration and price optional)
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Soft delete

**Example - Create Service:**
```bash
curl -X POST http://localhost:3000/api/admin/services \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"問診","duration":15,"price":200}'
```

---

### 3. Schedule APIs (Doctor Availability per Day)

**Model Updates (`models/Schedule.js`):**
- Added `serviceId` field (optional, references Service)
- Fixed index: `doctorId` instead of `doctor`
- Added index on clinicId + date

**Routes:**
- `GET /api/admin/schedules` - Supports `?doctorId=`, `?date=`, `?clinicId=` filters
- `POST /api/admin/schedules` - Create schedule (now supports serviceId)
- `PUT /api/admin/schedules/:id` - Update schedule
- `DELETE /api/admin/schedules/:id` - Soft delete
- `POST /api/admin/schedules/batch-copy` - Copy schedules to multiple dates

**Example - Create Schedule:**
```bash
curl -X POST http://localhost:3000/api/admin/schedules \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId":"507f1f77bcf86cd799439011",
    "doctorId":"507f1f77bcf86cd799439012",
    "serviceId":"507f1f77bcf86cd799439013",
    "date":"2026-03-27",
    "startTime":"09:00",
    "endTime":"18:00"
  }'
```

---

### 4. Available Slots Algorithm (Service Duration + Schedule + Bookings)

**Enhanced Endpoint:**
`GET /api/admin/schedules/available-slots?clinicId=&date=&doctorId=&serviceId=`

**Algorithm Features:**
- ✅ Considers clinic business hours per day of week
- ✅ Uses service duration for slot sizing (default: 30 min)
- ✅ Blocks out existing schedules
- ✅ Blocks out existing appointments (pending/confirmed status)
- ✅ Returns slots with start/end times and duration

**Example:**
```bash
curl "http://localhost:3000/api/admin/schedules/available-slots?clinicId=507f1f77bcf86cd799439011&date=2026-03-27&doctorId=507f1f77bcf86cd799439012&serviceId=507f1f77bcf86cd799439013" \
  -H "X-Admin-Token: admin123"
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "businessHours": { "isOpen": true, "open": "09:00", "close": "18:00" },
  "serviceDuration": 15,
  "slots": [
    { "startTime": "09:00", "endTime": "09:15", "available": true, "duration": 15 },
    { "startTime": "09:15", "endTime": "09:30", "available": true, "duration": 15 },
    ...
  ]
}
```

---

## 📁 Files Changed

### New Files
- `middleware/upload.js` - Multer configuration for photo uploads
- `migration_sprint3.js` - Migration script for doctor type field

### Modified Files
- `models/Doctor.js` - Added type field (required, enum)
- `models/Schedule.js` - Added serviceId, fixed index
- `routes/admin.js` - Enhanced doctor routes, available-slots algorithm
- `server.js` - Added static file serving for uploads
- `package.json` - Added multer dependency

---

## 🔧 Migration

**Run migration to add type field to existing doctors:**
```bash
cd booking_system_backend
node migration_sprint3.js
```

This will:
- Find all doctors without a `type` field
- Infer type from specialty/name (Physio/Western) or default to TCM
- Update and save each doctor
- Report counts by type

---

## 🧪 Testing

### 1. Test Doctor Creation with Type
```bash
# TCM Doctor
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"陳醫師","type":"TCM"}'

# Physio Doctor
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"李物理治療師","type":"Physio"}'

# Western Doctor
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"張西醫","type":"Western"}'
```

### 2. Test Filter by Type
```bash
curl "http://localhost:3000/api/admin/doctors?type=TCM" \
  -H "X-Admin-Token: admin123"
```

### 3. Test Available Slots with Service Duration
```bash
# Create a 15-min service first
curl -X POST http://localhost:3000/api/admin/services \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{"name":"問診","duration":15}'

# Get available slots (should return 15-min slots)
curl "http://localhost:3000/api/admin/schedules/available-slots?clinicId=<ID>&date=2026-03-27&doctorId=<ID>&serviceId=<SERVICE_ID>" \
  -H "X-Admin-Token: admin123"
```

---

## 🚀 Deployment

1. Run migration: `node migration_sprint3.js`
2. Commit and push changes
3. Render will auto-deploy
4. Test endpoints on production URL

---

## 📝 API Authentication

All `/api/admin/*` endpoints require:
```
Header: X-Admin-Token: admin123
```

---

**Last Updated:** 2026-03-26  
**Sprint:** 3 (v0.4.0)  
**Status:** ✅ Complete
