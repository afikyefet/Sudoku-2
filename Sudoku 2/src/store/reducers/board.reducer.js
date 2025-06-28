import { boardService } from "../../service/board.service.local";

export const SET_BOARD = "SET_BOARD";
export const SELECT_CELL = "SELECT_CELL";
export const SET_IS_LOADING = "SET_IS_LOADING";


// export const SET_CELLS = "SET_CELLS";

const initialState = {
    board: boardService.getEmptyBoardWithValuesAndFixedCells(),
    selectedCell: null,
    isLoading: false,
    lastBoard: [],
}

export function boardReducer(state = initialState, cmd = {}) {
    switch (cmd.type) {
        case SET_BOARD:
            return {
                ...state,
                board: cmd.board,
            };
        case SELECT_CELL:
            return {
                ...state,
                selectedCell: cmd.cell,
            };
        case SET_IS_LOADING:
            return {
                ...state,
                isLoading: cmd.isLoading,
            };
        default:
            return state;
    }
}