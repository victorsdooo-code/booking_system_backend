# Sprint 2 - Backend Development (v0.3.0)

**Priority:** 🔴 HIGH  
**Assigned by:** Scrum Master  
**Date:** 2026-03-12  
**Time:** 20:40  
**Sprint:** 2 of 4  
**Deadline:** 2026-03-15/03-16 (3-4 days)

---

## 📋 Sprint 2 Features Overview

### 1️⃣ SMS Verification API
**Status:** 🆕 NOT STARTED

**Endpoints:**
- `POST /api/sms/send` - Send 6-digit verification code
- `POST /api/sms/verify` - Verify code

**Requirements:**
- Rate limiting: 1 request per 60 seconds per phone number
- Code expiry: 5 minutes
- Database: `sms_verifications` table
- 6-digit numeric code generation

**Database Schema:**
```sql
CREATE TABLE sms_verifications (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL
);

CREATE INDEX idx_sms_phone ON sms_verifications(phone);
CREATE INDEX idx_sms_expires ON sms_verifications(expires_at);
```

---

### 2️⃣ Admin API Enhancements
**Status:** 🟡 PARTIALLY COMPLETE

**Existing (Sprint 1):**
- ✅ `POST /api/admin/login` - Employee login
- ✅ `GET /api/admin/appointments` - All appointments (with filters)
- ✅ `PUT /api/admin/appointments/:id` - Update appointment
- ✅ `DELETE /api/admin/appointments/:id` - Cancel appointment
- ✅ `GET /api/admin/doctors/schedule` - Doctor schedule

**New (Sprint 2):**
- 🆕 `POST /api/admin/appointments` - Manual appointment creation
- 🆕 `POST /api/admin/appointments/:id/status` - Change appointment status

**Requirements for Manual Creation:**
- Same validation as public booking
- Admin can override some validations (e.g., book outside schedule)
- Audit trail: who created the appointment

**Requirements for Status Change:**
- Valid statuses: confirmed, pending, cancelled, completed, no-show
- Audit trail: who changed status, when, from what to what

---

### 3️⃣ Double Booking Detection
**Status:** 🆕 NOT STARTED

**Helper Function:**
```javascript
checkDoubleBooking(doctorId, date, time, duration)
```

**Returns:**
```json
{
  "hasConflict": boolean,
  "conflictingAppointments": [
    {
      "id": 1,
      "patientName": "張三",
      "time": "09:00",
      "duration": 45,
      "overlap": "09:00-09:45"
    }
  ]
}
```

**Requirements:**
- Check for time overlaps (not just exact matches)
- Consider service duration
- Audit trail logging
- Use in appointment creation/update flows

---

## 🎯 Implementation Plan

### Phase 1: Double Booking Detection (Priority: HIGH)
**Why first:** Needed by SMS verification and admin manual creation

**Steps:**
1. Create `checkDoubleBooking()` helper function
2. Create `logAudit()` helper function for audit trail
3. Integrate into existing `POST /api/appointments`
4. Integrate into `PUT /api/admin/appointments/:id`
5. Test edge cases (overlapping durations)

**Estimated time:** 2-3 hours

---

### Phase 2: Admin API Enhancements
**Steps:**
1. Add `POST /api/admin/appointments` endpoint
   - Similar to public booking but with admin overrides
   - Add `createdBy` field for audit
2. Add `POST /api/admin/appointments/:id/status` endpoint
   - Validate status transitions
   - Log audit trail
3. Update appointment model to include audit fields:
   - `createdBy` (admin/user)
   - `statusHistory` array

**Estimated time:** 2-3 hours

---

### Phase 3: SMS Verification API
**Steps:**
1. Create `sms_verifications` in-memory store (or DB table)
2. Implement code generation (6-digit random)
3. Implement `POST /api/sms/send`:
   - Rate limiting check
   - Generate code
   - Store with expiry
   - Mock SMS sending (log to console)
4. Implement `POST /api/sms/verify`:
   - Find code by phone
   - Check expiry
   - Check code match
   - Mark as verified
5. Add cleanup for expired codes

**Estimated time:** 3-4 hours

---

### Phase 4: Testing & Documentation
**Steps:**
1. Test all new endpoints
2. Update API_DOCUMENTATION.md
3. Update version to v0.3.0
4. Write migration SQL for new tables
5. Update work-log.md and memory

**Estimated time:** 2 hours

---

## 📊 Total Estimated Effort
- **Development:** 9-12 hours
- **Testing & Docs:** 2 hours
- **Total:** 11-14 hours (~2 working days)

---

## 🗓️ Timeline

| Date | Task | Status |
|------|------|--------|
| 2026-03-12 | Planning & Double Booking | ⏳ TODO |
| 2026-03-13 | Admin API + SMS API | ⏳ TODO |
| 2026-03-14 | Testing + Documentation | ⏳ TODO |
| 2026-03-15 | Buffer + Deployment | ⏳ TODO |

---

## 📝 Deliverables

1. **Code:**
   - Updated `server.js` with all new features
   - New migration SQL for `sms_verifications` table
   - Audit trail logging

2. **Documentation:**
   - Updated `API_DOCUMENTATION.md`
   - Version bumped to v0.3.0

3. **Logs:**
   - Updated `work-log.md`
   - Updated `memory/2026-03-12.md`

---

## 🔧 Technical Notes

### Rate Limiting Implementation
```javascript
const smsRateLimits = new Map(); // phone -> lastSendTime

function canSendSMS(phone) {
  const lastSend = smsRateLimits.get(phone);
  if (!lastSend) return true;
  return Date.now() - lastSend > 60000; // 60 seconds
}
```

### Code Generation
```javascript
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### Double Booking Logic
```javascript
function checkDoubleBooking(doctorId, date, time, duration) {
  const appointmentStart = timeToMinutes(time);
  const appointmentEnd = appointmentStart + duration;
  
  const conflicts = appointments.filter(appt => {
    if (appt.doctorId !== doctorId || appt.date !== date) return false;
    if (appt.status === 'cancelled') return false;
    
    const apptStart = timeToMinutes(appt.time);
    const apptEnd = apptStart + appt.duration;
    
    // Check overlap
    return appointmentStart < apptEnd && appointmentEnd > apptStart;
  });
  
  return {
    hasConflict: conflicts.length > 0,
    conflictingAppointments: conflicts
  };
}
```

### Audit Trail
```javascript
const auditLogs = [];

function logAudit(action, entityType, entityId, details, adminId) {
  auditLogs.push({
    id: auditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    details,
    adminId
  });
}
```

---

## ✅ Definition of Done

- [ ] All 3 features implemented
- [ ] All endpoints tested manually
- [ ] API documentation updated
- [ ] Migration SQL written
- [ ] Work log updated
- [ ] Memory updated
- [ ] Version bumped to v0.3.0
- [ ] Code committed to git

---

**Start Time:** 2026-03-12 20:40  
**Target Completion:** 2026-03-14
