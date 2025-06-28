# Sudoku Game

## Overview
This project is a Sudoku game built using React and Redux. It allows users to play Sudoku, save their progress, and manage the game state effectively. The application utilizes a service layer to handle game logic and state management through Redux actions and reducers.

## Features
- Load and save Sudoku boards
- Undo and redo moves
- Reset the board to its initial state
- Clear the board
- Manage loading states
- Store and retrieve board state from local storage

## Project Structure
```
sudoku-game
├── src
│   ├── store
│   │   ├── actions
│   │   │   └── board.action.js
│   │   ├── reducers
│   │   │   └── Board.reducer.js
│   │   └── store.js
│   ├── service
│   │   └── board.service.js
│   └── index.js
├── package.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd sudoku-game
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## Development
- The application is structured using Redux for state management.
- The `src/store/actions/board.action.js` file contains action creators for managing the Sudoku board state.
- The `src/store/reducers/Board.reducer.js` file defines how the state changes in response to actions.
- The `src/service/board.service.js` file contains the core game logic and local storage management.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.