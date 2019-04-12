<template>
  <div>
    <el-dialog
      :before-close="order_handleDialogClose"
      :visible.sync="dialogVisible"
      width="30%">
      <span v-if="title.length > 1" :class="$style.order_input_title">{{ title }}</span>
      <textarea v-model="inputValues" cols="25" rows="6" maxlength="200" placeholder="最多可输入200字" width="24%"/>
      <br><br>
      <div align="center">
        <el-button v-if="inputValues.length > 0" type="primary" @click="order_handleChange">
          确定
        </el-button>
        <el-button type="primary" @click="order_handleDialogClose">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'OrderDialog',
    props: {
      id: {
        type: Number,
        required: true
      },
      title: {
        type: String,
        default: '',
        required: true
      },
      remark: {
         type: String,
         default: '',
         required: true
       },
      applyChange: {
        type: Function,
        default: null
      }
    },
    data() {
      return {
        inputValues: '',
        dialogVisible: true
      }
    },
    created() {
      this.dialogVisible = true
      this.inputValues = this.remark
      // console.log('add notes for ' + this.id)
    },
    methods: {
      order_handleChange() {
        this.$emit('apply', this.inputValues)
        this.dialogVisible = false
      },
      order_handleDialogClose() {
        this.$emit('close')
        this.dialogVisible = false
        // console.log('emit close')
      }
    }
  }
</script>
<style module>
  .order_input_title {
    font-size: 16px;
    font-weight: bold;
  }
</style>
