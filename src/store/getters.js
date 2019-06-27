import {
  role_admin_name
} from '@/utils/constants'

const getters = {
  sidebar: state => state.app.sidebar,
  cosUrl: state => state.app.cosUrl,
  token: state => state.user.token,
  userName: state => state.user.name,
  userRole: state => state.user.role,
  isAdminUser: state => role_admin_name === state.user.role,
  vendorProfile: state => state.vendor.profile,
  vendorId: state => state.vendor.profile.status === 3 ? state.vendor.profile.id : -1,
  productQuery: state => state.products.search,
  categoriesLoaded: state => state.categories.dataLoaded,
  categoriesLoading: state => state.categories.dataLoading,
  categories: state => state.categories.allData,
  aggregationsQuery: state => state.aggregations.search,
  currentAggregation: state => state.aggregations.aggregation,
  currentAggregationContent: state => state.aggregations.aggregation.content,
  currentAggregationContentIndex: state => state.aggregations.contentIndex,
  aggregationGroupId: state => state.aggregations.groupId,
  aggregationGroups: state => state.aggregations.groups,
  currentPromotion: state => state.promotions.promotion,
  couponQuery: state => state.coupons.search
}
export default getters
