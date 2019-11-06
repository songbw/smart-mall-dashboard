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
    <el-card v-if="isWuxiMall" shadow="never" style="margin-top: 20px">
      <div slot="header">
        <span class="card-header-text">
          会员余额：{{ memberBalance && memberBalance.amount >= 0 ? (memberBalance.amount / 100).toFixed(2) : '0' }}元
        </span>
        <el-button
          v-if="hasEditPermission"
          size="small"
          type="warning"
          style="margin-left: 20px"
          @click="rechargeDialogVisible = true"
        >
          充值
        </el-button>
      </div>
      <h4>余额交易记录</h4>
      <el-table
        v-loading="loadingBalance"
        :data="balanceFlowList"
        border
        fit
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="支付编号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="交易总额(元)" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ (scope.row.saleAmount / 100).toFixed(2) }}</span>
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
        :page-sizes="[10]"
        :page.sync="balanceFlowPageNo"
        :limit.sync="balanceFlowPageSize"
        :auto-scroll="false"
        layout="prev, pager, next"
        @pagination="getBalanceFlow"
      />
    </el-card>
    <el-card v-if="isWuxiMall" shadow="never" style="margin-top: 20px">
      <div slot="header">
        <span class="card-header-text">
          惠民优选卡绑定情况
        </span>
      </div>
      <el-radio-group v-model="cardValid" @change="getCardList">
        <el-radio :label="1">有效卡</el-radio>
        <el-radio :label="0">无效卡</el-radio>
      </el-radio-group>
      <el-table
        v-loading="loadingCardList"
        :data="cardData"
        border
        fit
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="卡面额(元)" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.amount | centFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卡余额(元)" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.balance | centFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卡号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.cardnum }}</span>
          </template>
        </el-table-column>
        <el-table-column label="添加日期" align="center" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.addDate | cardDateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效截止日期" align="center" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.expiryDate | cardDateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.isvalid === '01' ? '有效' : '无效' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="cardList.length"
        :page-sizes="[10]"
        :page.sync="cardPageNo"
        :limit.sync="cardPageSize"
        :auto-scroll="false"
        layout="prev, pager, next"
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
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import {
  getMemberProfileByIdApi,
  getMemberAddressListApi,
  getMemberBalanceApi,
  getMemberBalanceFlowApi,
  getMemberCardListApi,
  createMemberBalanceApi,
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
    cardDateFormat: date => {
      const format = 'YYYYMMDDHHmmss'
      const momentDate = moment(date, format)
      return date && momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : ''
    },
    typeFilter: type => {
      const find = BalanceFlowTypeDefinitions.find(item => item.value === type)
      return find ? find.label : ''
    },
    statusFilter: status => {
      const find = BalanceFlowStatusDefinitions.find(item => item.value === status)
      return find ? find.label : ''
    },
    centFilter: cent => {
      const yuan = Number.parseFloat(cent)
      if (Number.isNaN(yuan)) {
        return ''
      } else {
        return (yuan / 100).toFixed(2)
      }
    }
  },
  data() {
    return {
      isWuxiMall: process.env.VUE_APP_HOST === 'WX-MALL',
      loadingProfile: false,
      platformOpenId: null,
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
      loadingCardList: false,
      cardValid: 1,
      cardList: [],
      cardPageNo: 1,
      cardPageSize: 10,
      rechargeDialogVisible: false
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    }),
    hasEditPermission() {
      return this.isAdminUser
    },
    cardData: {
      get() {
        if (this.cardList.length > 0) {
          const begin = (this.cardPageNo > 1 ? (this.cardPageNo - 1) : 0) * this.cardPageSize
          const end = begin + this.cardPageSize
          return this.cardList.slice(begin, end)
        } else {
          return []
        }
      }
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
        const { data } = await getMemberProfileByIdApi({ id })
        if (data && data.user) {
          this.profile = data.user
          if (this.profile.openId) {
            this.platformOpenId = process.env.VUE_APP_ID + this.profile.openId
            if (this.isWuxiMall) {
              this.getMemberBalance()
              if (isEmpty(this.profile.telephone) === false) {
                this.getCardList()
              }
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
        const { code, data } = await getMemberBalanceApi({ openId })
        if (code === 200 && data !== null) {
          this.memberBalance = { ...data }
          this.getBalanceFlow()
        }
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
    async getAddressList() {
      try {
        this.loadingAddressList = true
        const openId = this.platformOpenId
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
    async getCardList() {
      try {
        this.loadingCardList = true
        const { code, data } = await getMemberCardListApi({
          phonenum: this.profile.telephone,
          isvalid: this.cardValid > 0
        })
        if (code === 200 && Array.isArray(data)) {
          this.cardList = data
        }
      } catch (e) {
        console.warn('Get member card list error:' + e)
      } finally {
        this.loadingCardList = false
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
          let res = null
          if (this.memberBalance !== null) {
            res = await rechargeMemberBalanceApi({ id: this.memberBalance.id, amount: amount * 100 })
          } else {
            res = await createMemberBalanceApi({
              openId: this.profile.openId,
              telephone: this.profile.telephone,
              amount: amount * 100
            })
          }
          if (res.code === 200) {
            this.$message.success('充值成功！')
            this.getMemberBalance()
          } else {
            this.$message.warning(res.msg)
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
