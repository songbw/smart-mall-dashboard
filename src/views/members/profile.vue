<template>
  <div class="app-container">
    <el-card v-loading="loadingProfile" shadow="never" style="width: 50%">
      <div slot="header">
        <span class="card-header-text">会员基本信息</span>
      </div>
      <el-form label-width="80px" label-position="left">
        <el-form-item label="OpenID">
          <span>{{ profile.openId }}</span>
        </el-form-item>
        <el-form-item label="会员姓名">
          <span>{{ profile.name }}</span>
        </el-form-item>
        <el-form-item label="会员电话">
          <span>{{ profile.telephone }}</span>
        </el-form-item>
        <el-form-item label="会员别称">
          <span>{{ profile.nickname }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ profile.createdAt | dateFormat }}</span>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-if="showBalance" shadow="never" style="margin-top: 20px">
      <div slot="header">
        <span class="card-header-text">会员余额：{{ balanceAmount }}</span>
      </div>
      <el-table
        v-loading="loadingBalance"
        :data="balanceFlowList"
        border
        fit
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="交易主订单编号" align="center">
          <template slot-scope="scope">
            <router-link
              :to="{ name: 'ViewMainOrder', params: { mainId: scope.row.orderId }}"
              class="el-link el-link--primary is-underline"
            >
              <span>{{ scope.row.orderNo }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="交易主总额" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.saleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="交易类型" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.type | typeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="交易状态" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.status | statusFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="交易时间" align="center" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.createdAt | dateFormat }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="balanceFlowTotal"
        :page-sizes="[10, 20]"
        :page.sync="balanceFlowPageNo"
        :limit.sync="balanceFlowPageSize"
        :auto-scroll="false"
        layout="prev, pager, next"
        @pagination="getBalanceFlow"
      />
    </el-card>
    <el-card v-loading="loadingAddressList" shadow="never" style="margin-top: 20px">
      <div slot="header">
        <span class="card-header-text">收货地址列表</span>
      </div>
      <el-table
        :data="receivingAddressList"
        border
        fit
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="收货人姓名" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.receiverName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货人电话" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.mobile }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮政编码" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.zip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收货人地址" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.provinceName }} </span>
            <span>{{ scope.row.cityName }} </span>
            <span>{{ scope.row.countyName }} </span>
            <span>{{ scope.row.address }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getMemberProfileApi,
  getMemberAddressListApi,
  getMemberBalanceApi,
  getMemberBalanceFlowApi
} from '@/api/members'
import {
  BalanceFlowTypeDefinitions,
  BalanceFlowStatusDefinitions
} from './constants'

export default {
  name: 'Profile',
  components: { Pagination },
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return date && momentDate.isValid() ? momentDate.format(format) : ''
    },
    typeFilter: type => {
      const find = BalanceFlowTypeDefinitions.find(item => item.value === type)
      return find ? find.label : ''
    },
    statusFilter: status => {
      const find = BalanceFlowStatusDefinitions.find(item => item.value === status)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      showBalance: process.env.VUE_APP_HOST === 'WX-MALL',
      loadingProfile: false,
      profile: {
        id: null,
        openId: '',
        name: '',
        telephone: '',
        nickname: '',
        createdAt: ''
      },
      balanceAmount: 0,
      loadingBalance: false,
      balanceFlowTotal: 0,
      balanceFlowList: [],
      balanceFlowPageNo: 1,
      balanceFlowPageSize: 10,
      loadingAddressList: false,
      receivingAddressList: []
    }
  },
  created() {
    const id = this.$route.params.id
    if (id) {
      this.getMemberProfile(id)
    }
  },
  methods: {
    async getMemberProfile(id) {
      try {
        this.loadingProfile = true
        const { data } = await getMemberProfileApi({ id })
        if (data && data.user) {
          this.profile = data.user
          if (this.profile.openId) {
            if (this.showBalance) {
              this.getMemberBalance(this.profile.openId)
            }
            this.getAddressList(this.profile.openId)
          }
        }
      } catch (e) {
        console.warn('Get member profile error:' + e)
      } finally {
        this.loadingProfile = false
      }
    },
    async getMemberBalance(openId) {
      try {
        const { data } = getMemberBalanceApi({ openId })
        if (data && 'amount' in data) {
          this.balanceAmount = data.amount
        }
        this.getBalanceFlow(openId)
      } catch (e) {
        console.warn('Get member balance error:' + e)
      }
    },
    async getBalanceFlow(openId) {
      try {
        this.loadingBalance = true
        const { data } = await getMemberBalanceFlowApi({
          openId,
          pageNo: this.balanceFlowPageNo,
          pageSize: this.balanceFlowPageSize
        })
        if (data && data.total > 0) {
          this.balanceFlowTotal = data.total
          this.balanceFlowList = data.list
        }
      } catch (e) {
        console.warn('Get balance list error: ' + e)
      } finally {
        this.loadingBalance = false
      }
    },
    async getAddressList(openId) {
      try {
        this.loadingAddressList = true
        const { data } = await getMemberAddressListApi({ openId })
        if (data && Array.isArray(data.result)) {
          this.receivingAddressList = data.result
        }
      } catch (e) {
        console.warn('Get member profile error:' + e)
      } finally {
        this.loadingAddressList = false
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
</style>
