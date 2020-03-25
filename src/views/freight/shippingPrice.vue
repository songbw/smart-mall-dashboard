<template>
  <div class="app-container">
    <el-form v-if="shippingType === vendorType" inline>
      <el-form-item label="供应商">
        <vendor-selection
          :vendor-id="queryMerchantId"
          @changed="onVendorChanged"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getShippingPriceList">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" style="margin-bottom: 10px">
      <el-button type="primary" @click="gotoCreateShippingPrice">
        {{ shippingType === mallType ? '新建商城运费模板' : '新建供应商运费模板' }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="shippingPriceList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ViewShippingPrice', params: { id: scope.row.id }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="模板名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板模式" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.mode | modeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shippingType === mallType" label="是否默认" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.isDefault ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="shippingType === vendorType" label="供应商" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.vendorName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleView(scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasEditPermission"
            type="warning"
            size="mini"
            @click="handleEdit(scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="shippingPriceTotal"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getShippingPriceList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Pagination from '@/components/Pagination'
import VendorSelection from '@/components/VendorSelection'
import {
  getShippingPriceListApi,
  getVendorShippingPriceListApi,
  deleteShippingPriceApi
} from '@/api/freight'
import { getVendorListApi } from '@/api/vendor'
import { ShippingPriceModeOptions } from './constants'
import { FreightPermissions } from '@/utils/role-permissions'
import { vendor_status_approved } from '@/utils/constants'

const mall_shipping_type = 'mall'
const vendor_shipping_type = 'vendor'

export default {
  name: 'ShippingPrice',
  components: { Pagination, VendorSelection },
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return date && momentDate.isValid() ? momentDate.format(format) : ''
    },
    modeFilter: mode => {
      const find = ShippingPriceModeOptions.find(item => item.value === mode)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      mallType: mall_shipping_type,
      vendorType: vendor_shipping_type,
      shippingType: mall_shipping_type,
      listLoading: false,
      vendorList: [],
      shippingPriceTotal: 0,
      shippingPriceList: [],
      queryMerchantId: null,
      pageNo: 1,
      pageSize: 20
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(FreightPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(FreightPermissions.update)
    }
  },
  created() {
    if (this.$route.name === 'VendorShippingPrice') {
      this.shippingType = vendor_shipping_type
    }
    this.prepareData()
  },
  methods: {
    async prepareData() {
      if (this.shippingType === vendor_shipping_type) {
        await this.getVendorList()
      }
      await this.getShippingPriceList()
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        this.listLoading = true
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
        this.listLoading = false
      }
    },
    getVendorName(merchantId) {
      const find = this.vendorList.find(item => item.value === merchantId)
      return find ? find.label : ''
    },
    onVendorChanged(id) {
      this.pageNo = 1
      this.queryMerchantId = id
    },
    async getShippingPriceListProxy(params) {
      if (this.shippingType === vendor_shipping_type) {
        const merchantId = parseInt(this.queryMerchantId)
        if (!isNaN(merchantId)) {
          params.merchantId = merchantId
        }
        return await getVendorShippingPriceListApi(params)
      } else {
        return await getShippingPriceListApi(params)
      }
    },
    async getShippingPriceList() {
      if (this.hasViewPermission) {
        try {
          this.listLoading = true
          const params = { pageNo: this.pageNo, pageSize: this.pageSize }
          const { data } = await this.getShippingPriceListProxy(params)
          if (data && data.result) {
            const res = data.result
            if (Array.isArray(res.list)) {
              this.shippingPriceList = res.list.map(item => {
                const vendorName = item.merchantId > 0 ? this.getVendorName(item.merchantId) : ''
                return {
                  ...item,
                  vendorName
                }
              })
            }
            if (res.pageInfo) {
              this.shippingPriceTotal = res.pageInfo.totalCount
            }
          }
        } catch (e) {
          console.warn('Get free shipping list error:' + e)
        } finally {
          this.listLoading = false
        }
      } else {
        this.$message.warning('没有查看运费模板权限，请联系管理员！')
      }
    },
    gotoCreateShippingPrice() {
      this.$router.push({
        name: this.shippingType === vendor_shipping_type ? 'CreateVendorShippingPrice' : 'CreateShippingPrice',
        params: {
          withVendor: this.shippingType === vendor_shipping_type
        }
      })
    },
    handleView(id) {
      this.$router.push({
        name: this.shippingType === vendor_shipping_type ? 'ViewVendorShippingPrice' : 'ViewShippingPrice',
        params: { id }
      })
    },
    handleEdit(id) {
      this.$router.push({
        name: this.shippingType === vendor_shipping_type ? 'EditVendorShippingPrice' : 'EditShippingPrice',
        params: { id }
      })
    },
    handleDelete(id) {
      this.$confirm('是否继续删除此模板？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteShippingPriceApi({ id })
          this.$message({ message: '包邮模板删除成功！', type: 'success' })
          this.getShippingPriceList()
        } catch (e) {
          console.warn(`Delete free shipping error: ${e}`)
          this.$message.error('包邮模板删除失败，请联系管理员！')
        }
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>

</style>
