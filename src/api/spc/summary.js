import request from '@/utils/request'

// 查询数据汇总列表
export function listSummary(query) {
  return request({
    url: '/spc/summary/list',
    method: 'get',
    params: query
  })
}

// 查询数据汇总详细
export function getSummary(id) {
  return request({
    url: '/spc/summary/info?id=' + id,
    method: 'get'
  })
}

// 新增数据汇总
export function addSummary(data) {
  return request({
    url: '/spc/summary/add',
    method: 'post',
    data: data
  })
}

// 修改数据汇总
export function updateSummary(data) {
  return request({
    url: '/spc/summary/edit',
    method: 'post',
    data: data
  })
}

// 删除数据汇总
export function delSummary(data) {
  return request({
    url: '/spc/summary/delete',
    method: 'post',
    data: data
  })
}

export function remarkSummary(data) {
  return request({
    url: '/spc/summary/remarkSummary',
    method: 'get',
    params: data
  })
}

export function hiddenSummary(data) {
  return request({
    url: '/spc/summary/hiddenSummary',
    method: 'get',
    params: data
  })
}
