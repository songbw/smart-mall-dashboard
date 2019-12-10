<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    append-to-body
    title="选择促销活动"
    width="70%"
    center
  >
    <el-form :inline="true" :model="query">
      <el-form-item label="活动名称">
        <el-input v-model="query.name" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="活动状态">
        <el-select v-model="query.status" style="width: 100px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getFilterData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="dialogPromotionTable"
      :data="promotionsData"
      style="width: 100%"
      height="250"
      highlight-current-row
      border
      @current-change="handleDialogSelectionChange"
    >
      <el-table-column label="已选" align="center" width="100px">
        <template slot-scope="scope">
          <el-checkbox :value="promotionSelection !== null && promotionSelection.id === scope.row.id" />
        </template>
      </el-table-column>
      <el-table-column label="活动编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.status | promotionStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效开始时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.startDate | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效结束时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.endDate | timeFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :page.sync="query.offset"
      :limit.sync="query.limit"
      @pagination="getFilterData"
    />
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import { searchPromotionsApi, getPublishedPromotionsApi } from '@/api/promotions'
import {
  PromotionStatusDefinition,
  PromotionPublishedDefinition
} from '@/utils/constants'

export default {
  name: 'PromotionSelection',
  components: { Pagination },
  filters: {
    discountTypeLabel: (type) => {
      if (type === 0) {
        return '减价'
      } else if (type === 1) {
        return '折扣'
      }
    },
    promotionStatus: (status) => {
      const found = PromotionStatusDefinition.find(item => item.value === status)
      return found ? found.label : ''
    },
    timeFilter: time => {
      if (time) {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const date = moment(time)
        return date.format(format)
      } else {
        return ''
      }
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    appId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      statusOptions: [{ value: 0, label: '全部' }].concat(PromotionPublishedDefinition),
      discountTypeOptions: [{
        value: -1,
        label: '全部'
      }, {
        value: 0,
        label: '减价'
      }, {
        value: 1,
        label: '折扣'
      }],
      query: {
        name: '',
        status: 0,
        offset: 1,
        limit: 20
      },
      dataLoading: false,
      promotionSelection: null,
      total: 0,
      promotionsData: []
    }
  },
  methods: {
    getFilterParams() {
      const params = { appId: this.appId, dailySchedule: false }
      if (this.query.name && this.query.name.trim()) {
        params.name = this.query.name.trim()
      }
      if (this.query.status !== 0) {
        params.status = this.query.status
      }
      return params
    },
    getFilterData() {
      const params = this.getFilterParams()
      if ('status' in params) {
        this.listLoading = true
        searchPromotionsApi({ offset: this.query.offset, limit: this.query.limit, ...params }).then((res) => {
          this.promotionsData = res.data.result.list
          this.total = res.data.result.total
          this.listLoading = false
        }).catch(err => {
          console.log('Search Promotions:' + err)
          this.listLoading = false
        })
      } else {
        this.listLoading = true
        getPublishedPromotionsApi({
          pageNo: this.query.offset, pageSize: this.query.limit, ...params
        }).then((res) => {
          if (res.code === 200) {
            this.promotionsData = res.data.result.list
            this.total = res.data.result.pageInfo.totalCount
          }
          this.listLoading = false
        }).catch(err => {
          console.log('Search Promotions:' + err)
          this.listLoading = false
        })
      }
    },
    handleDialogSelectionChange(row) {
      this.promotionSelection = row
    },
    handleDialogCancel() {
      this.clearDialogData()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      if (this.promotionSelection) {
        this.$emit('onSelectionConfirmed', Object.assign({}, this.promotionSelection))
        this.clearDialogData()
      } else {
        this.$message({
          showClose: true,
          message: '请选择一个促销活动！',
          type: 'warning'
        })
      }
    },
    clearDialogData() {
      this.promotionSelection = null
      this.promotionsData = []
      this.total = 0
      this.query.name = ''
      this.query.status = 0
      this.query.type = -1
      this.query.offset = 1
      this.query.limit = 20
    }
  }
}
</script>

<style scoped>

</style>
