<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :visible="dialogVisible"
    :title="appConfig !== null ? '编辑租户' : '创建租户'"
    @open="onDialogOpen"
  >
    <el-form
      ref="appConfigForm"
      :model="formData"
      :rules="formRules"
      label-position="right"
      label-width="12rem"
    >
      <el-form-item label="运营端AppID" prop="appId">
        <el-input v-model.trim="formData.appId" :readonly="appConfig !== null" maxlength="30" />
      </el-form-item>
      <el-form-item label="运营端名称" prop="appName">
        <el-input v-model.trim="formData.appName" maxlength="30" />
      </el-form-item>
      <el-form-item label="运营端域名" prop="domain">
        <el-input v-model.trim="formData.domain" maxlength="50" />
      </el-form-item>
      <el-form-item label="支付宝" prop="alipayId">
        <el-select
          v-model="formData.alipayId"
          placeholder="请选择支付方式"
          clearable
        >
          <el-option
            v-for="item in alipayOptions"
            :key="item.alipayId"
            :label="item.remark"
            :value="item.alipayId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="微信支付" prop="wechatId">
        <el-select
          v-model="formData.wechatId"
          placeholder="请选择支付方式"
          clearable
        >
          <el-option
            v-for="item in wepayOptions"
            :key="item.wechatId"
            :label="item.remark"
            :value="item.wechatId"
          />
        </el-select>
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
  name: 'AppConfigDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    appConfig: {
      type: Object,
      default: null
    },
    alipayOptions: {
      type: Array,
      default: function () {
        return []
      }
    },
    wepayOptions: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    const validateField = (rule, value, callback) => {
      if (isEmpty(value)) {
        let errDesc = ''
        switch (rule.field) {
          case 'appId':
            errDesc = '请输入运营端ID'
            break
          case 'appName':
            errDesc = '请输入运营端名称'
            break
          case 'domain':
            errDesc = '请输入运营端域名'
            break
        }
        callback(new Error(errDesc))
      } else {
        callback()
      }
    }
    return {
      formData: {
        appId: '',
        appName: '',
        domain: '',
        appKey: '',
        appSecret: '',
        alipayId: '',
        wechatId: ''
      },
      formRules: {
        appId: [{ required: true, trigger: 'blur', validator: validateField }],
        appName: [{ required: true, trigger: 'blur', validator: validateField }],
        domain: [{ required: true, trigger: 'blur', validator: validateField }]
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
        this.formData[key] = this.appConfig && this.appConfig[key] ? this.appConfig[key].toString() : ''
      })
    },
    handleDialogCancel() {
      this.resetFormData()
      this.$refs.appConfigForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.appConfigForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', { ...this.formData })
          this.resetFormData()
          this.$refs.appConfigForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
