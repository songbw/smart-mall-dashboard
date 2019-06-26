<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="选择聚合页"
    width="60%"
    append-to-body
    center
  >
    <el-form :inline="true" :model="listQuery">
      <el-form-item label="聚合页名称">
        <el-input v-model="listQuery.name" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="聚合页状态">
        <el-select v-model="listQuery.status">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否主页">
        <el-switch v-model="listQuery.homePage" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="dialogAggregationTable"
      v-loading="listLoading"
      :data="aggregationList"
      style="width: 100%;"
      height="250"
      row-key="id"
      border
      fit
      highlight-current-row
      @current-change="handleDialogSelectionChange"
    >

      <el-table-column label="已选" align="center" width="100px">
        <template slot-scope="scope">
          <el-checkbox :value="aggregationSelect !== null && aggregationSelect.id === scope.row.id" />
        </template>
      </el-table-column>

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
          <el-tag>{{ scope.row.status | statusFilter(statusTitle) }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.offset"
      :limit.sync="listQuery.limit"
      @pagination="getListData"
    />
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import {
  getAggregationsApi,
  searchAggregationsApi
} from '@/api/aggregations'
import Pagination from '@/components/Pagination'

export default {
  name: 'AggregationSelectionDialog',
  components: { Pagination },
  filters: {
    statusFilter(status, titles) {
      return titles[status]
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusTitle: [
        '编辑中',
        '销售中',
        '已下架'
      ],
      statusOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '编辑中'
      }, {
        value: 1,
        label: '销售中'
      }, {
        value: 2,
        label: '已下架'
      }],
      listLoading: false,
      listQuery: {
        name: '',
        status: -1,
        homePage: false,
        offset: 1,
        limit: 20
      },
      aggregationSelect: null,
      aggregationList: [],
      total: 0
    }
  },
  computed: {},
  methods: {
    queryFilterData(params) {
      searchAggregationsApi(params).then(res => {
        const data = res.data.result
        this.aggregationList = data.list
        this.total = data.total
      }).catch((err) => {
        console.log('getAggregationList:' + err)
        this.aggregationList = []
        this.total = 0
      })
    },
    getAggregationList() {
      getAggregationsApi({ offset: this.listQuery.offset, limit: this.listQuery.limit }).then(res => {
        const data = res.data.result
        this.aggregationList = data.list
        this.total = data.total
      }).catch((err) => {
        console.log('getAggregationList:' + err)
        this.aggregationList = []
        this.total = 0
      })
    },
    handleFilter() {
      this.listQuery.offset = 1
      this.getListData()
    },
    getListData() {
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
      if (filter) {
        this.queryFilterData(params)
      } else {
        this.getAggregationList()
      }
    },
    handleDialogSelectionChange(row) {
      this.aggregationSelect = row
    },
    handleDialogCancel() {
      this.clearDialogData()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      if (this.aggregationSelect) {
        this.$emit('onSelectionConfirmed', Object.assign({}, this.aggregationSelect))
        this.clearDialogData()
      } else {
        this.$message({
          showClose: true,
          message: '请选择一个聚合页！',
          type: 'warning'
        })
      }
    },
    clearDialogData() {
      this.total = 0
      this.offset = 1
      this.aggregationSelect = null
      this.aggregationList = []
    }
  }
}
</script>
