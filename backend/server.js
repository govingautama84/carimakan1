require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Initialize database
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ---- SOCKET.IO SETUP ----
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach io ke app untuk digunakan di controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join room berdasarkan user ID (untuk notifikasi personal)
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });

  // Join room berdasarkan restaurant ID (untuk notifikasi restoran)
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`🏪 Restaurant ${restaurantId} joined room restaurant_${restaurantId}`);
  });

  // Admin join room
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`🛡️ Admin joined admin_room`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ---- MIDDLEWARE ----
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- ROUTES ----
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restoranRoutes'));
app.use('/api/menus', require('./routes/menuRoutes'));
app.use('/api/reservations', require('./routes/reservasiRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ---- HEALTH CHECK ----
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🍽️ CariMakan+ API is running!',
    timestamp: new Date(),
    version: '2.0.0'
  });
});

// ---- 404 HANDLER ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan.' });
});

// ---- ERROR HANDLER ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ---- START SERVER ----
server.listen(PORT, () => {
  console.log(`\n🚀 CariMakan+ Server running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO ready for real-time connections`);
  console.log(`\n📋 Available Routes:`);
  console.log(`   /api/auth       - Authentication`);
  console.log(`   /api/restaurants - Restaurant management`);
  console.log(`   /api/menus       - Menu management`);
  console.log(`   /api/reservations - Reservation system`);
  console.log(`   /api/orders      - Order management`);
  console.log(`   /api/payments    - Payment processing`);
  console.log(`   /api/invoices    - Invoice generation`);
  console.log(`   /api/reviews     - Review system`);
  console.log(`   /api/notifications - Notifications`);
  console.log(`   /api/admin       - Admin management\n`);
});

module.exports = { app, server, io };
