export const ticket_status_init = 1
export const ticket_status_activated = 2
export const ticket_status_used = 3
export const ticket_status_expired = 4

export const TicketStatusOptions = [{
  value: ticket_status_init,
  label: '未激活'
}, {
  value: ticket_status_activated,
  label: '已激活'
}, {
  value: ticket_status_used,
  label: '已使用'
}, {
  value: ticket_status_expired,
  label: '已失效'
}]
