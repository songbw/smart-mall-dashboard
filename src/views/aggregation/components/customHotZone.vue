<template>
  <div class="components-container">
    <el-form label-width="8rem">
      <el-form-item label="两边预留空白">
        <el-switch v-model="hotZoneHasMargin" />
      </el-form-item>
    </el-form>
    <hotzone
      v-if="hotZoneImage"
      ref="imageHotZone"
      :image="hotZoneImage"
      :zones-init="hotZonesInit"
      @add="onZoneAdded"
      @change="onZoneChanged"
      @remove="onZoneRemoved"
    />
    <div v-else>
      请先上传热区图片，然后通过鼠标选择需要设置的区域，再选择对应区域的链接地址。
    </div>
    <el-divider />
    <image-upload
      path-name="aggregations"
      image-width="150px"
      tip="建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片"
      @success="handleUploadImageSuccess"
    />
    <el-divider />
    <div v-for="(zone, index) in hotZoneList" :key="'zone-' + index" style="margin-bottom: 20px">
      <span>
        {{ `热区 ${index + 1}` }}
      </span>
      <image-target-link
        :target-index="index"
        :target-type="zone.targetType"
        :target-url="zone.targetUrl"
        :target-name="zone.targetName"
        @targetChanges="handleImageTargetChanges"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import hotzone from 'vue-hotzone'
import ImageUpload from '@/components/ImageUpload'
import { hotZoneType, hotZoneSettings } from './templateType'
import ImageTargetLink from './imageTargetLink'

const generate = require('nanoid/generate')

export default {
  name: 'CustomHotZone',
  components: { hotzone, ImageTargetLink, ImageUpload },
  data() {
    return {
      uploadData: {
        pathName: 'aggregations'
      },
      uploadingImage: false,
      uploadImageFileList: null,
      componentMounted: false
    }
  },
  computed: {
    ...mapGetters({
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    hotZoneInfo: {
      get() {
        if (this.pageTemplateList[this.currentTemplateIndex].type === hotZoneType) {
          return this.pageTemplateList[this.currentTemplateIndex].data
        } else {
          return {
            list: [],
            settings: { ...hotZoneSettings }
          }
        }
      }
    },
    hotZoneHasMargin: {
      get() {
        return 'hasMargin' in this.hotZoneInfo.settings ? this.hotZoneInfo.settings.hasMargin : true
      },
      set(value) {
        const settings = { ...this.hotZoneInfo.settings, ...{ hasMargin: value }}
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    hotZoneImage: {
      get() {
        return this.hotZoneInfo.settings.imageUrl
      }
    },
    hotZonesInit: {
      get() {
        return this.hotZoneInfo.list.map(zone => Object.assign({}, zone.area))
      }
    },
    hotZoneList: {
      get() {
        return this.hotZoneInfo.list
      }
    }
  },
  mounted() {
    this.componentMounted = true
  },
  beforeDestroy() {
    this.componentMounted = false
  },
  methods: {
    onZoneAdded(zone) {
      const value = {
        area: { ...zone },
        targetType: 'blank',
        targetUrl: '',
        targetName: ''
      }
      const params = {
        index: -1,
        value
      }
      this.$store.commit('aggregations/SET_LIST_IN_CONTENT', params)
    },
    onZoneChanged(zones) {
      for (let index = 0; index < zones.length && index < this.hotZoneList.length; index++) {
        const { targetType, targetUrl, targetName } = this.hotZoneList[index]
        const value = { area: { ...zones[index] }, targetType, targetUrl, targetName }
        const params = {
          index,
          value
        }
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT', params)
      }
    },
    onZoneRemoved(index) {
      this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
    },
    handleUploadImageSuccess(imageUrl) {
      const noLookalikes = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      const imageKey = generate(noLookalikes, 21)
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', { imageUrl, imageKey })
    },
    handleImageTargetChanges(target) {
      const index = target.index
      if (index < this.hotZoneList.length) {
        const zone = this.hotZoneList[index]
        let targetType = zone.targetType
        if ('type' in target) {
          targetType = target.type
        }
        let targetName = zone.targetName
        if ('name' in target) {
          targetName = target.name
        }
        let targetUrl = zone.targetUrl
        if ('url' in target) {
          targetUrl = target.url
        }
        const value = { area: { ...zone.area }, targetType, targetUrl, targetName }
        const params = {
          index,
          value
        }
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT', params)
      }
    }
  }
}
</script>

<style scoped>

</style>
