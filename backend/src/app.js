const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const documentRoutes = require('./routes/documentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const academicRoutes = require('./routes/academicRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cloud Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'Student Management & Analytics Cloud API',
    awsRegion: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'student-management-docs-akash-2026',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/academic', academicRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Serverless Cloud-Based Student Management API using AWS',
    version: '1.0.0',
    documentation: '/docs',
  });
});

// 404 & Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
