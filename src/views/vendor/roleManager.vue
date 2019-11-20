<template>
  <div class="app-container">
    <el-tabs type="card">
      <el-tab-pane label="管理员角色">
        <vendor-roles />
      </el-tab-pane>
      <el-tab-pane label="角色权限">
        <role-permissions />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import VendorRoles from './vendorRoles'
import RolePermissions from './rolePermissions'

export default {
  name: 'RoleManager',
  components: { VendorRoles, RolePermissions }
}
</script>

<style scoped>

</style>
