<template>
  <el-container>
    <el-header style="text-align: center">
      提示：请通过手机“扫一扫”功能，在手机上进行预览！
    </el-header>
    <el-main class="content-center">
      <qriously :value="qrCodeValue" :size="300" />
    </el-main>
    <el-footer class="footer-container">
      <div>
        <el-button @click="$emit('prevStep')">上一步</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  name: 'PreviewPage',
  props: {
    pageId: {
      type: Number,
      default: -1
    }
  },
  computed: {
    qrCodeValue: {
      get() {
        return process.env.VUE_APP_MALL_URL + '/index/' + this.pageId
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('onSaved')
    }
  }
}
</script>

<style lang="scss" scoped>
  .content-center {
    display: flex;
    justify-content: center;
  }

  .footer-container {
    text-align: center;
  }
</style>
