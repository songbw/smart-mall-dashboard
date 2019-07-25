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
