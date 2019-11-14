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
        <el-button
          v-if="hasBalanceEditPermission"
          type="warning"
          icon="el-icon-upload2"
          @click="importDialogVisible = true"
        >
          批量初始化余额
        </el-button>
        <el-button
          v-if="hasBalanceExportPermission"
          type="success"
          icon="el-icon-download"
          @click="exportDialogVisible = true"
        >
          导出余额记录
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
      <el-table-column v-if="hasBalanceEditPermission" label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button
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
    <balances-import
      :dialog-visible="importDialogVisible"
      @onSelectionCancelled="importDialogVisible = false"
      @onSelectionConfirmed="handleImportBalances"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="exportDialogVisible"
      title="导出余额记录"
    >
      <el-form ref="exportForm" :model="exportForm" :rules="exportRules" label-width="7rem">
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="exportForm.startDate"
            placeholder="选择开始日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="exportForm.endDate"
            placeholder="选择结束日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelExport">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import RechargeBalance from './recharge-balance'
import {
  getAllMemberBalancesApi,
  rechargeMemberBalanceApi,
  getMemberProfileByOpenIdApi,
  batchInitBalancesApi
} from '@/api/members'
import { MemberPermissions } from '@/utils/role-permissions'
import BalancesImport from './balances-import'

const couldRecharge = true
const validateDates = (start, end) => {
  const format = 'YYYY-MM-DD'
  if (start && end) {
    const startDate = moment(start, format)
    const maxEndDate = moment(start, format).add(3, 'months')
    const endDate = moment(end, format)
    return endDate.isSameOrAfter(startDate) && endDate.isSameOrBefore(maxEndDate)
  } else {
    return false
  }
}
export default {
  name: 'Balances',
  components: { Pagination, RechargeBalance, BalancesImport },
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
      importDialogVisible: false,
      rechargeId: -1,
      rechargeTelephone: '',
      exportDialogVisible: false,
      exportForm: {
        startDate: null,
        endDate: null
      },
      exportRules: {
        startDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if ((value && this.exportForm.endDate === null) ||
              validateDates(this.exportForm.startDate, this.exportForm.endDate)) {
              callback()
            } else {
              callback(new Error('请选择合适导出的开始日期，区间最多3个月'))
            }
          }
        }],
        endDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if ((value && this.exportForm.startDate === null) ||
              validateDates(this.exportForm.startDate, this.exportForm.endDate)) {
              callback()
            } else {
              callback(new Error('请选择合适导出的结束日期， 区间最多3个月'))
            }
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userName: 'userName',
      userPermissions: 'userPermissions',
      listQuery: 'balancesQuery'
    }),
    hasBalanceViewPermission() {
      return this.userPermissions.includes(MemberPermissions.balanceView)
    },
    hasBalanceEditPermission() {
      return couldRecharge && this.userPermissions.includes(MemberPermissions.balanceUpdate)
    },
    hasBalanceExportPermission() {
      return this.userPermissions.includes(MemberPermissions.balanceExport)
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
      if (this.hasBalanceViewPermission) {
        try {
          this.balancesLoading = true
          const params = {
            pageNo: this.queryPageNo,
            pageSize: this.queryPageSize
          }
          if (!isEmpty(this.queryTelephone)) {
            params.telephone = this.queryTelephone
          }
          const { code, data } = await getAllMemberBalancesApi(params)
          if (code === 200) {
            this.balanceTotal = data.total
            this.balanceList = data.list
            for (const balance of this.balanceList) {
              if (balance.userId === null && balance.openId !== null) {
                balance.userId = await this.getMemberId(balance.openId)
              }
            }
          } else {
            this.balanceTotal = 0
            this.balanceList = []
          }
        } catch (e) {
          console.warn('Get all balances error:' + e)
        } finally {
          this.balancesLoading = false
        }
      } else {
        this.$message.warning('没有查看余额的权限，请联系管理员！')
      }
    },
    async getMemberId(openId) {
      let memberId = null
      try {
        const { code, data } = await getMemberProfileByOpenIdApi({ openId, iAppId: process.env.VUE_APP_ID })
        if (code === 200 && data.user !== null) {
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
          const { code, msg } = await rechargeMemberBalanceApi({
            id: this.rechargeId, amount: amount * 100, username: this.userName
          })
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
    },
    async handleImportBalances(balances) {
      this.importDialogVisible = false
      if (balances.length > 0) {
        try {
          this.balancesLoading = true
          for (let i = 0; i < balances.length; i += 100) {
            const balanceList = balances.slice(i, i + 100)
              .map(item => ({ username: this.userName, ...item }))
            await batchInitBalancesApi(balanceList)
          }
          this.getAllMemberBalances()
        } catch (e) {
          console.warn('Import balances error:' + e)
        } finally {
          this.balancesLoading = false
        }
      }
    },
    handleCancelExport() {
      this.$refs.exportForm.resetFields()
      this.exportDialogVisible = false
    },
    handleConfirmExport() {
      this.$refs.exportForm.validate(valid => {
        if (valid) {
          this.exportDialogVisible = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
