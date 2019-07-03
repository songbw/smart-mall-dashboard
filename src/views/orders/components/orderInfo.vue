<template>
  <el-row style="margin-bottom: 20px">
    <el-col :span="24">
      <el-card shadow="never">
        <div slot="header">
          <span class="card-header-text">订单信息</span>
        </div>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">订单状态：</span>
            <span class="item-text">{{ status | statusFilter }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">主订单号：</span>
            <span class="item-text">{{ tradeNo }}</span>
          </el-col>
          <el-col v-if="subOrderId" :span="12">
            <span class="item-label">子订单号：</span>
            <span class="item-text">{{ subOrderId }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">下单时间：</span>
            <span class="item-text">{{ createdAt | timeFilter }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">更新时间：</span>
            <span class="item-text">{{ updatedAt | timeFilter }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment'
import { OrderStatusDefinitions } from '@/utils/constants'

export default {
  name: 'OrderInfo',
  filters: {
    statusFilter: status => {
      const find = OrderStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter(date) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  props: {
    status: {
      type: Number,
      default: 0
    },
    tradeNo: {
      type: String,
      default: ''
    },
    subOrderId: {
      type: String,
      default: ''
    },
    createdAt: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
  .card-header-text {
    font-size: 18px;
    font-weight: bold;
  }

  .item-row {
    margin: 15px 0;
  }

  .item-label {
    font-size: 16px;
    color: #606266;
    font-weight: bolder;
  }

  .item-text {
    font-size: 14px;
  }
</style>
