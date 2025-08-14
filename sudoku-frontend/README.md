# Sudoku Frontend

A modern, responsive React application for creating and solving Sudoku puzzles. Built with TypeScript, Tailwind CSS, and featuring a beautiful, accessible user interface.

## Features

- 🔐 **User Authentication** - Secure JWT-based login and registration
- 🎮 **Interactive Sudoku Player** - Click-to-select cells with real-time validation
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✨ **Modern UI** - Clean, accessible interface with Tailwind CSS
- 🧩 **Puzzle Management** - Upload, view, and delete up to 20 puzzles per user
- 📊 **Real-time Validation** - Instant feedback on conflicts and completion
- ⌨️ **Keyboard Support** - Full keyboard navigation and shortcuts
- 🎯 **Accessibility** - Screen reader friendly with ARIA labels

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ProtectedRoute.tsx
│   ├── SudokuCell.tsx
│   └── SudokuGrid.tsx
├── contexts/            # React Context providers
│   └── AuthContext.tsx
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── PuzzleEditor.tsx
│   └── Register.tsx
├── services/            # API and external services
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── sudokuValidation.ts
├── App.tsx              # Main application component
└── index.tsx            # Application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see ../sudoku-backend)

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd sudoku-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Create .env file (already exists)
   # Update REACT_APP_API_URL if backend is running on different port
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

## Running the Application

### Development Mode
```bash
npm start
```
Opens the app at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

## Usage

### Authentication
1. **Register**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Auto-redirect**: Authenticated users go to dashboard, guests to login

### Dashboard
- **View Statistics**: See your puzzle count (max 20)
- **Upload Puzzles**: Add new puzzles via JSON or manual entry
- **Manage Puzzles**: View, play, or delete existing puzzles
- **JSON Format**: Use the provided example format for uploads

### Puzzle Editor
- **Interactive Grid**: Click cells to select, type numbers to fill
- **Real-time Validation**: Conflicts highlighted in red
- **Number Pad**: Mobile-friendly number input
- **Keyboard Shortcuts**: Full keyboard support
- **Progress Tracking**: Completion detection and celebration

## Puzzle JSON Format

Upload puzzles using this JSON structure:

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
- `1-9` represent filled numbers
- Each row must have exactly 9 numbers
- Grid must be 9x9

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Enter number in selected cell |
| `0` or `Backspace` | Clear selected cell |
| `Arrow Keys` | Navigate between cells |
| `Tab` | Move to next editable cell |
| `Escape` | Deselect current cell |

## Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px - Stacked layout, touch-friendly controls
- **Tablet**: 640px - 1024px - Optimized grid and side panels
- **Desktop**: > 1024px - Full side-by-side layout

## Accessibility Features

- **Screen Reader Support**: ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Clear visual indicators for states
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader feedback

## API Integration

The frontend communicates with the backend API:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Puzzle Endpoints
- `GET /api/sudoku` - Get user's puzzles
- `POST /api/sudoku` - Create new puzzle
- `GET /api/sudoku/:id` - Get specific puzzle
- `DELETE /api/sudoku/:id` - Delete puzzle

### Token Management
- JWT tokens stored in localStorage
- Automatic token inclusion in requests
- Token expiration handling with redirect

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## Browser Support

- **Chrome** (last 2 versions)
- **Firefox** (last 2 versions)
- **Safari** (last 2 versions)
- **Edge** (last 2 versions)

## Performance Optimizations

- **Code Splitting**: Automatic by Create React App
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Prevent unnecessary re-renders
- **Efficient Updates**: Optimized state management

## Security Features

- **JWT Token Storage**: Secure localStorage handling
- **Auto-logout**: On token expiration
- **Protected Routes**: Authentication-gated pages
- **XSS Prevention**: React's built-in protections

## Development Guidelines

### Code Style
- **TypeScript**: Strict typing enabled
- **ESLint**: Code linting (can be added)
- **Prettier**: Code formatting (can be added)
- **Component Structure**: Functional components with hooks

### State Management
- **React Context**: For global state (auth, theme)
- **useState**: For local component state
- **useEffect**: For side effects and API calls

### Error Handling
- **API Errors**: Centralized error handling
- **User Feedback**: Clear error messages
- **Graceful Degradation**: Fallback UI states

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Deployment

### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Configure redirects for SPA routing

### Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Traditional Hosting
1. Build: `npm run build`
2. Upload `build` folder contents
3. Configure server for SPA routing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed
- Check TypeScript errors
- Verify environment variables

**API Connection Issues**
- Verify backend is running
- Check CORS configuration
- Confirm API URL in .env

**Authentication Problems**
- Clear localStorage
- Check JWT token format
- Verify backend auth endpoints

### Debug Mode

```bash
# Enable detailed logging
REACT_APP_DEBUG=true npm start
```

## License

This project is licensed under the MIT License.
