/**
 * Sprint 3 Migration - Add Doctor Type Field
 * 
 * This migration adds the required 'type' field to existing doctors.
 * Doctors without a type will be assigned based on their specialty or default to 'TCM'.
 * 
 * Run with: node migration_sprint3.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./models/db');

async function migrate() {
  try {
    console.log('🚀 Starting Sprint 3 Migration...');
    
    await db.connect();
    console.log('✅ Connected to MongoDB');
    
    const Doctor = mongoose.model('Doctor');
    
    // Find all doctors without a type field
    const doctorsWithoutType = await Doctor.find({ type: { $exists: false } });
    
    console.log(`📊 Found ${doctorsWithoutType.length} doctors without type field`);
    
    let updated = 0;
    let tcm = 0;
    let physio = 0;
    let western = 0;
    
    for (const doctor of doctorsWithoutType) {
      let assignedType = 'TCM'; // Default
      
      // Try to infer type from specialty or name
      const specialty = (doctor.specialty || '').toLowerCase();
      const name = (doctor.name || '').toLowerCase();
      
      if (specialty.includes('physio') || specialty.includes('physical') || name.includes('physio')) {
        assignedType = 'Physio';
        physio++;
      } else if (specialty.includes('western') || specialty.includes('general') || specialty.includes('family')) {
        assignedType = 'Western';
        western++;
      } else {
        tcm++;
      }
      
      doctor.type = assignedType;
      await doctor.save();
      updated++;
      
      console.log(`  ✓ Updated "${doctor.name}" → ${assignedType}`);
    }
    
    console.log('\n✅ Migration Complete!');
    console.log(`   Total updated: ${updated}`);
    console.log(`   TCM (中醫師): ${tcm}`);
    console.log(`   Physio (物理治療師): ${physio}`);
    console.log(`   Western (西醫): ${western}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
