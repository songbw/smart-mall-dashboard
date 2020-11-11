<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="商品复制"
    top="5vh"
    width="60%"
    @opened="onDialogOpened"
  >
    <el-form ref="copyForm" :model="formData" :rules="formRules" label-width="160px">
      <el-form-item v-if="hasVendorPermission" label="供应商名" prop="merchantId">
        <vendor-selection
          :vendor-id="formData.merchantId"
          @changed="handleVendorChanged"
        />
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      element-loading-text="正在复制..."
      :data="parsedSkuList"
      border
      style="width: 100%;margin-top:20px;"
      height="350"
    >
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格(元)" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogSubmit">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import VendorSelection from '@/components/VendorSelection'
import { getProductsByMpuListApi } from '@/api/products'
import { ProductPermissions } from '@/utils/role-permissions'

const ProductFields = [
  'brand', 'category', 'image', 'model', 'name', 'weight',
  'upc', 'saleunit', 'price', 'sprice', 'imagesUrl', 'introductionUrl',
  'inventory', 'brandId', 'compareUrl', 'subTitle', 'comparePrice',
  'taxRate', 'floorPrice'
]

export default {
  name: 'CopyDialog',
  components: { VendorSelection },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    mpuIdList: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      loading: false,
      formRules: {
        merchantId: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value === null && this.hasVendorPermission) {
              callback(new Error('请选择商品供应商'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }]
      },
      formData: {
        merchantId: null
      },
      parsedSkuList: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      vendorId: 'vendorId'
    }),
    hasVendorPermission() {
      return this.userPermissions.includes(ProductPermissions.vendor)
    }
  },
  methods: {
    onDialogOpened() {
      this.formData.merchantId = null
      this.parsedSkuList = []
      this.parseProducts()
    },
    handleVendorChanged(value) {
      this.formData.merchantId = value
    },
    async parseProducts() {
      try {
        this.loading = true
        const mpuList = await this.getProductsByMpuList(this.mpuIdList)
        this.parsedSkuList = mpuList.map(item => {
          const sku = {}
          for (const field of ProductFields) {
            sku[field] = field in item ? item[field] : null
          }
          return sku
        })
      } catch (e) {
        console.warn('Query products for inventory error: ' + e)
      } finally {
        this.loading = false
      }
    },
    async getProductsByMpuList(fetchList) {
      let mpuList = []
      for (let begin = 0; begin < fetchList.length; begin += 50) {
        const params = {
          mpuIdList: fetchList.slice(begin, begin + 50).join(',')
        }
        try {
          const { code, data } = await getProductsByMpuListApi(params)
          if (code === 200 && data.result.length > 0) {
            mpuList = mpuList.concat(data.result)
          }
        } catch (err) {
          console.warn('Coupon Goods: search error:' + err)
        }
      }
      return mpuList
    },
    handleDialogCancel() {
      this.formData.merchantId = null
      this.parsedSkuList = []
      this.$refs.copyForm.clearValidate()
      this.$emit('cancelled')
    },
    handleDialogSubmit() {
      this.$refs.copyForm.validate(valid => {
        if (valid) {
          const skuList = this.parsedSkuList.map(item => ({
            skuid: '',
            merchantId: this.formData.merchantId,
            ...item
          }))
          this.$emit('confirmed', skuList)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
