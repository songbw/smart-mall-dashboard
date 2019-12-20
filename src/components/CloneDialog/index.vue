<template>
  <el-dialog
    :visible="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="title"
  >
    <el-form ref="cloneForm" :model="cloneForm" :rules="cloneRules" label-width="6rem">
      <el-form-item :label="nameTitle" prop="name">
        <el-input v-model="cloneForm.name" maxlength="50" />
      </el-form-item>
      <el-form-item label="运营平台" prop="appId">
        <el-select v-model="cloneForm.appId">
          <el-option
            v-for="item in appList"
            :key="item.appId"
            :label="item.name"
            :value="item.appId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button
        type="primary"
        @click="handleDialogConfirm"
      >
        确认
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'CloneDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '复制'
    },
    nameTitle: {
      type: String,
      default: '名称'
    }
  },
  data() {
    return {
      cloneForm: {
        appId: null,
        name: ''
      },
      cloneRules: {
        name: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入有效的名称'))
            } else {
              callback()
            }
          }
        }],
        appId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择对应的运营平台'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      appList: 'platformAppList'
    })
  },
  methods: {
    handleDialogCancel() {
      this.$emit('cancelled')
      this.$refs.cloneForm.resetFields()
    },
    handleDialogConfirm() {
      this.$emit('confirmed', { ...this.cloneForm })
      this.$refs.cloneForm.resetFields()
    }
  }
}
</script>

<style scoped>

</style>
