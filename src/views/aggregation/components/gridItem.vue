<template>
  <div style="margin: 10px 0">
    <el-row :gutter="0" class="show-border">
      <el-col v-for="(item, index) in gridInfo.grids" :key="index" :span="colSpan">
        <el-card shadow="hover" class="box-card" body-style="{ padding: '0px' }">
          <img v-if="item.imageUrl" :src="item.imageUrl" class="card-image" alt="">
          <img v-else :src="placeholderUrl" class="card-image" alt="">
          <el-button
            icon="el-icon-upload"
            size="mini"
            class="bottom-button"
            @click="handleUploadImage(index)"
          >
            {{ item.imageUrl ? '编辑' : '上传' }}
          </el-button>
        </el-card>
      </el-col>
      <el-col v-if="gridCount === 3" :span="2">
        <span>&nbsp;</span>
      </el-col>
      <el-col :span="4">
        <div class="ops-container">
          <el-select :value="gridCount" @change="onGridCountChanged">
            <el-option
              v-for="o in gridOptions"
              :key="o.label"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
          <el-button style="margin-top: 10px" @click.prevent="$emit('onRemove', gridIndex)">
            删除本行
          </el-button>
        </div>
      </el-col>
    </el-row>
    <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm" :model="dialogValue" label-width="6rem">
        <el-form-item label="缩略图">
          <image-upload
            :image-url="dialogValue.imageUrl"
            :tip="uploadTips"
            path-name="aggregations"
            image-width="100px"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
        <el-form-item
          label="图片链接"
          :rules="[
            { required: true, message: '请输入对应图片链接', trigger: 'change' }
          ]"
          prop="targetUrl"
        >
          <image-target-link
            :target-index="currentEditIndex"
            :target-type="dialogValue.targetType"
            :target-url="dialogValue.targetUrl"
            :target-name="dialogValue.targetName"
            :app-id="appId"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import ImageTargetLink from './imageTargetLink'

const placeholder = require('@/assets/images/placeholder-150x150.png')
export default {
  name: 'GridItem',
  components: { ImageUpload, ImageTargetLink },
  props: {
    gridInfo: {
      type: Object,
      default: function () {
        return {
          count: 1,
          grids: [
            { imageUrl: null, targetUrl: null, targetName: null, targetType: null }
          ]
        }
      }
    },
    gridIndex: {
      type: Number,
      default: -1
    },
    appId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogFormTitle: '',
      dialogFormVisible: false,
      dialogValue: {
        imageUrl: null,
        targetType: null,
        targetUrl: null,
        targetName: null
      },
      currentEditIndex: -1,
      placeholderUrl: placeholder,
      gridOptions: [
        {
          value: 1,
          label: '1行1个'
        },
        {
          value: 2,
          label: '1行2个'
        },
        {
          value: 3,
          label: '1行3个'
        },
        {
          value: 4,
          label: '1行4个'
        },
        {
          value: 5,
          label: '1行5个'
        }
      ]
    }
  },
  computed: {
    uploadTips: {
      get() {
        switch (this.gridInfo.count) {
          case 1:
            return '建议上传宽1095px，不超过500k，格式为jpg、png的图片'
          case 2:
            return '建议上传宽540px，不超过500k，格式为jpg、png的图片'
          case 3:
            return '建议上传宽360px，不超过500k，格式为jpg、png的图片'
          case 4:
            return '建议上传宽272px，不超过500k，格式为jpg、png的图片'
          case 5:
            return '建议上传宽219px，不超过500k，格式为jpg、png的图片'
          default:
            return ''
        }
      }
    },
    gridCount: {
      get() {
        return this.gridInfo.count
      },
      set(newValue) {
        this.$emit('gridCountChanged', this.gridIndex, newValue)
      }
    },
    colSpan: {
      get() {
        return Math.floor(20 / this.gridCount)
      }
    }
  },
  methods: {
    onGridCountChanged(value) {
      this.gridCount = value
    },
    handleUploadImage(index) {
      this.currentEditIndex = index
      this.dialogValue.imageUrl = this.gridInfo.grids[index].imageUrl
      this.dialogValue.targetUrl = this.gridInfo.grids[index].targetUrl
      this.dialogValue.targetName = this.gridInfo.grids[index].targetName
      this.dialogValue.targetType = this.gridInfo.grids[index].targetType
      this.dialogFormVisible = true
      this.dialogFormTitle =
        this.gridInfo.grids[index].imageUrl
          ? '编辑宫格图' : '添加宫格图'
    },
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.dialogFormVisible = false
          this.saveGridItemContent()
        }
      })
    },
    handleUploadImageSuccess(url) {
      this.dialogValue.imageUrl = url
    },
    saveGridItemContent() {
      this.$emit('gridImageChanged', this.gridIndex, { index: this.currentEditIndex, value: this.dialogValue })
    },
    handleImageTargetChanges(target) {
      if ('type' in target) {
        this.dialogValue.targetType = target.type
      }
      if ('name' in target) {
        this.dialogValue.targetName = target.name
      }
      if ('url' in target) {
        this.dialogValue.targetUrl = target.url
      }
      this.saveGridItemContent()
    }
  }
}
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
  }

  .box-card {
    width: 130px;
    max-width: 100%;
    height: 150px;
    max-height: 150px;
    margin: 10px auto;
    padding: 0;
    position: relative;
  }

  .card-image {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: contain;
  }

  .bottom-button {
    position: absolute;
    bottom: 0;
    margin: 5px auto;
  }

  .ops-container {
    height: 150px;
    margin: auto 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

</style>
