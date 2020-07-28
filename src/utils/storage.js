import SimpleCrypto from 'simple-crypto-js'
import localForage from 'localforage'

const secret = 'fc-mall-1984'
const simpleCrypto = new SimpleCrypto(secret)
const storageMap = new Map()

const storageSetItem = async function (key, value) {
  if (value !== null) {
    try {
      await localForage.removeItem(key)
      await localForage.setItem(key, simpleCrypto.encrypt(value))
      storageMap.set(key, value)
    } catch (e) {
      console.warn('storageSetItem ' + key + ' error:' + e)
    }
  }
}

const storageGetItem = async function (key) {
  if (storageMap.has(key)) {
    return storageMap.get(key)
  } else {
    try {
      const eValue = await localForage.getItem(key)
      return eValue ? simpleCrypto.decrypt(eValue) : null
    } catch (e) {
      console.warn('storageGetItem ' + key + ' error:' + e)
      await localForage.removeItem(key)
      return null
    }
  }
}

const storageRemoveItem = async function (key) {
  try {
    await localForage.removeItem(key)
    storageMap.delete(key)
  } catch (e) {
    console.warn('storageRemoveItem ' + key + ' error:' + e)
  }
}

export { storageSetItem, storageGetItem, storageRemoveItem }

