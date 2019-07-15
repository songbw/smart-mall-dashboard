<template>
  <el-dialog :visible="dialogVisible" :show-close="false" title="页面预览" width="380px" center append-to-body>
    <div class="content-center">
      <h3>请通过手机“扫一扫”功能，在手机上进行预览</h3>
    </div>
    <div class="content-center">
      <qriously :value="qrCode" :size="200" />
    </div>
    <div slot="footer">
      <el-button type="primary" @click="handleCloseDialog">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'PreviewDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    qrCode: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleCloseDialog() {
      this.$emit('closed')
    }
  }
}
</script>

<style scoped>
  .content-center {
    display: flex;
    justify-content: center;
  }
</style>
