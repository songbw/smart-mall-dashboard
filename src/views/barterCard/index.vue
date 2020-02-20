<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryData">
      <el-form-item label="运营平台">
        <el-input readonly :value="currentAppName" />
      </el-form-item>
      <el-form-item label="提货卡名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable maxlength="20" />
      </el-form-item>
      <el-form-item v-if="hasType" label="提货卡类型">
        <el-select v-model="queryType">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提货卡状态">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getBarterCardData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" class="ops-button-group">
      <el-button
        type="primary"
        icon="el-icon-edit"
        @click="handleCreateCarterCard"
      >
        新建提货卡
      </el-button>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="barterCardList"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'BarterCardDetail', params: { id: scope.row.id, readOnly: true }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额(元)" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasType" label="类型" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效期(天)" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.effectiveDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-dropdown v-if="hasEditPermission" placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              选择操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="`start:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-sell"
              >
                发布提货卡
              </el-dropdown-item>
              <el-dropdown-item
                :command="`tickets:${scope.$index}`"
                :disabled="scope.row.status === initStatus"
                icon="el-icon-collection"
              >
                提货卡记录
              </el-dropdown-item>
              <el-dropdown-item
                :command="`view:${scope.$index}`"
                icon="el-icon-view"
                divided
              >
                查看提货卡
              </el-dropdown-item>
              <el-dropdown-item
                :command="`edit:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-edit"
              >
                修改提货卡
              </el-dropdown-item>
              <el-dropdown-item
                :command="`delete:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-delete"
              >
                删除提货卡
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-else-if="hasViewPermission"
            type="primary"
            icon="el-icon-view"
            @click="handleViewBarterCard(scope.row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="barterCardTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getBarterCardData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEqual from 'lodash/isEqual'
import Pagination from '@/components/Pagination'
import {
  getBarterCardsApi,
  deleteBarterCardApi,
  updateBarterCardApi
} from '@/api/barterCards'
import {
  barter_card_status_init,
  barter_card_status_published,
  BarterCardStatusDefinition,
  BarterCardTypeDefinition
} from '@/utils/constants'
import { BarterCardPermissions } from '@/utils/role-permissions'

export default {
  name: 'BarterCard',
  components: { Pagination },
  filters: {
    statusFilter: (status) => {
      const item = BarterCardStatusDefinition.find(item => item.value === status)
      return item ? item.label : ''
    },
    typeFilter: type => {
      const find = BarterCardTypeDefinition.find(option => option.value === type)
      return find ? find.label : ''
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  data() {
    return {
      hasType: false,
      initStatus: barter_card_status_init,
      publishedStatus: barter_card_status_published,
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(BarterCardStatusDefinition),
      typeOptions: [{
        value: 0,
        label: '全部'
      }].concat(BarterCardTypeDefinition),
      dataLoading: false,
      barterCardList: [],
      barterCardTotal: 0,
      queryParams: null
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      queryData: 'barterCardQuery',
      appList: 'platformAppList',
      appId: 'platformAppId'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(BarterCardPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(BarterCardPermissions.update)
    },
    currentAppName() {
      const find = this.appList.find(item => item.appId === this.appId)
      return find ? find.name : ''
    },
    queryName: {
      get() {
        return this.queryData.name
      },
      set(value) {
        this.$store.commit('barterCards/SET_SEARCH_DATA', { name: value })
      }
    },
    queryType: {
      get() {
        return this.queryData.type
      },
      set(value) {
        this.$store.commit('barterCards/SET_SEARCH_DATA', { type: value })
      }
    },
    queryStatus: {
      get() {
        return this.queryData.status
      },
      set(value) {
        this.$store.commit('barterCards/SET_SEARCH_DATA', { status: value })
      }
    },
    queryOffset: {
      get() {
        return this.queryData.offset
      },
      set(value) {
        this.$store.commit('barterCards/SET_SEARCH_DATA', { offset: value })
      }
    },
    queryLimit: {
      get() {
        return this.queryData.limit
      },
      set(value) {
        this.$store.commit('barterCards/SET_SEARCH_DATA', { limit: value })
      }
    }
  },
  created() {
    this.getBarterCardData()
  },
  methods: {
    getFilterParams() {
      const params = {
        appId: this.appId,
        pageSize: this.queryLimit
      }
      if (this.queryName && this.queryName !== '') {
        params.name = this.queryName
      }
      if (this.queryStatus !== 0) {
        params.status = this.queryStatus
      }
      if (this.queryType !== 0) {
        params.type = this.queryType
      }
      if (!isEqual(this.queryParams, params)) {
        if (this.queryParams !== null) {
          this.queryOffset = 1
        }
        this.queryParams = { ...params }
      }
      params.pageNo = this.queryOffset
      return params
    },
    async getBarterCardData() {
      if (this.hasViewPermission) {
        let total = 0
        let dataList = []
        const params = this.getFilterParams()
        try {
          this.dataLoading = true
          const { code, data } = await getBarterCardsApi(params)
          if (code === 200) {
            total = data.result.pageInfo.totalCount
            dataList = data.result.list
          }
        } catch (e) {
          console.warn('Get barter card error:' + e)
        } finally {
          this.barterCardTotal = total
          this.barterCardList = dataList
          this.dataLoading = false
        }
      } else {
        this.$message.warning('没有查看优惠券权限，请联系管理员！')
      }
    },
    handleCreateCarterCard() {
      this.$router.push({ name: 'CreateBarterCard' })
    },
    handleViewBarterCard(id) {
      this.$router.push({
        name: 'BarterCardDetail',
        params: { id, readOnly: true }
      })
    },
    handleStartBarterCard(id) {
      this.$confirm('是否继续发布此提货卡？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.dataLoading = true
          const { code } = await updateBarterCardApi({ id, status: barter_card_status_published })
          if (code === 200) {
            await this.getBarterCardData()
          }
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        } finally {
          this.dataLoading = false
        }
      }).catch(() => {
      })
    },
    handleEditBarterCard(id) {
      this.$router.push({
        name: 'BarterCardDetail',
        params: { id, readOnly: false }
      })
    },
    handleDeleteBarterCard(id) {
      this.$confirm('是否继续删除此提货卡？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.dataLoading = true
          const { code } = await deleteBarterCardApi({ id })
          if (code === 200) {
            await this.getBarterCardData()
          }
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        } finally {
          this.dataLoading = false
        }
      }).catch(() => {
      })
    },
    handleViewTickets(id) {
      this.$router.push({
        name: 'BarterCardTickets',
        params: { id }
      })
    },
    handleOpsAction(action) {
      const cmd = action.split(':')[0]
      const index = Number.parseInt(action.split(':')[1])
      const id = this.barterCardList[index].id
      switch (cmd) {
        case 'start':
          this.handleStartBarterCard(id)
          break
        case 'view':
          this.handleViewBarterCard(id)
          break
        case 'edit':
          this.handleEditBarterCard(id)
          break
        case 'delete':
          this.handleDeleteBarterCard(id)
          break
        case 'tickets':
          this.handleViewTickets(id)
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped>
  .ops-button-group {
    margin: 10px 0;
  }
</style>
