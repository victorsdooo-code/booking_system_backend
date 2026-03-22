# API Documentation Summary - Sprint 1

**Project:** 青苗綜合醫療診所預約系統 (Ching Yiu Clinic Booking System)  
**Version:** 1.0.0  
**Base URL:** `http://localhost:3000` (development) or `https://your-app.onrender.com` (production)

---

## 🔐 Authentication

All admin endpoints require authentication header:
```
X-Admin-Token: <admin-password>
```

Default password: `admin123` (change in production!)

---

## 📋 API Endpoints

### 1. Clinic Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/clinics` | List all clinics |
| POST | `/api/admin/clinics` | Create new clinic |
| PUT | `/api/admin/clinics/:id` | Update clinic |
| DELETE | `/api/admin/clinics/:id` | Delete clinic |

**Clinic Schema:**
```javascript
{
  name: String,              // e.g., "青苗綜合醫療診所"
  description: String,
  image: String,             // URL or path
  phone: String,
  address: String,
  businessHours: {
    open: String,            // "09:00"
    close: String            // "18:00"
  },
  isActive: Boolean,         // default: true
  bookingWindowDays: Number  // default: 30
}
```

---

### 2. Doctor Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/doctors` | List all doctors |
| POST | `/api/admin/doctors` | Create new doctor (with avatar upload) |
| PUT | `/api/admin/doctors/:id` | Update doctor |
| DELETE | `/api/admin/doctors/:id` | Delete doctor |

**Doctor Schema:**
```javascript
{
  name: String,              // e.g., "陳醫師"
  avatar: String,            // URL or path
  description: String,       // Bio/specialties
  type: String,              // "TCM" | "Physio" | "Bone"
  isActive: Boolean,         // default: true
  createdAt: Date
}
```

**Avatar Upload:**
```bash
curl -X POST /api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -F "name=陳醫師" \
  -F "type=TCM" \
  -F "description=專長：內科" \
  -F "avatar=@doctor.jpg"
```

---

### 3. Service Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/services` | List all services |
| POST | `/api/admin/services` | Create new service |
| PUT | `/api/admin/services/:id` | Update service |
| DELETE | `/api/admin/services/:id` | Delete service |

**Service Schema:**
```javascript
{
  name: String,              // e.g., "問診"
  duration: Number,          // minutes (15, 45, 60)
  price: Number,             // in HKD
  isActive: Boolean          // default: true
}
```

---

### 4. Doctor-Service Mapping

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/doctor-services` | List all associations |
| POST | `/api/admin/doctor-services` | Create association |
| PUT | `/api/admin/doctor-services/:id` | Update association |
| DELETE | `/api/admin/doctor-services/:id` | Delete association |

**DoctorService Schema:**
```javascript
{
  doctorId: ObjectId,        // Reference to Doctor
  serviceId: ObjectId,       // Reference to Service
  isActive: Boolean          // default: true
}
```

---

### 5. Schedule Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/schedules?clinicId=&doctorId=&month=` | List schedules with filters |
| POST | `/api/admin/schedules` | Create schedule |
| PUT | `/api/admin/schedules/:id` | Update schedule |
| DELETE | `/api/admin/schedules/:id` | Delete schedule |
| POST | `/api/admin/schedules/batch-copy` | Copy schedules to multiple dates |

**Schedule Schema:**
```javascript
{
  clinicId: ObjectId,        // Reference to Clinic (optional)
  doctorId: ObjectId,        // Reference to Doctor
  date: String,              // "YYYY-MM-DD"
  startTime: String,         // "09:00"
  endTime: String,           // "18:00"
  serviceId: ObjectId,       // Reference to Service (optional)
  isActive: Boolean,         // default: true
  isOverride: Boolean,       // default: false
  conflictAlert: Boolean     // default: false
}
```

**Query Parameters for GET:**
- `clinicId` - Filter by clinic
- `doctorId` - Filter by doctor
- `month` - Filter by month (YYYY-MM format)
- `date` - Filter by specific date

**Batch Copy Request Body:**
```javascript
{
  sourceDate: "2026-03-23",
  targetDates: ["2026-03-24", "2026-03-25", "2026-03-26"],
  doctorId: "..."  // optional
}
```

---

### 6. Appointment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/appointments?search=&sort=&status=` | List appointments with filters |
| POST | `/api/admin/appointments` | Create new appointment |
| PUT | `/api/admin/appointments/:id` | Update appointment |
| DELETE | `/api/admin/appointments/:id` | Delete appointment |

**Appointment Schema:**
```javascript
{
  clinicId: ObjectId,        // Reference to Clinic
  doctorId: ObjectId,        // Reference to Doctor
  serviceId: ObjectId,       // Reference to Service
  patientName: String,
  patientTitle: String,      // Mr./Ms./Mrs. etc.
  phone: String,
  date: String,              // "YYYY-MM-DD"
  time: String,              // "10:00"
  status: String,            // "pending" | "confirmed" | "cancelled"
  notes: String,
  source: String,            // "admin" | "web"
  createdAt: Date
}
```

**Query Parameters for GET:**
- `search` - Search in patientName, phone, notes
- `sort` - Sort field: "date", "status", "patientName"
- `order` - Sort order: "asc" | "desc"
- `status` - Filter by status
- `doctorId` - Filter by doctor
- `clinicId` - Filter by clinic
- `date` - Filter by date

---

## 📝 Example Requests

### Create Appointment
```bash
curl -X POST http://localhost:3000/api/admin/appointments \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "507f1f77bcf86cd799439011",
    "doctorId": "507f1f77bcf86cd799439012",
    "serviceId": "507f1f77bcf86cd799439013",
    "patientName": "張大文",
    "patientTitle": "先生",
    "phone": "91234567",
    "date": "2026-03-25",
    "time": "10:00",
    "status": "pending",
    "notes": "第一次求診",
    "source": "admin"
  }'
```

### Get Appointments with Search
```bash
curl "http://localhost:3000/api/admin/appointments?search=張大文&sort=date&order=desc" \
  -H "X-Admin-Token: admin123"
```

### Batch Copy Schedules
```bash
curl -X POST http://localhost:3000/api/admin/schedules/batch-copy \
  -H "X-Admin-Token: admin123" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceDate": "2026-03-23",
    "targetDates": ["2026-03-30", "2026-04-06", "2026-04-13"]
  }'
```

---

## ✅ Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🌱 Seed Data

Run seed script to populate initial data:
```bash
npm run seed
```

**Seeded Data:**
- 2 Clinics (青苗綜合醫療診所, 青苗中藥房)
- 4 Services (問診 15min/$200, 治療 45min/$500, 物理治療 60min/$600, 中醫正骨 60min/$600)
- 10 Doctors (5 TCM, 3 Physio, 2 Bone Setting)
- Sample schedules for next 7 days

---

## 📊 Database Collections

- `clinics` - Clinic information
- `doctors` - Doctor profiles
- `services` - Available services
- `doctor_services` - Doctor-service mappings
- `schedules` - Doctor availability schedules
- `appointments` - Patient appointments
- `system_config` - System configuration

---

**Last Updated:** 2026-03-22  
**Sprint:** 1  
**Status:** Complete ✅
