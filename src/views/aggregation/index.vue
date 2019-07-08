<template>
  <div class="app-container">
    <el-form :inline="true" :model="listQuery">
      <el-form-item label="聚合页名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="聚合页状态">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否主页">
        <el-switch v-model="queryHomePage" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="按创建时间排序：">
        <el-select v-model="queryOrder" @change="onOrderChanged">
          <el-option
            v-for="item in orderOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div>
      <el-tabs v-model="currentGroup" type="card" @tab-click="onGroupChanged">
        <el-tab-pane
          v-for="item in groupTabs"
          :key="item.label"
          :label="item.label"
          :name="item.name"
        >
          <el-button-group>
            <el-button
              :disabled="!vendorApproved"
              type="primary"
              icon="el-icon-document-add"
              @click="createPage"
            >
              创建聚合页
            </el-button>
            <el-button
              v-if="item.name === '-1' || item.name === '0'"
              :disabled="!vendorApproved"
              type="info"
              icon="el-icon-folder"
              @click="handleCreateGroup"
            >
              创建组
            </el-button>
            <el-button
              v-if="item.name !== '-1' && item.name !== '0'"
              type="warning"
              icon="el-icon-edit"
              @click="handleUpdateGroup"
            >
              修改组名
            </el-button>
            <el-button
              v-if="item.name !== '-1' && item.name !== '0'"
              type="danger"
              icon="el-icon-delete"
              @click="handleDeleteGroup"
            >
              删除组
            </el-button>
          </el-button-group>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div style="margin-top: 20px">
      <el-table
        v-loading="listLoading"
        :data="aggregationList"
        row-key="id"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="ID" align="center" width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="名称" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="生效时间" align="center" width="150px">
          <template slot-scope="scope">
            <span>{{ scope.row.effectiveDate | dateFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.status | statusFilter }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="350px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleView(scope.$index)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              size="mini"
              @click="handleEdit(scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="warning"
              size="mini"
              @click="handlePublish(scope.$index)"
            >
              发布
            </el-button>
            <el-button
              v-else-if="scope.row.status === 1"
              type="warning"
              size="mini"
              @click="handleDisable(scope.$index)"
            >
              下架
            </el-button>
            <el-button
              v-else
              type="warning"
              size="mini"
              @click="handlePublish(scope.$index)"
            >
              发布
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="aggregationTotal"
        :page.sync="queryOffset"
        :limit.sync="queryLimit"
        @pagination="getListData"
      />
    </div>
    <el-dialog :visible.sync="qrCodeDialogVisible" :show-close="false" title="页面预览" width="380px" center>
      <div class="content-center">
        <h3>请通过手机“扫一扫”功能，在手机上进行预览</h3>
      </div>
      <div class="content-center">
        <qriously :value="qrCodeValue" :size="200" />
      </div>
      <span slot="footer">
        <el-button type="primary" @click="qrCodeDialogVisible = false">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getAggregationsApi,
  searchAggregationsApi,
  deleteAggregationApi,
  updateAggregationApi
} from '@/api/aggregations'

import {
  AggregationStatusOptions
} from './constants'

export default {
  name: 'AggregationPages',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const item = AggregationStatusOptions.find(option => option.value === status)
      return item ? item.label : status
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  data() {
    return {
      qrCodeValue: '',
      iframeSrc: '',
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(AggregationStatusOptions),
      orderOptions: [{
        value: 'asc',
        label: '升序'
      }, {
        value: 'desc',
        label: '降序'
      }],
      aggregationList: [],
      aggregationTotal: 0,
      displayPageId: 0,
      qrCodeDialogVisible: false,
      listLoading: false,
      queryGroupId: '-1'
    }
  },
  computed: {
    ...mapGetters({
      vendorApproved: 'vendorApproved',
      listQuery: 'aggregationsQuery',
      aggregationGroups: 'aggregationGroups',
      groupId: 'aggregationGroupId'
    }),
    queryName: {
      get() {
        return this.listQuery.name
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { name: value })
      }
    },
    queryStatus: {
      get() {
        return this.listQuery.status
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { status: value })
      }
    },
    queryHomePage: {
      get() {
        return this.listQuery.homePage
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { homePage: value })
      }
    },
    queryOffset: {
      get() {
        return this.listQuery.offset
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { offset: value })
      }
    },
    queryLimit: {
      get() {
        return this.listQuery.limit
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { limit: value })
      }
    },
    queryOrder: {
      get() {
        return this.listQuery.order
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { order: value })
      }
    },
    groupTabs: {
      get() {
        return [{
          name: '-1',
          label: '全部'
        }, {
          name: '0',
          label: '未分组'
        }].concat(this.aggregationGroups.map(group => ({ name: group.id.toString(), label: group.name })))
      }
    },
    currentGroup: {
      get() {
        return this.groupId.toString()
      },
      set(value) {
        this.$store.commit('aggregations/SET_GROUP_ID', Number.parseInt(value))
      }
    }
  },
  created() {
    this.getAggregationGroups()
    this.getListData()
  },
  methods: {
    async getAggregationGroups() {
      try {
        if (this.vendorApproved) {
          await this.$store.dispatch('aggregations/getGroups', { offset: 1, limit: 100 })
        }
      } catch (e) {
        console.warn('getAggregationGroups:' + e)
      }
    },
    getListData() {
      if (this.vendorApproved) {
        const params = this.getFilterParams()
        if (params) {
          this.queryFilterData(params)
        } else {
          this.queryAllData()
        }
      }
    },
    async queryAllData() {
      this.listLoading = true
      const params = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        order: this.listQuery.order
      }
      try {
        const { data } = await getAggregationsApi(params)
        this.aggregationList = data.result.list
        this.aggregationTotal = data.result.total
      } catch (e) {
        console.warn('getAggregationPages error: ' + e)
      } finally {
        this.listLoading = false
      }
    },
    getFilterParams() {
      const params = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        order: this.listQuery.order
      }
      let filter = false
      if (this.listQuery.name && this.listQuery.name.trim()) {
        params.name = this.listQuery.name
        filter = true
      }
      if (this.listQuery.status > -1) {
        params.status = this.listQuery.status
        filter = true
      }
      if (this.listQuery.homePage) {
        params.homePage = true
        filter = true
      }
      if (this.groupId !== -1) {
        params.groupId = this.groupId
        this.queryGroupId = this.groupId.toString()
        filter = true
      } else {
        this.queryGroupId = '-1'
      }
      if (filter) {
        return params
      } else {
        return null
      }
    },
    async queryFilterData(params) {
      this.listLoading = true
      try {
        const { data } = await searchAggregationsApi(params)
        this.aggregationList = data.result.list
        this.aggregationTotal = data.result.total
      } catch (e) {
        console.warn('queryFilterData: error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.offset = 1
      this.getListData()
    },
    createPage() {
      this.$store.commit('aggregations/RESET_CURRENT_DATA')
      this.$router.push({
        name: 'CreateAggregation'
      })
    },
    handleView(index) {
      const id = this.aggregationList[index].id
      this.qrCodeValue = process.env.VUE_APP_MALL_URL + id
      this.qrCodeDialogVisible = true
    },
    handleEdit(index) {
      this.$router.push({
        name: 'EditAggregation',
        params: { id: this.aggregationList[index].id.toString() }
      })
    },
    handleDisable(index) {
      this.$confirm('下架此页，将导致客户端不可访问，是否继续下架？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        updateAggregationApi({ id: this.aggregationList[index].id, status: 2 }).then(() => {
          this.getListData()
        }).catch(error => {
          this.listLoading = false
          this.$message(error)
        })
      }).catch(() => {
      })
    },
    publishPage(index) {
      this.listLoading = true
      updateAggregationApi({ id: this.aggregationList[index].id, status: 1 }).then(() => {
        this.getListData()
      }).catch(error => {
        this.listLoading = false
        this.$message(error)
      })
    },
    handlePublish(index) {
      let msg = '是否继续上架此聚合页？'
      if (this.aggregationList[index].homePage) {
        msg = '发布此主页，将会替换目前生效的主页，是否继续发布？'
      }
      this.$confirm(msg, '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.publishPage(index)
      }).catch(() => {
      })
    },
    handleDelete(index) {
      this.$confirm('是否继续删除?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        deleteAggregationApi({ id: this.aggregationList[index].id }).then(() => {
          this.getListData()
        }).catch(error => {
          this.listLoading = false
          this.$message(error)
        })
      }).catch(() => {
      })
    },
    async handleCreateGroup() {
      try {
        const action = await this.$prompt('请输入聚合页组的名称', '创建聚合页组', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await this.$store.dispatch('aggregations/createGroup', { name: action.value })
      } catch (e) {
        console.warn('Crete aggregation group: ' + e)
      }
    },
    async handleUpdateGroup() {
      try {
        const action = await this.$prompt('请输入聚合页组的名称', '更改聚合页组', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await this.$store.dispatch('aggregations/updateGroup',
          { id: this.groupId, name: action.value })
      } catch (e) {
        console.warn('Crete aggregation group: ' + e)
      }
    },
    async handleDeleteGroup() {
      if (this.listLoading) {
        this.$message.warning('正在加载聚合页列表，请稍后操作！')
        return
      }
      if (this.aggregationTotal > 0) {
        this.$message.warning('请删除此组内所有聚合页！')
        return
      }
      try {
        await this.$confirm('是否要删除此聚合页组？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$store.dispatch('aggregations/deleteGroup', { id: this.groupId })
      } catch (e) {
        console.warn('Delete aggregation group:' + e)
      }
    },
    onGroupChanged(group) {
      console.debug('Aggregation group changed:' + group.name)
      if (this.queryGroupId !== group.name) {
        this.getListData()
      }
    },
    onOrderChanged(order) {
      this.getListData()
    }
  }
}
</script>

<style scoped>
  .content-center {
    display: flex;
    justify-content: center;
  }
</style>

