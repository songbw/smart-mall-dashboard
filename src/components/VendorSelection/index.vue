<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择供应商"
  >
    <el-table
      ref="dialogSkuTable"
      v-loading="vendorLoading"
      :data="vendorData"
      style="width: 100%"
      height="250"
      border
      highlight-current-row
      @current-change="handleSelectionChange"
    >
      <el-table-column label="已选" align="center" width="55">
        <template slot-scope="scope">
          <el-checkbox :value="selectedItem !== null && selectedItem.id === scope.row.id" />
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      layout="total, prev, pager, next"
      :auto-scroll="false"
      :total="vendorList.length"
      :page.sync="pageNo"
      :limit.sync="pageSize"
    />
    <div slot="footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'VendorSelection',
  components: { Pagination },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    vendorLoading: {
      type: Boolean,
      default: false
    },
    vendorList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 10,
      selectedItem: null
    }
  },
  computed: {
    vendorData: {
      get() {
        if (this.vendorList.length > 0) {
          const begin = (this.pageNo > 1 ? (this.pageNo - 1) : 0) * this.pageSize
          const end = begin + this.pageSize
          return this.vendorList.slice(begin, end)
        } else {
          return []
        }
      }
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedItem = val
    },
    handleCancel() {
      this.$emit('cancelled')
    },
    handleConfirm() {
      if (this.selectedItem) {
        this.$emit('confirmed', this.selectedItem)
      } else {
        this.$message.warning('请选择一个供应商！')
      }
    }
  }
}
</script>

<style scoped>

</style>
