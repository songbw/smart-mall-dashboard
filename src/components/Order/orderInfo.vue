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
          <el-col :span="12">
            <span class="item-label">订单总额：</span>
            <span class="item-text">￥ {{ saleAmount }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">主订单号：</span>
            <span class="item-text">{{ tradeNo }}</span>
          </el-col>
          <el-col v-if="hasVendorPermission" :span="12">
            <span class="item-label">供应商名：</span>
            <span class="item-text">{{ merchantName }}</span>
          </el-col>
        </el-row>
        <el-row v-if="hasSupplierOrder" class="item-row">
          <el-col :span="12">
            <span class="item-label"> {{ supplierName }}：</span>
            <span class="item-text">{{ aoyiId }}</span>
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
            <span class="item-label">OpenID：</span>
            <span class="item-text">{{ openId }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import { OrderStatusDefinitions } from '@/utils/constants'
import { getVendorProfileByIdApi } from '@/api/vendor'
import { OrderPermissions } from '@/utils/role-permissions'

const vendorAoyi = 2
const vendorYiyatong = 4

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
    openId: {
      type: String,
      default: ''
    },
    merchantNo: {
      type: String,
      default: ''
    },
    aoyiId: {
      type: String,
      default: ''
    },
    saleAmount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      merchantName: ''
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasVendorPermission() {
      return this.userPermissions.includes(OrderPermissions.vendor)
    },
    hasSupplierOrder: {
      get() {
        return !isEmpty(this.aoyiId) && !isEmpty(this.merchantNo)
      }
    },
    supplierName: {
      get() {
        if (this.merchantId === vendorAoyi) {
          return this.merchantNo === '20' ? '苏宁单号' : '外部单号'
        } else if (this.merchantId === vendorYiyatong) {
          return '怡亚通单号'
        } else {
          return '外部单号'
        }
      }
    }
  },
  watch: {
    merchantId: function (val, oldVal) {
      this.getMerchantName()
    }
  },
  methods: {
    async getMerchantName() {
      try {
        if (this.merchantId >= 0) {
          const { code, data } = await getVendorProfileByIdApi({ id: this.merchantId })
          if (code === 200) {
            this.merchantName = data.name
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
