import { boardService } from "../../service/board.service.local";
import { SET_BOARD, SET_IS_LOADING } from "../reducers/Board.reducer";
import { store } from "../store";


export async function loadBoard() {
    try {
        // setIsLoading(true);
        console.log('board action -> loading board');
        const board = await boardService.getBoard();
        console.log('board action -> loaded board:', board);

        store.dispatch({ type: SET_BOARD, board });
        return board;
    } catch (err) {
        console.error('board action -> could not load board', err);
        return Promise.reject(err);
    } finally {
        setIsLoading(false);
    }
}

export function setBoard(board) {
    return boardService.setBoard(board)
        .then(() => {
            store.dispatch({ type: SET_BOARD, board });
        })
        .catch(err => {
            console.error('board action -> could not set board', err);
            throw err;
        })
}

export function setIsLoading(isLoading) {
    return store.dispatch({ type: SET_IS_LOADING, isLoading })
}

export async function getBoard() {
    try {
        const board = await boardService.getBoard();
        store.dispatch({ type: SET_BOARD, board });
        return board;
    } catch (err) {
        console.error('board action -> could not get board', err);
        throw err;
    }
}

export function getCell(row, col) {
    return boardService.getCell(row, col)
        .then(cell => {
            return cell;
        })
        .catch(err => {
            console.error('board action -> could not get cell', err);
            throw err;
        });
}

export function setCell(row, col, value, isFixed = false) {
    console.log('board action -> setting cell', { row, col, value });

    if (row == null) {
        return store.dispatch({ type: 'SELECT_CELL', cell: null });
    }

    return boardService.setCell(row, col, value, isFixed)
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
            return board;
        })
        .catch(err => {
            console.error('board action -> could not set cell', err);
            throw err;
        });
}

export function setSelectedCell(row, col) {
    return store.dispatch({ type: 'SELECT_CELL', cell: { row, col } });
}

export function resetSelectedCell() {
    return store.dispatch({ type: 'SELECT_CELL', cell: null });
}

