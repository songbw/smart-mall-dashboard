<template>
  <el-select
    filterable
    clearable
    placeholder="请输入名称关键字"
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
import { getCompanyListOfRenterApi, getRenterListApi } from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'
import { mapGetters } from 'vuex'
import { RenterPermissions } from '@/utils/role-permissions'

export default {
  name: 'VendorSelection',
  props: {
    vendorId: {
      type: String,
      default: ''
    },
    companyType: {
      type: String,
      default: 'vendor'
    }
  },
  data() {
    return {
      dataLoading: false,
      vendorOptions: []
    }
  },
  computed: {
    ...mapGetters({
      renterId: 'renterId',
      userPermissions: 'userPermissions'
    }),
    hasRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    }
  },
  created() {
    this.prepareVendorData()
  },
  methods: {
    async prepareVendorData() {
      if (this.companyType === 'vendor') {
        await this.getAllVendors()
      } else {
        await this.getAllRenters()
      }
    },
    async getAllVendors() {
      try {
        this.dataLoading = true
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        if (!this.hasRenterPermission) {
          params.renterId = this.renterId
        }
        const { code, data } = await getCompanyListOfRenterApi(params)
        if (code === 200) {
          this.vendorOptions = data.rows.map(item => ({
            value: item.companyId.toString(),
            label: item.companyName
          }))
        }
      } catch (e) {
        console.warn(`Vendor Selection: ${e}`)
      } finally {
        this.dataLoading = false
      }
    },
    async getAllRenters() {
      try {
        this.dataLoading = true
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        const { code, data } = await getRenterListApi(params)
        if (code === 200) {
          this.vendorOptions = data.rows.map(item => ({
            value: item.companyId.toString(),
            label: item.renterName,
            renterId: item.renterId
          }))
        }
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
