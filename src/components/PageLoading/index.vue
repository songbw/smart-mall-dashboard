<template>
  <div v-loading="loading" />
</template>

<script>
export default {
  name: 'PageLoading',
  data() {
    return {
      loading: true
    }
  },
  created() {
    this.loading = true
  },
  beforeDestroy() {
    this.loading = false
  }
}
</script>
