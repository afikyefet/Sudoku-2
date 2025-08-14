# 🧩 Sudoku Pro - Full-Stack Web Application

A modern, responsive Sudoku web application built with React, TypeScript, Node.js, Express, MongoDB, and HeroUI. Features user authentication, puzzle management, and an interactive Sudoku game with real-time validation.

![Sudoku Pro](https://via.placeholder.com/800x400/0070f3/ffffff?text=Sudoku+Pro+-+Full+Stack+Web+App)

## ✨ Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with secure token management
- **User registration and login** with email validation
- **Persistent sessions** with localStorage
- **Protected routes** and automatic logout on token expiry

### 🧩 Puzzle Management
- **Create custom puzzles** with JSON input or manual entry
- **20-puzzle limit per user** with backend validation
- **Grid preview** during puzzle creation
- **Delete puzzles** with confirmation
- **Puzzle metadata** (title, creation date)

### 🎮 Interactive Sudoku Game
- **Click-to-select cells** with visual feedback
- **Keyboard navigation** (arrow keys, number keys)
- **Real-time validation** with conflict highlighting
- **Row, column, and subgrid highlighting**
- **Auto-completion detection** with celebration modal
- **Reset functionality** to start over
- **Mobile-responsive design** for all screen sizes

### 🎨 Modern UI/UX
- **HeroUI component library** for polished interface
- **Dark/light mode support** (via HeroUI theming)
- **Responsive design** that works on mobile, tablet, and desktop
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **Loading states** and error handling

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **HeroUI** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety for backend code
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and verification
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sudoku-fullstack
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# The app will connect to mongodb://localhost:27017/sudoku_app
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### 5. Environment Configuration

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sudoku_app
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
sudoku-fullstack/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/            # Database schemas (User, Sudoku)
│   │   ├── routes/            # API routes (auth, sudoku)
│   │   ├── middleware/        # Authentication middleware
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Helper functions (database)
│   │   └── server.ts          # Main application entry
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies and scripts
│   └── tsconfig.json          # TypeScript configuration
│
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Helper functions (validation)
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # App entry point
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies and scripts
│   ├── tailwind.config.js     # Tailwind/HeroUI configuration
│   └── vite.config.ts         # Vite configuration
│
└── README.md                  # This file
```

## 🔧 Development

### Backend Scripts
```bash
npm run dev       # Start development server with hot reload
npm run build     # Build TypeScript to JavaScript
npm start         # Start production server
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run type-check # TypeScript type checking
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register   # Register new user
POST /api/auth/login      # Login user
```

### Sudoku Puzzles (Protected)
```
GET    /api/sudoku        # Get all user's puzzles
POST   /api/sudoku        # Create new puzzle
GET    /api/sudoku/:id    # Get specific puzzle
DELETE /api/sudoku/:id    # Delete puzzle
```

### Health Check
```
GET /api/health           # Server health status
```

## 📱 Usage

### 1. Register/Login
- Create a new account or login with existing credentials
- JWT token is stored securely in localStorage
- Automatic redirect to dashboard after authentication

### 2. Dashboard
- View all your created puzzles (up to 20)
- Create new puzzles by entering JSON data or using the sample
- Delete puzzles you no longer need
- Click any puzzle to start playing

### 3. Playing Sudoku
- Click a cell to select it
- Use keyboard numbers (1-9) or click number buttons
- Navigate with arrow keys
- Clear cells with Backspace/Delete or the Clear button
- Real-time validation shows conflicts in red
- Auto-completion detection with celebration modal

### 4. Puzzle Creation
Use this sample format for creating puzzles:

```json
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
- `0` represents empty cells
- Numbers 1-9 are pre-filled cells (clues)
- Must be exactly 9x9 grid

## 🔒 Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT token authentication** with expiry
- **Input validation** on both frontend and backend
- **Protected API routes** with middleware
- **CORS configuration** for production safety
- **Environment variable protection** for secrets

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- **Desktop** (1200px+) - Full layout with sidebar controls
- **Tablet** (768px - 1199px) - Adapted layout
- **Mobile** (< 768px) - Stack layout, touch-optimized Sudoku grid

## 🎨 Theming

Built with HeroUI's theming system:
- Consistent design language
- Automatic dark/light mode support
- Customizable color schemes
- Accessible design patterns

## 🚀 Production Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Update API URL in production environment
2. Build the application: `npm run build`
3. Deploy the `dist` folder to a static hosting service

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HeroUI** - For the beautiful component library
- **React Team** - For the amazing React framework
- **Express.js** - For the robust backend framework
- **MongoDB** - For the flexible database solution

---

**Built with ❤️ using React, TypeScript, Node.js, and HeroUI**