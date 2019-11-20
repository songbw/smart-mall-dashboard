import { Base64 } from 'js-base64'
import SimpleCrypto from 'simple-crypto-js'
import localForage from 'localforage'

const secret = 'fc-mall-9527'
const simpleCrypto = new SimpleCrypto(secret)
const storageMap = new Map()

const storageSetItem = async function(key, value) {
  if (value !== null) {
    const bKey = Base64.encode(key)
    await localForage.setItem(bKey, simpleCrypto.encrypt(value))
    storageMap.set(key, value)
  }
}

const storageGetItem = async function(key) {
  if (storageMap.has(key)) {
    return storageMap.get(key)
  } else {
    const bKey = Base64.encode(key)
    const eValue = await localForage.getItem(bKey)
    return eValue ? simpleCrypto.decrypt(eValue) : null
  }
}

const storageRemoveItem = async function(key) {
  const bKey = Base64.encode(key)
  await localForage.removeItem(bKey)
  storageMap.delete(key)
}

export { storageSetItem, storageGetItem, storageRemoveItem }

