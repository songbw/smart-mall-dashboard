import localForage from 'localforage'

localForage.config({
  driver: [
    localForage.INDEXEDDB,
    localForage.LOCALSTORAGE,
    localForage.WEBSQL
  ],
  name: 'smart-mall-dashboard'
})
