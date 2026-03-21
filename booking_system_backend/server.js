const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// VERSION
const VERSION = '0.3.0';

// Import database and models
const { connectDB, closeDB } = require('./models');

// Import routes
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
}));
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API Routes
// ============================================

// Public APIs
app.use('/api', publicRoutes);

// Admin APIs
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    version: VERSION 
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? '伺服器錯誤' : err.message 
  });
});

// ============================================
// Server Startup
// ============================================

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║  青苗綜合醫療診所預約系統 v${VERSION}                ║
║  Ching Yiu Clinic Booking System              ║
╠═══════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}               ║
║  📍 http://localhost:${PORT}                     ║
║  🔧 Admin API: /api/admin/*                    ║
║  🌐 Public API: /api/*                         ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

// Start the server
startServer();
