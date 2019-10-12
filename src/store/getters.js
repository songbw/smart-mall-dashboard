import {
  role_admin_name,
  role_watcher_name,
  vendor_status_approved
} from '@/utils/constants'

const getters = {
  appReady: state => state.app.ready,
  sidebar: state => state.app.sidebar,
  cosUrl: state => state.app.cosUrl,
  token: state => state.user.token,
  userName: state => state.user.name,
  userPhone: state => state.user.phone,
  userRole: state => state.user.role,
  isAdminUser: state => role_admin_name === state.user.role,
  isWatcherUser: state => role_watcher_name === state.user.role,
  vendorLoading: state => state.user.role === '' ||
    (role_admin_name !== state.user.role && role_watcher_name !== state.user.role && state.vendor.profile.id === -2),
  vendorProfile: state => state.vendor.profile,
  vendorApproved: state => {
    return role_admin_name === state.user.role || role_watcher_name === state.user.role ||
      state.vendor.profile.status === vendor_status_approved
  },
  vendorId: state => state.vendor.profile.status === vendor_status_approved ? state.vendor.profile.id : -1,
  productQuery: state => state.products.search,
  productVendors: state => state.products.vendors,
  categoriesLoaded: state => state.categories.dataLoaded,
  categoriesLoading: state => state.categories.dataLoading,
  categories: state => state.categories.categoriesTree,
  secondClassCategories: state => state.categories.secondClassTree
}
export default getters
