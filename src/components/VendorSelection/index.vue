<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择供应商"
    @opened="onOpened"
  >
    <el-table
      ref="dialogSkuTable"
      v-loading="vendorLoading"
      :data="vendorData"
      style="width: 100%"
      height="500"
      border
    >
      <el-table-column label="已选" align="center" width="55">
        <template slot-scope="scope">
          <el-checkbox :value="isRowSelected(scope.row)" @change="value => handleSelectionChanged(value, scope.row)" />
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
    },
    singleSelection: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 10,
      selectedItems: []
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
    onOpened() {
      this.selectedItems = []
      this.pageNo = 1
    },
    isRowSelected(row) {
      const index = this.selectedItems.findIndex(item => item.id === row.id)
      return index >= 0
    },
    handleSelectionChanged(value, row) {
      if (this.singleSelection) this.selectedItems = []
      if (value) {
        this.selectedItems.push(row)
      } else {
        this.selectedItems = this.selectedItems.filter(item => item.id !== row.id)
      }
    },
    handleCancel() {
      this.$emit('cancelled')
    },
    handleConfirm() {
      if (this.selectedItems.length > 0) {
        this.$emit('confirmed', this.selectedItems)
      } else {
        this.$message.warning('请选择所需供应商！')
      }
    }
  }
}
</script>

<style scoped>

</style>
