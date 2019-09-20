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
      <el-table-column label="OpenId" align="center">
        <template slot-scope="scope">
          <router-link
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
      <el-table-column label="创建时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedAt | dateFormat }}</span>
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
  </div>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import { getAllMemberBalancesApi } from '@/api/members'

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
    }
  }
}
</script>

<style scoped>

</style>
