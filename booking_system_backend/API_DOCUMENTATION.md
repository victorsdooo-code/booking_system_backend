# 🏥 青苗綜合醫療診所預約系統 API 文檔

**Version:** v0.3.0 (Sprint 2)  
**Base URL:** `https://booking-system-backend-2t8v.onrender.com`  
**Last Updated:** 2026-03-12

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

## Admin API

### POST /api/admin/login
Employee login.

**Request Body:**
```json
{
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "登入成功",
  "token": "admin123",
  "expiresIn": "24h"
}
```

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
