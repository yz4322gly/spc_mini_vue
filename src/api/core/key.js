import request from '@/utils/request'

// 查询数据key值列表
export function listKey(query) {
  return request({
    url: '/core/key/list',
    method: 'get',
    params: query
  })
}

// 查询数据key值详细
export function getKey(id) {
  return request({
    url: '/core/key/info?id=' + id,
    method: 'get'
  })
}

// 查询key1列表,排好序的
export function listKey1(id) {
  return request({
    url: '/core/key/listKey1',
    method: 'get'
  })
}


// 新增数据key值
export function addKey(data) {
  return request({
    url: '/core/key/add',
    method: 'post',
    data: data
  })
}

// 修改数据key值
export function updateKey(data) {
  return request({
    url: '/core/key/edit',
    method: 'post',
    data: data
  })
}

// 删除数据key值
export function delKey(data) {
  return request({
    url: '/core/key/delete',
    method: 'post',
    data: data
  })
}
