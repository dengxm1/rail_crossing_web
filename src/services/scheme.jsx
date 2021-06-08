import request, { get, post, put, del } from '../utils/request';

//接驳方案优化-线路优化-现状展示 GET /optimization/line/actuality
export async function lineActuality(params) {
  return get(`/optimization/line/actuality`, params);
}

//接驳方案优化-线路优化-线路预评估结果 GET /optimization/line/assess
export async function lineAssess(params) {
  return get(`/optimization/line/assess`, params);
}
//接驳方案优化-线路优化-现状展示-目的地热力图  GET /optimization/line/heatMap
export async function lineHeatMap(params) {
  return get(`/optimization/line/heatMap`, params);
}

//接驳方案优化-查询  GET /optimization/line/query
export async function lineQuery(params) {
  return get(`/optimization/line/query`, params);
}

// 接驳方案优化-班次优化-线路预评估结果 //GET /optimization/shift/assess
export async function shiftAssess(params) {
  return get(`/optimization/shift/assess`, params);
}

// 接驳方案优化-班次优化-现状展示
export async function shiftOriginal(params) {
  return get(`/optimization/shift/actuality`, params);
}
