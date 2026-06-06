/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DRESSLUX BACKEND - EXPRESS + MONGOOSE SERVER */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ✅ MUST BE FIRST LINE
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────────
// MIDDLEWARE
// ──────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ──────────────────────────────────────────────────
// MONGOOSE CONNECTION
// ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// ──────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function respondSuccess(res, data = null, message = 'Success') {
  res.json({ success: true, message, data });
}

function respondError(res, statusCode, error) {
  res.status(statusCode).json({ success: false, error });
}

// ──────────────────────────────────────────────────
// IMPORT MONGOOSE CONNECTION FOR ROUTES
// ──────────────────────────────────────────────────
const paymentRoutes = require('./routes/paymentRoutes');

// ──────────────────────────────────────────────────
// MOUNT ROUTES
// ──────────────────────────────────────────────────
app.use('/api/payment', paymentRoutes);

// ──────────────────────────────────────────────────
// TEST ROUTE
// ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ DressLux server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// ──────────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ──────────────────────────────────────────────────
// ERROR HANDLER
// ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ──────────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ──────────────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n⛔ Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
