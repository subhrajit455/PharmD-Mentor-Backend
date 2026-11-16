require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) and all origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    portal: 'Pharm.D (Doctor of Pharmacy) Educational Portal',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/colleges', require('./routes/college.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/reactions', require('./routes/reaction.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/cases', require('./routes/case.routes'));
app.use('/api/audit-logs', require('./routes/audit.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[PharmD Mentor Backend]: Running on port ${PORT}`);
});

