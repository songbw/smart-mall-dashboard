<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="选择运费模板"
    @opened="getShippingPriceList"
    @closed="onDialogClosed"
  >
    <el-table
      v-loading="dataLoading"
      :data="shippingPriceList"
      style="width: 100%"
      height="250"
      border
      highlight-current-row
      @current-change="handleSelectionChange"
    >
      <el-table-column label="已选" align="center" width="55">
        <template slot-scope="scope">
          <el-checkbox :value="selectedItem != null && selectedItem.id === scope.row.id" />
        </template>
      </el-table-column>
      <el-table-column label="模板编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="shippingPriceTotal > pageSize"
      :total="shippingPriceTotal"
      :page.sync="pageNo"
      :limit.sync="pageSize"
      @pagination="getShippingPriceList"
    />
    <div slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getShippingPriceListApi } from '@/api/freight'
import Pagination from '@/components/Pagination'

export default {
  name: 'ShippingPriceSelection',
  components: { Pagination },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 10,
      dataLoading: false,
      shippingPriceTotal: 0,
      shippingPriceList: [],
      selectedItem: null
    }
  },
  methods: {
    async getShippingPriceList() {
      try {
        this.dataLoading = true
        const params = { pageNo: this.pageNo, pageSize: this.pageSize }
        const { data } = await getShippingPriceListApi(params)
        if (data && data.result) {
          const res = data.result
          if (Array.isArray(res.list)) {
            this.shippingPriceList = res.list
          }
          if (res.pageInfo) {
            this.shippingPriceTotal = res.pageInfo.totalCount
          }
        }
      } catch (e) {
        console.warn('Get free shipping list error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onDialogClosed() {
      this.pageNo = 1
      this.shippingPriceTotal = 0
      this.shippingPriceList = []
    },
    handleDialogCancel() {
      this.$emit('onCancelled')
    },
    handleDialogConfirm() {
      if (this.selectedItem) {
        this.$emit('onConfirmed', this.selectedItem)
      } else {
        this.$message.warning('请选择对应的运费模板！')
      }
    },
    handleSelectionChange(val) {
      this.selectedItem = val
    }
  }
}
</script>

<style scoped>

</style>
