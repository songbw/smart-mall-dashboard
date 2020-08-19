<template>
  <div v-loading="dataLoading" class="app-container">
    <el-card shadow="never">
      <div slot="header">
        基本信息
      </div>
      <el-form
        inline
        label-position="right"
        label-width="10rem"
        label-suffix="："
      >
        <el-form-item label="租户状态" class="info-form-item">
          <el-tag>{{ (renterData ? renterData.status : '') | vendorStatus }}</el-tag>
        </el-form-item>
        <el-form-item label="租户名称" class="info-form-item">
          <span>{{ renterData ? renterData.renterName : '' }}</span>
        </el-form-item>
        <el-form-item label="租户电话" class="info-form-item">
          <span>{{ renterData ? renterData.phone : '' }}</span>
        </el-form-item>
        <el-form-item label="添加日期" prop="taxpayerType" class="info-form-item">
          <span>{{ (renterData ? renterData.createTime : null) | dateFormat }}</span>
        </el-form-item>
      </el-form>
      <el-form
        inline
        label-position="right"
        label-width="10rem"
        label-suffix="："
      >
        <el-form-item label="社会统一信用码" class="info-form-item">
          <span>{{ renterData ? renterData.uniformCode : '' }}</span>
        </el-form-item>
        <el-form-item label="租户地址" prop="address" class="info-form-item">
          <span>{{ renterData ? renterData.address : '' }}</span>
        </el-form-item>
        <el-form-item label="发票类型" prop="invoiceType" class="info-form-item">
          <span>{{ (renterData ? renterData.invoiceType : null) | vendorInvoice }}</span>
        </el-form-item>
        <el-form-item label="纳税人类型" prop="taxpayerType" class="info-form-item">
          <span>{{ (renterData ? renterData.taxpayerType : null) | vendorTaxpayer }}</span>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" style="margin-top: 24px">
      <div slot="header">
        <div>运营端配置</div>
      </div>
      <el-table :data="appConfigList">
        <el-table-column property="appId" label="运营端AppID" />
        <el-table-column property="appName" label="运营端名称" show-overflow-tooltip />
        <el-table-column property="domain" label="运营端域名" show-overflow-tooltip />
        <el-table-column property="appKey" label="appKey" />
        <el-table-column property="appSecret" label="appSecret" />
        <el-table-column label="支付宝">
          <template slot-scope="scope">
            <div v-if="scope.alipayId !== null">
              <el-popover
                placement="top-start"
                trigger="click"
                title="支付宝配置"
              >
                <el-button slot="reference" size="mini">查看</el-button>
              </el-popover>
            </div>
            <div v-else>未配置</div>
          </template>
        </el-table-column>
        <el-table-column label="微信支付">
          <template slot-scope="scope">
            <div v-if="scope.wechatId !== null">
              <el-popover
                placement="top-start"
                trigger="click"
                title="微信支付配置"
              >
                <el-button slot="reference" size="mini">查看</el-button>
              </el-popover>
            </div>
            <div v-else>未配置</div>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot="header">
            <el-button type="primary" size="mini" @click="onAppCreateClicked">新建运营端</el-button>
          </template>
          <template slot-scope="scope">
            <el-button type="info" size="mini" @click="onAppEditClicked(scope.$index)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card shadow="never" style="margin-top: 24px">
      <div slot="header">
        <div>支付配置</div>
      </div>
    </el-card>
    <app-config-dialog
      :dialog-visible="appConfigVisible"
      :app-config="currentAppConfig"
      @cancelled="appConfigVisible = false"
      @confirmed="onAppConfigConfirmed"
    />
  </div>
</template>

<script>
import {
  VendorInvoiceOptions,
  VendorStatusOptions,
  VendorTaxpayerOptions
} from '@/utils/constants'
import moment from 'moment'
import {
  getRenterByIdApi,
  getAlipayConfigListApi,
  getAppConfigListApi,
  getWechatPayConfigListApi,
  createAppConfigApi
} from '@/api/vendor'
import AppConfigDialog from '@/views/renter/appConfigDialog'

export default {
  name: 'RenterInfo',
  components: { AppConfigDialog },
  filters: {
    vendorStatus: (status) => {
      if (status !== null) {
        const item = VendorStatusOptions.find(vendor => vendor.value === status)
        return item ? item.label : ''
      } else {
        return ''
      }
    },
    dateFormat: date => {
      if (date !== null) {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(date)
        return momentDate.isValid() ? momentDate.format(format) : date
      } else {
        return ''
      }
    },
    vendorInvoice: type => {
      if (type !== null) {
        const item = VendorInvoiceOptions.find(invoice => invoice.value === type)
        return item ? item.label : ''
      } else {
        return ''
      }
    },
    vendorTaxpayer: type => {
      if (type !== null) {
        const item = VendorTaxpayerOptions.find(invoice => invoice.value === type)
        return item ? item.label : ''
      } else {
        return ''
      }
    }
  },
  data() {
    return {
      dataLoading: false,
      appConfigVisible: false,
      currentAppConfig: null,
      renterId: null,
      renterData: null,
      appConfigList: [],
      alipayConfigList: [],
      wechatPayConfigList: []
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      this.renterId = this.$route.params.renterId
      await this.getRenterData()
      await this.getAlipayConfigList()
      await this.getWechatPayConfigList()
      await this.getAppConfigList()
    },
    async getRenterData() {
      try {
        this.dataLoading = true
        const { code, data } = await getRenterByIdApi(this.renterId)
        if (code === 200) {
          this.renterData = data
        }
      } catch (e) {
        console.warn('Get renter info error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getAppConfigList() {
      try {
        this.dataLoading = true
        const { code, data } = await getAppConfigListApi({ renterId: this.renterId })
        if (code === 200) {
          this.appConfigList = data
        }
      } catch (e) {
        console.warn('Get renter info error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getAlipayConfigList() {
      try {
        this.dataLoading = true
        const { code, data } = await getAlipayConfigListApi({ renterId: this.renterId })
        if (code === 200) {
          this.alipayConfigList = data
        }
      } catch (e) {
        console.warn('Get renter info error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getWechatPayConfigList() {
      try {
        this.dataLoading = true
        const { code, data } = await getWechatPayConfigListApi({ renterId: this.renterId })
        if (code === 200) {
          this.wechatPayConfigList = data
        }
      } catch (e) {
        console.warn('Get renter info error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onAppCreateClicked() {
      this.currentAppConfig = null
      this.appConfigVisible = true
    },
    onAppEditClicked(index) {
      this.currentAppConfig = this.appConfigList[index]
      this.appConfigVisible = true
    },
    onAppConfigConfirmed(appData) {
      this.appConfigVisible = false
      if (this.currentAppConfig === null) {
        this.handleCreatAppConfig(appData)
      }
    },
    async handleCreatAppConfig(appData) {
      try {
        this.dataLoading = true
        const { code, msg } = await createAppConfigApi({ renterId: this.renterId, ...appData })
        if (code === 200) {
          await this.getAppConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create app config error:' + e)
      } finally {
        this.dataLoading = false
      }
    }
  }
}
</script>

<style scoped>
.info-form-item {
  width: 20%;
}
</style>
