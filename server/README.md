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
   ```

3. Start the server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)

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