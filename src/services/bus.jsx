import request, { get, post, put, del } from '../utils/request';

//接驳公交分析-线路分析 GET /bus/line
export async function busLine(params) {
  return get(`/bus/line`, params);
}

//接驳公交分析-线路分析-查询 GET /bus/query
export async function busLineQuery(params) {
  return get(`/bus/query`, params);
}

//接驳公交分析-班次分析 GET /bus/shift
export async function busShift(params) {
  return get(`/bus/shift`, params);
}

//接驳公交分析-班次分析-查询
export async function busShiftQuery(params) {
  return get(`/bus/shift/query`, params);
}

//GET /bus/site 接驳公交分析-站点分析
export async function busSite(params) {
  return get(`/bus/site`, params);
}

//GET 接驳公交分析-站点分析-查询  GET /bus/site/query
export async function busSiteQuery(params) {
  return get(`/bus/site/query`, params);
}

//GET 接驳公交分析-研判分析  GET /bus/studyAndJudge
export async function judgeAnalysis(params) {
  return get(`/bus/studyAndJudge`, params);
}
