require('dotenv').config();
const mongoose = require('mongoose');
const { Clinic, Doctor, Service, DoctorService, Schedule, Appointment } = require('../models');
const { connect, disconnect } = require('../models/db');

const seedData = async () => {
  try {
    await connect();
    
    console.log('🗑️  Clearing existing data...');
    await Clinic.deleteMany({});
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await DoctorService.deleteMany({});
    await Schedule.deleteMany({});
    await Appointment.deleteMany({});
    
    console.log('✅ Data cleared');
    
    // Create Clinic
    console.log('🏥 Creating clinic...');
    const clinic = await Clinic.create({
      name: '青苗綜合醫療診所',
      nameEn: 'Qingyiu Integrated Medical Clinic',
      address: '澳門高士德大馬路 123 號',
      phone: '+853 2828 8888',
      email: 'info@qingyiuclinic.com',
      description: '提供全面綜合醫療服務的專業診所',
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: null, close: null }
      },
      businessHours: {
        monday: { open: '09:00', close: '18:00', isOpen: true },
        tuesday: { open: '09:00', close: '18:00', isOpen: true },
        wednesday: { open: '09:00', close: '18:00', isOpen: true },
        thursday: { open: '09:00', close: '18:00', isOpen: true },
        friday: { open: '09:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '13:00', isOpen: true },
        sunday: { open: '00:00', close: '00:00', isOpen: false }
      },
      isActive: true
    });
    console.log(`✅ Clinic created: ${clinic.name}`);
    
    // Create Doctors
    console.log('👨‍⚕️ Creating doctors...');
    const doctors = await Doctor.insertMany([
      {
        name: '陳志明醫生',
        nameEn: 'Dr. Chan Chi Ming',
        title: '主治醫生',
        specialty: '家庭醫學',
        description: '擁有 15 年家庭醫學經驗',
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '李美玲醫生',
        nameEn: 'Dr. Lee Mei Ling',
        title: '專科醫生',
        specialty: '兒科',
        description: '專注於兒童健康及發展',
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '王偉強醫生',
        nameEn: 'Dr. Wong Wai Keung',
        title: '資深醫生',
        specialty: '內科',
        description: '擅長慢性病管理及預防醫學',
        clinic: clinic._id,
        isActive: true
      }
    ]);
    console.log(`✅ ${doctors.length} doctors created`);
    
    // Create Services
    console.log('💊 Creating services...');
    const services = await Service.insertMany([
      {
        name: '普通科門診',
        nameEn: 'General Consultation',
        description: '常見疾病診斷及治療',
        category: '門診',
        duration: 20,
        price: 300,
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '兒童保健檢查',
        nameEn: 'Pediatric Checkup',
        description: '兒童生長發育評估',
        category: '兒科',
        duration: 30,
        price: 450,
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '疫苗接種',
        nameEn: 'Vaccination',
        description: '各類疫苗接種服務',
        category: '預防醫學',
        duration: 15,
        price: 200,
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '慢性病管理',
        nameEn: 'Chronic Disease Management',
        description: '高血壓、糖尿病等慢性病跟進',
        category: '內科',
        duration: 30,
        price: 400,
        clinic: clinic._id,
        isActive: true
      },
      {
        name: '身體檢查',
        nameEn: 'Physical Examination',
        description: '全面身體檢查服務',
        category: '檢查',
        duration: 60,
        price: 800,
        clinic: clinic._id,
        isActive: true
      }
    ]);
    console.log(`✅ ${services.length} services created`);
    
    // Create Doctor-Service mappings
    console.log('🔗 Creating doctor-service mappings...');
    const doctorServices = await DoctorService.insertMany([
      { doctor: doctors[0]._id, service: services[0]._id, clinic: clinic._id },
      { doctor: doctors[0]._id, service: services[3]._id, clinic: clinic._id },
      { doctor: doctors[0]._id, service: services[4]._id, clinic: clinic._id },
      { doctor: doctors[1]._id, service: services[1]._id, clinic: clinic._id },
      { doctor: doctors[1]._id, service: services[2]._id, clinic: clinic._id },
      { doctor: doctors[2]._id, service: services[0]._id, clinic: clinic._id },
      { doctor: doctors[2]._id, service: services[3]._id, clinic: clinic._id }
    ]);
    console.log(`✅ ${doctorServices.length} doctor-service mappings created`);
    
    // Create sample schedules for next 7 days
    console.log('📅 Creating schedules...');
    const schedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) continue;
      
      // Morning schedule (9:00-12:00)
      schedules.push({
        doctorId: doctors[0]._id,
        date: date,
        startTime: '09:00',
        endTime: '12:00',
        clinicId: clinic._id,
        isAvailable: true
      });
      
      // Afternoon schedule (14:00-18:00)
      schedules.push({
        doctorId: doctors[0]._id,
        date: date,
        startTime: '14:00',
        endTime: '18:00',
        clinicId: clinic._id,
        isAvailable: true
      });
      
      schedules.push({
        doctorId: doctors[1]._id,
        date: date,
        startTime: '09:00',
        endTime: '13:00',
        clinicId: clinic._id,
        isAvailable: true
      });
      
      schedules.push({
        doctorId: doctors[2]._id,
        date: date,
        startTime: '14:00',
        endTime: '18:00',
        clinicId: clinic._id,
        isAvailable: true
      });
    }
    
    await Schedule.insertMany(schedules);
    console.log(`✅ ${schedules.length} schedules created`);
    
    // Create sample appointments
    console.log('📋 Creating sample appointments...');
    const appointments = await Appointment.insertMany([
      {
        patientName: '張大偉',
        patientPhone: '6688 1234',
        patientEmail: 'cheung@example.com',
        doctor: doctors[0]._id,
        service: services[0]._id,
        clinic: clinic._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        startTime: '09:00',
        endTime: '09:20',
        status: 'confirmed',
        notes: '首次就診'
      },
      {
        patientName: '林小美',
        patientPhone: '6688 5678',
        patientEmail: 'lam@example.com',
        doctor: doctors[1]._id,
        service: services[1]._id,
        clinic: clinic._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        startTime: '10:00',
        endTime: '10:30',
        status: 'pending',
        notes: '兒童保健檢查'
      },
      {
        patientName: '黃先生',
        patientPhone: '6688 9012',
        doctor: doctors[2]._id,
        service: services[3]._id,
        clinic: clinic._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        startTime: '15:00',
        endTime: '15:30',
        status: 'confirmed',
        notes: '糖尿病跟進'
      }
    ]);
    console.log(`✅ ${appointments.length} appointments created`);
    
    console.log('\n🎉 Seed data completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - 1 Clinic`);
    console.log(`   - ${doctors.length} Doctors`);
    console.log(`   - ${services.length} Services`);
    console.log(`   - ${doctorServices.length} Doctor-Service Mappings`);
    console.log(`   - ${schedules.length} Schedules`);
    console.log(`   - ${appointments.length} Appointments`);
    
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    await disconnect();
    process.exit(1);
  }
};

seedData();
