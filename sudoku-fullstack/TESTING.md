# 🧪 Testing Guide - Sudoku Pro

This guide will help you test all features of the Sudoku Pro application to ensure everything is working correctly.

## 🚀 Quick Start Testing

### 1. Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, ensure your connection string is correct in backend/.env
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 Health check: http://localhost:5000/api/health
🌍 Environment: development
```

### 3. Start Frontend Server
```bash
cd frontend
npm run dev
```
You should see the Vite dev server start at `http://localhost:5173`

### 4. Verify Health Check
Visit `http://localhost:5000/api/health` - you should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-XX..."
}
```

## 🔐 Authentication Testing

### Test User Registration
1. Go to `http://localhost:5173`
2. Click "Sign Up" or navigate to `/register`
3. Test the registration form:
   - **Valid registration**: Enter valid email and password (6+ chars)
   - **Email validation**: Try invalid emails (should show error)
   - **Password validation**: Try passwords < 6 chars (should show error)
   - **Password confirmation**: Enter mismatched passwords (should show error)
   - **Duplicate email**: Try registering with same email twice (should show error)

### Test User Login
1. Navigate to `/login`
2. Test the login form:
   - **Valid login**: Use credentials from registration
   - **Invalid credentials**: Try wrong email/password (should show error)
   - **Empty fields**: Submit without filling fields (should be disabled)

### Test Authentication Flow
1. **Automatic redirect**: After login, should redirect to `/dashboard`
2. **Protected routes**: Try accessing `/dashboard` without login (should redirect to `/login`)
3. **Token persistence**: Refresh page while logged in (should stay logged in)
4. **Logout**: Click user avatar → "Log Out" (should redirect to login)

## 🏠 Dashboard Testing

### Test Empty State
1. With a fresh account, dashboard should show:
   - Welcome message with user email
   - "No puzzles yet" empty state
   - "Create Your First Puzzle" button

### Test Puzzle Creation
1. Click "Create New Puzzle" button
2. Test the modal:
   - **Empty title**: Try submitting without title (should show error)
   - **Invalid JSON**: Edit puzzle data with invalid JSON (should show error)
   - **Invalid format**: Try non-9x9 arrays (should show error)
   - **Valid puzzle**: Create puzzle with sample data (should succeed)

### Test Puzzle Management
1. Create multiple puzzles (up to 20)
2. Test puzzle grid display:
   - Should show puzzle preview
   - Should show title and creation date
   - Should have dropdown menu (⋮ button)
3. Test puzzle deletion:
   - Click ⋮ → "Delete" (should remove puzzle)
4. Test 20-puzzle limit:
   - Create 20 puzzles
   - "Create New Puzzle" button should be disabled
   - Try creating via API (should return error)

## 🎮 Sudoku Game Testing

### Test Puzzle Loading
1. Click "Play Puzzle" on any puzzle card
2. Should navigate to `/puzzle/:id`
3. Puzzle should load with:
   - Correct title and date
   - 9x9 grid with pre-filled numbers
   - Number input buttons (1-9, Clear)
   - Game info panel

### Test Cell Selection
1. **Click selection**: Click on empty cells (should highlight blue)
2. **Fixed cells**: Click on pre-filled numbers (should not select)
3. **Row/column/subgrid highlighting**: Selected cell should highlight entire row, column, and 3x3 subgrid
4. **Keyboard navigation**: Use arrow keys to move selection

### Test Number Input
1. **Button input**: Select cell → click number button (should fill cell)
2. **Keyboard input**: Select cell → press number key 1-9 (should fill cell)
3. **Clear input**: Select filled cell → press Backspace/Delete or click Clear (should empty cell)
4. **Toggle behavior**: Click same number twice (should toggle on/off)
5. **Fixed cell protection**: Try entering numbers in pre-filled cells (should not work)

### Test Validation
1. **Valid placement**: Enter valid numbers (should appear normal)
2. **Invalid placement**: Create conflicts:
   - Same number in row (should highlight red)
   - Same number in column (should highlight red)
   - Same number in 3x3 subgrid (should highlight red)
3. **Error counter**: Should update in game info panel
4. **Multiple conflicts**: Create multiple errors (all should be highlighted)

### Test Game Completion
1. **Complete puzzle**: Fill entire grid correctly
2. Should trigger:
   - Success toast notification
   - Completion modal with celebration
   - "Completed!" chip in header
3. **Completion modal**: Should offer "Back to Dashboard" and "Play Again"

### Test Game Controls
1. **Reset button**: Should restore puzzle to original state
2. **Back to Dashboard**: Should navigate back to `/dashboard`
3. **Mobile responsiveness**: Test on mobile device/browser dev tools

## 📱 Responsive Design Testing

### Desktop (1200px+)
- Full layout with sidebar controls
- Large Sudoku grid
- All features accessible

### Tablet (768px - 1199px)
- Adapted layout
- Responsive navigation
- Touch-friendly buttons

### Mobile (< 768px)
- Stacked layout
- Hamburger menu navigation
- Optimized Sudoku grid (320px)
- Touch-optimized cells (32px min)

## 🔒 Security Testing

### Test JWT Authentication
1. **Token expiry**: Tokens expire in 7 days by default
2. **Invalid token**: Manually modify localStorage token (should logout)
3. **Missing token**: Remove token from localStorage (should redirect to login)

### Test API Protection
1. Try accessing protected endpoints without token:
   ```bash
   curl http://localhost:5000/api/sudoku
   # Should return 401 Unauthorized
   ```

### Test Input Validation
1. **SQL injection**: Try malicious inputs (should be sanitized)
2. **XSS**: Try script tags in puzzle titles (should be escaped)
3. **Large payloads**: Try extremely large puzzle data (should be rejected)

## 🐛 Error Handling Testing

### Test Network Errors
1. **Backend down**: Stop backend server, try using frontend
2. **Invalid API URL**: Change frontend API URL to invalid address
3. **Timeout**: Simulate slow network conditions

### Test Data Corruption
1. **Invalid puzzle data**: Manually edit database with invalid puzzle format
2. **Missing user**: Delete user from database while they're logged in
3. **Corrupted localStorage**: Manually edit localStorage data

## 🧪 Sample Test Data

### Valid Puzzle JSON
```json
{
  "title": "Test Puzzle Easy",
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

### Complete Solution (for testing completion)
```json
{
  "title": "Almost Complete",
  "puzzleData": [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,0]
  ]
}
```
(Only the bottom-right cell needs to be filled with 9)

## ✅ Test Checklist

### Backend
- [ ] MongoDB connection works
- [ ] Health check endpoint responds
- [ ] User registration with validation
- [ ] User login with JWT generation
- [ ] Protected routes require authentication
- [ ] Puzzle CRUD operations work
- [ ] 20-puzzle limit enforced
- [ ] Input validation prevents invalid data

### Frontend
- [ ] App loads without errors
- [ ] Navigation works correctly
- [ ] Authentication flow complete
- [ ] Dashboard shows puzzles correctly
- [ ] Puzzle creation modal works
- [ ] Sudoku game loads and plays
- [ ] Real-time validation works
- [ ] Game completion detection works
- [ ] Responsive design on all screen sizes
- [ ] Error handling displays appropriately

### Integration
- [ ] Frontend communicates with backend
- [ ] Authentication persists across page reloads
- [ ] Data synchronization works
- [ ] Error states handled gracefully

## 🚨 Common Issues & Solutions

### Backend won't start
- Check MongoDB is running
- Verify environment variables in `.env`
- Check port 5000 is not in use

### Frontend won't start
- Run `npm install` to ensure dependencies
- Check Node.js version (v16+)
- Verify Vite configuration

### Authentication issues
- Clear localStorage and cookies
- Check JWT secret configuration
- Verify token format in network requests

### Database issues
- Check MongoDB connection string
- Verify database permissions
- Check for network connectivity

---

**Happy Testing! 🧩✨**