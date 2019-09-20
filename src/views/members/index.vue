<template>
  <div class="app-container">
    <el-form inline @submit.prevent.native="() => {}">
      <el-form-item label="会员名">
        <el-input
          v-model="queryName"
          placeholder="输入会员姓名"
          style="max-width: 400px;"
          :clearable="true"
          maxlength="10"
        />
      </el-form-item>
      <el-form-item label="会员电话">
        <el-input
          v-model="queryTelephone"
          placeholder="输入会员电话"
          style="max-width: 400px;"
          :clearable="true"
          maxlength="10"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getMembers">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="memberList"
      border
      fit
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column label="会员编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="OpenID" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.openId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员姓名" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员电话" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.telephone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleViewMember(scope.row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="memberTotal"
      :page.sync="listQuery.pageNo"
      :limit.sync="listQuery.pageSize"
      @pagination="getMembers"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import { getMembersApi } from '@/api/members'
import Pagination from '@/components/Pagination'

export default {
  name: 'Members',
  components: { Pagination },
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      listQuery: {
        name: '',
        telephone: '',
        pageNo: 1,
        pageSize: 20
      },
      listLoading: false,
      memberTotal: 0,
      memberList: []
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    }),
    noEditPermission() {
      return !this.isAdminUser
    },
    queryName: {
      get() {
        return this.listQuery.name
      },
      set(value) {
        this.listQuery.name = trim(value)
      }
    },
    queryTelephone: {
      get() {
        return this.listQuery.telephone
      },
      set(value) {
        this.listQuery.telephone = trim(value)
      }
    }
  },
  created() {
    this.getMembers()
  },
  methods: {
    async getMembers() {
      try {
        const params = {
          pageNo: this.listQuery.pageNo,
          pageSize: this.listQuery.pageSize
        }
        if (!isEmpty(this.queryName)) {
          params.name = this.queryName
        }
        if (!isEmpty(this.queryTelephone)) {
          params.telephone = this.queryTelephone
        }
        this.listLoading = true
        const { data } = await getMembersApi(params)
        if (data.userList) {
          this.memberTotal = data.userList.total
          this.memberList = data.userList.list
        }
      } catch (e) {
        console.warn('Get members error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleViewMember(id) {
      this.$router.push({ name: 'MemberProfile', params: { id }})
    }
  }
}
</script>

<style scoped>

</style>
