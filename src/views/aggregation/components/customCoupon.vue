<template>
  <div style="width: 100%">
    <div class="show-border">
      <el-form label-width="120px">
        <el-form-item label="开启头部">
          <el-switch v-model="showTitle" />
          <el-form v-if="showTitle" label-position="right" label-width="160px">
            <el-form-item
              label="活动图片"
            >
              <image-upload
                :image-url="titleImageUrl"
                path-name="aggregations"
                image-width="200px"
                tip="请选择对应的类别图标文件，文件格式为JPEG或PNG"
                @success="handleUploadImageSuccess"
              />
            </el-form-item>
            <el-form-item
              label="图片链接地址"
            >
              <image-target-link
                :target-index="currentTemplateIndex"
                :target-type="titleTargetType"
                :target-url="titleTargetUrl"
                :target-name="titleTargetName"
                :app-id="pageAppId"
                @targetChanges="handleImageTargetChanges"
              />
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item label="下边距">
          <el-select :value="marginBottom" @change="val => marginBottom = val">
            <el-option label="0px" value="0" />
            <el-option label="10px" value="10" />
            <el-option label="20px" value="20" />
            <el-option label="30px" value="30" />
            <el-option label="40px" value="40" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button
          type="primary"
          size="mini"
          @click="dialogSelectionVisible = true"
        >
          添加优惠券
        </el-button>
      </div>
      <div class="header-ops-container">
        <span>{{ `已选择${selectedItems.length}件商品` }}</span>
        <el-button
          :disabled="selectedItems.length === 0"
          type="text"
          style="margin-left: 10px"
          @click="handleDeleteSelection"
        >
          删除
        </el-button>
      </div>
    </div>
    <el-table
      ref="couponTable"
      :data="couponList"
      style="width: 100%"
      max-height="450"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <el-link :href="'/coupons/detail/' + scope.row.id" target="_blank" type="primary">
            {{ scope.row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | couponStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上线时间" align="center" width="160">
        <template slot-scope="scope">
          <div>开始：{{ scope.row.releaseStartDate | dateFilter }}</div>
          <div>结束：{{ scope.row.releaseEndDate | dateFilter }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-tooltip :open-delay="1000" content="上移" placement="top">
            <el-button
              icon="el-icon-caret-top"
              type="primary"
              size="mini"
              circle
              @click="handleSortRow(true, scope.$index)"
            />
          </el-tooltip>
          <el-tooltip :open-delay="1000" content="下移" placement="top">
            <el-button
              icon="el-icon-caret-bottom"
              type="primary"
              size="mini"
              circle
              @click="handleSortRow(false, scope.$index)"
            />
          </el-tooltip>
          <el-tooltip :open-delay="1000" content="置顶" placement="top">
            <el-button
              icon="el-icon-top"
              type="primary"
              size="mini"
              circle
              @click="handleSortTop(scope.$index)"
            />
          </el-tooltip>
          <el-tooltip :open-delay="1000" content="删除" placement="top">
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              circle
              @click="handleDeleteRow(scope.$index)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <coupon-selection
      :app-id="pageAppId"
      :dialog-visible="dialogSelectionVisible"
      @onSelectionCancelled="onSelectionCancelled"
      @onSelectionConfirmed="onSelectionConfirmed"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import ImageUpload from '@/components/ImageUpload'
import ImageTargetLink from './imageTargetLink'
import CouponSelection from './couponSelection'
import { couponType, couponSettings } from './templateType'
import {
  coupon_status_ready_for_sale,
  coupon_status_on_sale,
  coupon_status_off_shelves,
  CouponStatusDefinition
} from '@/utils/constants'

export default {
  name: 'CustomCoupon',
  components: { ImageUpload, ImageTargetLink, CouponSelection },
  filters: {
    couponStatusFilter: (status) => {
      const item = CouponStatusDefinition.find(coupon => coupon.value === status)
      return item ? item.label : ''
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  data() {
    return {
      selectedItems: [],
      dialogSelectionVisible: false
    }
  },
  computed: {
    ...mapGetters({
      pageInfo: 'currentAggregation',
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    pageAppId() {
      return this.pageInfo.appId
    },
    couponData: function() {
      if (this.pageTemplateList[this.currentTemplateIndex].type === couponType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...couponSettings }
        }
      }
    },
    couponList: {
      get() {
        return this.couponData.list.map(coupon => {
          const { releaseStartDate, releaseEndDate, status, ...rest } = coupon
          const now = moment()
          let newStatus = status
          if (now.isBefore(releaseStartDate)) {
            newStatus = coupon_status_ready_for_sale
          } else if (now.isBetween(releaseStartDate, releaseEndDate)) {
            newStatus = coupon_status_on_sale
          } else if (now.isAfter(releaseEndDate)) {
            newStatus = coupon_status_off_shelves
          }
          return { releaseStartDate, releaseEndDate, status: newStatus, ...rest }
        })
      }
    },
    showTitle: {
      get() {
        return this.couponData.settings.title.show
      },
      set(newValue) {
        const title = Object.assign({}, this.couponData.settings.title, { show: newValue })
        this.changeTitle(title)
      }
    },
    titleImageUrl: {
      get() {
        return this.couponData.settings.title.imageUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.couponData.settings.title, { imageUrl: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetType: {
      get() {
        return this.couponData.settings.title.targetType
      },
      set(newValue) {
        const title = Object.assign({}, this.couponData.settings.title, { targetType: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetUrl: {
      get() {
        return this.couponData.settings.title.targetUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.couponData.settings.title, { targetUrl: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetName: {
      get() {
        return this.couponData.settings.title.targetName
      },
      set(newValue) {
        const title = Object.assign({}, this.couponData.settings.title, { targetName: newValue })
        this.changeTitle(title)
      }
    },
    marginBottom: {
      get() {
        return this.couponData.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.couponData.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    }
  },
  methods: {
    changeTitle(title) {
      const settings = Object.assign({}, this.couponData.settings, { title: title })
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    handleUploadImageSuccess(url) {
      this.titleImageUrl = url
    },
    handleImageTargetChanges(target) {
      if ('type' in target) {
        this.titleTargetType = target.type
      }
      if ('name' in target) {
        this.titleTargetName = target.name
      }
      if ('url' in target) {
        this.titleTargetUrl = target.url
      }
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selectedItems = val.map(item => item.id)
      } else {
        this.selectedItems = []
      }
    },
    async handleDeleteSelection() {
      if (this.selectedItems.length > 0) {
        try {
          await this.$confirm('是否要删除所选优惠券？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          const coupons = this.couponList.filter(coupon => !this.selectedItems.includes(coupon.id))
          this.$store.commit('aggregations/SET_COUPON_LIST', coupons)
          this.$refs.couponTable.clearSelection()
        } catch (e) {
          console.warn('Aggregation delete coupon selection error: ' + e)
        }
      }
    },
    async handleDeleteRow(index) {
      try {
        await this.$confirm('是否要删除此优惠券？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete coupon error: ' + e)
      }
    },
    handleSortRow(up, index) {
      if ((up && index > 0) || (!up && index < (this.couponList.length - 1))) {
        this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: up, index: index })
      }
    },
    handleSortTop(index) {
      if (index > 0) {
        this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: true, index: index, distance: index })
      }
    },
    onSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onSelectionConfirmed(selection) {
      this.dialogSelectionVisible = false
      const filtered = selection.filter(item => this.couponList.findIndex(coupon => coupon.id === item.id) < 0)
      if (filtered.length > 0) {
        this.$store.commit('aggregations/SET_COUPON_LIST', this.couponData.list.concat(filtered))
      }
    }
  }
}
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    margin: 10px 20px;
  }

  .header-ops-container {
    display: flex;
    align-items: center;
  }
</style>
