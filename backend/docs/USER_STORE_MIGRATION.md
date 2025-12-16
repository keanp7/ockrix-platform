# User Store Migration Guide

## 📋 Overview

The user store is currently implemented as an in-memory Map for development and testing. This guide explains how to migrate to a production database.

---

## 🏗️ Current Implementation

### In-Memory Store (Development)

**Location:** `services/userService.js`

**Structure:**
```javascript
const userStore = new Map();
// Key: userId
// Value: { userId, email, phone, recoveryMethods, createdAt, updatedAt }
```

**Characteristics:**
- ✅ Fast for development/testing
- ✅ No database setup required
- ❌ Data lost on server restart
- ❌ Not suitable for production
- ❌ No persistence
- ❌ Limited scalability

---

## 🔄 Migration to Database

### Step 1: Choose Your Database

**Recommended:**
- **PostgreSQL** - Best for production (ACID compliant, robust, JSONB support)
- **MongoDB** - Good for rapid development (document-based, flexible schema)
- **MySQL** - Widely used, stable
- **SQLite** - Good for small applications (no server required)

**This guide focuses on PostgreSQL (recommended).**

---

### Step 2: Install Database Driver

```bash
npm install pg
# or for MongoDB
npm install mongodb
```

---

### Step 3: Create Database Connection

Create `config/database.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;
```

Add to `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/ockrix
```

---

### Step 4: Create Database Schema

Run the SQL schema from `utils/userStorage.js`:

```sql
-- Users table (NO PASSWORD STORAGE - zero-knowledge design)
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  recovery_methods JSONB NOT NULL DEFAULT '["email"]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Auto-update updated_at trigger
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
```

---

### Step 5: Update userService.js

Replace in-memory operations with database queries:

#### Example: getUserById

**Before (In-Memory):**
```javascript
const getUserById = (userId) => {
  const user = userStore.get(userId);
  return user ? { ...user } : null;
};
```

**After (Database):**
```javascript
const pool = require('../config/database');

const getUserById = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return formatUserFromDB(result.rows[0]);
  } catch (error) {
    logger.error('Database error in getUserById:', error);
    throw new Error('Failed to retrieve user');
  }
};
```

#### Example: createUser

**Before (In-Memory):**
```javascript
const createUser = async (userData) => {
  userStore.set(userId, user);
  return user;
};
```

**After (Database):**
```javascript
const createUser = async (userData) => {
  const { userId, email, phone, recoveryMethods = ['email'] } = userData;

  try {
    const result = await pool.query(
      `INSERT INTO users (user_id, email, phone, recovery_methods)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING *`,
      [userId, email, phone, JSON.stringify(recoveryMethods)]
    );

    return formatUserFromDB(result.rows[0]);
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === '23505') { // PostgreSQL unique violation
      if (error.constraint === 'users_email_key') {
        throw new ValidationError('Email already registered');
      }
      throw new ValidationError('User ID already exists');
    }
    logger.error('Database error in createUser:', error);
    throw new Error('Failed to create user');
  }
};
```

#### Helper Function: formatUserFromDB

```javascript
const formatUserFromDB = (dbRow) => {
  return {
    userId: dbRow.user_id,
    email: dbRow.email,
    phone: dbRow.phone,
    recoveryMethods: Array.isArray(dbRow.recovery_methods)
      ? dbRow.recovery_methods
      : JSON.parse(dbRow.recovery_methods || '["email"]'),
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
};
```

---

### Step 6: Update All Service Methods

Convert all functions in `userService.js`:

1. ✅ `getUserById` → Database query with parameterized statement
2. ✅ `getUserByEmail` → Database query (uses index)
3. ✅ `getUserByPhone` → Database query (uses index)
4. ✅ `createUser` → INSERT with RETURNING
5. ✅ `updateUser` → UPDATE with parameterized statement
6. ✅ `deleteUser` → DELETE (consider soft delete in production)
7. ✅ `getAllUsers` → SELECT with LIMIT (always limit in production)

---

### Step 7: Use Migration Tool (Recommended)

Use a migration tool to manage schema changes:

**Option 1: node-pg-migrate**
```bash
npm install node-pg-migrate
```

Create migration:
```bash
npx node-pg-migrate create create-users-table
```

**Option 2: Knex.js**
```bash
npm install knex
```

Create migration:
```bash
npx knex migrate:make create_users_table
```

---

### Step 8: Add Connection Pooling

Already included in `config/database.js`, but configure based on your needs:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout after 2s
});
```

---

### Step 9: Handle Errors Gracefully

Database-specific error handling:

```javascript
const handleDatabaseError = (error) => {
  if (error.code === '23505') { // Unique constraint violation
    return new ValidationError('Duplicate entry');
  }
  if (error.code === '23503') { // Foreign key violation
    return new ValidationError('Referenced record not found');
  }
  logger.error('Database error:', error);
  return new Error('Database operation failed');
};
```

---

## 🔒 Security Considerations

### 1. Use Parameterized Queries

❌ **INSECURE (SQL Injection Risk):**
```javascript
pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

✅ **SECURE (Parameterized):**
```javascript
pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

### 2. Connection String Security

- Store `DATABASE_URL` in environment variables
- Never commit connection strings to version control
- Use different databases for dev/staging/production
- Enable SSL/TLS in production

### 3. Access Control

- Use database users with minimal required permissions
- Separate read-only and read-write users
- Implement row-level security if needed
- Regularly audit database access logs

---

## 📊 Performance Optimization

### Indexes

Ensure indexes are created for frequently queried columns:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
```

### Query Optimization

- Use `EXPLAIN ANALYZE` to analyze slow queries
- Limit result sets with `LIMIT`
- Use pagination for large datasets
- Monitor query performance

### Connection Pooling

- Configure appropriate pool size based on traffic
- Monitor pool usage
- Set connection timeouts appropriately

---

## 🧪 Testing Migration

### 1. Create Test Script

```javascript
// test-db-migration.js
const userService = require('./services/userService');

async function test() {
  // Create user
  const user = await userService.createUser({
    userId: 'test123',
    email: 'test@example.com',
    phone: '1234567890',
    recoveryMethods: ['email', 'phone']
  });
  console.log('Created:', user);

  // Get user
  const found = await userService.getUserById('test123');
  console.log('Found:', found);

  // Update user
  const updated = await userService.updateUser('test123', {
    recoveryMethods: ['email']
  });
  console.log('Updated:', updated);
}

test().catch(console.error);
```

### 2. Verify Data Integrity

- Test all CRUD operations
- Verify unique constraints work
- Test error handling
- Verify indexes are used

---

## ✅ Migration Checklist

- [ ] Database driver installed
- [ ] Database connection configured
- [ ] Schema created with indexes
- [ ] All service methods converted to database queries
- [ ] Parameterized queries used everywhere (no SQL injection)
- [ ] Error handling implemented
- [ ] Connection pooling configured
- [ ] Migration tested thoroughly
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Production database secured (SSL, access control)

---

## 🚀 Production Deployment

1. **Backup existing data** (if migrating from existing system)
2. **Run migrations** on production database
3. **Test connection** from production server
4. **Monitor** for errors and performance issues
5. **Set up** automated backups
6. **Configure** connection pooling for production load
7. **Enable** SSL/TLS for database connections
8. **Set up** monitoring and alerts

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migrating-your-database)
- [SQL Injection Prevention](https://owasp.org/www-community/attacks/SQL_Injection)
