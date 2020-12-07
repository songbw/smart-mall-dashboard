<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="编辑商品租户价格"
    @open="skuInit"
  >
    <el-form ref="renterPriceForm" :model="skuForm" :rules="formRules" label-width="160px">
      <el-form-item v-if="!isRenterAdminOrOp" label="租户名称" prop="renterId">
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
      <el-form-item label="销售价(元)" prop="price">
        <el-input-number
          v-model="skuForm.price"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
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
import { platform_renter_id, role_renter_name, role_renter_op_name } from '@/utils/constants'
import isNumber from 'lodash/isNumber'
import { mapGetters } from 'vuex'

export default {
  name: 'RenterPriceDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    renterPrice: {
      type: Number,
      default: 0
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
        price: 0
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
        }],
        price: [{
          required: true, validator: (rule, value, callback) => {
            if (isNumber(value) && value > 0) {
              callback()
            } else {
              callback(new Error('请输入销售价'))
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
    isRenterAdminOrOp() {
      return this.userRole === role_renter_name || this.userRole === role_renter_op_name
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
      this.skuForm.price = this.renterPrice > 0 ? this.renterPrice / 100 : 0
    },
    handleDialogCancel() {
      this.$refs.renterPriceForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      this.$refs.renterPriceForm.validate(valid => {
        if (valid) {
          const price = Math.round(this.skuForm.price * 100)
          this.$emit('confirmed', {
            renterId: this.skuForm.renterId,
            skuId: this.skuForm.skuId,
            price
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
