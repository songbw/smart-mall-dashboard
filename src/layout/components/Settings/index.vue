<template>
  <div class="drawer-container">
    <div v-loading="loading">
      <h3 class="drawer-title">选择运营平台</h3>
      <div v-if="hasRenterPermission">
        <el-tree
          :data="renterOptions"
          :props="renterProps"
          node-key="value"
          highlight-current
          default-expand-all
          @node-click="onNodeClicked"
        >
          <span slot-scope="{node, data}">
            <el-checkbox
              v-if="node.isLeaf"
              :value="platformAppId === data.value"
            />
            <span style="margin-left: 12px">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
      <div v-else>
        <div v-for="platform in platformOptions" :key="platform.appId" class="drawer-item">
          <span>{{ platform.name }}</span>
          <el-switch
            v-model="platform.selected"
            class="drawer-switch"
            @change="value => onPlatformChanged(value, platform.appId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { RenterPermissions } from '@/utils/role-permissions'

export default {
  name: 'Settings',
  data() {
    return {
      loading: false,
      renterProps: {
        label: 'label',
        children: 'appList',
        isLeaf: 'isLeaf'
      },
      renterOptions: [],
      platformOptions: []
    }
  },
  computed: {
    ...mapGetters([
      'platformAppId',
      'renterList',
      'validAppList',
      'userPermissions'
    ]),
    hasRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    }
  },
  created() {
    this.getAppPlatformList()
  },
  methods: {
    selectPlatform(appId) {
      const platform = this.platformOptions.find(option => option.appId === appId)
      if (platform) {
        platform.selected = true
      }
    },
    async onNodeClicked(node) {
      if (node.isLeaf) {
        await this.$store.dispatch('app/setPlatformId', node.value)
      }
    },
    async getAppPlatformList() {
      try {
        this.loading = true
        await this.$store.dispatch('app/getRenterList')
        await this.$store.dispatch('app/getPlatformList')
        this.renterOptions = this.renterList.map(renter => {
          const appList = this.validAppList
            .filter(item => item.renterId === renter.renterId)
            .map(item => ({ value: item.appId, label: item.name, isLeaf: true }))
          return { value: renter.renterId, label: renter.renterName, appList }
        })
        this.platformOptions = this.validAppList.map(option => ({ selected: false, ...option }))
        this.selectPlatform(this.platformAppId)
      } catch (e) {
        console.warn('Get platform list error:' + e)
      } finally {
        this.loading = false
      }
    },
    async onPlatformChanged(selected, appId) {
      try {
        if (selected) {
          await this.$store.dispatch('app/setPlatformId', appId)
          for (const platform of this.platformOptions) {
            if (platform.appId !== appId) {
              platform.selected = false
            }
          }
        } else {
          if (appId === this.platformAppId) {
            this.selectPlatform(appId)
          }
        }
      } catch (e) {
        console.warn('onPlatformChanged: error ' + e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }
}
</style>
