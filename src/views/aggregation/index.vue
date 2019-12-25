<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="运营平台名">
        <el-input readonly :value="currentAppName" />
      </el-form-item>
      <el-form-item label="聚合页名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
    </el-form>
    <el-form inline>
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
      <el-form-item label="主页设置">
        <el-select v-model="queryHomePage">
          <el-option
            v-for="item in homeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-form v-if="false" inline>
      <el-form-item label="创建时间排列：">
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
          <div v-if="hasEditPermission" style="display: flex;justify-content: space-between">
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
                :disabled="!vendorApproved || aggregationSelection.length === 0"
                type="info"
                icon="el-icon-brush"
                @click="revisePages"
              >
                批量修正聚合页
              </el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                :disabled="!vendorApproved"
                type="info"
                icon="el-icon-folder"
                @click="handleCreateGroup"
              >
                创建组
              </el-button>
              <el-button
                :disabled="item.name === '-1' || item.name === '0'"
                type="warning"
                icon="el-icon-edit"
                @click="handleUpdateGroup"
              >
                修改组名
              </el-button>
              <el-button
                :disabled="item.name === '-1' || item.name === '0'"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteGroup"
              >
                删除组
              </el-button>
            </el-button-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div style="margin-top: 20px">
      <el-table
        ref="aggregationTable"
        v-loading="listLoading"
        :data="aggregationList"
        row-key="id"
        border
        fit
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          align="center"
          type="selection"
          width="55"
        />
        <el-table-column label="编号" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="名称" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建日期" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.effectiveDate | dateFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column label="是否主页" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.homePage ? '是' : '否' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.status | statusFilter }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="left" :width="hasEditPermission? '350': '100'">
          <template slot-scope="scope">
            <el-button
              v-if="hasViewPermission"
              size="mini"
              @click="handleView(scope.$index)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasEditPermission"
              type="primary"
              size="mini"
              @click="handleEdit(scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasEditPermission"
              type="info"
              size="mini"
              @click="handleClone(scope.$index)"
            >
              复制
            </el-button>
            <el-button
              v-if="hasEditPermission && scope.row.status !== onSaleStatus"
              type="warning"
              size="mini"
              @click="handlePublish(scope.$index)"
            >
              发布
            </el-button>
            <el-button
              v-if="hasEditPermission && scope.row.status === onSaleStatus"
              type="warning"
              size="mini"
              @click="handleDisable(scope.$index)"
            >
              下架
            </el-button>
            <el-button
              v-if="hasEditPermission && scope.row.status !== onSaleStatus"
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
    <preview-dialog
      :dialog-visible="qrCodeDialogVisible"
      :qr-code="qrCodeValue"
      @closed="onPreviewClosed"
    />
    <clone-dialog
      :dialog-visible="cloneDialogVisible"
      title="复制聚合页"
      name-title="聚合页名称"
      @cancelled="cloneDialogVisible = false"
      @confirmed="handleClonePage"
    />
    <el-dialog
      title="正在修改聚合页商品"
      :visible.sync="reviseDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="300px"
      center
    >
      <div style="display: flex; flex-direction:column; align-items: center; justify-content: center">
        <div style="margin-bottom: 20px">{{ reviseName }}</div>
        <el-progress type="circle" :percentage="reviseProgress" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancelRevise">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import CloneDialog from '@/components/CloneDialog'
import PreviewDialog from './components/previewDialog'
import {
  getAggregationsApi,
  searchAggregationsApi,
  deleteAggregationApi,
  updateAggregationApi
} from '@/api/aggregations'
import { AggregationPermissions } from '@/utils/role-permissions'
import {
  AggregationStatusOptions,
  aggregation_editing_status,
  aggregation_on_sale_status,
  aggregation_off_shelves_status
} from './constants'

export default {
  name: 'AggregationPages',
  components: { Pagination, PreviewDialog, CloneDialog },
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
      homeOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '排除主页'
      }, {
        value: 1,
        label: '只含主页'
      }],
      orderOptions: [{
        value: 'asc',
        label: '升序'
      }, {
        value: 'desc',
        label: '降序'
      }],
      onEditStatus: aggregation_editing_status,
      onSaleStatus: aggregation_on_sale_status,
      onOffStatus: aggregation_off_shelves_status,
      aggregationList: [],
      aggregationTotal: 0,
      displayPageId: 0,
      qrCodeDialogVisible: false,
      listLoading: false,
      queryGroupId: '-1',
      cloneDialogVisible: false,
      cloneId: null,
      aggregationSelection: [],
      reviseDialogVisible: false,
      reviseProgress: 0,
      reviseName: '',
      cancelRevise: false
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      vendorApproved: 'vendorApproved',
      listQuery: 'aggregationsQuery',
      aggregationGroups: 'aggregationGroups',
      groupId: 'aggregationGroupId',
      appList: 'platformAppList',
      appId: 'platformAppId'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(AggregationPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(AggregationPermissions.update)
    },
    queryName: {
      get() {
        return this.listQuery.name
      },
      set(value) {
        this.$store.commit('aggregations/SET_SEARCH_DATA', { name: trim(value) })
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
    },
    currentAppName() {
      const find = this.appList.find(item => item.appId === this.appId)
      return find ? find.name : ''
    }
  },
  watch: {
    appId: function(value, old) {
      this.queryOffset = 1
      this.currentGroup = '-1'
      this.prepareAggregationData()
    }
  },
  created() {
    this.prepareAggregationData()
  },
  methods: {
    async prepareAggregationData() {
      await this.getAggregationGroups()
      await this.getListData()
    },
    async getAggregationGroups() {
      try {
        if (this.vendorApproved && this.hasViewPermission) {
          await this.$store.dispatch('aggregations/getGroups', {
            offset: 1, limit: 100, appId: this.appId
          })
        }
      } catch (e) {
        console.warn('getAggregationGroups:' + e)
      }
    },
    getListData() {
      if (this.vendorApproved) {
        if (this.hasViewPermission) {
          const params = this.getFilterParams()
          if (params) {
            this.queryFilterData(params)
          } else {
            this.queryAllData()
          }
        } else {
          this.$message.warning('没有查看聚合页权限，请联系管理员！')
        }
      }
    },
    async queryAllData() {
      this.listLoading = true
      try {
        const params = {
          offset: this.listQuery.offset,
          limit: this.listQuery.limit,
          order: this.listQuery.order,
          appId: this.appId
        }
        const { code, data } = await getAggregationsApi(params)
        if (code === 200) {
          this.aggregationList = data.result.list
          this.aggregationTotal = data.result.total
        } else {
          this.aggregationList = []
          this.aggregationTotal = 0
        }
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
        order: this.listQuery.order,
        appId: this.appId
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
      if (this.listQuery.homePage > -1) {
        params.homePage = this.listQuery.homePage > 0
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
        const { code, data } = await searchAggregationsApi(params)
        if (code === 200) {
          this.aggregationList = data.result.list
          this.aggregationTotal = data.result.total
        } else {
          this.aggregationList = []
          this.aggregationTotal = 0
        }
      } catch (e) {
        console.warn('queryFilterData: error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.queryOffset = 1
      this.getListData()
    },
    createPage() {
      this.$router.push({
        name: 'CreateAggregation'
      })
    },
    onPreviewClosed() {
      this.qrCodeDialogVisible = false
    },
    handleView(index) {
      const id = this.aggregationList[index].id
      this.qrCodeValue = process.env.VUE_APP_MALL_URL + '/index/' + id
      this.qrCodeDialogVisible = true
    },
    handleEdit(index) {
      this.$router.push({
        name: 'EditAggregation',
        params: { id: this.aggregationList[index].id.toString() }
      })
    },
    handleClone(index) {
      this.cloneId = this.aggregationList[index].id
      this.cloneDialogVisible = true
    },
    async handleClonePage(params) {
      this.cloneDialogVisible = false
      try {
        this.listLoading = true
        const id = await this.$store.dispatch('aggregations/clonePage', { id: this.cloneId, ...params })
        if (id >= 0) {
          this.$message.success('复制聚合页成功，请切换到对应的聚合页平台查看')
        }
      } catch (e) {
        console.warn('Clone aggregation page error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleDisable(index) {
      const aggregation = this.aggregationList[index]
      if (aggregation.status === aggregation_on_sale_status && aggregation.homePage === true) {
        this.$alert('此聚合页为正在使用主页，请先发布其他主页。', '警告', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: _ => {
          }
        })
        return
      }
      this.$confirm('下架此页，将导致客户端不可访问，是否继续下架？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        updateAggregationApi({ id: aggregation.id, status: 2 }).then(() => {
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
          if (this.aggregationList.length === 1 && this.queryOffset > 1) {
            this.queryOffset = this.queryOffset - 1
          }
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
        await this.$store.dispatch('aggregations/createGroup', {
          name: action.value, appId: this.appId
        })
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
        const index = this.groupTabs.findIndex(group => group.name === this.groupId.toString())
        const nextIndex = index > 1 ? index - 1 : 0
        await this.$store.dispatch('aggregations/deleteGroup', { id: this.groupId })
        this.currentGroup = this.groupTabs[nextIndex].name
        this.getListData()
      } catch (e) {
        console.warn('Delete aggregation group:' + e)
      }
    },
    onGroupChanged(group) {
      if (this.queryGroupId !== group.name) {
        this.queryOffset = 1
        this.getListData()
      }
    },
    onOrderChanged(order) {
      this.getListData()
    },
    handleSelectionChange(selection) {
      this.aggregationSelection = selection
    },
    async revisePages() {
      try {
        await this.$confirm('此操作将会删除所选聚合页中已下架的商品，是否继续？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.cancelRevise = false
        this.reviseDialogVisible = true
        let count = 0
        const total = this.aggregationSelection.length
        for (const aggregation of this.aggregationSelection) {
          this.reviseName = aggregation.name
          count++
          this.reviseProgress = Math.round(100 * count / total)
          await this.$store.dispatch('aggregations/revisePage', { id: aggregation.id })
          if (this.cancelRevise) break
        }
        if (!this.cancelRevise) this.$message.success('修改聚合页成功！')
      } catch (e) {
        console.warn('Revise aggregation error:' + e)
      } finally {
        this.$refs['aggregationTable'].clearSelection()
        this.reviseDialogVisible = false
      }
    },
    handleCancelRevise() {
      this.reviseDialogVisible = false
      this.cancelRevise = true
    }
  }
}
</script>

<style scoped>
</style>

