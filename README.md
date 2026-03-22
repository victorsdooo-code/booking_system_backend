# 青苗綜合醫療診所預約系統 - Backend API

**Qingyiu Integrated Medical Clinic Booking System - Backend**

Version: 1.0.0

## 📋 Overview

RESTful API backend for the Qingyiu Clinic appointment booking system. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **6 Core API Modules:**
  - Clinic Management
  - Doctor Management
  - Service Management
  - Doctor-Service Mappings
  - Schedule Management
  - Appointment Management

- **26+ API Endpoints** for complete CRUD operations
- **JWT Authentication** for admin access
- **MongoDB/Mongoose** for data persistence
- **Express Validator** for input validation
- **CORS Support** for frontend integration

## 📁 Project Structure

```
booking_system_backend/
├── server.js                 # Express server entry point
├── package.json              # Dependencies & scripts
├── models/
│   ├── db.js                 # MongoDB connection
│   ├── index.js              # Models export
│   ├── Clinic.js             # Clinic model
│   ├── Doctor.js             # Doctor model
│   ├── Service.js            # Service model
│   ├── DoctorService.js      # Doctor-Service mapping
│   ├── Schedule.js           # Schedule model
│   └── Appointment.js        # Appointment model
├── routes/
│   └── admin.js              # All admin API endpoints
├── middleware/
│   └── authenticateAdmin.js  # JWT authentication
├── seeds/
│   └── seed.js               # Default data seeding
├── .env.example              # Environment variables template
├── GITHUB_REPO_SETUP.md      # GitHub setup instructions
└── RENDER_SETUP.md           # Render deployment guide
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose 8.0
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** bcryptjs, cors

## 🏃 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

### 3. Seed Database (Optional)

```bash
npm run seed
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## 📡 API Endpoints

All endpoints require JWT authentication (Bearer token in Authorization header).

### Clinic Endpoints
- `GET /api/admin/clinics` - Get all clinics
- `GET /api/admin/clinics/:id` - Get clinic by ID
- `POST /api/admin/clinics` - Create clinic
- `PUT /api/admin/clinics/:id` - Update clinic

### Doctor Endpoints
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/doctors/:id` - Get doctor by ID
- `POST /api/admin/doctors` - Create doctor
- `PUT /api/admin/doctors/:id` - Update doctor

### Service Endpoints
- `GET /api/admin/services` - Get all services
- `GET /api/admin/services/:id` - Get service by ID
- `POST /api/admin/services` - Create service
- `PUT /api/admin/services/:id` - Update service

### Doctor-Service Endpoints
- `GET /api/admin/doctor-services` - Get all mappings
- `POST /api/admin/doctor-services` - Create mapping
- `DELETE /api/admin/doctor-services/:id` - Delete mapping
- `GET /api/admin/doctors/:id/services` - Get doctor's services

### Schedule Endpoints
- `GET /api/admin/schedules` - Get all schedules
- `GET /api/admin/schedules/:id` - Get schedule by ID
- `POST /api/admin/schedules` - Create schedule
- `PUT /api/admin/schedules/:id` - Update schedule

### Appointment Endpoints
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/appointments/:id` - Get appointment by ID
- `POST /api/admin/appointments` - Create appointment
- `PUT /api/admin/appointments/:id` - Update appointment
- `PATCH /api/admin/appointments/:id/status` - Update status
- `DELETE /api/admin/appointments/:id` - Delete appointment

### Statistics Endpoints
- `GET /api/admin/stats/overview` - Get overview stats
- `GET /api/admin/stats/today` - Get today's appointments

### Public Endpoints (No Auth Required)
- `GET /` - API info
- `GET /api/health` - Health check

## 🔐 Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 Deployment

### Render Deployment

1. Create GitHub repo and push code
2. Connect repo to Render
3. Set environment variables (MONGODB_URI, JWT_SECRET, etc.)
4. Deploy

See `RENDER_SETUP.md` for detailed instructions.

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (default: development) |
| `JWT_SECRET` | Yes | JWT signing secret |

## 🧪 Testing

Test the API with:

```bash
# Health check
curl http://localhost:3000/api/health

# With authentication
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/clinics
```

## 📄 License

MIT

## 👨‍💻 Author

Victor - 青苗綜合醫療診所

---

**Built for the Qingyiu Clinic Booking System v1.0.0**
