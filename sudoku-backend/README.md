# Sudoku Backend API

A RESTful API built with Express.js, TypeScript, and MongoDB for managing Sudoku puzzles and user authentication.

## Features

- 🔐 JWT-based authentication (register/login)
- 👤 User management with secure password hashing
- 🧩 CRUD operations for Sudoku puzzles
- 📊 20 puzzle limit per user
- ✅ Input validation and error handling
- 🔒 Protected routes with middleware
- 📝 TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Project Structure

```
src/
├── controllers/        # Route handlers
│   ├── authController.ts
│   └── sudokuController.ts
├── middleware/         # Custom middleware
│   └── auth.ts
├── models/            # MongoDB schemas
│   ├── User.ts
│   └── Sudoku.ts
├── routes/            # Route definitions
│   ├── auth.ts
│   └── sudoku.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   └── database.ts
└── server.ts          # Main application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd sudoku-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sudoku_app
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sudoku Routes (Protected)

All Sudoku routes require authentication. Include the JWT token in the Authorization header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All User Puzzles
```http
GET /api/sudoku
```

#### Get Specific Puzzle
```http
GET /api/sudoku/:id
```

#### Create New Puzzle
```http
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

#### Delete Puzzle
```http
DELETE /api/sudoku/:id
```

### Health Check
```http
GET /api/health
```

## Puzzle Data Format

Puzzles are stored as 9x9 arrays of numbers:
- `0` represents empty cells
- `1-9` represent filled numbers
- Each puzzle must be exactly 9x9

Example:
```json
{
  "title": "Easy Puzzle",
  "puzzleData": [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ]
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Security Features

- Password hashing with bcryptjs
- JWT token expiration (7 days)
- Input validation and sanitization
- CORS configuration
- Rate limiting ready (can be added)
- Secure headers ready (can be added)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (add test framework as needed)

### Code Style

- TypeScript for type safety
- ESLint for code linting (can be added)
- Prettier for code formatting (can be added)

## Deployment

### Environment Variables for Production

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sudoku_app
JWT_SECRET=very_long_random_secret_key_for_production
NODE_ENV=production
```

### Build and Deploy

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.