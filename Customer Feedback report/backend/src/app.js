const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const feedbackReportRoutes = require('./routes/feedbackReportRoutes');
const feedbackPublicRoutes = require('./routes/feedbackPublicRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FMS Customer Feedback & Critic Report Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', feedbackReportRoutes);
app.use('/api/feedback', feedbackPublicRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;

