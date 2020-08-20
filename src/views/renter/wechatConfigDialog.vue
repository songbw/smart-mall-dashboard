<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :visible="dialogVisible"
    :title="wechatPayConfig !== null ? '编辑微信支付配置' : '新建微信支付配置'"
    @open="onDialogOpen"
  >
    <el-form
      ref="wechatPayConfigForm"
      :model="formData"
      :rules="formRules"
      label-position="right"
      label-width="10rem"
    >
      <el-form-item label="配置描述" prop="remark">
        <el-input v-model.trim="formData.remark" maxlength="30" />
      </el-form-item>
      <el-form-item label="微信支付AppID" prop="appId">
        <el-input v-model.trim="formData.appId" maxlength="50" />
      </el-form-item>
      <el-form-item label="微信支付AppSecret" prop="appSecret">
        <el-input v-model.trim="formData.appSecret" maxlength="50" />
      </el-form-item>
      <el-form-item label="API地址" prop="apiUrl">
        <el-input v-model.trim="formData.apiUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="微信支付jsAppId" prop="jsAppId">
        <el-input v-model.trim="formData.jsAppId" maxlength="50" />
      </el-form-item>
      <el-form-item label="微信支付jsAppSecret" prop="jsAppSecret">
        <el-input v-model.trim="formData.jsAppSecret" maxlength="50" />
      </el-form-item>
      <el-form-item label="jsApi地址" prop="jsApiUrl">
        <el-input v-model.trim="formData.jsApiUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="支付回调地址" prop="payNotifyUrl">
        <el-input v-model.trim="formData.payNotifyUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="退款回调地址" prop="refundNotifyUrl">
        <el-input v-model.trim="formData.refundNotifyUrl" maxlength="256" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'WechatConfigDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    wechatPayConfig: {
      type: Object,
      default: null
    }
  },
  data() {
    const validateField = (rule, value, callback) => {
      if (isEmpty(value)) {
        let errDesc = ''
        switch (rule.field) {
          case 'remark':
            errDesc = '请输入配置描述'
            break
        }
        callback(new Error(errDesc))
      } else {
        callback()
      }
    }
    return {
      formData: {
        remark: '',
        appId: '',
        appSecret: '',
        apiUrl: '',
        payNotifyUrl: '',
        refundNotifyUrl: '',
        jsApiUrl: '',
        jsAppId: '',
        jsAppSecret: ''
      },
      formRules: {
        remark: [{ required: true, trigger: 'blur', validator: validateField }]
      }
    }
  },
  methods: {
    resetFormData() {
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = ''
      })
    },
    onDialogOpen() {
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = this.wechatPayConfig && this.wechatPayConfig[key] ? this.wechatPayConfig[key] : ''
      })
    },
    handleDialogCancel() {
      this.resetFormData()
      this.$refs.wechatPayConfigForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.wechatPayConfigForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', { ...this.formData })
          this.resetFormData()
          this.$refs.wechatPayConfigForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
