import { SET_BOARD, IS_LOADING, SET_LAST_BOARD, SET_REDO_BOARD } from '../actions/board.action';

const initialState = {
    board: [],
    isLoading: false,
    lastBoard: null,
    redoBoard: null,
};

export function boardReducer(state = initialState, action) {
    switch (action.type) {
        case SET_BOARD:
            return {
                ...state,
                board: action.board,
            };
        case IS_LOADING:
            return {
                ...state,
                isLoading: action.isLoading,
            };
        case SET_LAST_BOARD:
            return {
                ...state,
                lastBoard: action.lastBoard,
            };
        case SET_REDO_BOARD:
            return {
                ...state,
                redoBoard: action.redoBoard,
            };
        default:
            return state;
    }
}