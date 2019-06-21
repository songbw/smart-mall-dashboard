const getters = {
  sidebar: state => state.app.sidebar,
  cosUrl: state => state.app.cosUrl,
  token: state => state.user.token,
  userName: state => state.user.name,
  userRole: state => state.user.role,
  vendorProfile: state => state.vendor.profile,
  vendorId: state => state.vendor.profile.status === 3 ? state.vendor.profile.id : -1,
  productQuery: state => state.products.search,
  categoriesLoaded: state => state.categories.dataLoaded,
  categoriesLoading: state => state.categories.dataLoading,
  categories: state => state.categories.allData
}
export default getters
