const getters = {
  sidebar: state => state.app.sidebar,
  token: state => state.user.token,
  userName: state => state.user.name,
  userRole: state => state.user.role,
  vendorStatus: state => state.vendor.status,
  vendorProfile: state => state.vendor.profile
}
export default getters
