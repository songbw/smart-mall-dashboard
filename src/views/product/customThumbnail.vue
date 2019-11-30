<template>
  <el-card :body-style="{ padding: '0px' }" style="min-width: 180px">
    <el-image :src="imageUrl" class="image" fit="contain" />
    <div v-if="couldEdit" style="display: flex;flex-direction: column;align-items: center">
      <image-upload
        tip=""
        :path-name="bucket"
        :button-name="`修改主图 ${index + 1}`"
        @success="handleUploadSuccess"
      />
      <el-button-group style="margin: 3px 0">
        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click="handleDeleteThumbnail(index)"
        />
        <el-button
          :disabled="index === 0"
          size="mini"
          type="primary"
          icon="el-icon-arrow-left"
          @click="handleSortThumbnail(index, true)"
        />
        <el-button
          :disabled="index === length - 1"
          size="mini"
          type="primary"
          icon="el-icon-arrow-right"
          @click="handleSortThumbnail(index, false)"
        />
      </el-button-group>
    </div>
  </el-card>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'

export default {
  name: 'CustomThumbnail',
  components: { ImageUpload },
  props: {
    couldEdit: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    },
    bucket: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: -1
    },
    length: {
      type: Number,
      default: 0
    }
  },
  methods: {
    handleSortThumbnail(index, left) {
      this.$emit('sortThumbnail', { index: index, left: left })
    },
    handleDeleteThumbnail(index) {
      this.$confirm('将会删除此产品主图！请确认是否继续此操作？', '警告', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('deleteThumbnail', index)
      }).catch(() => {
      })
    },
    handleUploadSuccess(imageUrl) {
      const url = imageUrl.substring(this.$store.getters.cosUrl.length)
      this.$emit('uploadSuccess', { index: this.index, url })
    }
  }
}
</script>

<style scoped>
  .image {
    width: 100%;
  }
</style>
