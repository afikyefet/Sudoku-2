import { combineReducers, compose, legacy_createStore as createStore } from "redux"
import { toyReducer } from "./reducers/toy.reducer"
import { modalReducer } from "./reducers/modal.reducer"
import { userReducer } from "./reducers/user.reducer"

const rootReducer = combineReducers({
    // toyModule: toyReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(rootReducer, composeEnhancers())

window.gStore = store