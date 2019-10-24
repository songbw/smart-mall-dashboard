<template>
  <el-dialog
    title="物流信息"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    @opened="getExpressList"
  >
    <el-form
      ref="deliveryForm"
      v-loading="expressLoading"
      :model="deliveryData"
      :rules="deliveryRules"
      label-width="100px"
    >
      <el-form-item label="物流公司" prop="comCode">
        <el-select :value="deliveryData.comCode" placeholder="请选择物流公司" @change="onExpressSelected">
          <el-option
            v-for="item in expressOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物流单号" prop="logisticsId">
        <el-input v-model="deliveryData.logisticsId" placeholder="请输入对应物流公司单号" maxlength="30" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancelDeliver">取消</el-button>
      <el-button type="primary" @click="handleConfirmDeliver">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { getExpressCompanyApi } from '@/api/orders'

export default {
  name: 'ExpressSelection',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expressLoading: false,
      expressOptions: [],
      deliveryData: {
        logisticsId: '',
        logisticsContent: '',
        comCode: null
      },
      deliveryRules: {
        comCode: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择物流公司'))
            } else {
              callback()
            }
          }
        }],
        logisticsId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入物流单号'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  methods: {
    async getExpressList() {
      try {
        if (this.expressOptions.length === 0) {
          const params = { pageNo: 1, pageSize: 100 }
          this.expressLoading = true
          const { code, data } = await getExpressCompanyApi(params)
          if (code === 200) {
            this.expressOptions = data.result.list.map(item => {
              return {
                value: item.code,
                label: item.name
              }
            })
          }
        }
      } catch (e) {
        console.warn('Delivery get express error: ' + e)
        this.$message.warning('获取物流公司列表失败，请联系管理员！')
      } finally {
        this.expressLoading = false
      }
    },
    onExpressSelected(value) {
      this.deliveryData.comCode = value
      this.deliveryData.logisticsContent = this.expressOptions.find(option => option.value === value).label
    },
    handleCancelDeliver() {
      this.$refs.deliveryForm.resetFields()
      this.$emit('cancelled')
    },
    handleConfirmDeliver() {
      this.$refs.deliveryForm.validate(async(valid) => {
        if (valid) {
          this.$emit('confirmed', { ...this.deliveryData })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
