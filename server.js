require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const db = require('./models/db');
const adminRoutes = require('./routes/admin');
const authenticateAdmin = require('./middleware/authenticateAdmin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
db.connect()
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Routes
// Admin routes - ALL require authentication
app.use('/api/admin', authenticateAdmin, adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '青苗綜合醫療診所預約系統 Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Qingyiu Clinic Booking System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
