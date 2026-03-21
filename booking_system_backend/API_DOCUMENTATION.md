# 🏥 青苗綜合醫療診所預約系統 API 文檔

**Version:** v0.3.0 (Sprint 1.5 - Admin Features Complete)  
**Base URL:** `https://booking-system-backend-2t8v.onrender.com`  
**Local Testing:** `http://localhost:3000`  
**Last Updated:** 2026-03-20

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [SMS Verification API](#sms-verification-api) 🆕
4. [Clinics API](#clinics-api)
5. [Services API](#services-api)
6. [Doctors API](#doctors-api)
7. [Appointments API](#appointments-api)
8. [Admin API](#admin-api)
9. [Error Handling](#error-handling)

---

## Overview

### Base URL
```
https://booking-system-backend-2t8v.onrender.com
```

### Response Format
All responses are in JSON format with the following structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication

### Admin Token
Admin endpoints require an `X-Admin-Token` header or `token` query parameter.

**Default Admin Password:** `admin123` (change in production via `ADMIN_PASSWORD` env variable)

**Example:**
```bash
curl -H "X-Admin-Token: admin123" \
  https://booking-system-backend-2t8v.onrender.com/api/admin/appointments
```

---

## SMS Verification API 🆕

### POST /api/sms/send
Send a 6-digit verification code to a phone number.

**Rate Limit:** 1 request per 60 seconds per phone number  
**Code Expiry:** 5 minutes

**Request Body:**
```json
{
  "phone": "91234567"
}
```

**Validation:**
- Phone must be 8 digits (Hong Kong format: 5XXXXXXXX, 6XXXXXXXX, 7XXXXXXXX, 9XXXXXXXX)
- Hyphens and spaces are allowed but will be removed

**Success Response (200):**
```json
{
  "success": true,
  "message": "驗證碼已發送",
  "expiresInSeconds": 300,
  "phone": "91234567"
}
```

**Error Responses:**

**Rate Limited (429):**
```json
{
  "success": false,
  "error": "請求太頻密，請 60 秒後再試",
  "retryAfter": 60
}
```

**Invalid Phone (400):**
```json
{
  "success": false,
  "error": "電話號碼格式錯誤，請使用 8 位數字 (e.g. 91234567)"
}
```

---

### POST /api/sms/verify
Verify the SMS code.

**Request Body:**
```json
{
  "phone": "91234567",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "驗證成功",
  "phone": "91234567",
  "verifiedAt": "2026-03-12T12:30:00.000Z"
}
```

**Error Responses:**

**Not Found (404):**
```json
{
  "success": false,
  "error": "找不到驗證記錄，請重新發送驗證碼"
}
```

**Expired (410):**
```json
{
  "success": false,
  "error": "驗證碼已過期，請重新發送",
  "expired": true
}
```

**Invalid Code (400):**
```json
{
  "success": false,
  "error": "驗證碼錯誤"
}
```

---

### GET /api/sms/status
Check verification status for a phone number.

**Query Parameters:**
- `phone` (required) - Phone number

**Response:**
```json
{
  "success": true,
  "hasPendingVerification": true,
  "expiresInSeconds": 245,
  "expired": false
}
```

---

## Clinics API

### GET /api/clinics
List all clinics.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "clinics": [
    {
      "id": 1,
      "name": "青苗綜合醫療診所",
      "nameEn": "Ching Yiu Integrated Medical Clinic",
      "address": "香港中環皇后大道中 99 號中環中心 12 樓",
      "phone": "2525-1234",
      "email": "info@chingyiu.com",
      "services": ["中醫", "物理治療", "中醫正骨"]
    },
    {
      "id": 2,
      "name": "青苗中藥房",
      "nameEn": "Ching Yiu Chinese Medicine Pharmacy",
      "address": "香港中環皇后大道中 99 號中環中心 11 樓",
      "phone": "2525-1235",
      "email": "pharmacy@chingyiu.com",
      "services": ["中藥配藥", "藥膳諮詢"]
    }
  ]
}
```

### GET /api/clinics/:id
Get clinic by ID.

**Parameters:**
- `id` (path) - Clinic ID

**Response:**
```json
{
  "success": true,
  "clinic": { ... }
}
```

---

## Services API

### GET /api/services
List all services with duration.

**Response:**
```json
{
  "success": true,
  "count": 4,
  "services": [
    {
      "id": 1,
      "name": "中醫師 - 問診",
      "nameEn": "TCM Doctor - Consultation",
      "duration": 15,
      "price": 300,
      "category": "中醫",
      "description": "初步診斷及諮詢"
    },
    {
      "id": 2,
      "name": "中醫師 - 治療",
      "nameEn": "TCM Doctor - Treatment",
      "duration": 45,
      "price": 600,
      "category": "中醫",
      "description": "針灸、中藥治療等"
    },
    {
      "id": 3,
      "name": "物理治療師",
      "nameEn": "Physiotherapist",
      "duration": 60,
      "price": 800,
      "category": "物理治療",
      "description": "物理治療及復康"
    },
    {
      "id": 4,
      "name": "中醫正骨師",
      "nameEn": "TCM Bone Setter",
      "duration": 60,
      "price": 700,
      "category": "中醫正骨",
      "description": "正骨及關節調整"
    }
  ]
}
```

### GET /api/services/:id
Get service by ID.

---

## Doctors API

### GET /api/doctors
List all doctors.

**Query Parameters:**
- `clinicId` (optional) - Filter by clinic ID
- `type` (optional) - Filter by type (中醫，物理治療，中醫正骨)
- `available` (optional) - Filter by availability (true/false)

**Example:**
```bash
GET /api/doctors?clinicId=1&type=中醫&available=true
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "doctors": [
    {
      "id": 1,
      "name": "陳醫師",
      "nameEn": "Dr. Chan",
      "type": "中醫",
      "specialty": "內科、婦科",
      "clinicId": 1,
      "serviceIds": [1, 2],
      "available": true
    }
    // ... more doctors
  ]
}
```

### GET /api/doctors/:id
Get doctor by ID.

### GET /api/doctors/:id/available-slots
Get available time slots for a doctor.

**Parameters:**
- `id` (path) - Doctor ID
- `date` (query, required) - Date in YYYY-MM-DD format
- `serviceId` (query, optional) - Service ID to determine slot duration

**Example:**
```bash
GET /api/doctors/1/available-slots?date=2026-03-15&serviceId=2
```

**Response:**
```json
{
  "success": true,
  "doctorId": 1,
  "doctorName": "陳醫師",
  "date": "2026-03-15",
  "serviceId": 2,
  "duration": 45,
  "slots": [
    {
      "time": "09:00",
      "duration": 45,
      "available": true
    },
    {
      "time": "09:45",
      "duration": 45,
      "available": true
    }
    // ... more slots
  ]
}
```

---

## Appointments API

### POST /api/appointments
Create a new booking.

**Request Body:**
```json
{
  "name": "張三",
  "phone": "9123-4567",
  "doctorId": 1,
  "date": "2026-03-15",
  "time": "09:00",
  "serviceId": 2,
  "clinicId": 1,
  "notes": "第一次就診"
}
```

**Required Fields:**
- `name` - Patient name
- `phone` - Contact phone
- `doctorId` - Doctor ID
- `date` - Appointment date (YYYY-MM-DD)
- `time` - Appointment time (HH:MM)

**Optional Fields:**
- `serviceId` - Service ID
- `clinicId` - Clinic ID (defaults to doctor's clinic)
- `notes` - Additional notes

**Success Response (201):**
```json
{
  "success": true,
  "message": "預約成功",
  "appointment": {
    "id": 1,
    "name": "張三",
    "phone": "9123-4567",
    "doctorId": 1,
    "doctorName": "陳醫師",
    "serviceId": 2,
    "serviceName": "中醫師 - 治療",
    "clinicId": 1,
    "clinicName": "青苗綜合醫療診所",
    "date": "2026-03-15",
    "time": "09:00",
    "duration": 45,
    "status": "confirmed",
    "notes": "第一次就診",
    "createdAt": "2026-03-12T00:15:00.000Z"
  }
}
```

### GET /api/appointments
List all appointments.

**Query Parameters:**
- `date` (optional) - Filter by date
- `doctorId` (optional) - Filter by doctor
- `status` (optional) - Filter by status (confirmed, cancelled)
- `clinicId` (optional) - Filter by clinic

### GET /api/appointments/:id
Get appointment by ID.

### DELETE /api/appointments/:id
Cancel an appointment.

---

## Admin API 🔧

All admin endpoints require the `X-Admin-Token` header.

**Authentication:**
```bash
X-Admin-Token: admin123
```

---

### Clinic Management 🏥

#### GET /api/admin/clinics
List all clinics.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "clinics": [
    {
      "_id": "69bc2e871bc84cffbfdd1009",
      "name": "青苗綜合醫療診所",
      "description": "",
      "phone": "2525-1234",
      "address": "香港中環皇后大道中 99 號中環中心 12 樓",
      "businessHours": {
        "open": "09:00",
        "close": "18:00"
      },
      "isActive": true,
      "createdAt": "2026-03-19T17:12:39.946Z",
      "updatedAt": "2026-03-19T17:12:39.946Z"
    }
  ]
}
```

#### POST /api/admin/clinics
Create a new clinic.

**Request Body:**
```json
{
  "name": "青苗中藥房",
  "description": "中藥配藥服務",
  "phone": "2525-1235",
  "address": "香港中環皇后大道中 99 號中環中心 11 樓",
  "businessHours": {
    "open": "09:00",
    "close": "18:00"
  },
  "isActive": true
}
```

**Response (201):**
```json
{
  "success": true,
  "clinic": {
    "_id": "69bc2e871bc84cffbfdd100a",
    "name": "青苗中藥房",
    "phone": "2525-1235",
    "address": "香港中環皇后大道中 99 號中環中心 11 樓"
  }
}
```

#### PUT /api/admin/clinics/:id
Update a clinic.

**Request Body:**
```json
{
  "name": "Updated Clinic Name",
  "phone": "9999-9999"
}
```

#### DELETE /api/admin/clinics/:id
Delete a clinic.

**Response:**
```json
{
  "success": true,
  "message": "診所已刪除"
}
```

---

### Doctor Management 👨‍⚕️

#### GET /api/admin/doctors
List all doctors with their associated services.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "doctors": [
    {
      "_id": "69bc2e881bc84cffbfdd1011",
      "name": "張醫師",
      "nameEn": "Dr. Cheung",
      "type": "TCM",
      "bio": "專長：骨科、痛症",
      "avatar": "/avatars/cheung.jpg",
      "isActive": true,
      "serviceIds": ["69bc2e871bc84cffbfdd100b", "69bc2e871bc84cffbfdd100c"]
    }
  ]
}
```

#### POST /api/admin/doctors
Create a new doctor.

**Request Body (JSON):**
```json
{
  "name": "李醫師",
  "nameEn": "Dr. Lee",
  "type": "TCM",
  "bio": "專長：腸胃、呼吸系統",
  "avatar": "/avatars/lee.jpg",
  "serviceIds": ["69bc2e871bc84cffbfdd100b"],
  "isActive": true
}
```

**Request Body (with Avatar Upload - multipart/form-data):**
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "X-Admin-Token: admin123" \
  -F "name=李醫師" \
  -F "type=TCM" \
  -F "bio=專長：腸胃、呼吸系統" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "serviceIds[]=69bc2e871bc84cffbfdd100b"
```

**Response (201):**
```json
{
  "success": true,
  "doctor": {
    "_id": "69bc2e881bc84cffbfdd1012",
    "name": "李醫師",
    "nameEn": "Dr. Lee",
    "type": "TCM",
    "bio": "專長：腸胃、呼吸系統",
    "avatar": "/uploads/avatars/avatar-1774013250680-386399185.png"
  }
}
```

#### PUT /api/admin/doctors/:id
Update a doctor.

**Request Body (JSON):**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "serviceIds": ["69bc2e871bc84cffbfdd100b", "69bc2e871bc84cffbfdd100c"]
}
```

**Request Body (with Avatar Upload - multipart/form-data):**
```bash
curl -X PUT http://localhost:3000/api/admin/doctors/:id \
  -H "X-Admin-Token: admin123" \
  -F "name=Updated Name" \
  -F "bio=Updated bio" \
  -F "avatar=@/path/to/new-avatar.jpg" \
  -F "serviceIds[]=69bc2e871bc84cffbfdd100b"
```

**Note:** If avatar file is uploaded, it will override the existing avatar. If no file is uploaded but `avatar` field is provided in form data, that URL will be used.

#### DELETE /api/admin/doctors/:id
Delete a doctor (also removes service associations).

**Response:**
```json
{
  "success": true,
  "message": "醫生已刪除"
}
```

---

### Doctor Avatar Upload 📷

#### POST /api/admin/upload/avatar
Upload a doctor's avatar image.

**Request:** `multipart/form-data`
- `avatar` (file) - Image file (max 5MB, images only)

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/upload/avatar \
  -H "X-Admin-Token: admin123" \
  -F "avatar=@/path/to/avatar.jpg"
```

**Response:**
```json
{
  "success": true,
  "avatarUrl": "/uploads/avatars/avatar-1773970492069-142068928.png",
  "message": "頭像上傳成功"
}
```

---

### Service Management 🏷️

#### GET /api/admin/services
List all services.

#### POST /api/admin/services
Create a new service.

**Request Body:**
```json
{
  "name": "新服務",
  "nameEn": "New Service",
  "duration": 30,
  "isActive": true
}
```

#### PUT /api/admin/services/:id
Update a service.

#### DELETE /api/admin/services/:id
Delete a service.

---

### Schedule Management 📅

#### GET /api/admin/schedules
List schedules with optional filters.

**Query Parameters:**
- `doctorId` (optional) - Filter by doctor
- `date` (optional) - Filter by date

**Response:**
```json
{
  "success": true,
  "count": 49,
  "schedules": [
    {
      "_id": "69bc2e881bc84cffbfdd1028",
      "doctorId": "69bc2e881bc84cffbfdd100f",
      "date": "2026-03-19",
      "startTime": "09:00",
      "endTime": "13:00",
      "isOverride": false
    }
  ]
}
```

#### POST /api/admin/schedules
Create a schedule.

**Request Body:**
```json
{
  "doctorId": "69bc2e881bc84cffbfdd100f",
  "date": "2026-03-20",
  "startTime": "09:00",
  "endTime": "18:00",
  "isOverride": false
}
```

#### PUT /api/admin/schedules/:id
Update a schedule.

**Request Body:**
```json
{
  "startTime": "10:00",
  "endTime": "17:00"
}
```

#### DELETE /api/admin/schedules/:id
Delete a schedule.

**Response:**
```json
{
  "success": true,
  "message": "排班已刪除"
}
```

#### POST /api/admin/schedules/batch-copy 🆕
Copy schedules from a source date to multiple target dates.

**Request Body:**
```json
{
  "sourceDate": "2026-03-20",
  "targetDates": ["2026-03-26", "2026-03-27", "2026-03-28"],
  "doctorId": "69bc2e881bc84cffbfdd100f"
}
```

**Response:**
```json
{
  "success": true,
  "message": "成功複製 2 個排班",
  "count": 2,
  "schedules": [
    {
      "_id": "69bca444fd84850b6275d718",
      "doctorId": "69bc2e881bc84cffbfdd100f",
      "date": "2026-03-26",
      "startTime": "09:00",
      "endTime": "18:00",
      "isOverride": false
    }
  ]
}
```

---

### Appointment Management 📋

#### GET /api/admin/appointments
List all appointments with advanced filters.

**Query Parameters:**
- `doctorId` (optional) - Filter by doctor
- `clinicId` (optional) - Filter by clinic
- `date` (optional) - Filter by date
- `status` (optional) - Filter by status (pending, confirmed, cancelled)
- `search` (optional) - Search by patient name or phone
- `sort` (optional) - Sort field (e.g., date, createdAt)
- `order` (optional) - Sort order (asc, desc)

#### GET /api/admin/appointments/:id
Get appointment by ID.

#### PUT /api/admin/appointments/:id
Update an appointment.

#### PUT /api/admin/appointments/:id/status
Update appointment status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid statuses:** `pending`, `confirmed`, `cancelled`

#### DELETE /api/admin/appointments/:id
Cancel/delete an appointment.

---

### System Config ⚙️

#### GET /api/admin/system-config 🆕
Get all system configuration.

**Response:**
```json
{
  "success": true,
  "config": {
    "bookingWindowDays": 30
  }
}
```

#### PUT /api/admin/system-config 🆕
Update system configuration.

**Request Body:**
```json
{
  "bookingWindowDays": 60,
  "maxAppointmentsPerDay": 20
}
```

**Response:**
```json
{
  "success": true,
  "message": "系統配置已更新",
  "config": {
    "bookingWindowDays": {
      "key": "bookingWindowDays",
      "value": 60
    },
    "maxAppointmentsPerDay": {
      "key": "maxAppointmentsPerDay",
      "value": 20
    }
  }
}
```

---

### Legacy Config Routes (Deprecated)

The following routes are kept for backward compatibility but will be removed in future versions:

- `GET /api/admin/config` → Use `GET /api/admin/system-config`
- `PUT /api/admin/config/:key` → Use `PUT /api/admin/system-config`

---

### POST /api/admin/appointments 🆕
Manually create an appointment (admin only).

**Request Body:**
```json
{
  "name": "張三",
  "phone": "91234567",
  "doctorId": 1,
  "date": "2026-03-15",
  "time": "09:00",
  "serviceId": 2,
  "clinicId": 1,
  "notes": "行政預約",
  "status": "confirmed",
  "overrideSchedule": false
}
```

**Required Fields:**
- `name` - Patient name
- `phone` - Contact phone
- `doctorId` - Doctor ID
- `date` - Appointment date (YYYY-MM-DD)
- `time` - Appointment time (HH:MM)

**Optional Fields:**
- `serviceId` - Service ID
- `clinicId` - Clinic ID (defaults to doctor's clinic)
- `notes` - Additional notes
- `status` - Initial status (default: "confirmed")
- `overrideSchedule` - Boolean to override schedule conflicts (default: false)

**Admin Override:**
- Set `overrideSchedule: true` to book even if:
  - Time slot conflicts with existing appointment
  - Doctor has no schedule for that date

**Success Response (201):**
```json
{
  "success": true,
  "message": "預約已成功建立",
  "appointment": {
    "id": 1,
    "name": "張三",
    "phone": "91234567",
    "doctorId": 1,
    "doctorName": "陳醫師",
    "serviceId": 2,
    "serviceName": "中醫師 - 治療",
    "clinicId": 1,
    "clinicName": "青苗綜合醫療診所",
    "date": "2026-03-15",
    "time": "09:00",
    "duration": 45,
    "status": "confirmed",
    "notes": "行政預約",
    "createdBy": "admin",
    "createdAt": "2026-03-12T12:30:00.000Z"
  }
}
```

**Conflict Error (409):**
```json
{
  "success": false,
  "error": "此時段與現有預約衝突",
  "conflicts": [
    {
      "id": 5,
      "patientName": "李四",
      "time": "09:00",
      "duration": 45,
      "overlap": "09:00-09:45",
      "status": "confirmed"
    }
  ],
  "hint": "設置 overrideSchedule=true 可強制建立"
}
```

---

### POST /api/admin/appointments/:id/status 🆕
Change appointment status (admin only).

**Request Body:**
```json
{
  "status": "completed",
  "reason": "Patient arrived and treatment completed"
}
```

**Valid Statuses:**
- `confirmed` - Appointment confirmed
- `pending` - Awaiting confirmation
- `cancelled` - Cancelled
- `completed` - Treatment completed
- `no-show` - Patient didn't show up

**Status Transitions:**
```
confirmed → pending, cancelled, completed, no-show
pending → confirmed, cancelled
cancelled → confirmed (reactivate)
completed → (terminal state, no transitions)
no-show → confirmed (reactivate)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "預約狀態已更新",
  "appointment": { ... },
  "previousStatus": "confirmed",
  "newStatus": "completed"
}
```

**Invalid Transition Error (400):**
```json
{
  "success": false,
  "error": "不允許的狀態轉換：completed -> confirmed",
  "allowedTransitions": [],
  "currentStatus": "completed"
}
```

---

### GET /api/admin/audit-logs 🆕
View audit trail (admin only).

**Query Parameters:**
- `entityType` (optional) - Filter by entity type (appointment, sms_verification, etc.)
- `entityId` (optional) - Filter by entity ID
- `action` (optional) - Filter by action type
- `limit` (optional) - Max results (default: 100)

**Example:**
```bash
curl -H "X-Admin-Token: admin123" \
  "https://booking-system-backend-2t8v.onrender.com/api/admin/audit-logs?entityType=appointment&limit=50"
```

**Response:**
```json
{
  "success": true,
  "total": 15,
  "returned": 15,
  "auditLogs": [
    {
      "id": 15,
      "timestamp": "2026-03-12T12:30:00.000Z",
      "action": "appointment_status_changed",
      "entityType": "appointment",
      "entityId": 5,
      "details": {
        "from": "confirmed",
        "to": "completed",
        "reason": "Treatment completed"
      },
      "adminId": "admin"
    },
    {
      "id": 14,
      "timestamp": "2026-03-12T12:25:00.000Z",
      "action": "sms_verified",
      "entityType": "sms_verification",
      "entityId": 3,
      "details": {
        "phone": "91234567"
      },
      "adminId": "system"
    }
  ]
}
```

---

### GET /api/admin/appointments
Get all appointments with advanced filters (requires admin token).

**Query Parameters:**
- `date` - Filter by date
- `startDate` + `endDate` - Filter by date range
- `doctorId` - Filter by doctor
- `clinicId` - Filter by clinic
- `status` - Filter by status
- `search` - Search by name or phone

### PUT /api/admin/appointments/:id
Update an appointment (requires admin token).

### DELETE /api/admin/appointments/:id
Cancel an appointment (requires admin token).

### GET /api/admin/doctors/schedule
Get doctor schedule (requires admin token).

**Query Parameters:**
- `date` - Single date
- `startDate` + `endDate` - Date range
- `doctorId` (optional) - Filter by doctor

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (appointment booked) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid admin token) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (slot already booked) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "required": ["field1", "field2"] // for validation errors
}
```

### Common Errors

**Missing Required Fields:**
```json
{
  "success": false,
  "error": "缺少必要欄位",
  "required": ["name", "phone", "doctorId", "date", "time"]
}
```

**Invalid Date Format:**
```json
{
  "success": false,
  "error": "日期格式錯誤，請使用 YYYY-MM-DD"
}
```

**Slot Already Booked:**
```json
{
  "success": false,
  "error": "此時段已被預約"
}
```

**Doctor Not Available:**
```json
{
  "success": false,
  "error": "該醫生暫時不接受預約"
}
```

---

## Service Duration Configuration

| Service | Duration |
|---------|----------|
| 中醫師 - 問診 | 15 分鐘 |
| 中醫師 - 治療 | 45 分鐘 |
| 物理治療師 | 60 分鐘 |
| 中醫正骨師 | 60 分鐘 |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `ADMIN_PASSWORD` | Admin password | admin123 |
| `CORS_ORIGIN` | CORS allowed origin | * |
| `NODE_ENV` | Environment | development |
| `SELF_URL` | Self-ping URL | https://booking-system-backend-2t8v.onrender.com |

---

## Example Usage

### Book an Appointment

```bash
curl -X POST https://booking-system-backend-2t8v.onrender.com/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "張三",
    "phone": "9123-4567",
    "doctorId": 1,
    "date": "2026-03-15",
    "time": "09:00",
    "serviceId": 2
  }'
```

### Get Available Slots

```bash
curl https://booking-system-backend-2t8v.onrender.com/api/doctors/1/available-slots?date=2026-03-15
```

### Admin: Get All Appointments

```bash
curl -H "X-Admin-Token: admin123" \
  https://booking-system-backend-2t8v.onrender.com/api/admin/appointments
```

---

## Changelog

### v0.3.0 (2026-03-20) - Sprint 1.5: Admin Features Complete 🆕

**New Admin APIs:**
- ✅ Clinic Management (CRUD): `GET/POST/PUT/DELETE /api/admin/clinics`
- ✅ Doctor Management (CRUD): `GET/POST/PUT/DELETE /api/admin/doctors`
- ✅ Doctor Avatar Upload: `POST /api/admin/upload/avatar` (multipart/form-data, max 5MB)
- ✅ Service Management (CRUD): `GET/POST/PUT/DELETE /api/admin/services`
- ✅ Schedule Management (CRUD): `GET/POST/PUT/DELETE /api/admin/schedules`
- ✅ Batch Schedule Copy: `POST /api/admin/schedules/batch-copy` (copy schedules to multiple dates)
- ✅ System Config: `GET/PUT /api/admin/system-config`
- ✅ Enhanced Appointment Management with search, sort, and status updates

**Improvements:**
- ✅ All admin routes properly protected with authentication middleware
- ✅ Consistent error handling and logging
- ✅ Service association management for doctors
- ✅ File upload with validation (image types only, 5MB limit)
- ✅ Batch operations for efficient schedule management

**Known Issues:**
- None - All endpoints tested and working ✅

**Test Results (2026-03-20 21:30):**
- ✅ GET /api/admin/clinics - Returns JSON with clinic list
- ✅ POST /api/admin/clinics - Creates clinic successfully
- ✅ PUT /api/admin/clinics/:id - Updates clinic successfully
- ✅ DELETE /api/admin/clinics/:id - Deletes clinic successfully
- ✅ GET /api/admin/doctors - Returns JSON with doctor list and serviceIds
- ✅ POST /api/admin/doctors - Creates doctor (supports avatar upload via multipart/form-data)
- ✅ PUT /api/admin/doctors/:id - Updates doctor (supports avatar upload via multipart/form-data)
- ✅ DELETE /api/admin/doctors/:id - Deletes doctor and service associations
- ✅ GET /api/admin/services - Returns JSON with service list
- ✅ POST /api/admin/services - Creates service successfully
- ✅ PUT /api/admin/services/:id - Updates service successfully
- ✅ DELETE /api/admin/services/:id - Deletes service successfully
- ✅ GET /api/admin/system-config - Returns system configuration
- ✅ PUT /api/admin/system-config - Updates system configuration

---

### v0.3.0 (2026-03-12) - Sprint 2 🆕

**New Features:**
- ✅ SMS Verification API (`POST /api/sms/send`, `POST /api/sms/verify`)
- ✅ Rate limiting (1 SMS per 60 seconds per phone)
- ✅ Code expiry (5 minutes)
- ✅ Admin manual appointment creation (`POST /api/admin/appointments`)
- ✅ Admin status change endpoint (`POST /api/admin/appointments/:id/status`)
- ✅ Audit trail logging system
- ✅ Admin audit logs endpoint (`GET /api/admin/audit-logs`)

**Improvements:**
- ✅ Double booking detection with time overlap check (not just exact match)
- ✅ Admin override for schedule conflicts
- ✅ Status transition validation
- ✅ Status history tracking on appointments
- ✅ Enhanced error responses with conflict details
- ✅ Automatic cleanup of expired SMS codes (every 5 minutes)

**Database:**
- ✅ New table: `sms_verifications`
- ✅ New table: `audit_logs`
- ✅ Enhanced `appointments` table with audit fields

---

### v0.2.0 (2026-03-12) - Sprint 1

**New Features:**
- ✅ Added `clinics` table (2 clinics)
- ✅ Added `services` table (4 services with duration)
- ✅ Added `doctors` table (10 doctors with specialties)
- ✅ Added `schedules` table (doctor availability)
- ✅ Enhanced `appointments` table (links to clinics, services, doctors)
- ✅ New API: `GET /api/clinics`
- ✅ New API: `GET /api/services`
- ✅ New API: `GET /api/doctors/:id/available-slots`
- ✅ Enhanced `POST /api/appointments` with validation
- ✅ Enhanced `GET /api/appointments` with filters

**Improvements:**
- ✅ Consistent error handling
- ✅ Input validation on all endpoints
- ✅ Console logging for debugging
- ✅ CORS configuration
- ✅ Environment variables support

---

**Contact:** info@chingyiu.com  
**Support:** 2525-1234
