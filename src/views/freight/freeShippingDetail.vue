<template>
  <div class="app-container">
    <el-form
      ref="freeShippingForm"
      v-loading="dataLoading"
      :model="freeShippingForm"
      :rules="freeShippingRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input
          :value="freeShippingForm.name"
          :readonly="viewOnly"
          class="dialog-form-item"
          style="width: 480px"
          @input="value => freeShippingForm.name = value.trim()"
        />
      </el-form-item>
      <el-form-item label="包邮模式">
        <span v-if="viewOnly">{{ freeShippingForm.mode | modeFilter }}</span>
        <el-radio-group v-else v-model="freeShippingForm.mode">
          <el-radio
            v-for="option in modeOptions"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="isAdminUser || isWatcherUser" label="所属供应商">
        <span v-if="viewOnly">
          {{ vendorName }}
        </span>
        <el-select v-else v-model="freeShippingForm.merchantId">
          <el-option
            v-for="item in vendorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span style="margin-left: 20px;font-size: 12px">
          <i class="el-icon-warning-outline">
            在计算订单是否包邮时，如未找到商品所属供应商的包邮模板，则使用平台模板。每个供应商只支持一个模板。
          </i>
        </span>
      </el-form-item>
      <el-divider />
      <el-form-item label="运费设置" prop="regions">
        <div
          v-for="(region, index) in freeShippingForm.regions"
          :key="region.type"
          style="display: flex;justify-content: start;margin-bottom: 10px"
        >
          <span v-if="region.type === '0' || viewOnly" style="width: 190px">
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
          <div style="margin-left: 30px">
            <span>满</span>
            <span v-if="viewOnly">{{ region.fullAmount }}</span>
            <el-input-number
              v-else
              v-model="region.fullAmount"
              :controls="false"
              size="mini"
              :min="0"
              :max="10000"
              step-strictly
            />
            <span>{{ unitName }} 包邮</span>
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
          <span v-if="region.fullAmount === 0" style="margin-left: 20px;font-size: 12px">
            <i class="el-icon-warning-outline">请注意，如果设置为0{{ unitName }}，将不会收取运费！</i>
          </span>
        </div>
        <el-button
          v-if="!viewOnly"
          :disabled="freeShippingForm.regions.length >= regionOptions.length + 1"
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
import {
  createFreeShippingApi,
  updateFreeShippingApi,
  getFreeShippingDetailApi,
  deleteFreeShippingRegionApi,
  addFreeShippingRegionApi
} from '@/api/freight'
import { getVendorListApi } from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'
import {
  free_shipping_amount_mode,
  FreeShippingModeOptions,
  RegionList
} from './constants'

export default {
  name: 'FreeShippingDetail',
  filters: {
    modeFilter: mode => {
      const find = FreeShippingModeOptions.find(item => item.value === mode)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      vendorLoading: false,
      modeOptions: FreeShippingModeOptions,
      regionOptions: RegionList.filter(region => region.type !== '0'),
      viewOnly: false,
      vendorList: [],
      dataLoading: false,
      freeShippingData: {},
      freeShippingForm: {
        id: -1,
        name: '',
        merchantId: 0,
        isDefault: true,
        mode: free_shipping_amount_mode,
        regions: []
      },
      freeShippingRules: {
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
            const noAmount = value.filter(item => !Number.isInteger(item.fullAmount))
            if (noRegions.length > 0) {
              callback(new Error('请选择区域'))
            } else if (noAmount.length > 0) {
              callback(new Error('请设置包邮金额'))
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
        const vendor = this.vendorOptions.find(option => option.value === this.freeShippingForm.merchantId)
        return vendor ? vendor.label : ''
      } else {
        return ''
      }
    },
    unitName() {
      return this.freeShippingForm.mode === free_shipping_amount_mode ? '元' : '件'
    }
  },
  created() {
    if (this.$route.name === 'CreateFreeShipping') {
      this.freeShippingForm.regions.push({ id: -1, type: '0', name: '默认', provinces: [], fullAmount: undefined })
    } else {
      const id = this.$route.params.id
      if (this.$route.name === 'ViewFreeShipping') {
        this.viewOnly = true
      }
      if (id !== null) {
        this.getFreeShippingDetail(id)
      }
    }
    this.getVendorList()
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
    async getFreeShippingDetail(id) {
      try {
        this.dataLoading = true
        const { data } = await getFreeShippingDetailApi({ id })
        if (data && data.result) {
          const resData = data.result
          Object.keys(this.freeShippingForm).forEach(key => {
            if (!Array.isArray(resData[key])) {
              this.freeShippingForm[key] = resData[key]
              this.freeShippingData[key] = resData[key]
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
          this.freeShippingForm.regions = regions.map(item => ({ ...item }))
          this.freeShippingData.regions = regions.map(item => ({ ...item }))
        }
      } catch (e) {
        console.warn('Get free shipping detail error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    getVendorName(vendorId) {
      if (this.vendorList.length > 0 && vendorId != null) {
        const vendor = this.vendorList.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    handleDeleteRegion(index) {
      const region = this.freeShippingForm.regions[index]
      const regionId = region.id
      if (regionId >= 0) {
        this.$confirm('是否继续删除此区域？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          try {
            this.dataLoading = true
            const { code } = await deleteFreeShippingRegionApi({ id: regionId })
            if (code === 200) {
              this.freeShippingForm.regions.splice(index, 1)
            }
          } catch (e) {
            console.warn('Delete free shipping region error: ' + e)
            console.warn('删除此区域失败，请联系管理员！')
          } finally {
            this.dataLoading = false
          }
        }).catch(() => {
        })
      } else {
        this.freeShippingForm.regions.splice(index, 1)
      }
    },
    handleAddRegion() {
      this.freeShippingForm.regions.push({ id: -1, type: null, name: '', provinces: null, fullAmount: undefined })
    },
    onRegionSelected(type, region) {
      const find = this.regionOptions.find(item => item.type === type)
      const index = this.freeShippingForm.regions.findIndex(item => item.type === type)
      if (index >= 0) {
        this.$message.warning('此区域已经添加，请选择其他区域！')
      } else if (find) {
        region.type = type
        region.name = find.name
        region.provinces = find.provinces
      }
    },
    async handleCreateFreeShipping(params) {
      try {
        this.dataLoading = true
        const { code, msg } = await createFreeShippingApi(params)
        if (code === 200) {
          this.handleGoBack()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create free shipping error:' + e)
        this.$message.warning('创建包邮模板失败，请联系管理员！')
      } finally {
        this.dataLoading = false
      }
    },
    async handleUpdateFreeShipping(formData) {
      try {
        const params = {}
        if (this.freeShippingForm.name !== this.freeShippingData.name) {
          params.name = this.freeShippingForm.name
        }
        if (this.freeShippingForm.mode !== this.freeShippingData.mode) {
          params.mode = this.freeShippingForm.mode
        }
        if (this.freeShippingForm.merchantId !== this.freeShippingData.merchantId) {
          params.merchantId = this.freeShippingForm.merchantId
        }
        const addRegions = this.freeShippingForm.regions.filter(region => region.id < 0)
        const updateRegions = this.freeShippingForm.regions
          .filter(region => {
            const find = this.freeShippingData.regions.find(item => item.id === region.id)
            if (find) {
              return find.fullAmount !== region.fullAmount || find.name !== region.name
            } else {
              return false
            }
          })
        if (updateRegions.length > 0) {
          params.regions = updateRegions
        }
        this.dataLoading = true
        if (addRegions.length > 0) {
          await addFreeShippingRegionApi({ id: this.freeShippingData.id, regions: addRegions })
        }
        if (!isEmpty(params)) {
          params.id = this.freeShippingData.id
          const { code } = await updateFreeShippingApi(params)
          if (code === 200) {
            this.handleGoBack()
          }
        } else {
          this.handleGoBack()
        }
      } catch (e) {
        console.warn('Create free shipping error:' + e)
        this.$message.warning('更新包邮模板失败，请联系管理员！')
      } finally {
        this.dataLoading = false
      }
    },
    handleGoBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push({ name: 'FreeShipping' })
    },
    handleSubmit() {
      if (this.viewOnly) {
        this.handleGoBack()
      } else {
        this.$refs.freeShippingForm.validate(valid => {
          if (valid) {
            const { id, ...data } = this.freeShippingForm
            if (id < 0) {
              this.handleCreateFreeShipping(data)
            } else {
              this.handleUpdateFreeShipping(this.freeShippingForm)
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
