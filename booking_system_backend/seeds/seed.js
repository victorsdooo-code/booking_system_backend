const { connectDB, closeDB, Clinic, Doctor, Service, DoctorService, Schedule, Appointment, SystemConfig } = require('../models');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing data
    const db = require('../models/db').getDB();
    await db.collection('clinics').deleteMany({});
    await db.collection('doctors').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('doctor_services').deleteMany({});
    await db.collection('schedules').deleteMany({});
    await db.collection('appointments').deleteMany({});
    await db.collection('system_config').deleteMany({});
    console.log('🧹 Cleared existing data');

    // 1. Seed Clinics (2 診所)
    const clinics = await Promise.all([
      Clinic.createClinic({
        name: "青苗綜合醫療診所",
        nameEn: "Ching Yiu Integrated Medical Clinic",
        address: "香港中環皇后大道中 99 號中環中心 12 樓",
        phone: "2525-1234"
      }),
      Clinic.createClinic({
        name: "青苗中藥房",
        nameEn: "Ching Yiu Chinese Medicine Pharmacy",
        address: "香港中環皇后大道中 99 號中環中心 11 樓",
        phone: "2525-1235"
      })
    ]);
    console.log(`✅ Seeded ${clinics.length} clinics`);

    // 2. Seed Services (4 服務)
    const services = await Promise.all([
      Service.createService({ name: "問診", nameEn: "Consultation", duration: 15 }),
      Service.createService({ name: "治療", nameEn: "Treatment", duration: 45 }),
      Service.createService({ name: "物理治療", nameEn: "Physiotherapy", duration: 60 }),
      Service.createService({ name: "中醫正骨", nameEn: "TCM Bone Setting", duration: 60 })
    ]);
    console.log(`✅ Seeded ${services.length} services`);

    // 3. Seed Doctors (10 醫生)
    const doctors = await Promise.all([
      // TCM Doctors (5)
      Doctor.createDoctor({ name: "陳醫師", nameEn: "Dr. Chan", type: "TCM", bio: "專長：內科、婦科", avatar: "/avatars/chan.jpg" }),
      Doctor.createDoctor({ name: "李醫師", nameEn: "Dr. Lee", type: "TCM", bio: "專長：兒科、皮膚科", avatar: "/avatars/lee.jpg" }),
      Doctor.createDoctor({ name: "張醫師", nameEn: "Dr. Cheung", type: "TCM", bio: "專長：骨科、痛症", avatar: "/avatars/cheung.jpg" }),
      Doctor.createDoctor({ name: "王醫師", nameEn: "Dr. Wong", type: "TCM", bio: "專長：腸胃、呼吸系統", avatar: "/avatars/wong.jpg" }),
      Doctor.createDoctor({ name: "林醫師", nameEn: "Dr. Lam", type: "TCM", bio: "專長：神經系統、失眠", avatar: "/avatars/lam.jpg" }),
      // Physiotherapists (3)
      Doctor.createDoctor({ name: "黃物理治療師", nameEn: "Wong Physio", type: "Physio", bio: "專長：運動創傷、復康", avatar: "/avatars/wong_physio.jpg" }),
      Doctor.createDoctor({ name: "周物理治療師", nameEn: "Chau Physio", type: "Physio", bio: "專長：脊椎、關節", avatar: "/avatars/chau.jpg" }),
      Doctor.createDoctor({ name: "蔡物理治療師", nameEn: "Choi Physio", type: "Physio", bio: "專長：頸椎、腰椎", avatar: "/avatars/choi.jpg" }),
      // Bone Setters (2)
      Doctor.createDoctor({ name: "吳正骨師", nameEn: "Ng Bone Setter", type: "Bone", bio: "專長：傳統正骨、跌打", avatar: "/avatars/ng.jpg" }),
      Doctor.createDoctor({ name: "鄭正骨師", nameEn: "Cheng Bone Setter", type: "Bone", bio: "專長：頸椎、腰椎調整", avatar: "/avatars/cheng.jpg" })
    ]);
    console.log(`✅ Seeded ${doctors.length} doctors`);

    // 4. Seed Doctor-Service Relationships
    const serviceIds = services.map(s => s._id);
    const doctorIds = doctors.map(d => d._id);
    
    // TCM doctors offer 問診 (serviceIds[0]) and 治療 (serviceIds[1])
    await Promise.all(doctorIds.slice(0, 5).map(doctorId => 
      DoctorService.updateDoctorServices(doctorId, [serviceIds[0], serviceIds[1]])
    ));
    
    // Physio doctors offer 物理治療 (serviceIds[2])
    await Promise.all(doctorIds.slice(5, 8).map(doctorId => 
      DoctorService.updateDoctorServices(doctorId, [serviceIds[2]])
    ));
    
    // Bone setters offer 中醫正骨 (serviceIds[3])
    await Promise.all(doctorIds.slice(8, 10).map(doctorId => 
      DoctorService.updateDoctorServices(doctorId, [serviceIds[3]])
    ));
    console.log('✅ Seeded doctor-service relationships');

    // 5. Seed System Config
    await SystemConfig.setConfig('bookingWindowDays', 30);
    console.log('✅ Seeded system config');

    // 6. Seed Sample Schedules (for next 7 days)
    const today = new Date();
    const schedules = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Skip Sunday (0)
      if (dayOfWeek === 0) continue;
      
      // TCM doctors (0-4): Mon/Wed/Fri morning, Tue/Thu afternoon
      for (let j = 0; j < 5; j++) {
        if ([1, 3, 5].includes(dayOfWeek)) {
          schedules.push({ doctorId: doctorIds[j], date: dateStr, startTime: "09:00", endTime: "13:00" });
        } else if ([2, 4].includes(dayOfWeek)) {
          schedules.push({ doctorId: doctorIds[j], date: dateStr, startTime: "14:00", endTime: "18:00" });
        }
      }
      
      // Physio (5-7): Mon-Fri full day
      for (let j = 5; j < 8; j++) {
        if ([1, 2, 3, 4, 5].includes(dayOfWeek)) {
          schedules.push({ doctorId: doctorIds[j], date: dateStr, startTime: "09:00", endTime: "18:00" });
        }
      }
      
      // Bone setters (8-9): Mon/Wed/Fri
      for (let j = 8; j < 10; j++) {
        if ([1, 3, 5].includes(dayOfWeek)) {
          schedules.push({ doctorId: doctorIds[j], date: dateStr, startTime: "09:00", endTime: "18:00" });
        }
      }
    }
    
    for (const schedule of schedules) {
      await Schedule.createSchedule(schedule);
    }
    console.log(`✅ Seeded ${schedules.length} schedules`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Clinics: ${clinics.length}`);
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run if called directly
if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };
