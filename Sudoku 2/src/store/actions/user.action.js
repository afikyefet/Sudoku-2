import { userService } from "../../service/user.service"
import { SET_ISSIGNUP, SET_USER, TOGGLE_ISSIGNUP } from "../reducers/user.reducer"
import { store } from "../store"

export function login(credentials) {
    console.log(credentials);
    return userService.login(credentials)
        .then((user) => {
            store.dispatch({ type: SET_USER, user })
        })
        .catch((err) => {
            console.log('user actions -> Cannot login', err)
            throw err
        })
}

export function signup(credentials) {
    return userService.signup(credentials)
        .then((user) => {
            store.dispatch({ type: SET_USER, user })
        })
        .catch((err) => {
            
            console.log('user actions -> Cannot signup', err)
            throw err
        })
}

export function logout() {
    return userService.logout()
        .then(() => {
            store.dispatch({ type: SET_USER, user: null })
        })
        .catch((err) => {
            console.log('user actions -> Cannot logout', err)
        })
}

export function setIsSignup(isSignup){
    store.dispatch({type:SET_ISSIGNUP, isSignup})
}

export function toggleIsSignup(){
    store.dispatch({type:TOGGLE_ISSIGNUP })
}