<template>
  <el-row :gutter="20" style="border: 1px solid #99a9bf;">
    <el-col :span="18">
      <img :src="imageUrl" class="thumb-image" alt="">
    </el-col>
    <el-col :span="6">
      <div v-if="couldEdit" style="padding: 14px;">
        <image-upload
          tip=""
          :path-name="bucket"
          :button-name="`修改详情图 ${index + 1}`"
          @success="handleUploadSuccess"
        />
        <el-button-group>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDeleteIntroduction(index)"
          />
          <el-button
            :disabled="index === 0"
            size="mini"
            type="primary"
            icon="el-icon-arrow-up"
            @click="handleSortIntroduction(index, true)"
          />
          <el-button
            :disabled="index === length - 1"
            size="mini"
            type="primary"
            icon="el-icon-arrow-down"
            @click="handleSortIntroduction(index, false)"
          />
        </el-button-group>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'

export default {
  name: 'CustomIntroduction',
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
    handleSortIntroduction(index, up) {
      this.$emit('sortIntroduction', { index: index, up: up })
    },
    handleDeleteIntroduction(index) {
      this.$confirm('将会删除此产品详情图！请确认是否继续此操作？', '警告', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('deleteIntroduction', this.index)
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
  .thumb-image {
    margin: 10px;
    object-fit: contain;
    width: 100%;
    height: 100%
  }
</style>
