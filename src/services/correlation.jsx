import request, { get, post, put, del } from '../utils/request';

//获取轨交下拉列表GET /correlation/subwayLineSimple
export async function subwayLineSimple(params) {
  return get(`/correlation/subwayLineSimple`, params);
}

//GET /metro/query
// 轨交站点分析-查询
export async function stationQuery(params) {
  return get(`/metro/query`, params);
}

// 轨交站点分析-OD出行 GET /metro/setOutAndArrive
export async function setOutAndArrive(params) {
  return get(`/metro/setOutAndArrive`, params);
}

//轨交站点分析-客流分析 GET /metro/travel
export async function crowdTravel(params) {
  return get(`/metro/travel`, params);
}

//接驳相关性分析-走向分析-类型分析数据 GET /correlation/types
export async function typesAnalyze(params) {
  return get(`/correlation/types`, params);
}
//轨交站点分析-接驳公交站点 GET /metro/shuttleBusStop
export async function shuttleBusStop(params) {
  return get(`/metro/shuttleBusStop`, params);
}

// GET /metro/studyAndJudge  轨交站点分析-研判分
export async function stationStudyAndJudge(params) {
  return get(`/metro/studyAndJudge`, params);
}

// 接驳公交分析-走向分析-类型分析数据 /bus/trend
export async function typeAnalyze(params) {
  return get(`/bus/trend`, params);
}

//GET /correlation/run
// 接驳相关性分析-走向分析-运行分析数据 GET
export async function runAnalyze(params) {
  return get(`/correlation/run`, params);
}

//接驳相关性分析-站点客流查询 GET /correlation/stationOD
export async function stationOD(params) {
  return get(`/correlation/stationOD`, params);
}
//轨交站点分析-客流分析图表数据-表格 GET /data/metro/travel
export async function busMetroTravel(params) {
  return get(`/data/metro/travel`, params);
}
