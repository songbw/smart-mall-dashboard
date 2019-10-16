<template>
  <div class="app-container">
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
      <el-table-column label="余额总数" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
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
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleRecharge(scope.$index)">
            充值
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="balanceTotal"
      :page-sizes="[10, 20]"
      :page.sync="query.pageNo"
      :limit.sync="query.pageSize"
      @pagination="getAllMemberBalances"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="rechargeDialogVisible"
      title="余额充值"
    >
      <el-form
        ref="rechargeForm"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="会员电话">
          <el-input :value="rechargeForm.telephone" readonly />
        </el-form-item>
        <el-form-item label="充值额度(元)" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :precision="2"
            :step="1"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRecharge">取消</el-button>
        <el-button type="primary" @click="confirmRecharge">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import { getAllMemberBalancesApi, rechargeMemberBalanceApi } from '@/api/members'

export default {
  name: 'Balances',
  components: { Pagination },
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
      rechargeForm: {
        id: -1,
        telephone: '',
        amount: 0
      },
      rechargeRules: {
        amount: [{
          required: true, validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请输入有效的充值额度'))
            }
          }, trigger: 'blur'
        }]
      }
    }
  },
  created() {
    this.getAllMemberBalances()
  },
  methods: {
    async getAllMemberBalances() {
      try {
        this.loadingBalance = true
        const params = {
          pageNo: this.query.pageNo,
          pageSize: this.query.pageSize
        }
        const { data } = await getAllMemberBalancesApi(params)
        if (data && data.total > 0) {
          this.balanceTotal = data.total
          this.balanceList = data.list
        }
      } catch (e) {
        console.warn('Get all balances error:' + e)
      } finally {
        this.loadingBalance = false
      }
    },
    handleRecharge(index) {
      this.rechargeForm.id = this.balanceList[index].id
      this.rechargeForm.telephone = this.balanceList[index].telephone
      this.rechargeForm.amount = 0
      this.rechargeDialogVisible = true
    },
    async rechargeBalance(params) {
      this.$confirm(`是否充值余额：${params.amount}元？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const { code, msg } = await rechargeMemberBalanceApi(params)
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
      this.$refs.rechargeForm.clearValidate()
      this.rechargeDialogVisible = false
      this.rechargeForm.id = -1
      this.rechargeForm.telephone = ''
      this.rechargeForm.amount = 0
    },
    confirmRecharge() {
      this.$refs.rechargeForm.validate(async valid => {
        if (valid) {
          this.rechargeDialogVisible = false
          this.rechargeBalance({ id: this.rechargeForm.id, amount: this.rechargeForm.amount })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
