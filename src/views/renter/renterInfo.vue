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
        <el-table-column property="appKey" label="appKey" show-overflow-tooltip />
        <el-table-column property="appSecret" label="appSecret" show-overflow-tooltip />
        <el-table-column label="支付宝配置ID" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.alipayId ? scope.row.alipayId : '未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="微信支付配置ID" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.wechatId ? scope.row.wechatId : '未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column width="160">
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
      <div>
        <el-tabs v-model="renterPayType" type="card">
          <el-tab-pane label="支付宝" name="alipay">
            <el-table :data="alipayConfigList">
              <el-table-column property="alipayId" label="配置ID" show-overflow-tooltip />
              <el-table-column property="remark" label="配置描述" show-overflow-tooltip />
              <el-table-column property="appId" label="支付宝AppID" show-overflow-tooltip />
              <el-table-column property="apiUrl" label="API地址" show-overflow-tooltip />
              <el-table-column property="payNotifyUrl" label="支付回调地址" show-overflow-tooltip />
              <el-table-column property="refundNotifyUrl" label="退款回调地址" show-overflow-tooltip />
              <el-table-column width="160">
                <template slot="header">
                  <el-button type="primary" size="mini" @click="onAlipayConfigCreateClicked">新建支付宝配置</el-button>
                </template>
                <template slot-scope="scope">
                  <el-button type="info" size="mini" @click="onAlipayConfigEditClicked(scope.$index)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="微信支付" name="wechatPay">
            <el-table :data="wechatPayConfigList">
              <el-table-column property="wechatId" label="配置ID" show-overflow-tooltip />
              <el-table-column property="remark" label="配置描述" show-overflow-tooltip />
              <el-table-column property="appId" label="微信AppID" show-overflow-tooltip />
              <el-table-column property="apiUrl" label="API地址" show-overflow-tooltip />
              <el-table-column property="jsAppId" label="微信jsAppID" show-overflow-tooltip />
              <el-table-column property="jsApiUrl" label="jsAPI地址" show-overflow-tooltip />
              <el-table-column property="payNotifyUrl" label="支付回调地址" show-overflow-tooltip />
              <el-table-column property="refundNotifyUrl" label="退款回调地址" show-overflow-tooltip />
              <el-table-column width="160">
                <template slot="header">
                  <el-button type="primary" size="mini" @click="onWxPayConfigCreateClicked">新建微信支付配置</el-button>
                </template>
                <template slot-scope="scope">
                  <el-button type="info" size="mini" @click="onWxPayConfigEditClicked(scope.$index)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
    <app-config-dialog
      :dialog-visible="appConfigVisible"
      :app-config="currentAppConfig"
      :alipay-options="alipayConfigList"
      :wepay-options="wechatPayConfigList"
      @cancelled="appConfigVisible = false"
      @confirmed="onAppConfigConfirmed"
    />
    <alipay-config-dialog
      :dialog-visible="alipayConfigVisible"
      :alipay-config="currentAlipayConfig"
      @cancelled="alipayConfigVisible = false"
      @confirmed="onAlipayConfigConfirmed"
    />
    <wechat-config-dialog
      :dialog-visible="wechatPayConfigVisible"
      :wechat-pay-config="currentWechatPayConfig"
      @cancelled="wechatPayConfigVisible = false"
      @confirmed="onWechatPayConfigConfirmed"
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
  createAppConfigApi,
  createAlipayConfigApi,
  updateAlipayConfigApi,
  createWechatPayConfigApi,
  updateWechatPayConfigApi, updateAppConfigApi
} from '@/api/vendor'
import AppConfigDialog from '@/views/renter/appConfigDialog'
import AlipayConfigDialog from '@/views/renter/alipayConfigDialog'
import { getDigitalId } from '@/utils'
import WechatConfigDialog from '@/views/renter/wechatConfigDialog'
import { mapGetters } from 'vuex'
import { RenterPermissions } from '@/utils/role-permissions'

export default {
  name: 'RenterInfo',
  components: { WechatConfigDialog, AlipayConfigDialog, AppConfigDialog },
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
      renterPayType: 'alipay',
      alipayConfigVisible: false,
      currentAlipayConfig: null,
      alipayConfigList: [],
      wechatPayConfigVisible: false,
      currentWechatPayConfig: null,
      wechatPayConfigList: []
    }
  },
  computed: {
    ...mapGetters({
      userRenterId: 'renterId',
      userPermissions: 'userPermissions'
    }),
    hasViewRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      if (this.hasViewRenterPermission) {
        this.renterId = this.$route.params.renterId
      } else {
        this.renterId = this.userRenterId
      }
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
      } else {
        this.handleUpdateAppConfig(appData)
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
        let msg = '系统服务有问题，请联系管理员！'
        const res = e.response
        if (res && res.status >= 400 && res.status < 500) {
          if (res && res.data && res.data.message) {
            msg = res.data.message
          }
        }
        this.$message.warning(msg)
      } finally {
        this.dataLoading = false
      }
    },
    async handleUpdateAppConfig(appData) {
      try {
        this.dataLoading = true
        const { code, msg } = await updateAppConfigApi({ ...this.currentAppConfig, ...appData })
        if (code === 200) {
          await this.getAppConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update app config error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onAlipayConfigCreateClicked() {
      this.currentAlipayConfig = null
      this.alipayConfigVisible = true
    },
    onAlipayConfigEditClicked(index) {
      this.currentAlipayConfig = this.alipayConfigList[index]
      this.alipayConfigVisible = true
    },
    async handleUpdateAlipayConfig(data) {
      try {
        this.dataLoading = true
        const params = { ...this.currentAlipayConfig, ...data }
        const { code, msg } = await updateAlipayConfigApi(params)
        if (code === 200) {
          await this.getAlipayConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update alipay config error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleCreateAlipayConfig(data) {
      try {
        this.dataLoading = true
        const alipayId = 'alipay_' + getDigitalId(16)
        const params = { renterId: this.renterId, alipayId, ...data }
        const { code, msg } = await createAlipayConfigApi(params)
        if (code === 200) {
          await this.getAlipayConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create alipay config error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onAlipayConfigConfirmed(data) {
      this.alipayConfigVisible = false
      if (this.currentAlipayConfig !== null) {
        this.handleUpdateAlipayConfig(data)
      } else {
        this.handleCreateAlipayConfig(data)
      }
    },
    onWxPayConfigCreateClicked() {
      this.currentWechatPayConfig = null
      this.wechatPayConfigVisible = true
    },
    onWxPayConfigEditClicked(index) {
      this.currentWechatPayConfig = this.wechatPayConfigList[index]
      this.wechatPayConfigVisible = true
    },
    async handleUpdateWechatPayConfig(data) {
      try {
        this.dataLoading = true
        const params = { ...this.currentWechatPayConfig, ...data }
        const { code, msg } = await updateWechatPayConfigApi(params)
        if (code === 200) {
          await this.getWechatPayConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update wechat pay config error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleCreateWechatPayConfig(data) {
      try {
        this.dataLoading = true
        const wechatId = 'wxpay_' + getDigitalId(16)
        const params = { renterId: this.renterId, wechatId, ...data }
        const { code, msg } = await createWechatPayConfigApi(params)
        if (code === 200) {
          await this.getWechatPayConfigList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create wechat pay config error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onWechatPayConfigConfirmed(data) {
      this.wechatPayConfigVisible = false
      if (this.currentWechatPayConfig !== null) {
        this.handleUpdateWechatPayConfig(data)
      } else {
        this.handleCreateWechatPayConfig(data)
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
