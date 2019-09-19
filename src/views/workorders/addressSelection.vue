<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    title="选择退货地址"
    width="60%"
  >
    <el-table
      v-loading="listLoading"
      :data="addressList"
      border
      fit
      style="width: 100%; margin-top: 20px"
      highlight-current-row
      @current-change="handleSingleSelectionChange"
    >
      <el-table-column label="已选" align="center" width="55">
        <template slot-scope="scope">
          <el-checkbox :value="dialogSelectedItem && dialogSelectedItem.id === scope.row.id" />
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系地址" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.provinceName + ' ' + scope.row.cityName + ' ' + scope.row.countyName }}</div>
          <div>{{ scope.row.address }}</div>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'AddressSelection',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    listLoading: {
      type: Boolean,
      default: false
    },
    addressList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      dialogSelectedItem: null
    }
  },
  methods: {
    handleSingleSelectionChange(row) {
      this.dialogSelectedItem = row
    },
    handleDialogCancel() {
      this.$emit('onCancelled')
      this.dialogSelectedItem = null
    },
    handleDialogConfirm() {
      this.$emit('onConfirmed', { ...this.dialogSelectedItem })
      this.dialogSelectedItem = null
    }
  }
}
</script>

<style scoped>

</style>
