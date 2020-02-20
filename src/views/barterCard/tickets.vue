<template>
  <div class="app-container">
    <el-form inline :model="queryData">
      <el-form-item label="提货券状态">
        <el-select v-model="queryData.status" style="width: 90px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="激活时间">
        <el-date-picker
          v-model="queryData.activateStartTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="-">
        <el-date-picker
          v-model="queryData.activateEndTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getTicketData">
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <div style="margin: 20px 0">
      <el-button type="primary" @click="distributeDialogVisible = true">
        生成提货券
      </el-button>
      <el-button :disabled="activateSelection.length === 0" type="warning" @click="handleActivateTickets">
        批量激活
      </el-button>
      <el-button type="info" @click="exportDialogVisible = true">
        导出提货券
      </el-button>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="ticketList"
      border
      fit
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="提货券编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.card }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提货券密码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户优惠券码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userCouponCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户OpenID" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.openId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="激活时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.activateTime | timeFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.consumedTime | timeFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="ticketTotal"
      :page.sync="queryData.pageNo"
      :limit.sync="queryData.pageSize"
      @pagination="getTicketData"
    />
    <el-dialog
      title="生成提货券"
      :visible.sync="distributeDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
    >
      <el-form label-width="160">
        <el-form-item label="提货券数量">
          <el-input-number v-model="distributeNum" :min="1" :max="100000000" step-strictly />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelDistribute">取消</el-button>
        <el-button type="primary" @click="handleConfirmDistribute">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="导出提货券"
      :visible.sync="exportDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
    >
      <el-form label-width="160">
        <el-form-item label="提货券状态">
          <el-select v-model="exportTicketStatus" style="width: 90px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelExport">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  getTicketsByIdApi,
  distributeBarterCardApi,
  exportTicketsByIdApi,
  batchActivateTicketsApi
} from '@/api/barterCards'
import {
  ticket_status_init,
  TicketStatusOptions
} from './constants'
import isEqual from 'lodash/isEqual'

const timeFormat = time => {
  const format = 'YYYY-MM-DD HH:mm:ss'
  const momentDate = moment(time)
  if (momentDate.isValid()) {
    return momentDate.format(format)
  } else {
    return ''
  }
}

export default {
  name: 'Tickets',
  components: { Pagination },
  filters: {
    statusFilter: status => {
      const usage = TicketStatusOptions.find(option => status === option.value)
      return usage ? usage.label : ''
    },
    passwordFilter: password => {
      const len = password.length
      if (len > 5) {
        const reg = password.slice(1, 5)
        return password.replace(reg, '****')
      } else {
        return '*'
      }
    },
    timeFormat: time => timeFormat(time)
  },
  data() {
    return {
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(TicketStatusOptions),
      dataLoading: false,
      queryParams: null,
      queryData: {
        status: 0,
        activateStartTime: null,
        activateEndTime: null,
        pageNo: 1,
        pageSize: 20
      },
      activateSelection: [],
      barterCardId: -1,
      ticketTotal: 0,
      ticketList: [],
      distributeDialogVisible: false,
      distributeNum: 1,
      exportDialogVisible: false,
      exportTicketStatus: 0
    }
  },
  created() {
    this.barterCardId = this.$route.params.id
    this.getTicketData()
  },
  methods: {
    getFilterParams() {
      const params = {
        id: this.barterCardId,
        pageSize: this.queryData.pageSize
      }

      if (this.queryData.status !== 0) {
        params.status = this.queryData.status
      }
      if (this.queryData.activateStartTime !== null) {
        params.activateStartTime = this.queryData.activateStartTime
      }
      if (this.queryData.activateEndTime !== null) {
        params.activateEndTime = this.queryData.activateEndTime
      }
      if (!isEqual(this.queryParams, params)) {
        if (this.queryParams !== null) {
          this.queryData.pageNo = 1
        }
        this.queryParams = { ...params }
      }
      params.pageNo = this.queryData.pageNo
      return params
    },
    async getTicketData() {
      let total = 0
      let dataList = []
      try {
        this.dataLoading = true
        const params = this.getFilterParams()
        const { code, data } = await getTicketsByIdApi(params)
        if (code === 200) {
          dataList = data.result.list
          total = data.result.pageInfo.totalCount
        }
      } catch (e) {
        console.warn('Get barter card tickets error:' + e)
      } finally {
        this.ticketList = dataList
        this.ticketTotal = total
        this.dataLoading = false
      }
    },
    handleSelectionChange(selection) {
      this.activateSelection = selection
        .filter(item => item.status === ticket_status_init)
        .map(item => ({ id: item.id, card: item.card }))
    },
    async handleActivateTickets() {
      try {
        this.dataLoading = true
        const { code } = await batchActivateTicketsApi(this.activateSelection)
        if (code === 200) {
          this.activateSelection = []
          await this.getTicketData()
        } else {
          this.$message.warning('激活失败，请联系管理员！')
        }
      } catch (e) {
        console.warn('Batch activate tickets error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    handleCancelDistribute() {
      this.distributeDialogVisible = false
      this.distributeNum = 1
    },
    async handleConfirmDistribute() {
      const num = this.distributeNum
      this.distributeDialogVisible = false
      this.distributeNum = 1
      if (num > 0) {
        try {
          this.dataLoading = true
          const params = {
            cardId: this.barterCardId,
            num,
            remark: ''
          }
          const { code } = await distributeBarterCardApi(params)
          if (code === 200) {
            this.queryData.pageNo = 1
            await this.getTicketData()
          }
        } catch (e) {
          console.warn('Distribute tickets error:' + e)
        } finally {
          this.dataLoading = false
        }
      }
    },
    downloadBlobData(data, filename) {
      try {
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Download blob data error:' + e)
      }
    },
    handleCancelExport() {
      this.exportDialogVisible = false
      this.exportTicketStatus = 0
    },
    async handleConfirmExport() {
      try {
        const status = this.exportTicketStatus
        this.exportDialogVisible = false
        this.exportTicketStatus = 0
        const params = {
          ids: this.barterCardId
        }
        if (status > 0) {
          params.status = status
        }
        const data = await exportTicketsByIdApi(params)
        const filename = '提货券列表.xls'
        this.downloadBlobData(data, filename)
      } catch (e) {
        console.warn('Export barter card tickets error:' + e)
        this.$message.warning('导出提货券失败！')
      }
    }
  }
}
</script>

<style scoped>

</style>
