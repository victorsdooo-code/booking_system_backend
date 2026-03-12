-- ============================================
-- Database Migration Script
-- Sprint 1 - Backend Enhancements v0.2.0
-- Date: 2026-03-12
-- ============================================

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    services TEXT[], -- Array of service categories
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2),
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    specialty VARCHAR(255),
    clinic_id INTEGER REFERENCES clinics(id),
    service_ids INTEGER[], -- Array of service IDs
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table (doctor availability)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id),
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update appointments table (add new columns)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id),
ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(id),
ADD COLUMN IF NOT EXISTS service_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_schedules_doctor_id ON schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);

-- ============================================
-- Seed Data
-- ============================================

-- Insert clinics
INSERT INTO clinics (id, name, name_en, address, phone, email, services) VALUES
(1, '青苗綜合醫療診所', 'Ching Yiu Integrated Medical Clinic', '香港中環皇后大道中 99 號中環中心 12 樓', '2525-1234', 'info@chingyiu.com', ARRAY['中醫', '物理治療', '中醫正骨']),
(2, '青苗中藥房', 'Ching Yiu Chinese Medicine Pharmacy', '香港中環皇后大道中 99 號中環中心 11 樓', '2525-1235', 'pharmacy@chingyiu.com', ARRAY['中藥配藥', '藥膳諮詢'])
ON CONFLICT (id) DO NOTHING;

-- Insert services
INSERT INTO services (id, name, name_en, duration, price, category, description) VALUES
(1, '中醫師 - 問診', 'TCM Doctor - Consultation', 15, 300, '中醫', '初步診斷及諮詢'),
(2, '中醫師 - 治療', 'TCM Doctor - Treatment', 45, 600, '中醫', '針灸、中藥治療等'),
(3, '物理治療師', 'Physiotherapist', 60, 800, '物理治療', '物理治療及復康'),
(4, '中醫正骨師', 'TCM Bone Setter', 60, 700, '中醫正骨', '正骨及關節調整')
ON CONFLICT (id) DO NOTHING;

-- Insert doctors
INSERT INTO doctors (id, name, name_en, type, specialty, clinic_id, service_ids, available) VALUES
(1, '陳醫師', 'Dr. Chan', '中醫', '內科、婦科', 1, ARRAY[1, 2], true),
(2, '李醫師', 'Dr. Lee', '中醫', '兒科、皮膚科', 1, ARRAY[1, 2], true),
(3, '張醫師', 'Dr. Cheung', '中醫', '骨科、痛症', 1, ARRAY[1, 2], true),
(4, '王醫師', 'Dr. Wong', '中醫', '腸胃、呼吸系統', 1, ARRAY[1, 2], false),
(5, '林醫師', 'Dr. Lam', '中醫', '神經系統、失眠', 2, ARRAY[1, 2], true),
(6, '黃物理治療師', 'Wong Physiotherapist', '物理治療', '運動創傷、復康', 1, ARRAY[3], true),
(7, '周物理治療師', 'Chau Physiotherapist', '物理治療', '脊椎、關節', 1, ARRAY[3], true),
(8, '吳正骨師', 'Ng Bone Setter', '中醫正骨', '傳統正骨、跌打', 1, ARRAY[4], true),
(9, '鄭正骨師', 'Cheng Bone Setter', '中醫正骨', '頸椎、腰椎', 2, ARRAY[4], true),
(10, '劉醫師', 'Dr. Lau', '中醫', '調理、養生', 2, ARRAY[1, 2], true)
ON CONFLICT (id) DO NOTHING;

-- Insert schedules
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, available) VALUES
-- 陳醫師 - 週一、三、五上午
(1, 1, '09:00', '13:00', true),
(1, 3, '09:00', '13:00', true),
(1, 5, '09:00', '13:00', true),
-- 李醫師 - 週二、四、六
(2, 2, '09:00', '18:00', true),
(2, 4, '09:00', '18:00', true),
(2, 6, '09:00', '13:00', true),
-- 張醫師 - 週一、三、五下午
(3, 1, '14:00', '18:00', true),
(3, 3, '14:00', '18:00', true),
(3, 5, '14:00', '18:00', true),
-- 王醫師 - 週二、四 (unavailable)
(4, 2, '09:00', '18:00', false),
(4, 4, '09:00', '18:00', false),
-- 林醫師 - 週一至五
(5, 1, '09:00', '18:00', true),
(5, 2, '09:00', '18:00', true),
(5, 3, '09:00', '18:00', true),
(5, 4, '09:00', '18:00', true),
(5, 5, '09:00', '18:00', true),
-- 黃物理治療師 - 週一至五
(6, 1, '09:00', '18:00', true),
(6, 2, '09:00', '18:00', true),
(6, 3, '09:00', '18:00', true),
(6, 4, '09:00', '18:00', true),
(6, 5, '09:00', '18:00', true),
-- 周物理治療師 - 週六
(7, 6, '09:00', '18:00', true),
-- 吳正骨師 - 週一、三、五
(8, 1, '09:00', '18:00', true),
(8, 3, '09:00', '18:00', true),
(8, 5, '09:00', '18:00', true),
-- 鄭正骨師 - 週二、四、六
(9, 2, '09:00', '18:00', true),
(9, 4, '09:00', '18:00', true),
(9, 6, '09:00', '13:00', true),
-- 劉醫師 - 週一至五
(10, 1, '09:00', '18:00', true),
(10, 2, '09:00', '18:00', true),
(10, 3, '09:00', '18:00', true),
(10, 4, '09:00', '18:00', true),
(10, 5, '09:00', '18:00', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Notes:
-- ============================================
-- Run this migration with: psql -d your_database -f migration.sql
-- For PostgreSQL database
-- Adjust SERIAL to AUTO_INCREMENT if using MySQL
-- Adjust data types as needed for your database system
