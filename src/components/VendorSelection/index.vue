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
import { getVendorListApi, getVendorProfileByIdApi } from '@/api/vendor'
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
    const id = Number.parseInt(this.vendorId)
    if (!Number.isNaN(id) && this.vendorOptions.length === 0) {
      this.initVendorOptions(id)
    }
  },
  methods: {
    async initVendorOptions(id) {
      const label = await this.getVendorName(id)
      if (label !== null) {
        this.vendorOptions = [{
          value: id.toString(),
          label
        }]
      }
    },
    async getVendorName(id) {
      try {
        const { code, data } = await getVendorProfileByIdApi({ id })
        if (code === 200) {
          return data.name
        }
      } catch (e) {
        console.warn('Vendor selection error:' + e)
      }
      return null
    },
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
