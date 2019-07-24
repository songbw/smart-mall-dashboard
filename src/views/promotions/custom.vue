<template>
  <el-form
    v-loading="loadingData"
    label-position="right"
    label-width="120px"
    status-icon
  >
    <el-form-item label="活动名称" required>
      <el-input v-model="promotionName" maxlength="20" placeholder="请输入活动名称" />
    </el-form-item>
    <el-form-item label="活动标签" required>
      <el-select :value="promotionTagValue" @change="value => promotionTagValue = value">
        <el-option
          v-for="item in promotionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="开始时间" required>
      <el-date-picker
        v-model="promotionStartDate"
        placeholder="选择开始时间"
        type="datetime"
        default-time="00:00:00"
        value-format="yyyy-MM-dd HH:mm:ss"
      />
    </el-form-item>
    <el-form-item label="结束时间" required>
      <el-date-picker
        v-model="promotionEndDate"
        placeholder="选择结束时间"
        type="datetime"
        default-time="23:59:59"
        value-format="yyyy-MM-dd HH:mm:ss"
      />
    </el-form-item>
    <el-form-item>
      <el-button @click="$emit('cancelCreation')">取消</el-button>
      <el-button type="primary" @click="savePromotion">{{ saveButtonLabel }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CustomPromotion',
  data() {
    return {
      promotionOptions: [{
        value: 0,
        label: '当季新品'
      }, {
        value: 1,
        label: '新品特价'
      }, {
        value: 2,
        label: '爆款推荐'
      }, {
        value: 3,
        label: '人气热卖'
      }, {
        value: 4,
        label: '限时特价'
      }, {
        value: 5,
        label: '超值优惠'
      }, {
        value: 6,
        label: '惊喜价'
      }, {
        value: 7,
        label: '冰点价'
      }, {
        value: 8,
        label: '限时抢'
      }],
      loadingData: false,
      originalName: null,
      originalTag: null,
      originalStartDate: null,
      originalEndDate: null
    }
  },
  computed: {
    ...mapGetters({
      promotionData: 'currentPromotion'
    }),
    saveButtonLabel() {
      if (this.promotionData && this.promotionData.id >= 0) {
        return '更新并修改商品'
      } else {
        return '创建并选择商品'
      }
    },
    promotionName: {
      get() {
        return this.promotionData ? this.promotionData.name : ''
      },
      set(value) {
        if (this.originalName === null) {
          this.originalName = this.promotionData.name
        }
        this.$store.commit('promotions/SET_DATA', { name: value })
      }
    },
    promotionTagValue: {
      get() {
        if (this.promotionData) {
          for (const tag of this.promotionOptions) {
            if (tag.label === this.promotionData.tag) {
              return tag.value
            }
          }
        }
        return null
      },
      set(value) {
        if (this.promotionData) {
          if (this.originalTag === null) {
            this.originalTag = this.promotionData.tag
          }
          for (const tag of this.promotionOptions) {
            if (tag.value === value) {
              this.$store.commit('promotions/SET_DATA', { tag: tag.label })
              break
            }
          }
        }
      }
    },
    promotionStartDate: {
      get() {
        return this.promotionData ? this.promotionData.startDate : ''
      },
      set(value) {
        if (this.originalStartDate === null) {
          this.originalStartDate = this.promotionData.startDate
        }
        this.$store.commit('promotions/SET_DATA', { startDate: value })
      }
    },
    promotionEndDate: {
      get() {
        return this.promotionData ? this.promotionData.endDate : ''
      },
      set(value) {
        if (this.originalEndDate === null) {
          this.originalEndDate = this.promotionData.endDate
        }
        this.$store.commit('promotions/SET_DATA', { endDate: value })
      }
    }
  },
  methods: {
    checkFormValidation() {
      if (this.promotionName === null || this.promotionName.trim().length === 0) {
        this.$message({ message: '请输入有效的活动名称！', type: 'error' })
        return -1
      }
      if (this.promotionTagValue === null) {
        this.$message({ message: '请选择有效的活动标签！', type: 'error' })
        return -1
      }
      if (this.promotionStartDate === null || this.promotionStartDate.trim().length === 0) {
        this.$message({ message: '请选择有效的开始时间！', type: 'error' })
        return -1
      }
      const startDate = Date.parse(this.promotionStartDate)
      const now = Date.now()
      if (now > startDate) {
        this.$message({ message: '开始时间必须晚于当前时间！', type: 'error' })
        return -1
      }
      if (this.promotionEndDate === null || this.promotionEndDate.trim().length === 0) {
        this.$message({ message: '请选择有效的结束时间！', type: 'error' })
        return -1
      }
      const endDate = Date.parse(this.promotionEndDate)
      if (endDate <= startDate) {
        this.$message({ message: '请选择有效的结束时间！结束时间必须晚于开始时间！', type: 'error' })
        return -1
      }
      return 0
    },
    handleSetPromotionType(id) {
      const params = {
        id,
        promotionType: 0
      }
      this.$store.dispatch('promotions/update', params).then(() => {
        this.$emit('onPromotionCreated')
      }).catch(err => {
        console.warn('updatePromotion:' + err)
      })
    },
    handleCreatePromotion() {
      const params = {
        name: this.promotionName,
        tag: this.promotionData.tag,
        startDate: this.promotionStartDate,
        endDate: this.promotionEndDate,
        status: 1
      }
      this.$store.dispatch('promotions/create', params).then((id) => {
        this.handleSetPromotionType(id)
      }).catch(err => {
        console.warn('createPromotion:' + err)
      })
    },
    handleUpdatePromotion() {
      let changed = false
      const params = { id: this.promotionData.id }
      if (this.originalName && this.promotionName !== this.originalName) {
        params.name = this.promotionName
        changed = true
      }
      if (this.originalTag && this.promotionData.tag !== this.originalTag) {
        params.tag = this.promotionData.tag
        changed = true
      }
      if (this.originalStartDate && this.promotionStartDate !== this.originalStartDate) {
        params.startDate = this.promotionStartDate
        changed = true
      }
      if (this.originalEndDate && this.promotionEndDate !== this.originalEndDate) {
        params.endDate = this.promotionEndDate
        changed = true
      }
      if (changed) {
        this.$store.dispatch('promotions/update', params).then(() => {
          this.$emit('onPromotionCreated')
        }).catch(err => {
          console.warn('updatePromotion:' + err)
        })
      } else {
        this.$emit('onPromotionCreated')
      }
    },
    savePromotion() {
      const ret = this.checkFormValidation()
      if (ret >= 0) {
        if (this.promotionData.id >= 0) {
          this.handleUpdatePromotion()
        } else {
          this.handleCreatePromotion()
        }
      }
    }
  }
}
</script>

