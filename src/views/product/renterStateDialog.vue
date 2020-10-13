<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="编辑商品租户状态"
    @open="skuInit"
  >
    <el-form ref="renterStateForm" :model="skuForm" :rules="formRules" label-width="160px">
      <el-form-item v-if="!isRenterAdmin" label="租户名称" prop="renterId">
        <el-select v-model="skuForm.renterId">
          <el-option
            v-for="item in renterOptions"
            :key="item.renterId"
            :value="item.renterId"
            :label="item.renterName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品SKU" prop="skuId">
        <el-select v-model="skuForm.skuId">
          <el-option
            v-for="item in skuOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品状态">
        <span>下架商品</span>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { platform_renter_id, role_renter_name } from '@/utils/constants'
import { mapGetters } from 'vuex'

export default {
  name: 'RenterStateDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    renterId: {
      type: String,
      default: ''
    },
    skuId: {
      type: String,
      default: ''
    },
    renterList: {
      type: Array,
      default: function () {
        return []
      }
    },
    skuList: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      skuForm: {
        renterId: '',
        skuId: '',
        state: 0
      },
      formRules: {
        renterId: [{
          required: true, validator: (rule, value, callback) => {
            if (!isEmpty(value)) {
              callback()
            } else {
              callback(new Error('请选择对应的租户'))
            }
          }, trigger: 'blur'
        }],
        skuId: [{
          required: true, validator: (rule, value, callback) => {
            if (!isEmpty(value)) {
              callback()
            } else {
              callback(new Error('请选择对应的商品'))
            }
          }, trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userRole: 'userRole'
    }),
    isRenterAdmin() {
      return this.userRole === role_renter_name
    },
    renterOptions() {
      return isEmpty(this.renterId)
        ? this.renterList.filter(item => item.renterId !== platform_renter_id)
        : this.renterList.filter(item => item.renterId === this.renterId)
    },
    skuOptions() {
      const skuList = this.skuList.map(item => ({ value: item.code, label: item.code }))
      return isEmpty(this.skuId) ? skuList : skuList.filter(item => item.value === this.skuId)
    }
  },
  methods: {
    skuInit() {
      this.skuForm.renterId = this.renterId
      this.skuForm.skuId = this.skuId
    },
    handleDialogCancel() {
      this.$refs.renterStateForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.renterStateForm.validate(valid => {
        if (valid) {
          this.$emit('confirmed', {
            renterId: this.skuForm.renterId,
            skuId: this.skuForm.skuId,
            state: this.skuForm.state
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
