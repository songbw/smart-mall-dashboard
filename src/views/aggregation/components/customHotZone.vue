<template>
  <div class="components-container">
    <el-form label-width="8rem">
      <el-form-item label="两边是否预留空白">
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
    <el-upload
      ref="upload"
      :action="uploadUrl"
      :data="uploadData"
      :auto-upload="false"
      :limit="1"
      :before-upload="handleBeforeUploadImage"
      :on-success="handleUploadImageSuccess"
      :on-error="handleUploadImageError"
      :on-progress="handleUploadImageProgress"
      :on-change="handleUploadImageChanged"
      accept="image/png, image/jpeg, image/jpg"
      list-type="picture"
      name="file"
    >
      <el-button slot="trigger" size="small" type="primary">选择图片</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传图片</el-button>
      <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
    </el-upload>
    <el-progress
      :text-inside="true"
      :stroke-width="18"
      :percentage="imageUploadPercent"
      status="success"
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
import { hotZoneType, hotZoneSettings } from './templateType'
import ImageTargetLink from './imageTargetLink'
import { app_upload_url } from '@/utils/constants'

const generate = require('nanoid/generate')

export default {
  name: 'CustomHotZone',
  components: { hotzone, ImageTargetLink },
  data() {
    return {
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: 'aggregations'
      },
      uploadingImage: false,
      uploadImageFileList: null,
      imageUploadPercent: 0,
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
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleBeforeUploadImage(file) {
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        this.$message.warning('上传的图片大小超过1M，请裁剪或者优化图片，重新上传！')
        return false
      }
      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (imageTypes.includes(file.type) === false) {
        this.$message.warning('请选择正确的文件类型！')
        return false
      }
      this.imageUploadPercent = 0
      this.uploadingImage = true
      return true
    },
    handleUploadImageSuccess(res) {
      const imageUrl = this.$store.getters.cosUrl + res.data.url
      const noLookalikes = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      const imageKey = generate(noLookalikes, 21)
      this.$refs.upload.clearFiles()
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', { imageUrl, imageKey })
    },
    handleUploadImageError(res) {
      this.$refs.upload.clearFiles()
      this.$message.error('上传图片文件失败，请联系管理员')
      this.uploadingImage = false
    },
    handleUploadImageProgress(event) {
      this.imageUploadPercent = event.percent
    },
    handleUploadImageChanged(file, fileList) {
      this.uploadImageFileList = fileList
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
