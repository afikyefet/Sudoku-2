import { boardService } from '../../service/board.service';
import { SET_BOARD } from '../reducers/Board.reducer';
import { store } from '../store';

export function loadBoard(boardId) {
    return boardService.query(boardId)
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
        })
        .catch(err => {
            console.error('board action -> could not load board', err);
            throw err;
        });
}

export function saveBoard(board) {
    return boardService.save(board)
        .then(savedBoard => {
            store.dispatch({ type: SET_BOARD, board: savedBoard });
            return savedBoard;
        })
        .catch(err => {
            console.error('board action -> could not save board', err);
            throw err;
        });
}

export function resetBoard() {
    return boardService.reset()
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
        })
        .catch(err => {
            console.error('board action -> could not reset board', err);
            throw err;
        });
}

export function setSelectedCell(cell) {
    store.dispatch({ type: 'SELECT_CELL', cell });
}

export function setCells(cells) {
    store.dispatch({ type: 'SET_CELLS', cells });
}

export function undoLastMove() {
    return boardService.undo()
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
        })
        .catch(err => {
            console.error('board action -> could not undo last move', err);
            throw err;
        });
}

export function redoLastMove() {
    return boardService.redo()
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
        })
        .catch(err => {
            console.error('board action -> could not redo last move', err);
            throw err;
        });
}

export function setBoard(board) {
    store.dispatch({ type: SET_BOARD, board });
}

export function clearBoard() {
    store.dispatch({ type: SET_BOARD, board: [] });
}

export function setIsLoading(isLoading) {
    store.dispatch({ type: 'IS_LOADING', isLoading });
}

export function setLastBoard(board) {
    store.dispatch({ type: 'SET_LAST_BOARD', lastBoard: board });
}

export function setRedoBoard(board) {
    store.dispatch({ type: 'SET_REDO_BOARD', redoBoard: board });
}

export function setBoardFromLocalStorage() {
    const board = boardService.getBoardFromLocalStorage();
    if (board) {
        store.dispatch({ type: SET_BOARD, board });
    } else {
        console.warn('No board found in local storage');
    }
}