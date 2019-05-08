<template>
  <div class="components-container">
    <hotzone ref="imageHotZone" v-if="hotZoneImage"
             :image="hotZoneImage"
             :zonesInit="hotZonesInit"
             @add="onZoneAdded"
             @change="onZoneChanged"
             @remove="onZoneRemoved" />
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
      list-type="picture"
      name="file"
    >
      <el-button slot="trigger" size="small" type="primary">选择图片</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传图片</el-button>
      <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
    </el-upload>
    <el-progress :text-inside="true" :stroke-width="18" :percentage="imageUploadPercent"
                 status="success" />
    <el-divider />
    <div v-for="(zone, index) in hotZoneList" :key="'zone-' + index" style="margin-bottom: 20px">
      <span>
        {{ `热区 ${index + 1}` }}
      </span>
      <image-target-link :target-index="index"
                         :target-type="zone.targetType"
                         :target-url="zone.targetUrl"
                         :target-name="zone.targetName"
                         @targetChanges="handleImageTargetChanges" />
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import hotzone from 'vue-hotzone'
  import { hotZoneType } from '@/utils/templateType'
  import ImageTargetLink from './imageTargetLink'

  export default {
    name: 'CustomHotZone',
    components: { hotzone, ImageTargetLink },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
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
              settings: {
                imageUrl: '',
              }
            }
          }
        }
      },
      hotZoneImage: {
        get() {
          return this.hotZoneInfo.settings.imageUrl
        }
      },
      hotZonesInit: {
        get() {
          return this.hotZoneInfo.list.map(zone => zone.area)
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
        this.$store.commit('setListInTemplateContent', params)
      },
      onZoneChanged(zones) {
        for (let index = 0; index < zones.length && index < this.hotZoneList.length; index++) {
          const { targetType, targetUrl, targetName } = this.hotZoneList[index]
          const value = { area: { ...zones[index] }, targetType, targetUrl, targetName }
          const params = {
            index,
            value
          }
          this.$store.commit('setListInTemplateContent', params)
        }
      },
      onZoneRemoved(index) {
        this.$store.commit('deleteItemInTemplateContent', index)
      },
      submitUpload() {
        this.$refs.upload.submit()
      },
      handleBeforeUploadImage(file) {
        this.imageUploadPercent = 0
        this.uploadingImage = true
        return true
      },
      handleUploadImageSuccess(res) {
        const imageUrl = this.$store.getters.cosUrl + res.data.url
        this.$refs.upload.clearFiles()
        this.$store.commit('setTemplateHotZoneSettings', { imageUrl })
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
          if (target.hasOwnProperty('type')) {
            targetType = target.type
          }
          let targetName = zone.targetName
          if (target.hasOwnProperty('name')) {
            targetName = target.name
          }
          let targetUrl = zone.targetUrl
          if (target.hasOwnProperty('url')) {
            targetUrl = target.url
          }
          const value = { area: { ...zone.area }, targetType, targetUrl, targetName }
          const params = {
            index,
            value
          }
          this.$store.commit('setListInTemplateContent', params)
        }
      }
    }
  }
</script>

<style scoped>

</style>
