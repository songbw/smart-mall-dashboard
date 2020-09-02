<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="租户信息"
    width="60%"
    center
  >
    <el-form label-position="right" label-width="100px">
      <el-form-item v-if="company && company.status === statusRejected" label="审核意见">
        <el-input :value="company.comments" type="textarea" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="商户名称">
        <el-input :value="company && company.companyName" readonly class="item-input" />
      </el-form-item>
      <el-form-item label="所属租户">
        <el-table :data="orderedRenterList" border max-height="480px" style="width: 100%;">
          <el-table-column label="租户名称" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.renterName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="120">
            <template slot-scope="scope">
              <el-tag :type="isRenterAdded(scope.row.renterId) ? 'success' : 'danger'">
                {{ isRenterAdded(scope.row.renterId) ? '已添加' : '未添加' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template slot-scope="scope">
              <el-button
                v-if="!isRenterAdded(scope.row.renterId)"
                :disabled="!isPlatformCompany"
                type="warning"
                size="mini"
                @click="onAddClicked(scope.row)"
              >
                添加
              </el-button>
              <el-button
                v-if="isRenterAdded(scope.row.renterId)"
                :disabled="!isPlatformCompany || scope.row.renterId === platformRenterId"
                type="danger"
                size="mini"
                @click="onDelClicked(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { platform_renter_id, vendor_status_rejected } from '@/utils/constants'

export default {
  name: 'VendorRenter',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    company: {
      type: Object,
      default() {
        return {
          companyName: '',
          companyId: -1,
          renterList: []
        }
      }
    },
    renterList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      platformRenterId: platform_renter_id,
      statusRejected: vendor_status_rejected
    }
  },
  computed: {
    orderedRenterList() {
      const addedList = this.company && this.company.renterList ? this.company.renterList : []
      if (this.isPlatformCompany) {
        const idList = addedList.map(item => item.renterId)
        return [...addedList, ...this.renterList.filter(item => !idList.includes(item.renterId))]
      } else {
        return addedList
      }
    },
    isPlatformCompany() {
      const renterList = this.company && this.company.renterList ? this.company.renterList : []
      return renterList.findIndex(item => item.renterId === platform_renter_id) >= 0
    }
  },
  methods: {
    isRenterAdded(renterId) {
      if (this.company && this.company.renterList && this.company.renterList.length > 0) {
        return this.company.renterList.findIndex(item => item.renterId === renterId) >= 0
      } else {
        return false
      }
    },
    onDelClicked(renter) {
      this.$emit('onConfirmed', {
        type: 'del',
        companyId: this.company.companyId,
        companyName: this.company.companyName,
        renterName: renter.renterName,
        renterId: renter.renterId
      })
    },
    onAddClicked(renter) {
      this.$emit('onConfirmed', {
        type: 'add',
        companyId: this.company.companyId,
        companyName: this.company.companyName,
        renterName: renter.renterName,
        renterId: renter.renterId
      })
    },
    handleDialogConfirm() {
      this.$emit('onConfirmed')
    }
  }
}
</script>

<style lang="scss" scoped>
.item-input {
  width: 70%;
}
</style>
