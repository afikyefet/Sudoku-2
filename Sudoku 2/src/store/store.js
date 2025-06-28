import { combineReducers, compose, legacy_createStore as createStore } from "redux"
import { boardReducer } from "./reducers/Board.reducer"
import { userReducer } from "./reducers/user.reducer"


const rootReducer = combineReducers({
    userModule: userReducer,
    boardModule: boardReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(rootReducer, composeEnhancers())

window.gStore = store