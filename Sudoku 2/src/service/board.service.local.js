import { storageService } from "./async-storage.service";
import { utilService } from "./util.service";

export const boardService = {
    getBoard,
    setBoard,
    getEmptyBoard,
    setCell,
    getRow,
    getCol,
    getBox,
    getEmptyCell,
    getEmptyRow,
    getEmptyCol,
    getEmptyBox,
    getEmptyBoardWithFixedCells,
    getEmptyBoardWithValues,
    getEmptyBoardWithValuesAndFixedCells
};

const boardDB = 'board';


function getEmptyBoard() {
    console.log("emptyyyyyyyyyyyy");

    let emptyBoard = {
        _id: utilService.makeId(),
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
        Array.from({ length: 9 }, () => (getEmptyCell())))
    return emptyBoard
}

export function getEmptyCell() {
    return { value: 0, isFixed: false };
}

async function getBoard() {
    try {
        console.log('board service -> getting board');
        let board = await storageService.query(boardDB);
        console.log('board service -> board:', board);

        if (!board || !board.cells) {
            const emptyBoard = getEmptyBoard();
            board = storageService.save(boardDB, emptyBoard);
            console.log('board service -> no board found, created empty board:', board);
        }

        return board;
    } catch (err) {
        console.error('board service -> could not get board', err);
        throw err; // cleaner than Promise.reject
    }
}


async function setBoard(board) {
    await storageService.set(boardDB, board);
}


async function setCell(row, col, value, isFixed = false) {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) {
        throw new Error('Row or column index out of bounds');
    }

    if (value < 0 || value > 9) {
        throw new Error('Value must be between 0 and 9');
    }

    let board = await getBoard();
    console.log(board + "heyhgey");

    board.cells[row][col] = {
        ...board.cells[row][col], value, isFixed
    };
    console.log('board service -> setting cell', { row, col, value, isFixed });
    await setBoard(board);
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
