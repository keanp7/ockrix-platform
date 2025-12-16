/**
 * CORS Configuration Middleware
 * 
 * Responsibility: Configures Cross-Origin Resource Sharing (CORS) policies
 * to control which origins can access the API.
 * 
 * Security Features:
 * - Whitelist-based origin control
 * - Credentials support for authenticated requests
 * - Preflight request handling
 * - Security headers
 */

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173']; // Default for development

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/credentials to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400 // 24 hours - how long to cache preflight response
};

module.exports = { corsOptions };
