import request, { get, post, put, del } from '../utils/request';

// 获取轨交下拉列表 GET /metro/subwayLineSimple
export async function getSubwayLine(params) {
  return get(`/metro/subwayLineSimple`, params);
}
//GET /bus/busLineMsg/{stopId}
// 接驳公交分析-公交线路信息-地图
export async function busLineMsg(params) {
  return get(`/bus/line`, params);
}

// 接驳相关性分析-公交线路信息-地图 //GET /correlation/busLineMsg/{routeId}
export async function corBusLine(params) {
  return get(`/correlation/busLineMsg`, params);
}

// 接驳公交分析-线路分析-热力图
export async function busLineHeatMap(params) {
  return get(`/bus/line/heatMap`, params);
}

// 站点点击获取信息（轨交站点）
export async function getStationInfo(params) {
  if (params.shiftAnalysis) {
    return get(`/bus/shift/stopInfo`, params);
  }
  return get(`/metro/metroStationInfo`, params);
}
// 站点点击获取信息（公交站点）
export async function getBusStopInfo(params) {
  if (params.shiftAnalysis) {
    return get(`/bus/shift/stopInfo`, params);
  }
  return get(`/bus/busStopInfo`, params);
}

// 接驳方案优化-线路优化-热力图
export async function optLineHeatMap(params) {
  return get(`/optimization/line/heatMap`, params);
}

//接驳方案优化-线路(公交)
export async function optBusLine(params) {
  return get(`/optimization/line/optLine`, params);
}

//首页-全局概览-公交线路-经纬度数据
export async function getIndexBusLineLatLngs(params) {
  return get(`/index/shuttleBusLine`, params);
}

//首页-全局概览-公交线路-展示系数
export async function getIndexMapMsg(params) {
  return get(`/index/busLineMsg`, params);
}

//首页-全局概览-公交线路-站点线路详情
export async function getIndexMarkerClick(params) {
  return get(`/index/busLineMsgHover`, params);
}
