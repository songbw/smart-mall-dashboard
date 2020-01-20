<template>
  <el-dialog
    v-loading="dataLoading"
    :title="isReturnAddress ? '退货地址' : '收货地址'"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
  >
    <el-form ref="addressForm" :model="addressForm" :rules="addressRules" label-width="120px" label-position="right">
      <el-form-item label="联系人" prop="receiverName">
        <el-input
          :value="addressForm.receiverName"
          class="dialog-form-item"
          maxlength="20"
          @input="value => addressForm.receiverName = value.trim()"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="receiverPhone">
        <el-input
          :value="addressForm.receiverPhone"
          class="dialog-form-item"
          maxlength="20"
          @input="value => addressForm.receiverPhone = value.trim()"
        />
      </el-form-item>
      <el-form-item label="邮政编码" prop="zipCode">
        <el-input
          :value="addressForm.zipCode"
          class="dialog-form-item"
          maxlength="20"
          @input="value => addressForm.zipCode = value.trim()"
        />
      </el-form-item>
      <el-form-item :label="isReturnAddress? '退货地址' : '收货地址'" prop="receiverAddress">
        <div style="display: flex;flex-direction: column;">
          <el-select :value="addressForm.provinceId" style="margin: 5px 0;width: 200px" @change="onProvinceChanged">
            <el-option
              v-for="item in provinceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select :value="addressForm.cityId" style="margin: 5px 0;width: 200px" @change="onCityChanged">
            <el-option
              v-for="item in cityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select :value="addressForm.countyId" style="margin: 5px 0;width: 200px" @change="onCountyChanged">
            <el-option
              v-for="item in countyList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-model="addressForm.address"
            type="textarea"
            class="dialog-form-item"
            style="margin: 5px 0;"
            resize="none"
            maxlength="50"
            show-word-limit
          />
        </div>
      </el-form-item>
      <el-form-item v-if="isReturnAddress" label="设为默认">
        <el-switch v-model="addressForm.isDefault" />
        <span style="font-size: 14px;margin-left: 10px">
          <i class="el-icon-warning-outline">如设置为默认，客户在申请退货中将使用此地址</i>
        </span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { getAddressApi, getOrderListApi } from '@/api/orders'
import { getReturnAddressByIdApi } from '@/api/workOrders'
import { validPhone, validZipCode } from '@/utils/validate'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'

export default {
  name: 'ReceiverDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    isReturnAddress: {
      type: Boolean,
      default: false
    },
    returnAddressId: {
      type: Number,
      default: -1
    },
    subOrderId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataLoading: false,
      provinceList: [],
      cityList: [],
      countyList: [],
      addressForm: {
        receiverName: '',
        receiverPhone: '',
        zipCode: '',
        provinceId: '',
        provinceName: '',
        cityId: '',
        cityName: '',
        countyId: '',
        countyName: '',
        address: '',
        isDefault: false
      },
      addressRules: {
        receiverName: [{
          required: true,
          validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入联系人姓名'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }],
        receiverPhone: [{
          required: true,
          validator: (rule, value, callback) => {
            if (validPhone(value)) {
              callback()
            } else {
              callback(new Error('请输入联系电话'))
            }
          },
          trigger: 'blur'
        }],
        zipCode: [{
          required: true,
          validator: (rule, value, callback) => {
            if (validZipCode(value)) {
              callback()
            } else {
              callback(new Error('请输入正确的邮政编码'))
            }
          },
          trigger: 'blur'
        }],
        receiverAddress: [{
          required: true,
          validator: (rule, value, callback) => {
            if (isEmpty(this.addressForm.provinceId)) {
              callback(new Error('请选择省份地址'))
            } else if (isEmpty(this.addressForm.cityId)) {
              callback(new Error('请选择市级地址'))
            } else if (isEmpty(this.addressForm.countyId)) {
              callback(new Error('请选择区级地址'))
            } else if (isEmpty(this.addressForm.address)) {
              callback(new Error('请输入详细地址'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      }
    }
  },
  watch: {
    returnAddressId: function(val, old) {
      if (val >= 0 && val !== old && this.isReturnAddress && this.dialogVisible) {
        this.getReturnAddressData(val)
      }
    },
    subOrderId: function(val, old) {
      if (!isEmpty(val)) {
        this.getOrderData(val)
      }
    },
    dialogVisible: function(val, old) {
      if (val && val !== old && this.provinceList.length === 0) {
        this.getProvinceList()
      }
    }
  },
  methods: {
    async getReturnAddressData(id) {
      try {
        this.dataLoading = true
        const data = await getReturnAddressByIdApi({ id })
        this.addressForm = {
          isDefault: data.isDefault,
          ...JSON.parse(data.content)
        }
        await this.getCityList(this.addressForm.provinceId)
        await this.getCountyList(this.addressForm.cityId)
      } catch (e) {
        console.warn('Get return address error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getOrderData(subOrderId) {
      try {
        this.dataLoading = true
        const { data } = await getOrderListApi({ pageIndex: 1, pageSize: 1, subOrderId })
        if (data.result.list.length > 0) {
          const orderData = data.result.list[0]
          this.addressForm.receiverName = orderData.receiverName
          this.addressForm.receiverPhone = orderData.mobile
          this.addressForm.zipCode = orderData.zip
          this.addressForm.provinceId = orderData.provinceId
          this.addressForm.provinceName = orderData.provinceName
          this.addressForm.cityId = orderData.cityId
          this.addressForm.cityName = orderData.cityName
          this.addressForm.countyId = orderData.countyId
          this.addressForm.countyName = orderData.countyName
          this.addressForm.address = orderData.address
          await this.getCityList(this.addressForm.provinceId)
          await this.getCountyList(this.addressForm.cityId)
        }
      } catch (e) {
        console.warn('Work order get order detail error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getAddress(params) {
      try {
        this.dataLoading = true
        const { data } = await getAddressApi(params)
        if (Array.isArray(data.list)) {
          const addressList = data.list.map(item => ({ value: item.id, label: item.name }))
          return addressList.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN'))
        }
      } catch (e) {
        console.warn('Return address get address error: ' + e)
        return []
      } finally {
        this.dataLoading = false
      }
    },
    async getProvinceList() {
      try {
        this.provinceList = await this.getAddress({ level: '1' })
      } catch (e) {
        this.provinceList = []
      }
    },
    onProvinceChanged(id) {
      this.addressForm.provinceId = id
      this.addressForm.provinceName = this.provinceList.find(item => item.value === id).label
      this.addressForm.cityId = ''
      this.addressForm.cityName = ''
      this.addressForm.countyId = ''
      this.addressForm.countyName = ''
      this.cityList = []
      this.getCityList(id)
    },
    async getCityList(pid) {
      try {
        this.cityList = await this.getAddress({ level: '2', pid })
      } catch (e) {
        this.cityList = []
      }
    },
    onCityChanged(id) {
      this.addressForm.cityId = id
      this.addressForm.cityName = this.cityList.find(item => item.value === id).label
      this.addressForm.countyId = ''
      this.addressForm.countyName = ''
      this.countyList = []
      this.getCountyList(id)
    },
    async getCountyList(pid) {
      try {
        this.countyList = await this.getAddress({ level: '3', pid })
      } catch (e) {
        this.countyList = []
      }
    },
    onCountyChanged(id) {
      this.addressForm.countyId = id
      this.addressForm.countyName = this.countyList.find(item => item.value === id).label
    },
    resetAddressForm() {
      Object.keys(this.addressForm).forEach(key => {
        if (isString(this.addressForm[key])) {
          this.addressForm[key] = ''
        } else if (isNumber(this.addressForm[key])) {
          this.addressForm[key] = -1
        } else {
          this.addressForm[key] = false
        }
      })
    },
    handleCancel() {
      if (this.isReturnAddress) {
        this.resetAddressForm()
      }
      this.$refs.addressForm.clearValidate()
      this.$emit('cancelled')
    },
    handleSubmit() {
      this.$refs.addressForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', { ...this.addressForm })
          if (this.isReturnAddress) {
            this.resetAddressForm()
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
