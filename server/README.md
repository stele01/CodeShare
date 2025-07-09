# CodeShare API Server

Backend API for the CodeShare application, allowing users to save and share code snippets.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codeshare
   JWT_SECRET=your_super_secure_secret_key
   JWT_EXPIRATION=7d
   NODE_ENV=development
   ```

3. Start the server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Password hashing using bcrypt with salt factor 10
- Protected routes using middleware
- Optional authentication for public endpoints

### Rate Limiting
- General rate limiting: 100 requests per 15 minutes per IP
- Stricter auth rate limiting: 5 attempts per 15 minutes per IP
- Prevents brute force attacks and API abuse

### Input Validation & Sanitization
- Email validation and normalization
- Input sanitization using validator library
- Request body size limiting (10MB)
- Mongoose schema validation

### Security Headers
- Helmet.js for security headers
- CORS configuration with domain restrictions
- Content Security Policy headers

### Production Security Checklist
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Update CORS origins to your actual domain
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Configure proper MongoDB authentication
- [ ] Set up proper logging and monitoring
- [ ] Regular security updates for dependencies

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/password` - Update user password (protected)

### Workspaces

- `GET /api/workspaces/public` - Get recent public workspaces
- `GET /api/workspaces/:id` - Get a specific workspace by ID (public or owned by user)
- `POST /api/workspaces` - Create a new workspace (protected)
- `GET /api/workspaces` - Get all workspaces for the logged-in user (protected)
- `PUT /api/workspaces/:id` - Update a workspace (protected, owner only)
- `DELETE /api/workspaces/:id` - Delete a workspace (protected, owner only)

## Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Database Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- createdAt: Date

### Workspace
- title: String (default: 'Untitled Workspace')
- code: String (required)
- language: String (required, default: 'javascript')
- isPublic: Boolean (default: true)
- user: ObjectId (ref: 'User', required)
- createdAt: Date
- updatedAt: Date 