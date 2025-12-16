/**
 * User Storage Utility - Database Migration Guide
 * 
 * Responsibility: Provides database schema and migration instructions
 * for replacing the in-memory user store with a real database.
 * 
 * CURRENT IMPLEMENTATION: In-memory Map (development/testing)
 * PRODUCTION: Replace with database (PostgreSQL, MongoDB, etc.)
 */

/**
 * ============================================================================
 * DATABASE SCHEMA - PostgreSQL Example
 * ============================================================================
 */

const POSTGRES_SCHEMA = `
-- Users table (NO PASSWORD STORAGE - zero-knowledge design)
CREATE TABLE users (
  -- Primary identifier
  user_id VARCHAR(255) PRIMARY KEY,
  
  -- Contact information
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  
  -- Recovery methods (stored as JSON array)
  recovery_methods JSONB NOT NULL DEFAULT '["email"]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for fast lookups
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * ============================================================================
 * DATABASE SCHEMA - MongoDB Example
 * ============================================================================
 */

const MONGODB_SCHEMA = `
// MongoDB Collection: users
// No explicit schema required (schema-less), but enforce in application

{
  userId: String,           // Primary key, indexed, unique
  email: String,           // Indexed, unique
  phone: String,           // Indexed, optional
  recoveryMethods: [String], // Array of recovery methods
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
db.users.createIndex({ userId: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { sparse: true }); // Sparse index (only non-null)
db.users.createIndex({ createdAt: -1 });
`;

/**
 * ============================================================================
 * DATABASE SCHEMA - SQLite Example
 * ============================================================================
 */

const SQLITE_SCHEMA = `
-- Users table (NO PASSWORD STORAGE - zero-knowledge design)
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NULL,
  recovery_methods TEXT NOT NULL DEFAULT '["email"]', -- JSON string
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
`;

/**
 * ============================================================================
 * MIGRATION GUIDE
 * ============================================================================
 * 
 * STEPS TO MIGRATE FROM IN-MEMORY TO DATABASE:
 * 
 * 1. Choose your database (PostgreSQL recommended for production)
 * 
 * 2. Install database driver:
 *    npm install pg          # PostgreSQL
 *    npm install mongodb     # MongoDB
 *    npm install mysql2      # MySQL
 *    npm install sqlite3     # SQLite
 * 
 * 3. Create database connection file (e.g., config/database.js):
 * 
 *    const { Pool } = require('pg');
 *    const pool = new Pool({
 *      connectionString: process.env.DATABASE_URL,
 *      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
 *    });
 *    module.exports = pool;
 * 
 * 4. Replace userService.js functions with database queries:
 * 
 *    Example: getUserById with PostgreSQL
 *    ------------------------------------
 *    const getUserById = async (userId) => {
 *      const result = await pool.query(
 *        'SELECT * FROM users WHERE user_id = $1',
 *        [userId]
 *      );
 *      
 *      if (result.rows.length === 0) {
 *        return null;
 *      }
 *      
 *      const user = result.rows[0];
 *      return {
 *        userId: user.user_id,
 *        email: user.email,
 *        phone: user.phone,
 *        recoveryMethods: user.recovery_methods, // JSONB auto-parsed by pg
 *        createdAt: user.created_at,
 *        updatedAt: user.updated_at
 *      };
 *    };
 * 
 * 5. Update createUser function:
 * 
 *    const createUser = async (userData) => {
 *      const { userId, email, phone, recoveryMethods = ['email'] } = userData;
 *      
 *      const result = await pool.query(
 *        `INSERT INTO users (user_id, email, phone, recovery_methods)
 *         VALUES ($1, $2, $3, $4::jsonb)
 *         RETURNING *`,
 *        [userId, email, phone, JSON.stringify(recoveryMethods)]
 *      );
 *      
 *      return formatUser(result.rows[0]);
 *    };
 * 
 * 6. Update getUserByEmail:
 * 
 *    const getUserByEmail = async (email) => {
 *      const result = await pool.query(
 *        'SELECT * FROM users WHERE email = $1',
 *        [email.toLowerCase().trim()]
 *      );
 *      
 *      return result.rows.length > 0 ? formatUser(result.rows[0]) : null;
 *    };
 * 
 * 7. Handle errors appropriately (database-specific error codes)
 * 
 * 8. Run database migrations (use migration tool like node-pg-migrate, Knex, etc.)
 * 
 * 9. Test thoroughly before deploying to production
 */

/**
 * Helper function to format database row to application format
 * 
 * @param {Object} dbRow - Database row object
 * @returns {Object} Formatted user object
 */
const formatUser = (dbRow) => {
  return {
    userId: dbRow.user_id || dbRow.userId,
    email: dbRow.email,
    phone: dbRow.phone,
    recoveryMethods: Array.isArray(dbRow.recovery_methods) 
      ? dbRow.recovery_methods 
      : JSON.parse(dbRow.recovery_methods || '["email"]'),
    createdAt: dbRow.created_at || dbRow.createdAt,
    updatedAt: dbRow.updated_at || dbRow.updatedAt
  };
};

/**
 * ============================================================================
 * PRODUCTION CONSIDERATIONS
 * ============================================================================
 * 
 * 1. CONNECTION POOLING:
 *    - Use connection pooling to manage database connections
 *    - Set appropriate pool size based on your traffic
 * 
 * 2. TRANSACTIONS:
 *    - Use transactions for operations that need atomicity
 *    - Example: Creating user + sending welcome email (rollback on email failure)
 * 
 * 3. PREPARED STATEMENTS:
 *    - Always use prepared statements (parameterized queries)
 *    - Prevents SQL injection attacks
 *    - Example: SELECT * FROM users WHERE email = $1 (not string concatenation)
 * 
 * 4. MIGRATIONS:
 *    - Use migration tools (node-pg-migrate, Knex, Sequelize migrations)
 *    - Version control your database schema
 *    - Test migrations on staging before production
 * 
 * 5. BACKUPS:
 *    - Regular automated backups
 *    - Test backup restoration procedures
 *    - Keep backups in separate location
 * 
 * 6. MONITORING:
 *    - Monitor query performance
 *    - Set up alerts for slow queries
 *    - Monitor connection pool usage
 * 
 * 7. SECURITY:
 *    - Use environment variables for connection strings
 *    - Enable SSL/TLS for database connections in production
 *    - Use read-only database users for read operations
 *    - Implement row-level security if needed
 * 
 * 8. INDEXING:
 *    - Index frequently queried columns (email, phone, userId)
 *    - Monitor index usage and remove unused indexes
 *    - Use partial indexes where appropriate (e.g., WHERE phone IS NOT NULL)
 */

module.exports = {
  POSTGRES_SCHEMA,
  MONGODB_SCHEMA,
  SQLITE_SCHEMA,
  formatUser
};
