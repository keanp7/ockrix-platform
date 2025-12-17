require('dotenv').config();

// Validate environment variables before starting server
const { validateEnv } = require('./utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const { corsOptions } = require('./middleware/cors');

const app = express();

// Security: Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security: Disable X-Powered-By header to hide Express version
app.disable('x-powered-by');

// CORS middleware - configured with security best practices
app.use(cors(corsOptions));

// JSON body parser with size limit for security
app.use(express.json({ limit: '10mb' }));

// URL-encoded body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/recovery', require('./routes/recoveryTokenRoutes'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler - must be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 OCKRIX Backend Server running on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = app;
