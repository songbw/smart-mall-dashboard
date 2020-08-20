<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :visible="dialogVisible"
    :title="alipayConfig !== null ? '编辑支付宝配置' : '新建支付宝配置'"
    @open="onDialogOpen"
  >
    <el-form
      ref="alipayConfigForm"
      :model="formData"
      :rules="formRules"
      label-position="right"
      label-width="8rem"
    >
      <el-form-item label="配置描述" prop="remark">
        <el-input v-model.trim="formData.remark" maxlength="30" />
      </el-form-item>
      <el-form-item label="支付宝AppID" prop="appId">
        <el-input v-model.trim="formData.appId" maxlength="30" />
      </el-form-item>
      <el-form-item label="API地址" prop="apiUrl">
        <el-input v-model.trim="formData.apiUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="支付回调地址" prop="payNotifyUrl">
        <el-input v-model.trim="formData.payNotifyUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="退款回调地址" prop="refundNotifyUrl">
        <el-input v-model.trim="formData.refundNotifyUrl" maxlength="256" />
      </el-form-item>
      <el-form-item label="支付宝私钥" prop="privateKey">
        <el-input v-model.trim="formData.privateKey" maxlength="5120" />
      </el-form-item>
      <el-form-item label="支付宝公钥" prop="publicKey">
        <el-input v-model.trim="formData.publicKey" maxlength="5120" />
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
  name: 'AlipayConfigDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    alipayConfig: {
      type: Object,
      default: null
    }
  },
  data() {
    const validateField = (rule, value, callback) => {
      if (isEmpty(value)) {
        let errDesc = ''
        switch (rule.field) {
          case 'appId':
            errDesc = '请输入支付宝AppID'
            break
          case 'apiUrl':
            errDesc = '请输入支付宝Api地址'
            break
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
        apiUrl: '',
        appId: '',
        payNotifyUrl: '',
        refundNotifyUrl: '',
        privateKey: '',
        publicKey: ''
      },
      formRules: {
        appId: [{ required: true, trigger: 'blur', validator: validateField }],
        apiUrl: [{ required: true, trigger: 'blur', validator: validateField }],
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
        this.formData[key] = this.alipayConfig && this.alipayConfig[key] ? this.alipayConfig[key] : ''
      })
    },
    handleDialogCancel() {
      this.resetFormData()
      this.$refs.alipayConfigForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.alipayConfigForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', { ...this.formData })
          this.resetFormData()
          this.$refs.alipayConfigForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
