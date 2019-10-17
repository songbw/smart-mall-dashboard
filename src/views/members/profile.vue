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
    <el-card v-if="showBalance && memberBalance" shadow="never" style="margin-top: 20px">
      <div slot="header">
        <span class="card-header-text">会员余额：{{ memberBalance.amount }}</span>
        <el-button size="small" type="warning" style="margin-left: 20px">充值</el-button>
      </div>
      <h4>余额交易记录</h4>
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
              v-if="scope.row.orderId"
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
    <el-button type="primary" style="margin-top: 20px" @click="goBack">返回</el-button>
    <recharge-balance
      :dialog-visible="rechargeDialogVisible"
      :name="profile.name"
      :telephone="profile.telephone"
      @cancelled="rechargeDialogVisible = false"
      @confirmed="confirmRecharge"
    />
  </div>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getMemberProfileApi,
  getMemberAddressListApi,
  getMemberBalanceApi,
  getMemberBalanceFlowApi,
  rechargeMemberBalanceApi
} from '@/api/members'
import RechargeBalance from './recharge-balance'
import {
  BalanceFlowTypeDefinitions,
  BalanceFlowStatusDefinitions
} from './constants'

export default {
  name: 'Profile',
  components: { Pagination, RechargeBalance },
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
      memberBalance: null,
      loadingBalance: false,
      balanceFlowTotal: 0,
      balanceFlowList: [],
      balanceFlowPageNo: 1,
      balanceFlowPageSize: 10,
      loadingAddressList: false,
      receivingAddressList: [],
      rechargeDialogVisible: false
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
              this.getMemberBalance()
            }
            this.getAddressList()
          }
        }
      } catch (e) {
        console.warn('Get member profile error:' + e)
      } finally {
        this.loadingProfile = false
      }
    },
    async getMemberBalance() {
      try {
        const openId = this.profile.openId
        const { code, data } = getMemberBalanceApi({ openId })
        if (code === 200 && data) {
          this.memberBalance = { ...data }
        }
        this.getBalanceFlow()
      } catch (e) {
        console.warn('Get member balance error:' + e)
      }
    },
    async getBalanceFlow() {
      try {
        this.loadingBalance = true
        const openId = this.profile.openId
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
        const openId = this.profile.openId
        const { data } = await getMemberAddressListApi({ openId })
        if (data && Array.isArray(data.result)) {
          this.receivingAddressList = data.result
        }
      } catch (e) {
        console.warn('Get member profile error:' + e)
      } finally {
        this.loadingAddressList = false
      }
    },
    confirmRecharge(amount) {
      this.rechargeDialogVisible = false
      this.$confirm(`是否充值余额：${amount}元？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const { code, msg } = await rechargeMemberBalanceApi({ id: this.memberBalance.id, amount })
          if (code === 200) {
            this.$message.success('充值成功！')
            this.getBalanceFlow()
          } else {
            this.$message.warning(msg)
          }
        } catch (e) {
          console.debug('Recharge balance error:' + e)
        }
      }).catch(() => {
      })
    },
    goBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/members')
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
