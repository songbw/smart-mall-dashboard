export const app_upload_url = `${process.env.VUE_APP_BASE_URL}/bases/upload/relative`
export const storage_key_token = 'user_token'
export const storage_key_name = 'user_name'
export const storage_key_role = 'user_role'
export const storage_merchant_id = 'merchant_id'
export const storage_product_categories = 'product_categories'

export const role_vendor_name = 'vendor'
export const role_admin_name = 'admin'

export const vendor_status_init = 0
export const vendor_status_editing = 1
export const vendor_status_reviewing = 2
export const vendor_status_approved = 3
export const vendor_status_rejected = 4

export const product_state_off_shelves = 0
export const product_state_on_sale = 1
export const ProductStateOptions = [
  {
    value: product_state_on_sale,
    label: '销售中'
  }, {
    value: product_state_off_shelves,
    label: '已下架'
  }
]
