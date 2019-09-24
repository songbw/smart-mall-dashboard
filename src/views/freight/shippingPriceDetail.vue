<template>
  <div class="app-container">
    <el-form
      ref="shippingPriceForm"
      v-loading="dataLoading"
      :model="shippingPriceForm"
      :rules="shippingPriceRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          :value="shippingPriceForm.name"
          :readonly="viewOnly"
          class="dialog-form-item"
          style="width: 480px"
          @input="value => shippingPriceForm.name = value.trim()"
        />
      </el-form-item>
      <el-form-item label="是否默认">
        <span v-if="viewOnly">{{ shippingPriceForm.isDefault ? '是' : '否' }}</span>
        <el-switch v-else v-model="shippingPriceForm.isDefault" />
        <span style="margin-left: 20px;font-size: 12px">
          <i class="el-icon-warning-outline">
            在计算订单运费时，如未找到商品指定运费模板，则使用默认模板。
          </i>
        </span>
      </el-form-item>
      <el-form-item label="计价模式">
        <el-radio-group v-model="shippingPriceForm.mode">
          <el-radio
            v-for="option in modeOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="hasVendor" label="所属供应商">
        <span v-if="viewOnly">
          {{ vendorName }}
        </span>
        <el-select v-else v-model="shippingPriceForm.merchantId" v-loading="vendorLoading">
          <el-option
            v-for="item in vendorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-divider />
      <el-form-item label="运费设置" prop="regions">
        <div
          v-for="(region, index) in shippingPriceForm.regions"
          :key="region.type"
          style="display: flex;justify-content: start;margin-bottom: 10px"
        >
          <span v-if=" viewOnly || region.type === '0'" style="width: 190px">
            {{ region.name }}
          </span>
          <el-select v-else :value="region.type" @change="value => onRegionSelected(value, region)">
            <el-option
              v-for="item in regionOptions"
              :key="item.name"
              :label="item.name"
              :value="item.type"
            />
          </el-select>
          <div style="margin-left: 20px">
            <span>默认运费：</span>
            <span v-if="viewOnly">{{ region.basePrice }}</span>
            <el-input-number
              v-else
              v-model="region.basePrice"
              :controls="false"
              size="mini"
              :min="0"
              :max="100"
              :precision="1"
              step-strictly
              style="width: 80px"
            />
            <span>元 默认运费基础数量：</span>
            <span v-if="viewOnly">{{ region.baseAmount }}</span>
            <el-input-number
              v-else
              v-model="region.baseAmount"
              :controls="false"
              size="mini"
              :min="1"
              :max="100"
              step-strictly
              style="width: 80px"
            />
            <span>件    每增加：</span>
            <span v-if="viewOnly">{{ region.cumulativeUnit }}</span>
            <el-input-number
              v-else
              v-model="region.cumulativeUnit"
              :controls="false"
              size="mini"
              :min="1"
              :max="100"
              step-strictly
              style="width: 80px"
            />
            <span>件 增加运费：</span>
            <span v-if="viewOnly">{{ region.cumulativePrice }}</span>
            <el-input-number
              v-else
              v-model="region.cumulativePrice"
              :controls="false"
              size="mini"
              :min="0"
              :max="10000"
              :precision="1"
              step-strictly
              style="width: 80px"
            />
            <span>元</span>
          </div>
          <el-button
            v-if="!viewOnly && region.type !== '0'"
            type="danger"
            size="mini"
            style="margin-left: 10px"
            @click="handleDeleteRegion(index)"
          >
            删除
          </el-button>
        </div>
        <el-button
          v-if="!viewOnly"
          :disabled="shippingPriceForm.regions.length >= regionOptions.length + 1"
          type="primary"
          style="margin-top: 10px"
          @click="handleAddRegion"
        >
          增加特定区域
        </el-button>
      </el-form-item>
    </el-form>
    <div style="float: right">
      <el-button v-if="!viewOnly" @click="handleGoBack">返回</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import {
  createShippingPriceApi,
  updateShippingPriceApi,
  getShippingPriceDetailApi,
  deleteShippingPriceRegionApi,
  addShippingPriceRegionApi
} from '@/api/freight'
import { getVendorListApi } from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'
import {
  shipping_price_unit_mode,
  ShippingPriceModeOptions,
  RegionList
} from './constants'

const priceTemplate = {
  basePrice: 0,
  baseAmount: 1,
  cumulativePrice: 0,
  cumulativeUnit: 1
}
export default {
  name: 'ShippingPriceDetail',
  data() {
    return {
      hasVendor: false,
      vendorLoading: false,
      modeOptions: ShippingPriceModeOptions,
      regionOptions: RegionList,
      viewOnly: false,
      vendorList: [],
      dataLoading: false,
      shippingPriceData: {},
      shippingPriceForm: {
        id: -1,
        name: '',
        merchantId: 0,
        isDefault: false,
        mode: shipping_price_unit_mode,
        regions: []
      },
      shippingPriceRules: {
        name: [{
          required: true,
          validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入模板名称'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }],
        regions: [{
          required: true,
          validator: (rule, value, callback) => {
            const noRegions = value.filter(item => isEmpty(item.name))
            const noAmount = value.filter(item => !isNumber(item.baseAmount) ||
              !isNumber(item.cumulativeUnit) ||
              !isNumber(item.basePrice) ||
              !isNumber(item.cumulativePrice))
            if (noRegions.length > 0) {
              callback(new Error('请选择区域'))
            } else if (noAmount.length > 0) {
              callback(new Error('请设置运费模板'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      isWatcherUser: 'isWatcherUser'
    }),
    vendorOptions() {
      return [{ value: 0, label: '平台' }].concat(this.vendorList)
    },
    vendorName() {
      if (this.viewOnly) {
        const vendor = this.vendorOptions.find(option => option.value === this.shippingPriceForm.merchantId)
        return vendor ? vendor.label : ''
      } else {
        return ''
      }
    }
  },
  created() {
    if (this.$route.name === 'CreateShippingPrice') {
      this.shippingPriceForm.regions.push({
        id: -1,
        type: '0',
        name: '默认',
        provinces: [],
        ...priceTemplate
      })
    } else {
      if (this.$route.name === 'ViewShippingPrice') {
        this.viewOnly = true
      }
      const id = this.$route.params.id
      if (id !== null) {
        this.getShippingPriceDetail(id)
      }
    }
    if (this.hasVendor) {
      this.getVendorList()
    }
  },
  methods: {
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        this.vendorList = data.rows.map(row => {
          return {
            value: row.company.id,
            label: row.company.name
          }
        })
      } catch (e) {
        console.warn('Coupon get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
      }
    },
    async getShippingPriceDetail(id) {
      try {
        const { data } = await getShippingPriceDetailApi({ id })
        if (data && data.result) {
          const resData = data.result
          Object.keys(this.shippingPriceForm).forEach(key => {
            if (!Array.isArray(resData[key])) {
              this.shippingPriceForm[key] = resData[key]
              this.shippingPriceData[key] = resData[key]
            }
          })
          const regions = resData.regions.map(region => {
            const { provinces, ...other } = region
            const match = RegionList.find(item => item.name === region.name)
            return {
              ...other,
              type: match ? match.type : null,
              provinces: provinces.filter(province => !isEmpty(province))
            }
          })
          this.shippingPriceForm.regions = regions.map(item => ({ ...item }))
          this.shippingPriceData.regions = regions.map(item => ({ ...item }))
        }
      } catch (e) {
        console.warn('Get shipping price detail error:' + e)
      }
    },
    handleDeleteRegion(index) {
      const region = this.shippingPriceForm.regions[index]
      const regionId = region.id
      if (regionId >= 0) {
        this.$confirm('是否继续删除此区域？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          try {
            this.dataLoading = true
            const { code } = await deleteShippingPriceRegionApi({ id: regionId })
            if (code === 200) {
              this.shippingPriceForm.regions.splice(index, 1)
            }
          } catch (e) {
            console.warn('Delete shipping price region error: ' + e)
            console.warn('删除此区域失败，请联系管理员！')
          } finally {
            this.dataLoading = false
          }
        }).catch(() => {
        })
      } else {
        this.shippingPriceForm.regions.splice(index, 1)
      }
    },
    handleAddRegion() {
      this.shippingPriceForm.regions.push({ id: -1, type: null, name: '', provinces: null, ...priceTemplate })
    },
    onRegionSelected(type, region) {
      const find = this.regionOptions.find(item => item.type === type)
      const index = this.shippingPriceForm.regions.findIndex(item => item.type === type)
      if (index >= 0) {
        this.$message.warning('此区域已经添加，请选择其他区域！')
      } else if (find) {
        region.type = type
        region.name = find.name
        region.provinces = find.provinces
      }
    },
    async handleCreateShippingPrice(params) {
      try {
        this.dataLoading = true
        const { code, msg } = await createShippingPriceApi(params)
        if (code === 200) {
          this.handleGoBack()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create shipping price error:' + e)
        this.$message.warning('创建运费模板失败，请联系管理员！')
      } finally {
        this.dataLoading = false
      }
    },
    async handleUpdateShippingPrice() {
      try {
        const params = {}
        if (this.shippingPriceForm.name !== this.shippingPriceData.name) {
          params.name = this.shippingPriceForm.name
        }
        if (this.shippingPriceForm.merchantId !== this.shippingPriceData.merchantId) {
          params.merchantId = this.shippingPriceForm.merchantId
        }
        if (this.shippingPriceForm.isDefault !== this.shippingPriceData.isDefault) {
          params.isDefault = this.shippingPriceForm.isDefault
        }
        const addRegions = this.shippingPriceForm.regions.filter(region => region.id < 0)
        const updateRegions = this.shippingPriceForm.regions
          .filter(region => {
            const find = this.shippingPriceData.regions.find(item => item.id === region.id)
            if (find) {
              return find.baseAmount !== region.baseAmount ||
                find.basePrice !== region.basePrice ||
                find.cumulativePrice !== region.cumulativePrice ||
                find.cumulativeUnit !== region.cumulativeUnit ||
                find.name !== region.name
            } else {
              return false
            }
          })
        if (updateRegions.length > 0) {
          params.regions = updateRegions
        }
        this.dataLoading = true
        if (addRegions.length > 0) {
          await addShippingPriceRegionApi({ id: this.shippingPriceData.id, regions: addRegions })
        }
        if (!isEmpty(params)) {
          params.id = this.shippingPriceData.id
          const { code } = await updateShippingPriceApi(params)
          if (code === 200) {
            this.handleGoBack()
          }
        } else {
          this.handleGoBack()
        }
      } catch (e) {
        console.warn('Create shipping price error:' + e)
        this.$message.warning('更新运费模板失败，请联系管理员！')
      } finally {
        this.dataLoading = false
      }
    },
    handleGoBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push({ name: 'ShippingPrice' })
    },
    handleSubmit() {
      if (this.viewOnly) {
        this.handleGoBack()
      } else {
        this.$refs.shippingPriceForm.validate(valid => {
          if (valid) {
            const { id, ...data } = this.shippingPriceForm
            if (id < 0) {
              this.handleCreateShippingPrice((data))
            } else {
              this.handleUpdateShippingPrice()
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
