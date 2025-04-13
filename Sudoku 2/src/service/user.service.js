import { storageService } from "./async-storage.service"

const STORAGE_KEY = "userDB"
const STORAGE_KEY_LOGGEDIN = 'loggedinUser'


export const userService = {
    getById,
    login,
    signup,
    logout,
    getEmptyCredentials,
    getLoggedinUser,
}
_setAdmin()

function getById(userId) {
    return storageService.get(STORAGE_KEY, userId)
    .then(user => {
        delete user.password
        return user
    })
    .catch(err =>{
        console.error('could not get user by id', err)
        throw err
    })
}

function login({username, password}){
    return storageService.query(STORAGE_KEY)
    .then(users => {
        const user = users.find(user => user.username === username)
        if (user && user.password !== password) return Promise.reject('Incorrect Password')
        if (user) return _setLoggedinUser(user)
            else return Promise.reject('Invalid login')
    })
}

function signup({ username, password, fullname }) {
    const user = { username, password, fullname, isAdmin: false}

    
    if (!user.imgUrl) user.imgUrl = '/public/default-profile.webp'
    return storageService.post(STORAGE_KEY, user)
        .then(_setLoggedinUser)
}

function _setAdmin(){
    const adminUser = {
        username: 'admin',
        password: 'admin',
        fullname: 'admin admond',
        imgUrl: '/public/default-profile.webp',
        isAdmin: true
    }
    storageService.query(STORAGE_KEY)
    .then(users => {
        const user = users.find(user => user.username === adminUser.username)
        if(user) return
        storageService.post(STORAGE_KEY, adminUser)
    })

}

function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN)
    return Promise.resolve()
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN))
}

function _setLoggedinUser(user) {
    const userToSave = { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl, isAdmin: user.isAdmin}
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN, JSON.stringify(userToSave))
    return userToSave
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}
