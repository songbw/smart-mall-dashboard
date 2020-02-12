export const max_upload_image_size = 2 * 1024 * 1024
export const storage_key_token = 'user_token'
export const storage_key_name = 'user_name'
export const storage_key_phone = 'user_phone'
export const storage_key_role = 'user_role'
export const storage_key_permissions = 'user_permissions'
export const storage_merchant_id = 'merchant_id'
export const storage_platform_id = 'app_id'

export const role_vendor_name = 'vendor'
export const role_admin_name = 'admin'
export const role_watcher_name = 'watcher'

export const vendor_status_init = 0
export const vendor_status_editing = 1
export const vendor_status_reviewing = 2
export const vendor_status_approved = 3
export const vendor_status_rejected = 4
export const vendor_status_locked = 5
export const VendorStatusOptions = [{
  value: vendor_status_editing,
  label: '编辑中'
}, {
  value: vendor_status_reviewing,
  label: '待审核'
}, {
  value: vendor_status_approved,
  label: '审核已通过'
}, {
  value: vendor_status_rejected,
  label: '审核有问题'
}, {
  value: vendor_status_locked,
  label: '已冻结'
}]

export const product_state_off_shelves = 0
export const product_state_on_sale = 1
export const product_state_is_editing = -2
export const product_state_all = -3
export const ProductStateOptions = [{
  value: product_state_is_editing,
  label: '编辑中'
}, {
  value: product_state_on_sale,
  label: '销售中'
}, {
  value: product_state_off_shelves,
  label: '已下架'
}
]

export const product_sub_sku_sold_out = 0
export const product_sub_sku_on_sale = 1
export const ProductSubSkuStatusOptions = [{
  value: product_sub_sku_on_sale,
  label: '销售中'
}, {
  value: product_sub_sku_sold_out,
  label: '已下架'
}
]

export const product_type_physical_goods = 0
export const product_type_virtual_voucher = 1
export const product_type_physical_voucher = 2
export const ProductTypeOptions = [{
  value: product_type_physical_goods,
  label: '实体类商品'
}, {
  value: product_type_virtual_voucher,
  label: '虚拟卡券类'
}, {
  value: product_type_physical_voucher,
  label: '实体卡券类'
}
]

export const product_default_tax_rate = '0.13'
export const ProductTaxRateOptions = [{
  value: '0',
  label: '0%'
}, {
  value: '0.03',
  label: '3%'
}, {
  value: '0.06',
  label: '6%'
}, {
  value: '0.09',
  label: '9%'
}, {
  value: '0.11',
  label: '11%'
}, {
  value: '0.13',
  label: '13%'
}]

export const order_status_deleted = -1
export const order_status_waiting_pay = 0
export const order_status_waiting_receipt = 1
export const order_status_completed = 2
export const order_status_canceled = 3
export const OrderStatusDefinitions = [{
  value: order_status_deleted,
  label: '已删除'
}, {
  value: order_status_waiting_pay,
  label: '待付款'
}, {
  value: order_status_waiting_receipt,
  label: '待收货'
}, {
  value: order_status_completed,
  label: '已完成'
}, {
  value: order_status_canceled,
  label: '已取消'
}]

export const suborder_status_waiting_pay = 0
export const suborder_status_waiting_deliver = 1
export const suborder_status_delivered = 2
export const suborder_status_completed = 3
export const suborder_status_canceled = 4
export const suborder_status_requested_service = 5
export const SubOrderStatusDefinitions = [{
  value: suborder_status_waiting_pay,
  label: '待付款' // 已下单
}, {
  value: suborder_status_waiting_deliver,
  label: '待发货'
}, {
  value: suborder_status_delivered,
  label: '已发货'
}, {
  value: suborder_status_completed,
  label: '已完成'
}, {
  value: suborder_status_canceled,
  label: '已取消'
}, {
  value: suborder_status_requested_service,
  label: '已申请售后'
}]

export const PaymentStatusDefinitions = [{
  value: 0,
  label: '初始状态'
}, {
  value: 1,
  label: '等待支付'
}, {
  value: 2,
  label: '支付中'
}, {
  value: 3,
  label: '超时未支付'
}, {
  value: 4,
  label: '支付失败'
}, {
  value: 5,
  label: '支付成功'
}, {
  value: 11,
  label: '记账成功'
}, {
  value: 12,
  label: '记账失败'
}, {
  value: 14,
  label: '退款失败'
}, {
  value: 15,
  label: '退款成功'
}]

export const promotion_status_init = 1
export const promotion_status_published = 2
export const promotion_status_ready_for_sale = 3
export const promotion_status_on_sale = 4
export const promotion_status_off_shelves = 5

export const PromotionStatusDefinition = [{
  value: promotion_status_init,
  label: '编辑中'
}, {
  value: promotion_status_ready_for_sale,
  label: '未开始'
}, {
  value: promotion_status_on_sale,
  label: '进行中'
}, {
  value: promotion_status_off_shelves,
  label: '已下线'
}]

export const PromotionPublishedDefinition = [{
  value: promotion_status_ready_for_sale,
  label: '未开始'
}, {
  value: promotion_status_on_sale,
  label: '进行中'
}]

export const promotion_account_type_normal = 0
export const promotion_account_type_sec_kill = 1
export const promotion_account_type_premium = 2
export const PromotionAccountTypeDefinition = [{
  value: promotion_account_type_normal,
  label: '普通类结算'
}, {
  value: promotion_account_type_sec_kill,
  label: '秒杀类结算'
}, {
  value: promotion_account_type_premium,
  label: '精品类结算'
}]

export const coupon_status_init = 1
export const coupon_status_published = 2
export const coupon_status_ready_for_sale = 3
export const coupon_status_on_sale = 4
export const coupon_status_off_shelves = 5
export const coupon_status_distributing = 6

export const CouponStatusDefinition = [{
  value: coupon_status_init,
  label: '编辑中'
}, {
  value: coupon_status_ready_for_sale,
  label: '未开始'
}, {
  value: coupon_status_on_sale,
  label: '进行中'
}, {
  value: coupon_status_off_shelves,
  label: '已下线'
}, {
  value: coupon_status_distributing,
  label: '待分配'
}]

export const CouponPublishedDefinition = [{
  value: coupon_status_ready_for_sale,
  label: '未开始'
}, {
  value: coupon_status_on_sale,
  label: '进行中'
}]

export const PayTypeOptions = [{
  value: 'balance',
  label: '无锡余额'
}, {
  value: 'woa',
  label: '无锡联机账户'
}, {
  value: 'card',
  label: '无锡惠民优选卡'
}, {
  value: 'bank',
  label: '快捷支付'
}, {
  value: 'pingan',
  label: '平安统一支付'
}, {
  value: 'fcwxh5',
  label: '微信H5支付'
}, {
  value: 'fcwx',
  label: '微信公众号支付'
}, {
  value: 'fcwxxcx',
  label: '微信小程序支付'
}, {
  value: 'fcalipay',
  label: '支付宝H5支付'
}]

export const work_order_status_request = 1
export const work_order_status_approved = 3
export const work_order_status_rejected = 4
export const work_order_status_working = 5
export const work_order_status_finished = 6
export const work_order_status_refunding = 7
export const WorkOrderStatusDefinition = [{
  value: work_order_status_request,
  label: '待审核'
}, /* {
  value: 2,
  label: '审核中'
}, */{
  value: work_order_status_approved,
  label: '审核通过'
}, {
  value: work_order_status_rejected,
  label: '已关闭'
}, {
  value: work_order_status_working,
  label: '处理中'
}, {
  value: work_order_status_finished,
  label: '处理完成'
}, {
  value: work_order_status_refunding,
  label: '退款中'
}]

export const aggregationBannerType = '0'
export const aggregationServiceType = '1'
export const aggregationGridType = '2'
export const aggregationPromotionType = '3'
export const aggregationGoodsType = '4'
export const aggregationCouponType = '6'
export const aggregationHotZoneType = '7'
export const aggregationComboType = '8'
export const aggregationPromotionListType = '9'
export const aggregationHorizontalGoodType = '10'

export const vendor_invoice_type_special = 1
export const vendor_invoice_type_normal = 2
export const VendorInvoiceOptions = [{
  value: vendor_invoice_type_special,
  label: '增值税专用发票'
}, {
  value: vendor_invoice_type_normal,
  label: '增值税普通发票'
}]

export const vendor_taxpayer_type_general = 1
export const vendor_taxpayer_type_small_scale = 2
export const VendorTaxpayerOptions = [{
  value: vendor_taxpayer_type_general,
  label: '一般纳税人'
}, {
  value: vendor_taxpayer_type_small_scale,
  label: '小规模纳税人'
}]
