import {
  role_admin_name,
  role_watcher_name,
  vendor_status_approved
} from '@/utils/constants'

const getters = {
  appReady: state => state.app.ready,
  sidebar: state => state.app.sidebar,
  needAppSettings: state => state.app.needSettings,
  platformAppId: state => state.app.platformId,
  platformAppList: state => state.app.platformList,
  vendorAppList: state => state.app.vendorPlatformList,
  validAppList: state => state.app.platformList.filter(
    item => state.app.vendorPlatformList.includes(item.appId)),
  renterList: state => state.app.renterList,
  vendorList: state => state.app.vendorList,
  cosUrl: state => state.app.cosUrl,
  token: state => state.user.token,
  userName: state => state.user.name,
  userPhone: state => state.user.phone,
  userRole: state => state.user.role,
  userPermissions: state => state.user.permissions,
  vendorLoading: state => state.user.role === '' ||
    (role_admin_name !== state.user.role &&
      role_watcher_name !== state.user.role &&
      state.vendor.profile.id === -2),
  vendorProfile: state => state.vendor.profile,
  vendorApproved: state => {
    return role_admin_name === state.user.role ||
      role_watcher_name === state.user.role ||
      state.vendor.profile.status === vendor_status_approved
  },
  vendorId: state => state.vendor.profile.status === vendor_status_approved
    ? state.vendor.profile.id : -1,
  renterId: state => state.vendor.profile.status === vendor_status_approved
    ? state.vendor.renter.id : '-1',
  productQuery: state => state.products.search,
  categoriesLoaded: state => state.categories.dataLoaded,
  categoriesLoading: state => state.categories.dataLoading,
  categories: state => state.categories.categoriesTree,
  secondClassCategories: state => state.categories.secondClassTree,
  thirdClassCategories: state => state.categories.thirdClassList,
  appIdCategories: state => state.categories.appIdList,
  aggregationsQuery: state => state.aggregations.search,
  currentAggregation: state => state.aggregations.aggregation,
  currentAggregationContent: state => state.aggregations.aggregation.content,
  currentAggregationContentIndex: state => state.aggregations.contentIndex,
  aggregationGroupId: state => state.aggregations.groupId,
  aggregationGroups: state => state.aggregations.groups,
  promotionQuery: state => state.promotions.query,
  currentPromotion: state => state.promotions.promotion,
  promotionTypes: state => state.promotions.promotionTypes,
  promotionTypeId: state => state.promotions.promotionTypeId,
  conflictedMpus: state => state.promotions.conflictedMpus,
  defaultSchedules: state => state.promotions.defaultSchedules,
  couponQuery: state => state.coupons.search,
  barterCardQuery: state => state.barterCards.search,
  orderQuery: state => state.orders.search,
  orderDeliveryQuery: state => state.orders.deliveryQuery,
  workOrdersQuery: state => state.workOrders.search,
  membersQuery: state => state.members.membersQuery,
  balancesQuery: state => state.members.balancesQuery,
  freightQuery: state => state.freight.query
}
export default getters
