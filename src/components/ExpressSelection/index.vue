<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="物流信息"
    @opened="getExpressList"
  >
    <el-form
      ref="deliveryForm"
      v-loading="loading"
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
        <el-input v-model.trim="deliveryData.logisticsId" placeholder="请输入对应物流公司单号" maxlength="30" />
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
import { getExpressCompanyApi, uploadLogisticsApi, updateLogisticsApi } from '@/api/orders'
import {
  suborder_status_waiting_deliver,
  suborder_status_delivered
} from '@/utils/constants'

export default {
  name: 'ExpressSelection',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    updateOrder: {
      type: Boolean,
      default: true
    },
    orderId: {
      type: Number,
      default: 0
    },
    subId: {
      type: Number,
      default: 0
    },
    subOrderStatus: {
      type: Number,
      default: 0
    },
    subOrderId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
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
          this.loading = true
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
        this.loading = false
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
      this.$refs.deliveryForm.validate((valid) => {
        if (valid) {
          if (this.updateOrder) {
            if (this.subOrderStatus === suborder_status_waiting_deliver) {
              this.handleSetDeliver()
            } else if (this.subOrderStatus === suborder_status_delivered) {
              this.handleUpdateDeliver()
            }
          } else {
            this.$emit('confirmed', { ...this.deliveryData })
            this.$refs.deliveryForm.resetFields()
          }
        }
      })
    },
    async handleSetDeliver() {
      this.loading = true
      const params = {
        total: 1,
        logisticsList: [{ ...this.deliveryData, orderId: this.orderId, subOrderId: this.subOrderId }]
      }
      try {
        const { code, msg } = await uploadLogisticsApi(params)
        if (code === 200) {
          this.$message.success('上传物流信息成功！')
          this.$emit('confirmed')
          this.$refs.deliveryForm.resetFields()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Delivery upload logistics error:' + e)
        this.$message.error('上传物流信息失败，请联系管理员！')
      } finally {
        this.loading = false
      }
    },
    async handleUpdateDeliver() {
      this.loading = true
      const params = {
        ...this.deliveryData, id: this.subId
      }
      try {
        const { code, msg } = await updateLogisticsApi(params)
        if (code === 200) {
          this.$message.success('上传物流信息成功！')
          this.$emit('confirmed')
          this.$refs.deliveryForm.resetFields()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Delivery upload logistics error:' + e)
        this.$message.error('上传物流信息失败，请联系管理员！')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>

</style>
