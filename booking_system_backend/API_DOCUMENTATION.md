# 🏥 青苗綜合醫療診所預約系統 API 文檔

**Version:** v0.2.0 (Sprint 1)  
**Base URL:** `https://booking-system-backend-2t8v.onrender.com`  
**Last Updated:** 2026-03-12

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Clinics API](#clinics-api)
4. [Services API](#services-api)
5. [Doctors API](#doctors-api)
6. [Appointments API](#appointments-api)
7. [Admin API](#admin-api)
8. [Error Handling](#error-handling)

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
