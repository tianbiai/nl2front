// localStorage 封装

const STORAGE_PREFIX = 'manager_'

/**
 * 获取存储项
 * @param {string} key 键名
 * @returns {*} 值
 */
export function getStorage(key) {
  const fullKey = STORAGE_PREFIX + key
  const value = localStorage.getItem(fullKey)
  if (value === null) return null

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/**
 * 设置存储项
 * @param {string} key 键名
 * @param {*} value 值
 */
export function setStorage(key, value) {
  const fullKey = STORAGE_PREFIX + key
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(fullKey, stringValue)
}

/**
 * 移除存储项
 * @param {string} key 键名
 */
export function removeStorage(key) {
  const fullKey = STORAGE_PREFIX + key
  localStorage.removeItem(fullKey)
}

/**
 * 清空所有存储项（仅清除带前缀的）
 */
export function clearStorage() {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * 获取所有存储项（仅带前缀的）
 * @returns {Object} 所有存储项
 */
export function getAllStorage() {
  const result = {}
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const shortKey = key.replace(STORAGE_PREFIX, '')
      result[shortKey] = getStorage(shortKey)
    }
  })
  return result
}

export default {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  clear: clearStorage,
  getAll: getAllStorage
}
