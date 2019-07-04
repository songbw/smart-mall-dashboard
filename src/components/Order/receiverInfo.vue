<template>
  <el-row style="margin-bottom: 20px">
    <el-col :span="24">
      <el-card shadow="never">
        <div slot="header">
          <span class="card-header-text">收货人信息</span>
        </div>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">收货人名：</span>
            <span class="item-text">{{ receiverName }}</span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">联系电话：</span>
            <span class="item-text">{{ mobile }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">所在地区：</span>
            <span class="item-text">
              {{ `${provinceName || province} ${cityName || city} ${countyName || county}` }}
            </span>
          </el-col>
          <el-col :span="12">
            <span class="item-label">详细地址：</span>
            <span class="item-text">{{ address }}</span>
          </el-col>
        </el-row>
        <el-row class="item-row">
          <el-col :span="12">
            <span class="item-label">邮政编码：</span>
            <span class="item-text">{{ zip }}</span>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import {
  getAddressApi
} from '@/api/orders'

export default {
  name: 'ReceiverInfo',
  props: {
    receiverName: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    },
    provinceName: {
      type: String,
      default: ''
    },
    provinceId: {
      type: String,
      default: ''
    },
    cityName: {
      type: String,
      default: ''
    },
    cityId: {
      type: String,
      default: ''
    },
    countyName: {
      type: String,
      default: ''
    },
    countyId: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    zip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      province: '',
      city: '',
      county: ''
    }
  },
  created() {
    this.getProvinceData()
  },
  methods: {
    async getProvinceData() {
      if (!isEmpty(this.provinceId) && isEmpty(this.provinceName)) {
        try {
          const { data } = await getAddressApi({ level: '1' })
          const found = data.list.find(item => item.id === this.provinceId)
          this.province = found ? found.name : ''
        } catch (e) {
          console.warn('Get order province error:' + e)
        }
      }
      await this.getCityData(this.cityId)
    },
    async getCityData(id) {
      if (!isEmpty(id) && isEmpty(this.cityName)) {
        try {
          const { data } = await getAddressApi({ level: '2', pid: this.provinceId })
          const found = data.list.find(item => item.id === id)
          this.city = found ? found.name : ''
        } catch (e) {
          console.warn('Get order city error:' + e)
        }
      }
      await this.getCountyData(this.countyId)
    },
    async getCountyData(id) {
      if (!isEmpty(id) && isEmpty(this.countyName)) {
        try {
          const { data } = await getAddressApi({ level: '3', pid: this.cityId })
          const found = data.list.find(item => item.id === id)
          this.county = found ? found.name : ''
        } catch (e) {
          console.warn('Get order county error:' + e)
        }
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
