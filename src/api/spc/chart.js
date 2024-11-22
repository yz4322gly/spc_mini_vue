import request from '@/utils/request'

// 查询spc管制图列表
export function listChart(query) {
  return request({
    url: '/spc/chart/list',
    method: 'get',
    params: query
  })
}

// 查询spc管制图详细
export function getChart(id) {
  return request({
    url: '/spc/chart/info?id=' + id,
    method: 'get'
  })
}

// 新增spc管制图
export function addChart(data) {
  return request({
    url: '/spc/chart/add',
    method: 'post',
    data: data
  })
}

// 修改spc管制图
export function updateChart(data) {
  return request({
    url: '/spc/chart/edit',
    method: 'post',
    data: data
  })
}

// 删除spc管制图
export function delChart(data) {
  return request({
    url: '/spc/chart/delete',
    method: 'post',
    data: data
  })
}

// 获取绘图数据
export function chartSummaryData(query) {
  if (query.time && query.time.length === 2)
  {
    query.startTime=query.time[0]
    query.endTime=query.time[1]
  }
  else
  {
    query.startTime=null;
    query.endTime=null;
  }
  return request({
    url: '/spc/chart/chartSummaryData',
    method: 'get',
    params: query
  })
}

/**
 * 通过summary的id查询明细数据
 * @param query summary的id含分页参数
 * @returns {*}
 */
export function listDataBySummaryId(query) {
  return request({
    url: '/spc/chart/listDataBySummaryId',
    method: 'get',
    params: query
  })
}

/**
 * 保存/更新ooc的配置
 * @returns {*}
 */
export function saveOOC(id,ooc) {
  return request({
    url: '/spc/chart/saveOOC',
    method: 'post',
    data: {
      id:id,
      checkOoc:ooc
    }
  })
}

// 查询spc管制图列表
export function listDataRowBySummaryId(query) {
  return request({
    url: '/spc/chart/listDataRowBySummaryId',
    method: 'get',
    params: query
  })
}
