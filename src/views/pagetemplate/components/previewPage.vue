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
        <el-button @click="$emit('prevStep')">{{ $t('confirm_button_prev_title') }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ $t('confirm_button_ok_title') }}</el-button>
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
          return 'http://mall.weesharing.com/#/index/' + this.pageId
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

<style scoped>
  .content-center {
    display: flex;
    justify-content: center;
  }

  .phone-container {
    height: 720px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .phone {
    width: 375px;
    height: 680px;
    padding: 20px 10px;
    border-radius: 30px;
    box-shadow: 0 0 0 2px #aaa;
    background: #111;
    position: absolute;
  }

  .phone iframe {
    width: 100%;
    height: 640px;
    display: block;
    border-radius: 12px
  }

  .footer-container {
    text-align: center;
  }
</style>
