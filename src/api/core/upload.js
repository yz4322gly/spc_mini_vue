import request from '@/utils/request'

// 查询文件导入记录列表
export function listUpload(query) {
  return request({
    url: '/core/upload/list',
    method: 'get',
    params: query
  })
}

// 查询文件导入记录详细
export function getUpload(id) {
  return request({
    url: '/core/upload/info?id=' + id,
    method: 'get'
  })
}

// 新增文件导入记录
export function addUpload(data) {
  return request({
    url: '/core/upload/add',
    method: 'post',
    data: data
  })
}

// 修改文件导入记录
export function updateUpload(data) {
  return request({
    url: '/core/upload/edit',
    method: 'post',
    data: data
  })
}

// 删除文件导入记录
export function delUpload(data) {
  return request({
    url: '/core/upload/delete',
    method: 'post',
    data: data
  })
}
