<template>
  <el-row style="margin-bottom: 20px">
    <el-col :span="24">
      <el-card shadow="never">
        <div slot="header">
          <span class="card-header-text">支付信息</span>
        </div>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">支付状态：</span>
            <span class="item-text">{{ payStatus | payFilter }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">支付编号：</span>
            <span class="item-text">{{ paymentNo }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">商户编号：</span>
            <span class="item-text">{{ outTradeNo }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">支付金额：</span>
            <span class="item-text">{{ paymentAmount | centFilter }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">支付时间：</span>
            <span class="item-text">{{ paymentAt | timeFilter }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">支付类型：</span>
            <span class="item-text">{{ payType }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">退款金额：</span>
            <span class="item-text">{{ refundFee | centFilter }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">优惠券码：</span>
            <span class="item-text">{{ couponCode || '无' }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">优惠金额：</span>
            <span class="item-text">￥ {{ couponDiscount || `0.00` }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label" style="margin-left: 2rem">运费：</span>
            <span class="item-text">￥ {{ servFee || '0.00' }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment'
import { PaymentStatusDefinitions } from '@/utils/constants'

export default {
  name: 'PaymentInfo',
  filters: {
    timeFilter(date) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    },
    invoiceFilter(state) {
      return state === '1' ? '需要' : '不需要'
    },
    payFilter: status => {
      const find = PaymentStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    },
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        const value = (yuan / 100).toFixed(2)
        return `￥ ${value}`
      }
    }
  },
  props: {
    payStatus: {
      type: Number,
      default: 0
    },
    paymentNo: {
      type: String,
      default: ''
    },
    outTradeNo: {
      type: String,
      default: ''
    },
    paymentAt: {
      type: String,
      default: ''
    },
    paymentAmount: {
      type: Number,
      default: 0
    },
    payType: {
      type: String,
      default: ''
    },
    refundFee: {
      type: Number,
      default: 0
    },
    couponId: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    couponDiscount: {
      type: Number,
      default: 0
    },
    servFee: {
      type: Number,
      default: 0
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
