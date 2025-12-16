# OCKRIX Backend Architecture

A secure, production-ready Node.js Express backend with a layered architecture.

## 📁 Project Structure

```
backend/
├── server.js                 # Main entry point - Express app setup
├── middleware/              # Request/response middleware
│   ├── cors.js             # CORS configuration
│   ├── errorHandler.js     # Central error handling
│   └── exampleMiddleware.js # Example middleware template
├── routes/                  # API route definitions
│   └── exampleRoutes.js    # Example route file
├── controllers/             # Request/response handlers
│   └── exampleController.js # Example controller
├── services/                # Business logic layer
│   └── exampleService.js   # Example service
├── utils/                   # Utility functions
│   ├── logger.js           # Logging utility
│   └── exampleUtil.js      # Example utility
└── .env.example            # Environment variables template
```

## 🏗️ Architecture Layers

### 1. **Routes** (`routes/`)
**Responsibility**: Define API endpoints and HTTP method mappings.

- Maps URL paths to controller functions
- Applies middleware (auth, validation, rate limiting)
- Groups related endpoints
- Handles HTTP method routing (GET, POST, PUT, DELETE)

**Example Flow**: `GET /api/users/:id` → `userController.getUserById`

---

### 2. **Controllers** (`controllers/`)
**Responsibility**: Handle HTTP request/response logic.

- Extract data from requests (params, query, body, headers)
- Validate input format
- Call service layer for business logic
- Format and send HTTP responses
- Pass errors to error handler via `next(error)`

**Should NOT**:
- Contain business logic
- Directly access databases
- Have complex data transformation

---

### 3. **Services** (`services/`)
**Responsibility**: Contains all business logic and data operations.

- Implement business rules
- Process and transform data
- Interact with databases or external APIs
- Handle transactions and complex operations
- Reusable across different controllers

**Should**:
- Be database-agnostic
- Handle all business logic
- Return data (not HTTP responses)
- Throw appropriate errors for error handler

---

### 4. **Middleware** (`middleware/`)
**Responsibility**: Functions executed during request/response cycle.

**Common Middleware Types**:
- **Authentication**: Verify user tokens (JWT)
- **Authorization**: Check user permissions
- **Validation**: Validate request data (joi, express-validator)
- **Rate Limiting**: Prevent API abuse
- **Logging**: Track requests for debugging
- **Error Handling**: Centralized error catching

**Execution Order**: Runs before routes → can modify `req`/`res` → calls `next()`

---

### 5. **Utils** (`utils/`)
**Responsibility**: Pure, reusable helper functions.

- Stateless functions (no side effects)
- No dependency on request context
- Data formatting, validation, encryption
- Email sending, file operations
- Token generation, pagination helpers

**Should**:
- Be pure functions (same input → same output)
- Have no dependencies on Express
- Be easily testable

---

## 🔒 Security Features

### Express Security Setup
- ✅ Disabled `X-Powered-By` header
- ✅ Trust proxy configuration for accurate IPs
- ✅ JSON body parser with size limits (10MB)
- ✅ URL-encoded parser with size limits

### CORS Configuration
- ✅ Whitelist-based origin control
- ✅ Credentials support for authenticated requests
- ✅ Configurable via environment variables
- ✅ Preflight request handling

### Error Handling
- ✅ Centralized error handler
- ✅ Environment-aware error details (no stack traces in production)
- ✅ Custom error classes (ValidationError, AuthenticationError, etc.)
- ✅ Consistent error response format
- ✅ Error logging for debugging

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

---

## 📝 Request Flow

```
Request
  ↓
CORS Middleware
  ↓
Body Parser
  ↓
Routes (apply middleware: auth, validation, rate limit)
  ↓
Controllers (extract data, call services)
  ↓
Services (business logic, database operations)
  ↓
Controller (format response)
  ↓
Response
  ↓
Error Handler (if error occurs)
```

---

## 🔧 Environment Variables

See `.env.example` for all available configuration options:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated CORS origins
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRE`: JWT expiration time

---

## 📚 Best Practices

1. **Keep controllers thin** - Only handle HTTP concerns
2. **Business logic in services** - Reusable and testable
3. **Use middleware** - For cross-cutting concerns (auth, logging)
4. **Error handling** - Always use `next(error)` to pass errors to handler
5. **Environment variables** - Never commit `.env` file
6. **Validation** - Validate input at controller or middleware level
7. **Logging** - Use logger utility for consistent logging

---

## 🧪 Adding New Features

1. **Create route** in `routes/` → define endpoint
2. **Create controller** in `controllers/` → handle HTTP logic
3. **Create service** in `services/` → implement business logic
4. **Add middleware** if needed (auth, validation)
5. **Update server.js** to include new routes

---

## 📦 Next Steps

- Add authentication middleware (JWT)
- Implement rate limiting
- Add request validation (joi/express-validator)
- Set up database connection
- Add API documentation (Swagger)
- Implement logging service (Winston/Pino)
