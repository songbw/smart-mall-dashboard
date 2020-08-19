<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :visible="dialogVisible"
    :title="renterData !== null ? '编辑租户' : '创建租户'"
    @open="onDialogOpen"
  >
    <el-form
      ref="renterForm"
      :model="formData"
      :rules="formRules"
      label-position="right"
      label-width="10rem"
    >
      <el-form-item label="租户名称" prop="renterName">
        <el-input v-model="formData.renterName" maxlength="30" />
      </el-form-item>
      <el-form-item label="租户电话" prop="phone">
        <el-input v-model="formData.phone" maxlength="11" />
      </el-form-item>
      <el-form-item label="社会统一信用码" prop="uniformCode">
        <el-input v-model="formData.uniformCode" maxlength="50" />
      </el-form-item>
      <el-form-item label="租户地址" prop="address">
        <el-input
          v-model="formData.address"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item label="发票类型" prop="invoiceType">
        <el-select
          v-model="formData.invoiceType"
          placeholder="请选择发票类型"
        >
          <el-option
            v-for="item in invoiceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="纳税人类型" prop="taxpayerType">
        <el-select
          v-model="formData.taxpayerType"
          placeholder="请选择纳税人类型"
        >
          <el-option
            v-for="item in taxpayerOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
import {
  VendorInvoiceOptions,
  VendorTaxpayerOptions
} from '@/utils/constants'
import isEmpty from 'lodash/isEmpty'
import { validPhone } from '@/utils/validate'

export default {
  name: 'RenterFormDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    renterData: {
      type: Object,
      default: null
    }
  },
  data() {
    const validateField = (rule, value, callback) => {
      if (isEmpty(value)) {
        let errDesc = ''
        switch (rule.field) {
          case 'renterName':
            errDesc = '请输入租户名称'
            break
          case 'address':
            errDesc = '请输入租户地址'
            break
          case 'uniformCode':
            errDesc = '请输入社会统一信用码'
            break
          case 'invoiceType':
            errDesc = '请选择发票类型'
            break
          case 'taxpayerType':
            errDesc = '请选择纳税人类型'
            break
        }
        callback(new Error(errDesc))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (isEmpty(value) || validPhone(value) === false) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    return {
      invoiceOptions: VendorInvoiceOptions.map(item => ({ value: item.value.toString(), label: item.label })),
      taxpayerOptions: VendorTaxpayerOptions.map(item => ({ value: item.value.toString(), label: item.label })),
      formData: {
        renterName: '',
        address: '',
        uniformCode: '',
        phone: '',
        invoiceType: '',
        taxpayerType: ''
      },
      formRules: {
        renterName: [{ required: true, trigger: 'change', validator: validateField }],
        address: [{ required: true, trigger: 'change', validator: validateField }],
        uniformCode: [{ required: true, trigger: 'change', validator: validateField }],
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        invoiceType: [{ required: true, trigger: 'change', validator: validateField }],
        taxpayerType: [{ required: true, trigger: 'change', validator: validateField }]
      }
    }
  },
  methods: {
    onDialogOpen() {
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = this.renterData ? this.renterData[key].toString() : ''
      })
    },
    handleDialogCancel() {
      this.$refs.renterForm.resetFields()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.renterForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', { ...this.formData })
          this.$refs.renterForm.resetFields()
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
