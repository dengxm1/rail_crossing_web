import request, { get, post, put, del } from '../utils/request';

// 获取轨交下拉列表
export async function getSubwayLine(params) {
  return get(`/correlation/subwayLineSimple`, params);
}
