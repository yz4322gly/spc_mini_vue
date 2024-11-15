import request from '@/utils/request'

// 查询核心数据列表
export function listData(query) {
  return request({
    url: '/core/data/list',
    method: 'get',
    params: query
  })
}

// 查询核心数据列表
export function listDataBeautify(query) {
  return request({
    url: '/core/data/listBeautify',
    method: 'get',
    params: query
  })
}
export function infoBeautify(recordNum) {
  return request({
    url: '/core/data/infoBeautify2?recordNum=' + recordNum,
    method: 'get'
  })
}


// 查询核心数据详细
export function getData(id) {
  return request({
    url: '/core/data/info?id=' + id,
    method: 'get'
  })
}

export function addOrUpdateBeautify(data) {
  return request({
    url: '/core/data/addOrUpdateBeautify',
    method: 'post',
    data: data
  })
}



// 新增核心数据
export function addData(data) {
  return request({
    url: '/core/data/add',
    method: 'post',
    data: data
  })
}

// 修改核心数据
export function updateData(data) {
  return request({
    url: '/core/data/edit',
    method: 'post',
    data: data
  })
}

// 删除核心数据
export function delData(data) {
  return request({
    url: '/core/data/delete',
    method: 'post',
    data: data
  })
}

export function delDataBeautify(data) {
  return request({
    url: '/core/data/delDataBeautify',
    method: 'post',
    data: data
  })
}


