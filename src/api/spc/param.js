import request from '@/utils/request'

// 查询参数组列表
export function listParam(query) {
  return request({
    url: '/spc/param/list',
    method: 'get',
    params: query
  })
}

// 查询参数组详细
export function getParam(id) {
  return request({
    url: '/spc/param/info?id=' + id,
    method: 'get'
  })
}

// 新增参数组
export function addParam(data) {
  return request({
    url: '/spc/param/add',
    method: 'post',
    data: data
  })
}

// 修改参数组
export function updateParam(data) {
  return request({
    url: '/spc/param/edit',
    method: 'post',
    data: data
  })
}

// 删除参数组
export function delParam(data) {
  return request({
    url: '/spc/param/delete',
    method: 'post',
    data: data
  })
}
