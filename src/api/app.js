import request from '@/utils/request'

export function getCosUrlsApi() {
  return request({
    url: 'cos/url',
    method: 'get'
  })
}
