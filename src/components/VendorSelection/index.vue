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
import { mapGetters } from 'vuex'
import { RenterPermissions } from '@/utils/role-permissions'
import isEmpty from 'lodash/isEmpty'
import { platform_renter_id, role_renter_name } from '@/utils/constants'

export default {
  name: 'VendorSelection',
  props: {
    vendorId: {
      type: String,
      default: ''
    },
    filterRenter: {
      type: String,
      default: ''
    },
    companyType: {
      type: String,
      default: 'vendor'
    },
    ownVendor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataLoading: false
    }
  },
  computed: {
    ...mapGetters({
      renterId: 'renterId',
      userPermissions: 'userPermissions',
      renterList: 'renterList',
      vendorList: 'vendorList',
      userRole: 'userRole'
    }),
    hasRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    },
    isRenterAdmin() {
      return this.userRole === role_renter_name
    },
    vendorOptions() {
      if (this.companyType === 'renter') {
        return this.renterList.map(item => ({
          value: item.companyId.toString(),
          label: item.renterName,
          renterId: item.renterId
        }))
      } else {
        const vendorList = this.vendorList.map(item => ({
          value: item.companyId.toString(),
          label: item.companyName,
          renterIdList: item.renterIdList
        }))
        if (this.ownVendor && this.isRenterAdmin) {
          return vendorList.filter(
            item => item.renterIdList.includes(this.renterId) && !item.renterIdList.includes(platform_renter_id)
          )
        } else {
          return isEmpty(this.filterRenter)
            ? vendorList
            : vendorList.filter(item => item.renterIdList.includes(this.filterRenter))
        }
      }
    }
  },
  created() {
    this.prepareVendorData()
  },
  methods: {
    async prepareVendorData() {
      this.dataLoading = true
      if (this.companyType === 'vendor') {
        await this.$store.dispatch('app/getVendorList')
      } else {
        await this.$store.dispatch('app/getRenterList')
      }
      this.dataLoading = false
    },
    handleVendorChanged(id) {
      const find = this.vendorOptions.find(item => item.value === id)
      this.$emit('changed', id, find ? find.label : '', find ? find.renterId : '')
    }
  }
}
</script>

<style scoped>

</style>
