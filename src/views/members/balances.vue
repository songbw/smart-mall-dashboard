<template>
  <div class="app-container">
    <el-form inline @submit.prevent.native="() => {}">
      <el-form-item label="会员电话">
        <el-input
          v-model="queryTelephone"
          placeholder="输入会员电话"
          style="max-width: 400px;"
          :clearable="true"
          maxlength="20"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearchBalances">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="balancesLoading"
      :data="balanceList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员电话" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.telephone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="OpenId" align="center">
        <template slot-scope="scope">
          <router-link
            v-if="scope.row.userId"
            :to="{ name: 'MemberProfile', params: { id: scope.row.userId }}"
            class="el-link el-link--primary is-underline"
          >
            <span>{{ scope.row.openId }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="余额总数(元)" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.amount >= 0 ? (scope.row.amount / 100).toFixed(2) : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedAt | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasEditPermission" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            :disabled="scope.row.userId === null"
            type="primary"
            size="mini"
            @click="handleRecharge(scope.$index)"
          >
            充值
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="balanceTotal"
      :page.sync="queryPageNo"
      :limit.sync="queryPageSize"
      @pagination="getAllMemberBalances"
    />
    <recharge-balance
      :dialog-visible="rechargeDialogVisible"
      :telephone="rechargeTelephone"
      @cancelled="cancelRecharge"
      @confirmed="confirmRecharge"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import RechargeBalance from './recharge-balance'
import { getAllMemberBalancesApi, rechargeMemberBalanceApi, getMemberProfileByOpenIdApi } from '@/api/members'

export default {
  name: 'Balances',
  components: { Pagination, RechargeBalance },
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return date && momentDate.isValid() ? momentDate.format(format) : ''
    },
    statusFilter: status => {
      return status === 0 ? '正常' : '锁定'
    }
  },
  data() {
    return {
      balancesLoading: false,
      balanceTotal: 0,
      balanceList: [],
      query: {
        pageNo: 1,
        pageSize: 20
      },
      rechargeDialogVisible: false,
      rechargeId: -1,
      rechargeTelephone: ''
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      listQuery: 'balancesQuery'
    }),
    hasEditPermission() {
      return this.isAdminUser
    },
    queryTelephone: {
      get() {
        return this.listQuery.telephone
      },
      set(value) {
        this.$store.commit('members/SET_BALANCES_QUERY', { telephone: value.trim() })
      }
    },
    queryPageNo: {
      get() {
        return this.listQuery.pageNo
      },
      set(value) {
        this.$store.commit('members/SET_BALANCES_QUERY', { pageNo: value })
      }
    },
    queryPageSize: {
      get() {
        return this.listQuery.pageSize
      },
      set(value) {
        this.$store.commit('members/SET_BALANCES_QUERY', { pageSize: value })
      }
    }
  },
  created() {
    this.getAllMemberBalances()
  },
  beforeRouteLeave(to, from, next) {
    const toGroup = to.meta.group || ''
    if (toGroup !== this.$route.meta.group) {
      this.$store.commit('members/RESET_BALANCES_QUERY')
    }
    next()
  },
  methods: {
    async getAllMemberBalances() {
      try {
        this.balancesLoading = true
        const params = {
          pageNo: this.queryPageNo,
          pageSize: this.queryPageSize
        }
        if (!isEmpty(this.queryTelephone)) {
          params.telephone = this.queryTelephone
        }
        const { data } = await getAllMemberBalancesApi(params)
        if (data && data.total > 0) {
          this.balanceTotal = data.total
          this.balanceList = data.list
          for (const balance of this.balanceList) {
            if (balance.userId === null && balance.openId !== null) {
              balance.userId = await this.getMemberId(balance.openId)
            }
          }
        }
      } catch (e) {
        console.warn('Get all balances error:' + e)
      } finally {
        this.balancesLoading = false
      }
    },
    async getMemberId(openId) {
      let memberId = null
      try {
        const { code, data } = await getMemberProfileByOpenIdApi({ openId, iAppId: process.env.VUE_APP_ID })
        if (code === 200) {
          memberId = data.user.id
        }
      } catch (e) {
        console.warn('Get member id for balance list error:' + e)
      }
      return memberId
    },
    handleSearchBalances() {
      this.queryPageNo = 1
      this.getAllMemberBalances()
    },
    handleRecharge(index) {
      this.rechargeId = this.balanceList[index].id
      this.rechargeTelephone = this.balanceList[index].telephone
      this.rechargeDialogVisible = true
    },
    confirmRecharge(amount) {
      this.rechargeDialogVisible = false
      this.$confirm(`是否充值余额：${amount}元？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const { code, msg } = await rechargeMemberBalanceApi({ id: this.rechargeId, amount: amount * 100 })
          if (code === 200) {
            this.$message.success('充值成功！')
            this.getAllMemberBalances()
          } else {
            this.$message.warning(msg)
          }
        } catch (e) {
          console.debug('Recharge balance error:' + e)
        }
      }).catch(() => {
      })
    },
    cancelRecharge() {
      this.rechargeDialogVisible = false
      this.rechargeId = -1
      this.rechargeTelephone = ''
    }
  }
}
</script>

<style scoped>

</style>
