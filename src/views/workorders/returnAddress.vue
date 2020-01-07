<template>
  <div class="app-container">
    <div>
      <el-button type="primary" @click="handleShowDialog">
        新增退货地址
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="returnAddressList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系地址" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.provinceName + ' ' + scope.row.cityName + ' ' + scope.row.countyName }}</div>
          <div>{{ scope.row.address }}</div>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.isDefault ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="退货地址"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form ref="addressForm" :model="addressForm" :rules="addressRules" label-width="120px" label-position="right">
        <el-form-item label="联系人" prop="receiverName">
          <el-input
            :value="addressForm.receiverName"
            class="dialog-form-item"
            @input="value => addressForm.receiverName = value.trim()"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiverPhone">
          <el-input
            :value="addressForm.receiverPhone"
            class="dialog-form-item"
            @input="value => addressForm.receiverPhone = value.trim()"
          />
        </el-form-item>
        <el-form-item label="邮政编码" prop="zipCode">
          <el-input
            :value="addressForm.zipCode"
            class="dialog-form-item"
            @input="value => addressForm.zipCode = value.trim()"
          />
        </el-form-item>
        <el-form-item label="退货地址" prop="receiverAddress">
          <div style="display: flex;flex-direction: column;">
            <el-select :value="addressForm.provinceId" style="margin: 5px 0;width: 200px" @change="onProvinceChanged">
              <el-option
                v-for="item in provinceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select :value="addressForm.cityId" style="margin: 5px 0;width: 200px" @change="onCityChanged">
              <el-option
                v-for="item in cityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select :value="addressForm.countyId" style="margin: 5px 0;width: 200px" @change="onCountyChanged">
              <el-option
                v-for="item in countyOptions"
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
        <el-form-item label="设为默认">
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
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import { getAddressApi } from '@/api/orders'
import {
  getReturnAddressListApi,
  createReturnAddressApi,
  updateReturnAddressApi,
  deleteReturnAddressApi
} from '@/api/workOrders'
import { validPhone, validZipCode } from '@/utils/validate'

export default {
  name: 'ReturnAddress',
  data() {
    return {
      listLoading: false,
      returnAddressList: [],
      dialogFormVisible: false,
      provinceList: [],
      cityList: [],
      countyList: [],
      addressForm: {
        id: -1,
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
              callback('请选择省份地址')
            } else if (isEmpty(this.addressForm.cityId)) {
              callback('请选择市级地址')
            } else if (isEmpty(this.addressForm.countyId)) {
              callback('请选择区级地址')
            } else if (isEmpty(this.addressForm.address)) {
              callback('请输入详细地址')
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
    provinceOptions() {
      return this.provinceList.length > 0 ? this.provinceList : []
    },
    cityOptions() {
      return this.cityList.length > 0 ? this.cityList : []
    },
    countyOptions() {
      return this.countyList.length > 0 ? this.countyList : []
    }
  },
  created() {
    this.getReturnAddressList()
  },
  methods: {
    async getReturnAddressList() {
      try {
        const data = await getReturnAddressListApi()
        if (Array.isArray(data)) {
          this.returnAddressList = data.map(item => ({
            id: item.id,
            isDefault: item.isDefault,
            ...JSON.parse(item.content)
          }))
        }
      } catch (e) {
        console.warn('Get return address list error:' + e)
      }
    },
    async handleEdit(index) {
      this.resetAddressForm()
      this.addressForm = Object.assign({}, this.addressForm, this.returnAddressList[index])
      try {
        this.listLoading = true
        if (this.provinceList.length === 0) {
          await this.getProvinceList()
        }
        await this.getCityList(this.addressForm.provinceId)
        await this.getCountyList(this.addressForm.cityId)
        this.listLoading = false
        this.dialogFormVisible = true
      } catch (e) {
        console.warn('Edit return address error:' + e)
      }
    },
    async handleDelete(index) {
      const id = this.returnAddressList[index].id
      try {
        await this.$confirm(`删除此退货地址, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteReturnAddressApi({ id })
        this.getReturnAddressList()
      } catch (e) {
        console.warn('Delete return address :' + e)
      }
    },
    handleShowDialog() {
      this.resetAddressForm()
      this.cityList = []
      this.countyList = []
      this.dialogFormVisible = true
      if (this.provinceList.length === 0) {
        this.getProvinceList()
      }
    },
    async getAddress(params) {
      try {
        const { data } = await getAddressApi(params)
        if (Array.isArray(data.list)) {
          const addressList = data.list.map(item => ({ value: item.id, label: item.name }))
          return addressList.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN'))
        }
      } catch (e) {
        console.warn('Return address get address error: ' + e)
        return []
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
      this.addressForm.provinceName = this.provinceOptions.find(item => item.value === id).label
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
      this.addressForm.cityName = this.cityOptions.find(item => item.value === id).label
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
    async createReturnAddress(params) {
      try {
        const res = await createReturnAddressApi(params)
        if (res.id >= 0) {
          this.$message.success('创建退货地址成功！')
          this.getReturnAddressList()
        }
      } catch (e) {
        console.warn('Create return address error:' + e)
      }
    },
    async updateReturnAddress(params) {
      try {
        await updateReturnAddressApi(params)
        this.getReturnAddressList()
        this.$message.success('更新退货地址成功！')
      } catch (e) {
        console.warn('Update return address error:' + e)
      }
    },
    onCountyChanged(id) {
      this.addressForm.countyId = id
      this.addressForm.countyName = this.countyOptions.find(item => item.value === id).label
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
      this.dialogFormVisible = false
      this.resetAddressForm()
      this.$refs.addressForm.clearValidate()
    },
    handleSubmit() {
      this.$refs.addressForm.validate(async valid => {
        if (valid) {
          const { id, isDefault, ...content } = this.addressForm
          if (id < 0) {
            this.createReturnAddress({ isDefault, content: JSON.stringify(content) })
          } else {
            this.updateReturnAddress({ id, isDefault, content: JSON.stringify(content) })
          }
          this.dialogFormVisible = false
        }
      })
    }
  }
}
</script>

<style scoped>
  .dialog-form-item {
    width: 400px;
  }
</style>
