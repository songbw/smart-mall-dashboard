<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item>
        <el-radio-group v-model="chartDataType" @change="onDataTypeChanged">
          <el-radio-button label="1">昨天</el-radio-button>
          <el-radio-button label="7">最近7天</el-radio-button>
          <el-radio-button label="30">最近30天</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序">
        <el-select :value="sortKey" @change="onSortChanged">
          <el-option
            v-for="item in sortOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-table
          ref="behaviorsTable"
          v-loading="dataLoading"
          :data="behaviorData"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @current-change="handleCurrentChange"
        >
          <el-table-column label="页面地址" align="start">
            <template slot-scope="scope">
              <span>{{ scope.row.url }}</span>
            </template>
          </el-table-column>
          <el-table-column label="访问次数" align="center" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.total_pv }}</span>
            </template>
          </el-table-column>
          <el-table-column label="访问人数" align="center" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.total_uv }}</span>
            </template>
          </el-table-column>
          <el-table-column label="平均停留时长(分）" align="center" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.avg_stop_time | secondFormat }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="behaviorTotal"
          :page.sync="queryOffset"
          :limit.sync="queryLimit"
          @pagination="getBehaviorsData"
        />
      </el-col>
      <el-col :span="12">
        <div class="data-title">页面访问趋势 / 按日期</div>
        <el-card shadow="never">
          <ve-line :data="chartData" :settings="chartSettings" :loading="chartLoading" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getBehaviorDataApi
} from '@/api/statistics'

export default {
  name: 'Behaviors',
  components: { Pagination },
  filters: {
    secondFormat: secs => {
      return Math.floor(secs / 60) + ':' + ('0' + Math.floor(secs % 60)).slice(-2)
    }
  },
  data() {
    return {
      chartDataType: '7',
      sortOptions: [{
        value: 'avg_stop_time',
        label: '平均停留时长'
      }, {
        value: 'total_pv',
        label: '访问次数'
      }, {
        value: 'total_uv',
        label: '访问人数'
      }],
      sortKey: 'avg_stop_time',
      dataLoading: false,
      behaviorData: [],
      behaviorTotal: 0,
      queryOffset: 1,
      queryLimit: 10,
      chartLoading: false,
      chartSettings: {
        dataType: 'normal',
        labelMap: {
          total_pv: '访问次数',
          total_uv: '访问人数',
          avg_stop_time: '平均停留时长'
        }
      },
      chartData: {
        columns: ['visit_date', 'total_pv', 'total_uv'],
        rows: []
      }
    }
  },
  created() {
    this.getBehaviorsData()
  },
  methods: {
    async getBehaviorsData() {
      try {
        this.dataLoading = true
        const format = 'YYYY-MM-DD'
        const range = Number.parseInt(this.chartDataType)
        const startTime = moment().subtract(range, 'days').format(format)
        const endTime = moment().subtract(1, 'days').format(format)
        const params = {
          pageNo: this.queryOffset,
          pageSize: this.queryLimit,
          orderKey: this.sortKey,
          startTime,
          endTime
        }
        const { data } = await getBehaviorDataApi(params)
        this.behaviorTotal = data.data.total
        this.behaviorData = data.data.list
        if (this.behaviorData.length > 0) {
          this.$refs.behaviorsTable.setCurrentRow(this.behaviorData[0])
        } else {
          this.chartData.rows = []
        }
      } catch (e) {
        console.warn('User behavior error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onDataTypeChanged(value) {
      this.chartDataType = value
      this.getBehaviorsData()
    },
    onSortChanged(value) {
      this.sortKey = value
      this.getBehaviorsData()
    },
    handleCurrentChange(row) {
      if (row) {
        this.getChartData(row.key)
      }
    },
    async getChartData(urlKey) {
      if (!isEmpty(urlKey)) {
        try {
          const format = 'YYYY-MM-DD'
          const range = Number.parseInt(this.chartDataType)
          const startTime = moment().subtract(range, 'days').format(format)
          const endTime = moment().subtract(1, 'days').format(format)
          const params = {
            pageNo: 1,
            pageSize: 100,
            urlKey,
            startTime,
            endTime
          }
          this.chartLoading = true
          const { data } = await getBehaviorDataApi(params)
          const shortFormat = 'MM/DD'
          const behaviors = data.data.list.map(item => {
            return {
              visit_date: moment(item.visit_date, format).format(shortFormat),
              total_pv: item.total_pv,
              total_uv: item.total_uv,
              avg_stop_time: item.avg_stop_time
            }
          })
          this.chartData.rows = []
          for (let index = 0; index < range; index++) {
            const visitDate = moment().subtract(range - index, 'days').format(shortFormat)
            const found = behaviors.find(item => item.visit_date === visitDate)
            this.chartData.rows.push({
              visit_date: visitDate,
              total_pv: found ? found.total_pv : 0,
              total_uv: found ? found.total_uv : 0,
              avg_stop_time: found ? found.avg_stop_time : 0
            })
          }
        } catch (e) {
          console.warn('User behavior chart error:' + e)
        } finally {
          this.chartLoading = false
        }
      }
    }
  }
}
</script>

<style scoped>
  .data-title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }
</style>
