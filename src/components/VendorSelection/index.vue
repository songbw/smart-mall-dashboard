<template>
  <el-select
    filterable
    remote
    clearable
    placeholder="请输入供应商关键字"
    :loading="dataLoading"
    :value="vendorId"
    :remote-method="handleFilterVendor"
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
import isEmpty from 'lodash/isEmpty'
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
  methods: {
    async handleFilterVendor(word) {
      if (isEmpty(word)) {
        this.vendorOptions = []
      } else {
        try {
          this.dataLoading = true
          const params = {
            page: 1,
            limit: 50,
            status: vendor_status_approved,
            name: word
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
      }
    },
    handleVendorChanged(id) {
      this.$emit('changed', id)
    }
  }
}
</script>

<style scoped>

</style>
