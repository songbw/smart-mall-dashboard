<template>
  <div class="app-container">
    <el-tabs v-model="queryAppId" type="card" @tab-click="onAppIdChanged">
      <el-tab-pane
        v-for="item in appIdOptions"
        :key="item.appId"
        :label="item.name"
        :name="item.appId"
      />
    </el-tabs>
    <el-form inline @submit.prevent.native="() => {}">
      <el-form-item label="会员姓名">
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
          maxlength="20"
        />
      </el-form-item>
    </el-form>
    <el-form inline @submit.prevent.native="() => {}">
      <el-form-item label="会员昵称">
        <el-input
          v-model="queryNickname"
          placeholder="输入会员昵称"
          style="max-width: 400px;"
          :clearable="true"
          maxlength="30"
        />
      </el-form-item>
      <el-form-item label="OpenID">
        <el-input
          v-model="queryOpenId"
          placeholder="输入OpenID"
          style="max-width: 400px;"
          :clearable="true"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearchMembers">
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
      <el-table-column label="编号" align="center" width="80">
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
      <el-table-column label="会员昵称" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
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
      :page.sync="queryPageNo"
      :limit.sync="queryPageSize"
      @pagination="getMemberList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import { getMemberListApi } from '@/api/members'
import Pagination from '@/components/Pagination'
import { MemberPermissions } from '@/utils/role-permissions'

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
      listLoading: false,
      memberTotal: 0,
      memberList: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      platformAppList: 'platformAppList',
      validAppList: 'validAppList',
      listQuery: 'membersQuery'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(MemberPermissions.view)
    },
    queryAppId: {
      get() {
        return this.listQuery.appId
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { appId: value })
      }
    },
    queryName: {
      get() {
        return this.listQuery.name
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { name: trim(value) })
      }
    },
    queryTelephone: {
      get() {
        return this.listQuery.telephone
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { telephone: trim(value) })
      }
    },
    queryOpenId: {
      get() {
        return this.listQuery.openId
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { openId: trim(value) })
      }
    },
    queryNickname: {
      get() {
        return this.listQuery.nickname
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { nickname: trim(value) })
      }
    },
    queryPageNo: {
      get() {
        return this.listQuery.pageNo
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { pageNo: value })
      }
    },
    queryPageSize: {
      get() {
        return this.listQuery.pageSize
      },
      set(value) {
        this.$store.commit('members/SET_MEMBERS_QUERY', { pageSize: value })
      }
    },
    appIdOptions() {
      if (this.showAllAppIdList) {
        return [{ appId: 'all', name: '全部' }].concat(this.platformAppList)
      } else {
        return this.validAppList
      }
    },
    showAllAppIdList() {
      return this.validAppList.length === this.platformAppList.length
    }
  },
  created() {
    this.prepareData()
  },
  beforeRouteLeave(to, from, next) {
    const toGroup = to.meta.group || ''
    if (toGroup !== this.$route.meta.group) {
      this.$store.commit('members/RESET_MEMBERS_QUERY')
    }
    next()
  },
  methods: {
    async prepareData() {
      await this.getAppPlatformList()
      await this.getMemberList()
    },
    async getAppPlatformList() {
      try {
        if (this.platformAppList.length === 0) {
          await this.$store.dispatch('app/getPlatformList')
        }
        if (!this.showAllAppIdList) {
          this.queryAppId = this.validAppList.length > 0 ? this.validAppList[0].appId : 'invalid'
        }
      } catch (e) {
        console.warn('Order get app list error:' + e)
      }
    },
    async getMemberList() {
      if (this.hasViewPermission) {
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
          if (!isEmpty(this.queryOpenId)) {
            params.openId = this.queryOpenId
          }
          if (!isEmpty(this.queryNickname)) {
            params.nickname = this.queryNickname
          }
          if (this.queryAppId !== 'all') {
            params.appId = this.queryAppId
          }
          this.listLoading = true
          const { data } = await getMemberListApi(params)
          if (data.userList) {
            this.memberTotal = data.userList.total
            this.memberList = data.userList.list
          }
        } catch (e) {
          console.warn('Get members error:' + e)
        } finally {
          this.listLoading = false
        }
      } else {
        this.$message.warning('没有查看会员的权限，请联系管理员！')
      }
    },
    handleSearchMembers() {
      this.listQuery.pageNo = 1
      this.getMemberList()
    },
    handleViewMember(id) {
      this.$router.push({
        name: 'MemberProfile',
        params: { id }
      })
    },
    onAppIdChanged(platform) {
      if (this.queryAppId !== platform.appId) {
        this.queryPageNo = 1
        this.getMemberList()
      }
    }
  }
}
</script>

<style scoped>

</style>
