<template>
  <el-select
    filterable
    clearable
    placeholder="请输入供应商关键字"
    :loading="dataLoading"
    :value="vendorId"
    @change="handleVendorChanged"
  >
    <el-option
      v-for="item in vendorOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
      <span>{{ item.label }}</span>
    </el-option>
  </el-select>
</template>

<script>
import { getVendorListApi } from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'

export default {
  name: 'VendorSelection',
  props: {
    vendorId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataLoading: false,
      vendorOptions: []
    }
  },
  created() {
    this.prepareVendorData()
  },
  methods: {
    async prepareVendorData() {
      await this.getAllVendors()
    },
    async getAllVendors() {
      try {
        this.dataLoading = true
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        const data = await getVendorListApi(params)
        this.vendorOptions = data.rows.map(item => ({
          value: item.company.id.toString(),
          label: item.company.name
        }))
      } catch (e) {
        console.warn(`Vendor Selection: ${e}`)
      } finally {
        this.dataLoading = false
      }
    },
    handleVendorChanged(id) {
      const find = this.vendorOptions.find(item => item.value === id)
      this.$emit('changed', id, find ? find.label : '')
    }
  }
}
</script>

<style scoped>

</style>
