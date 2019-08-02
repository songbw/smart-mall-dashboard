<template>
  <el-row style="margin-bottom: 20px">
    <el-col :span="24">
      <el-card shadow="never">
        <div slot="header">
          <span class="card-header-text">主订单信息</span>
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
          <el-col :span="12">
            <span class="item-label">供应商名：</span>
            <span class="item-text">{{ merchantName }}</span>
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
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">备注信息：</span>
            <span class="item-text">{{ remark }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import { OrderStatusDefinitions } from '@/utils/constants'
import {
  getVendorProfileApi
} from '@/api/vendor'

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
    merchantId: {
      type: Number,
      default: -1
    },
    createdAt: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: String,
      default: ''
    },
    remark: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      merchantName: ''
    }
  },
  watch: {
    merchantId: function(val, oldVal) {
      this.getMerchantName()
    }
  },
  methods: {
    async getMerchantName() {
      try {
        if (this.merchantId >= 0) {
          const { data } = await getVendorProfileApi({ id: this.merchantId })
          if (data && data.company) {
            this.merchantName = data.company.name
          }
        }
      } catch (e) {
        console.warn('Sub order detail vendor profile error:' + e)
      }
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
