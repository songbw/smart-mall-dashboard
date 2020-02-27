import SimpleCrypto from 'simple-crypto-js'
import localForage from 'localforage'

const secret = 'fc-mall-9527'
const simpleCrypto = new SimpleCrypto(secret)
const storageMap = new Map()

const storageSetItem = async function (key, value) {
  if (value !== null) {
    await localForage.removeItem(key)
    await localForage.setItem(key, simpleCrypto.encrypt(value))
    storageMap.set(key, value)
  }
}

const storageGetItem = async function (key) {
  if (storageMap.has(key)) {
    return storageMap.get(key)
  } else {
    const eValue = await localForage.getItem(key)
    return eValue ? simpleCrypto.decrypt(eValue) : null
  }
}

const storageRemoveItem = async function (key) {
  await localForage.removeItem(key)
  storageMap.delete(key)
}

export { storageSetItem, storageGetItem, storageRemoveItem }

