import { boardService } from "../../service/board.service.local";
import { SET_BOARD, SET_IS_LOADING } from "../reducers/Board.reducer";
import { store } from "../store";

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

export function getBoard() {
    return boardService.getBoard()
        .then(board => {
            store.dispatch({ type: SET_BOARD, board });
            return board;
        })
        .catch(err => {
            console.error('board action -> could not get board', err);
            throw err;
        });
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

export function setCell(row, col, value) {
    return boardService.setCell(row, col, value)
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





// export function loadToys(filterBy = {}){
//     return toysService.query(filterBy)
//     .then(toys => {
//         store.dispatch({type: SET_TOYS, toys})
//     })
//     .catch(err => {
//         console.error('toys action -> could not load toys', err);
//         throw err
//     })
// }

// export function setIsLoading(isLoading){
//     return store.dispatch({type: IS_LOADING, isLoading})
// }

// export function setSelectedToy(toyId){
//     return store.dispatch({type: SELECT_TOY, toyId})
// }

// export function saveToy(toy){
//     const type = toy._id ? UPDATE_TOY : ADD_TOY
//     return toysService.save(toy)
//     .then((savedToy)=>{
//         store.dispatch({type, toy})
//         setSelectedToy(savedToy._id)
//         return savedToy
//     })
//     .catch(err => {
//         console.error('toy action -> could not save toy', err);
//         throw err
//     })
// }

// export function removeToy(toyId){
//     return toysService.remove(toyId)
//     .then(()=>{
//         store.dispatch({type: REMOVE_TOY, toyId})
//     }).catch(err =>{
//         console.error('toy action -> could not delete toy ', err);
//         throw err
//     }
//     )
// }


// export function removeReview(toy, reviewId){
//     const newReviews = toy.msgs.filter((review) => review.id !== reviewId)
//     const toyToSave = {...toy, msgs: newReviews}
//     return saveToy(toyToSave)
//     .catch((err)=>{
//         console.log('toy action -> could not remove review');
//         throw err
//     })
// }


// export function setFilterBy(filterBy) {
//     store.dispatch({ type: SET_FILTER_BY, filterBy })
// }