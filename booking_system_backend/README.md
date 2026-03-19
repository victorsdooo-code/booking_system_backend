# 青苗綜合醫療診所預約系統 - Backend v0.3.0

Ching Yiu Integrated Medical Clinic Booking System

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud instance)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017

# Seed the database
npm run seed

# Start the server
npm start
```

## API Endpoints

### Public APIs (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/clinics` | List all clinics |
| GET | `/api/doctors` | List doctors (query: `clinicId`, `type`) |
| GET | `/api/services` | List services (query: `doctorId`) |
| GET | `/api/slots` | Get available slots (query: `doctorId`, `date`, `serviceId`) |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/config` | Get system configuration |

### Admin APIs (Require `X-Admin-Token` header)

Default admin password: `admin123`

#### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/doctors` | List all doctors |
| POST | `/api/admin/doctors` | Create doctor |
| PUT | `/api/admin/doctors/:id` | Update doctor |
| DELETE | `/api/admin/doctors/:id` | Delete doctor |

#### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/services` | List all services |
| POST | `/api/admin/services` | Create service |
| PUT | `/api/admin/services/:id` | Update service |
| DELETE | `/api/admin/services/:id` | Delete service |

#### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/schedules` | List schedules (query: `doctorId`, `date`) |
| POST | `/api/admin/schedules` | Create schedule |
| PUT | `/api/admin/schedules/:id` | Update schedule |
| DELETE | `/api/admin/schedules/:id` | Delete schedule |

#### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/appointments` | List appointments (query: `doctorId`, `clinicId`, `date`, `status`) |
| GET | `/api/admin/appointments/:id` | Get appointment by ID |
| PUT | `/api/admin/appointments/:id` | Update appointment |
| PUT | `/api/admin/appointments/:id/status` | Update status only |
| DELETE | `/api/admin/appointments/:id` | Delete appointment |

#### System Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/config` | Get all config |
| PUT | `/api/admin/config/:key` | Update config value |

## Example Requests

### Create Appointment (Public)
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "67d...",
    "doctorId": "67d...",
    "serviceId": "67d...",
    "date": "2026-03-20",
    "time": "10:00",
    "patientName": "張先生",
    "patientPhone": "91234567",
    "notes": "第一次就診"
  }'
```

### Get Available Slots
```bash
curl "http://localhost:3000/api/slots?doctorId=67d...&date=2026-03-20&serviceId=67d..."
```

### Admin: Update Appointment Status
```bash
curl -X PUT http://localhost:3000/api/admin/appointments/:id/status \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: admin123" \
  -d '{"status": "confirmed"}'
```

## Database Schema

### Collections
1. **clinics** - Clinic information
2. **doctors** - Doctor profiles
3. **services** - Available services with duration
4. **doctor_services** - Doctor-service relationships
5. **schedules** - Doctor availability schedules
6. **appointments** - Booking records
7. **system_config** - System configuration

See `memory/2026-03-19.md` for detailed schema documentation.

## Development

```bash
# Start in development mode
npm run dev

# Re-seed database (clears existing data)
npm run seed
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| MONGODB_URI | mongodb://localhost:27017 | MongoDB connection string |
| DB_NAME | qingyiu_clinic | Database name |
| CORS_ORIGIN | * | CORS allowed origin |
| ADMIN_PASSWORD | admin123 | Admin authentication password |

---

**Version:** 0.3.0  
**Sprint:** 1 - Backend Development  
**Date:** 2026-03-19
