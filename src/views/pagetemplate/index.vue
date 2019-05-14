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
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否主页">
        <el-switch v-model="queryHomePage" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-tabs v-model="currentTab" type="card" @tab-click="onGroupChanged">
        <el-tab-pane
          v-for="item in groupTabs"
          :key="item.label"
          :label="item.label"
          :name="item.name"
        >
          <el-button-group>
            <el-button type="primary" icon="el-icon-document-add" @click="createPage">
              {{ $t('aggregation_create_new_btn_title') }}
            </el-button>
            <el-button v-if="item.name === '-1' || item.name === '0'" type="info" icon="el-icon-folder"
                       @click="handleCreateGroup">
              创建组
            </el-button>
            <el-button v-if="item.name !== '-1' && item.name !== '0'" type="warning" icon="el-icon-edit"
                       @click="handleUpdateGroup">
              修改组名
            </el-button>
            <el-button v-if="item.name !== '-1' && item.name !== '0'" type="danger" icon="el-icon-delete"
                       @click="handleDeleteGroup">
              删除组
            </el-button>
          </el-button-group>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div style="margin-top: 20px">
      <el-table v-loading="listLoading" :data="aggregationList" row-key="id" border fit highlight-current-row
                style="width: 100%;">
        <el-table-column label="ID" align="center" width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('aggregation_table_name_title')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('aggregation_table_date_title')" align="center" width="150px">
          <template slot-scope="scope">
            <span>{{ scope.row.effectiveDate | dateFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('aggregation_table_status_title')" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.status | statusFilter(statusTitle) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('aggregation_table_ops_title')" align="center" width="350px">
          <template slot-scope="scope">
            <el-button size="mini"
                       @click="handleView(scope.$index)">
              {{ $t('aggregation_table_ops_view_title') }}
            </el-button>
            <el-button type="primary" size="mini"
                       @click="handleEdit(scope.$index)">
              {{ $t('aggregation_table_ops_edit_title') }}
            </el-button>
            <el-button v-if="scope.row.status === 0" type="warning" size="mini"
                       @click="handlePublish(scope.$index)">
              {{ $t('confirm_button_publish_title') }}
            </el-button>
            <el-button v-else-if="scope.row.status === 1" type="warning" size="mini"
                       @click="handleDisable(scope.$index)">
              {{ $t('aggregation_table_ops_disable_title') }}
            </el-button>
            <el-button v-else type="warning" size="mini"
                       @click="handlePublish(scope.$index)">
              {{ $t('confirm_button_re-publish_title') }}
            </el-button>
            <el-button type="danger" size="mini"
                       @click="handleDelete(scope.$index)">
              {{ $t('confirm_button_del_title') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="queryOffset" :limit.sync="queryLimit"
                  @pagination="getListData" />
    </div>
    <el-dialog :visible.sync="viewDialogVisible" :show-close="false" center width="380px" custom-class="custom-phone">
      <div class="phone-container">
        <div class="phone">
          <iframe :src="iframeSrc" scrolling="no" frameborder="0" class="phone-content" />
          <!-- <page-display :page-id="displayPageId" class="phone-content"/> -->
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="handleClosePreview">{{ $t('confirm_button_ok_title') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="qrCodeDialogVisible" :show-close="false" title="页面预览" width="380px" center>
      <div class="content-center">
        <h3>请通过手机“扫一扫”功能，在手机上进行预览</h3>
      </div>
      <div class="content-center">
        <qriously :value="qrCodeValue" :size="200" />
      </div>
      <span slot="footer">
        <el-button type="primary" @click="qrCodeDialogVisible = false">{{ $t('confirm_button_ok_title') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination'

  export default {
    name: 'AggregationPages',
    components: { Pagination },
    filters: {
      statusFilter(status, titles) {
        return titles[status]
      },
      dateFilter(time) {
        if (time) {
          return parseTime(time, '{y}-{m}-{d}')
        } else {
          return ''
        }
      }
    },
    data() {
      return {
        qrCodeValue: '',
        iframeSrc: '',
        statusTitle: [
          this.$t('aggregation_table_status_editing'),
          this.$t('aggregation_table_status_active'),
          this.$t('aggregation_table_status_inactive')
        ],
        statusOptions: [{
          value: -1,
          label: '全部'
        }, {
          value: 0,
          label: this.$t('aggregation_table_status_editing')
        }, {
          value: 1,
          label: this.$t('aggregation_table_status_active')
        }, {
          value: 2,
          label: this.$t('aggregation_table_status_inactive')
        }],
        displayPageId: 0,
        viewDialogVisible: false,
        qrCodeDialogVisible: false,
        listLoading: false,
        queryGroupId: '-1'
      }
    },
    computed: {
      ...mapGetters({
        listQuery: 'aggregationQuery',
        aggregationList: 'allAggregationList',
        total: 'aggregationTotal',
        groups: 'aggregationGroups',
        groupId: 'aggregationGroupId'
      }),
      queryName: {
        get() {
          return this.listQuery.name
        },
        set(value) {
          this.$store.commit('setAggregationQuery', { name: value })
        }
      },
      queryStatus: {
        get() {
          return this.listQuery.status
        },
        set(value) {
          this.$store.commit('setAggregationQuery', { status: value })
        }
      },
      queryHomePage: {
        get() {
          return this.listQuery.homePage
        },
        set(value) {
          this.$store.commit('setAggregationQuery', { homePage: value })
        }
      },
      queryOffset: {
        get() {
          return this.listQuery.offset
        },
        set(value) {
          this.$store.commit('setAggregationQuery', { offset: value })
        }
      },
      queryLimit: {
        get() {
          return this.listQuery.limit
        },
        set(value) {
          this.$store.commit('setAggregationQuery', { limit: value })
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
          }].concat(this.groups.map(group => ({ name: group.id.toString(), label: group.name })))
        }
      },
      currentTab: {
        get() {
          return this.groupId.toString()
        },
        set(value) {
          this.$store.commit('setAggregationGroupID', Number.parseInt(value))
        }
      }
    },
    created() {
      this.getAggregationGroups()
      this.getListData()
    },
    beforeRouteLeave(to, from, next) {
      if (to.name !== 'pageCreate') {
        this.$store.commit('setAggregationQuery', {
          name: '',
          status: -1,
          homePage: false,
          offset: 1,
          limit: 20
        })
      }
      next()
    },
    methods: {
      async getAggregationGroups() {
        try {
          await this.$store.dispatch('getAggregationGroups', { offset: 1, limit: 100 })
        } catch (e) {
          this.$log.warn('getAggregationGroups:' + e)
        }
      },
      getListData() {
        const params = this.getFilterParams()
        if (params) {
          this.queryFilterData(params)
        } else {
          this.queryAllData()
        }
      },
      queryAllData() {
        this.listLoading = true
        const params = {
          offset: this.listQuery.offset,
          limit: this.listQuery.limit
        }
        this.$store.dispatch('getAggregationPages', params).then(() => {
          this.listLoading = false
        }).catch(err => {
          this.$message.error(err)
          this.listLoading = false
        })
      },
      getFilterParams() {
        const params = {
          offset: this.listQuery.offset,
          limit: this.listQuery.limit
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
      queryFilterData(params) {
        this.listLoading = true
        this.$store.dispatch('searchAggregationPages', params).then(() => {
          this.listLoading = false
        }).catch(err => {
          this.$message.error(err)
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.offset = 1
        this.getListData()
      },
      createPage() {
        this.$store.commit('resetTemplatePage')
        this.$router.push({
          name: 'pageCreate',
          params: { id: '-1' }
        })
      },
      handleClosePreview() {
        this.viewDialogVisible = false
        this.iframeSrc = 'about:blank'
      },
      handleView(index) {
        this.$store.commit('setCurrentAggregation', index)
        const id = this.aggregationList[index].id
        /*
        const url = this.$router.resolve({
          name: 'pageDisplay',
          params: { id: id }
        })
        console.log('handleView:' + url.href)
        this.iframeSrc = url.href
        */
        this.qrCodeValue = 'http://mall.weesharing.com/#/index/' + id
        this.qrCodeDialogVisible = true
      },
      handleEdit(index) {
        this.$store.commit('setCurrentAggregation', index)
        this.$router.push({
          name: 'pageCreate',
          params: { id: this.aggregationList[index].id.toString() }
        })
      },
      handleDisable(index) {
        this.$confirm(this.$t('aggregation_confirm_dialog_disable_message'), this.$t('confirm_dialog_warning_title'), {
          confirmButtonText: this.$t('confirm_button_ok_title'),
          cancelButtonText: this.$t('confirm_button_cancel_title'),
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          this.$store.dispatch('updateAggregationPage', { id: this.aggregationList[index].id, status: 2 }).then(() => {
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
        this.$store.dispatch('updateAggregationPage', { id: this.aggregationList[index].id, status: 1 }).then(() => {
          this.getListData()
        }).catch(error => {
          this.listLoading = false
          this.$message(error)
        })
      },
      handlePublish(index) {
        if (this.aggregationList[index].homePage) {
          this.$confirm(this.$t('aggregation_confirm_dialog_publish_main_message'), this.$t('confirm_dialog_warning_title'), {
            confirmButtonText: this.$t('confirm_button_ok_title'),
            cancelButtonText: this.$t('confirm_button_cancel_title'),
            type: 'warning'
          }).then(() => {
            this.publishPage(index)
          }).catch(() => {
          })
        } else {
          this.publishPage(index)
        }
      },
      handleDelete(index) {
        this.$confirm(this.$t('confirm_dialog_delete_message'), this.$t('confirm_dialog_warning_title'), {
          confirmButtonText: this.$t('confirm_button_ok_title'),
          cancelButtonText: this.$t('confirm_button_cancel_title'),
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          this.$store.dispatch('deleteAggregationPage', { id: this.aggregationList[index].id }).then(() => {
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
            cancelButtonText: '取消',
          })
          await this.$store.dispatch('createAggregationGroup', { name: action.value })
        } catch (e) {
          this.$log.warn('Crete aggregation group: ' + e)
        }
      },
      async handleUpdateGroup() {
        try {
          const action = await this.$prompt('请输入聚合页组的名称', '更改聚合页组', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          })
          await this.$store.dispatch('updateAggregationGroup', { id: this.groupId, name: action.value })
        } catch (e) {
          this.$log.warn('Crete aggregation group: ' + e)
        }
      },
      async handleDeleteGroup() {
        if (this.listLoading) {
          this.$message.warning('正在加载聚合页列表，请稍后操作！')
          return
        }
        if (this.total > 0) {
          this.$message.warning('请删除此组内所有聚合页！')
          return
        }
        try {
          await this.$confirm('是否要删除此聚合页组？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          await this.$store.dispatch('deleteAggregationGroup', { id: this.groupId })
          this.getListData()
        } catch (e) {
          this.$log.warn('Delete aggregation group:' + e)
        }
      },
      onGroupChanged(group) {
        this.$log.debug('Aggregation group changed:' + group.name)
        if (this.queryGroupId !== group.name) {
          this.getListData()
        }
      }
    }
  }
</script>

<style scoped>
  .custom-phone {
    padding: 10px;
  }

  .phone-container {
    height: 720px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .phone {
    height: 720px;
    padding: 10px 10px;
    border-radius: 30px;
    box-shadow: 0 0 0 2px #aaa;
    background: #111;
    position: absolute;
  }

  .phone-content {
    width: 100%;
    height: 700px;
    display: block;
    border-radius: 12px
  }

  .content-center {
    display: flex;
    justify-content: center;
  }
</style>

