export const ticket_status_init = 1
export const ticket_status_activated = 2
export const ticket_status_bind = 3
export const ticket_status_redeem = 4
export const ticket_status_pending = 5
export const ticket_status_used = 6
export const ticket_status_expired = 7

export const TicketStatusOptions = [{
  value: ticket_status_init,
  label: '未激活'
}, {
  value: ticket_status_activated,
  label: '已激活'
}, {
  value: ticket_status_bind,
  label: '已绑定'
}, {
  value: ticket_status_redeem,
  label: '已兑换'
}, {
  value: ticket_status_pending,
  label: '已占用'
}, {
  value: ticket_status_used,
  label: '已使用'
}, {
  value: ticket_status_expired,
  label: '已过期'
}]
