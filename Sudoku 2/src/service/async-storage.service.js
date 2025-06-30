export const storageService = {
    load,
    query,
    save,
    get,
    set,
    remove,
}

// Public API

function load(entityType, delay = 200) {
    const entity = JSON.parse(localStorage.getItem(entityType))
    return new Promise(resolve => setTimeout(() => resolve(entity), delay))
}

function query(entityType, delay = 200) {
    const entity = JSON.parse(localStorage.getItem(entityType))
    return new Promise(resolve => setTimeout(() => resolve(entity), delay))
}

function save(entityType, entity) {
    localStorage.setItem(entityType, JSON.stringify(entity))
}

async function get(entityType) {
    const entity = await load(entityType)
    if (!entity) {
        throw new Error(`Get failed: No data found for "${entityType}"`)
    }
    return entity
}

async function set(entityType, newEntity) {
    if (!newEntity._id) newEntity._id = _makeId()
    save(entityType, newEntity)
    return newEntity
}

function remove(entityType) {
    localStorage.removeItem(entityType)
}

// Private Helper

function _makeId(length = 5) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('')
}
