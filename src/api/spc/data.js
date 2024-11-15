import request from '@/utils/request'

// 查询spc主数据列表
export function listData(query) {
  return request({
    url: '/spc/data/list',
    method: 'get',
    params: query
  })
}

// 查询spc主数据详细
export function getData(id) {
  return request({
    url: '/spc/data/info?id=' + id,
    method: 'get'
  })
}

// 新增spc主数据
export function addData(data) {
  return request({
    url: '/spc/data/add',
    method: 'post',
    data: data
  })
}

// 修改spc主数据
export function updateData(data) {
  return request({
    url: '/spc/data/edit',
    method: 'post',
    data: data
  })
}

// 删除spc主数据
export function delData(data) {
  return request({
    url: '/spc/data/delete',
    method: 'post',
    data: data
  })
}
