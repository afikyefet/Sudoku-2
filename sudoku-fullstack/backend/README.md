# Sudoku Backend API

A RESTful API for the Sudoku web application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 JWT-based authentication
- 👤 User registration and login
- 🧩 Sudoku puzzle CRUD operations
- 📝 20-puzzle limit per user
- ✅ Input validation and error handling
- 🔒 Protected routes with middleware
- 📱 CORS support for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sudoku_app
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sudoku Puzzles (Protected Routes)

All puzzle routes require authentication header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get All User Puzzles
```
GET /api/sudoku
```

#### Create New Puzzle
```
POST /api/sudoku
Content-Type: application/json

{
  "title": "Easy Puzzle 1",
  "puzzleData": [
    [0,0,0,2,6,0,7,0,1],
    [6,8,0,0,7,0,0,9,0],
    [1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],
    [0,0,4,6,0,2,9,0,0],
    [0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],
    [0,4,0,0,5,0,0,3,6],
    [7,0,3,0,1,8,0,0,0]
  ]
}
```

#### Get Specific Puzzle
```
GET /api/sudoku/:id
```

#### Delete Puzzle
```
DELETE /api/sudoku/:id
```

### Health Check
```
GET /api/health
```

## Data Models

### User
```typescript
{
  email: string;        // Unique, lowercase
  password: string;     // Hashed with bcrypt
  createdAt: Date;      // Auto-generated
}
```

### Sudoku Puzzle
```typescript
{
  user: string;         // User ID reference
  title: string;        // Max 100 characters
  puzzleData: number[][]; // 9x9 grid, numbers 0-9
  createdAt: Date;      // Auto-generated
}
```

## Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Puzzle Data**: Must be 9x9 grid with numbers 0-9 (0 = empty cell)
- **User Limit**: Maximum 20 puzzles per user
- **Title**: Maximum 100 characters

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (valid token but no access)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Helper functions
│   └── server.ts       # Main application
├── .env                # Environment variables
├── .env.example        # Environment template
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sudoku_app` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `NODE_ENV` | Environment mode | `development` |