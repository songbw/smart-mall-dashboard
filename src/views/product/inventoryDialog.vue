<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="商品库存"
    top="5vh"
    width="60%"
  >
    <el-form ref="inventoryForm" :model="formData" :rules="formRules" label-width="160px">
      <el-form-item v-if="hasVendorPermission" label="供应商名" prop="merchantId">
        <vendor-selection
          :vendor-id="formData.merchantId"
          @changed="handleVendorChanged"
        />
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" icon="el-icon-search" @click="handleSearch">
          查询库存
        </el-button>
        <el-button :loading="loading" type="primary" icon="el-icon-download" @click="handleExport">
          导出库存
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      element-loading-text="正在查询..."
      :data="parsedSkuList"
      border
      style="width: 100%;margin-top:20px;"
      height="350"
    >
      <el-table-column label="商品MPU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.mpu }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品种SKU" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.skuCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品库存" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.inventory }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :auto-scroll="false"
      :total="total"
      :page.sync="offset"
      :limit.sync="limit"
      @pagination="handleSearch"
    />
    <span slot="footer">
      <el-button type="primary" @click="handleDialogCancel">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import VendorSelection from '@/components/VendorSelection'
import {
  searchProductsApi,
  getProductsByMpuListApi,
  getInventoryBySkuCodesApi
} from '@/api/products'

import { ProductPermissions } from '@/utils/role-permissions'

const vendorYiyatong = 4
const InventoryHeaders = [
  { field: 'mpu', label: '商品MPU', type: 'string' },
  { field: 'name', label: '商品名称', type: 'string' },
  { field: 'skuCode', label: '品种SKU', type: 'string' },
  { field: 'inventory', label: '商品库存', type: 'integer' }
]

export default {
  name: 'InventoryDialog',
  components: { Pagination, VendorSelection },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vendorAoyi: '2',
      loading: false,
      total: 0,
      offset: 1,
      limit: 20,
      formRules: {
        merchantId: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === null && this.hasVendorPermission) {
              callback(new Error('请选择商品供应商'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      },
      formData: {
        merchantId: null
      },
      parsedSkuList: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      vendorId: 'vendorId'
    }),
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    }
  },
  methods: {
    handleVendorChanged(value) {
      this.formData.merchantId = value
      this.offset = 1
      this.total = 0
      this.parsedSkuList = []
    },
    handleSearch() {
      this.$refs.inventoryForm.validate(async (valid) => {
        if (valid) {
          const merchantId = Number.parseInt(
            this.hasVendorPermission ? this.formData.merchantId : this.vendorId)
          const params = {
            merchantId,
            offset: this.offset,
            limit: this.limit,
            order: 'desc'
          }
          this.parsedSkuList = await this.handleQueryProducts(params)
        }
      })
    },
    async handleQueryProducts(params) {
      try {
        this.loading = true
        const { code, data } = await searchProductsApi(params)
        if (code === 200) {
          this.total = data.result.total
          const idList = Array.isArray(data.result.list) ? data.result.list.map(item => item.mpu) : []
          const mpuList = await this.getProductsByMpuList(idList)
          if (params.merchantId !== vendorYiyatong) {
            return mpuList.map(item => ({
              mpu: item.mpu,
              name: item.name,
              skuCode: '',
              inventory: item.inventory
            }))
          } else {
            const skuList = []
            for (const mpuItem of mpuList) {
              if (Array.isArray(mpuItem.skuList) && mpuItem.skuList.length > 0) {
                for (const sku of mpuItem.skuList) {
                  skuList.push({
                    mpu: mpuItem.mpu,
                    name: mpuItem.name,
                    skuCode: sku.code,
                    inventory: 0
                  })
                }
              }
            }
            return await this.getInventoryBySkuCodes(skuList)
          }
        }
      } catch (e) {
        console.warn('Query products for inventory error: ' + e)
      } finally {
        this.loading = false
      }
      this.total = 0
      return []
    },
    async getProductsByMpuList(fetchList) {
      let mpuList = []
      for (let begin = 0; begin < fetchList.length; begin += 50) {
        const params = {
          mpuIdList: fetchList.slice(begin, begin + 50).join(',')
        }
        try {
          const { code, data } = await getProductsByMpuListApi(params)
          if (code === 200 && data.result.length > 0) {
            mpuList = mpuList.concat(data.result)
          }
        } catch (err) {
          console.warn('Coupon Goods: search error:' + err)
        }
      }
      return mpuList
    },
    async getInventoryBySkuCodes(skuList) {
      try {
        const codeList = skuList.map(item => item.skuCode)
        const params = {
          codes: codeList.join(',')
        }
        const { code, data } = await getInventoryBySkuCodesApi(params)
        if (code === 200) {
          for (const skuItem of data.skuInvList) {
            const find = skuList.find(item => item.skuCode === skuItem.code)
            if (find) {
              find.inventory = skuItem.inventoryCount
            }
          }
        }
      } catch (e) {
        console.warn('Get inventory by sku codes error:' + e)
      }
      return skuList
    },
    handleExport() {
      this.$refs.inventoryForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          await this.handleExportInventory()
          this.loading = false
        }
      })
    },
    async handleExportInventory() {
      let inventoryList = []
      const merchantId = Number.parseInt(
        this.hasVendorPermission ? this.formData.merchantId : this.vendorId)
      const limit = 50
      const maxOffset = Math.floor(this.total / limit) + 1
      for (let offset = 0; offset < maxOffset; offset++) {
        const params = {
          merchantId,
          offset: offset + 1,
          limit,
          order: 'desc'
        }
        const skuList = await this.handleQueryProducts(params)
        inventoryList = inventoryList.concat(skuList)
      }
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = InventoryHeaders
        const data = inventoryList.map(item => tHeader.map(header => item[header.field]))
        excel.export_json_to_excel({
          header: tHeader.map(header => header.label),
          data,
          filename: '商品库存列表'
        })
      })
    },
    handleDialogCancel() {
      this.formData.merchantId = null
      this.offset = 1
      this.total = 0
      this.parsedSkuList = []
      this.$refs.inventoryForm.clearValidate()
      this.$emit('cancelled')
    }
  }
}
</script>

<style scoped>

</style>
