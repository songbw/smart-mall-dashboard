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
import {
  getShippingPriceListApi,
  getMpuShippingPriceApi,
  setMpuShippingPriceApi,
  updateMpuShippingPriceApi
} from '@/api/freight'
import Pagination from '@/components/Pagination'

export default {
  name: 'ShippingPriceSelection',
  components: { Pagination },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    mpuList: {
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
    async getMpuShippingPrice(mpu) {
      let id = null
      try {
        const { code, data } = await getMpuShippingPriceApi({ mpu })
        if (code === 200 && Array.isArray(data.result)) {
          if (data.result.length > 0) {
            const shipMpus = data.result.filter(item => item.shipMpuId !== null)
            const shippingPriceData = shipMpus.length > 0 ? shipMpus[0] : null
            id = shippingPriceData ? shippingPriceData.shipMpuId : null
          }
        }
      } catch (e) {
        console.warn('Product get mpu shipping price error:' + e)
      }
      return id
    },
    async setMpuShippingPrice(mpu, template) {
      let id = null
      try {
        const { code, data } = await setMpuShippingPriceApi({ mpu, templateId: template.id })
        if (code === 200) {
          id = data.id
        }
      } catch (e) {
        console.warn('Product set shipping price error:' + e)
      }
      return id
    },
    async updateMpuShippingPrice(id, mpu, template) {
      let sucId = null
      try {
        const { code } = await updateMpuShippingPriceApi({ id, mpu, templateId: template.id })
        if (code === 200) {
          sucId = id
        }
      } catch (e) {
        console.warn('Product set shipping price error:' + e)
      }
      return sucId
    },
    async handleSetMpuListTemplate() {
      this.dataLoading = true
      const mpuShipList = []
      for (const mpu of this.mpuList) {
        const shipMpuId = await this.getMpuShippingPrice(mpu)
        let id = null
        if (shipMpuId !== null) {
          id = await this.updateMpuShippingPrice(shipMpuId, mpu, this.selectedItem)
        } else {
          id = await this.setMpuShippingPrice(mpu, this.selectedItem)
        }
        if (id !== null) mpuShipList.push(id)
      }
      this.dataLoading = false
      this.$emit('onConfirmed', this.mpuList.length === mpuShipList.length)
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
      this.handleSetMpuListTemplate()
    },
    handleSelectionChange(val) {
      this.selectedItem = val
    }
  }
}
</script>

<style scoped>

</style>
