<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  import { Base64 } from 'js-base64'
  import axios from 'axios'

  const pako = require('pako');
  export default {
    name: 'App',
    created() {
      this.$store.dispatch('GetCosUrl').then(() => {
      }).catch(err => {
      })
      axios.get('http://192.168.1.44:8080/aggregation/getCompress').then(response => {
        const data = response.data.data.result
        console.log(data.name)
        const encodedContent = Base64.decode(data.content)
        const content = pako.ungzip(encodedContent)
        console.log('' + content)
      })
    }
  }
</script>
