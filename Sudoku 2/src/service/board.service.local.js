export const boardService = {
    getEmptyBoard, getBoard, setBoard, getCell, setCell, getRow, getCol, getBox,
    getEmptyCell, getEmptyRow, getEmptyCol, getEmptyBox, getEmptyBoardWithFixedCells,
    getEmptyBoardWithValues, getEmptyBoardWithValuesAndFixedCells
};

function getEmptyBoard() {
    let emptyBoard = {
        id: 'empty-board',
        title: 'New Sudoku Board',
        description: 'This is a new empty Sudoku board.',
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSolved: false,
        isLoading: false,
        cells: [],
    }
    emptyBoard.cells = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => ({ value: 0, isFixed: false })))
    return emptyBoard
}
function getBoard() {
    const board = JSON.parse(localStorage.getItem('board'));
    return board || getEmptyBoard();
}
function setBoard(board) {
    localStorage.setItem('board', JSON.stringify(board));
}
function getCell(board, row, col) {
    return board[row][col];
}
function setCell(board, row, col, value) {
    board[row][col].value = value;
    return board;
}
function getRow(board, row) {
    return board[row];
}
function getCol(board, col) {
    return board.map(row => row[col]);
}
function getBox(board, row, col) {
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    const box = [];
    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
            box.push(board[r][c]);
        }
    }
    return box;
}
export function getEmptyCell() {
    return { value: 0, isFixed: false };
}
export function getEmptyRow() {
    return Array.from({ length: 9 }, () => getEmptyCell());
}
export function getEmptyCol() {
    return Array.from({ length: 9 }, () => getEmptyCell());
}
export function getEmptyBox() {
    return Array.from({ length: 3 }, () => getEmptyRow());
}

export function getEmptyBoardWithFixedCells() {
    const board = getEmptyBoard();
    // Set some cells as fixed for testing
    board.cells[0][0].value = 5;
    board.cells[0][0].isFixed = true;
    board.cells[1][1].value = 3;
    board.cells[1][1].isFixed = true;
    board.cells[2][2].value = 4;
    board.cells[2][2].isFixed = true;
    return board;
}
export function getEmptyBoardWithValues() {
    const board = getEmptyBoard();
    // Set some cells with values for testing
    board.cells[0][0].value = 5;
    board.cells[0][1].value = 3;
    board.cells[0][2].value = 4;
    board.cells[1][0].value = 6;
    board.cells[1][1].value = 7;
    board.cells[1][2].value = 8;
    return board;
}
export function getEmptyBoardWithValuesAndFixedCells() {
    const board = getEmptyBoard();
    // Set some cells with values and fixed for testing
    board.cells[0][0].value = 5;
    board.cells[0][0].isFixed = true;
    board.cells[0][4].value = 3;
    board.cells[0][2].value = 4;
    board.cells[1][0].value = 6;
    board.cells[1][1].value = 7;
    board.cells[1][2].value = 8;
    return board;
}
