import { get, post, put, del } from '../utils/request';

// 基础设施概览查询
export async function getBasisInfo(params) {
  return get(`/index/selectBasisInformation`, params);
}

// 公交客流量分析
export async function getBusPass(params) {
  return get(`/index/selectStopBusPassengercntDistribute`, params);
}

// 轨交客流量分析
export async function getSubwayPass(params) {
  return get(`/index/selectStopSubwayPassengercntDistribute`, params);
}

// 线路满载率排名前五
export async function getTopLoad(params) {
  return get(`/index/selectTopLoadRate`, params);
}

// 线路满载率排名倒数前五
export async function getLastLoad(params) {
  return get(`/index/selectLastLoadRate`, params);
}

// 站点客流量排名前五
export async function getTopStop(params) {
  return get(`/index/selectTopStopSubwayPassengercnt`, params);
}

// 站点客流量排名倒数前五
export async function getLastStop(params) {
  return get(`/index/selectLastStopSubwayPassengercnt`, params);
}
