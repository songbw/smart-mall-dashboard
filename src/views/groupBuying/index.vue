<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryData">
      <el-form-item label="名称" class="form-item">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="状态" class="form-item">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="queryData">
      <el-form-item label="开始时间" class="form-item">
        <el-date-picker v-model="queryStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" />
      </el-form-item>
      <el-form-item label="结束时间" class="form-item">
        <el-date-picker v-model="queryEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getCampaignData">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div class="ops-button-group">
      <el-button type="primary" icon="el-icon-edit" class="ops-button"
                 @click="handleCreateCampaign">
        新建团购活动
      </el-button>
    </div>
    <el-table
      v-loading="dataLoading"
      ref="productsTable"
      :data="campaignData"
      border fit stripe highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品编码" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.skuid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | campaignStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="组团次数" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.groupTotal }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动开始时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.effectiveStartDate | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.effectiveEndDate | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('aggregation_table_ops_title')" align="center" width="120">
        <template slot-scope="scope">
          <el-dropdown placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="`start:${scope.$index}`" :disabled="scope.row.status !== 1"
                                icon="el-icon-time">
                发布
              </el-dropdown-item>
              <el-dropdown-item :command="`view:${scope.$index}`"
                                icon="el-icon-view" divided>
                查看
              </el-dropdown-item>
              <el-dropdown-item :command="`edit:${scope.$index}`"
                                :disabled="scope.row.status === 2 || scope.row.status === 3"
                                icon="el-icon-edit">
                修改
              </el-dropdown-item>
              <el-dropdown-item :command="`usage:${scope.$index}`"
                                icon="el-icon-collection">
                记录
              </el-dropdown-item>
              <el-dropdown-item :command="`stop:${scope.$index}`"
                                :disabled="scope.row.status === 1 || scope.row.status === 3"
                                icon="el-icon-sold-out" divided>
                结束
              </el-dropdown-item>
              <el-dropdown-item :command="`delete:${scope.$index}`" :disabled="scope.row.status === 2"
                                icon="el-icon-delete">
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="campaignTotal"
                :page.sync="queryOffset" :limit.sync="queryLimit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getCampaignData" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import pagination from '@/components/Pagination'
  import {
    campaignStatus
  } from './constants'

  export default {
    name: 'GroupBuying',
    components: { pagination },
    filters: {
      campaignStatus: (status) => {
        const item = campaignStatus.find(campaign => campaign.value === status)
        return item ? item.label : ''
      },
      dateFilter: date => {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const momentDate = moment(date)
        return momentDate.isValid() ? momentDate.format(format) : date

      }
    },
    data() {
      return {
        statusOptions: [{
          value: -1,
          label: '全部'
        }].concat(campaignStatus),
        dataLoading: false,
      }
    },
    computed: {
      ...mapGetters({
        campaignData: 'groupBuyingCampaignList',
        campaignTotal: 'groupBuyingCampaignTotalNum',
        queryData: 'groupBuyingQuery'
      }),
      queryName: {
        get() {
          return this.queryData.name
        },
        set(value) {
          this.$store.commit('setGroupBuyingQueryData', { name: value })
        }
      },
      queryStatus: {
        get() {
          return this.queryData.status
        },
        set(value) {
          this.$store.commit('setGroupBuyingQueryData', { status: value })
        }
      },
      queryStartDate: {
        get() {
          return this.queryData.startDate
        },
        set(value) {
          const start = moment(value).set({ 'hour': 0, 'minute': 0, 'second': 0 })
          if (start.isValid() && (this.queryEndDate === null || start.isBefore(this.queryEndDate))) {
            this.$store.commit('setGroupBuyingQueryData', { startDate: start.format('YYYY-MM-DD HH:mm:ss') })
          } else {
            if (value) {
              this.$message.warn('开始日前必须早于结束日期')
            }
            this.$store.commit('setGroupBuyingQueryData', { startDate: null })
          }

        }
      },
      queryEndDate: {
        get() {
          return this.queryData.endDate
        },
        set(value) {
          const end = moment(value).set({ 'hour': 23, 'minute': 59, 'second': 59 })
          if (end.isValid() && (this.queryStartDate === null || end.isAfter(this.queryStartDate))) {
            this.$store.commit('setGroupBuyingQueryData', { endDate: end.format('YYYY-MM-DD HH:mm:ss') })
          } else {
            if (value) {
              this.$message.warn('结束日期必须晚于开始日期')
            }
            this.$store.commit('setGroupBuyingQueryData', { endDate: null })
          }
        }
      },
      queryOffset: {
        get() {
          return this.queryData.offset
        },
        set(value) {
          this.$store.commit('setGroupBuyingQueryData', { offset: value })
        }
      },
      queryLimit: {
        get() {
          return this.queryData.limit
        },
        set(value) {
          this.$store.commit('setGroupBuyingQueryData', { limit: value })
        }
      }
    },
    created() {
      this.getCampaignData()
    },
    methods: {
      getFilterParams() {
        const params = {}
        if (this.queryName && this.queryName !== '') {
          params.name = this.queryName
        }
        if (this.queryStatus >= 0) {
          params.status = this.queryStatus
        }
        if (this.queryStartDate && this.queryStartDate.trim()) {
          params.startDate = this.queryStartDate
        }
        if (this.queryEndDate && this.queryEndDate.trim()) {
          params.endDate = this.queryEndDate
        }
        params.offset = this.queryOffset
        params.limit = this.queryLimit
        return params
      },
      async getCampaignData() {
        const params = this.getFilterParams()
        this.dataLoading = true
        try {
          await this.$store.dispatch('getGroupBuyingList', params)
        } catch (e) {
          this.$log.warn('getCampaignData:' + e)
        } finally {
          this.dataLoading = false
        }
      },
      handleCreateCampaign() {
        this.$router.push({ name: 'CreateGroupBuying' })
      },
      handleOpsAction() {
      }
    }
  }
</script>

<style scoped>
  .form-item {
    width: 300px;
  }

  .ops-button-group {
    margin: 10px 0;
  }

  .ops-button {
    margin: 0 10px;
  }
</style>
