<template>
  <el-container>
    <el-header>
      <h3>当前登录用户</h3>
    </el-header>
    <el-main>
      <el-form
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input :value="userName" readonly class="item-input" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input :value="userPhone" readonly class="item-input" />
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserInfo',
  computed: {
    ...mapGetters([
      'userName',
      'userPhone'
    ])
  }
}
</script>

<style scoped>
  .item-input {
    width: 50%;
  }
</style>
