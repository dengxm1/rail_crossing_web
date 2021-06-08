import { get, post, put, del } from '../utils/request';

// 报告分页查询
export async function getReport(params) {
  return get(`/report/page`, params);
}

// 日志分页查询
export async function getLog(params) {
  return get(`/report/logs/page`, params);
}

// 订阅邮箱分页查询
export async function getEmial(params) {
  return get(`/report/email/page`, params);
}

//根据id删除订阅邮箱
export async function delEmial(params) {
  return del(`/report/email/${params.id}`);
}

//新增订阅邮箱POST /report/email
export async function addEmial(params) {
  return post(`/report/email`, params);
}

//更新订阅邮箱
export async function updataEmial(params) {
  return put(`/report/email`, params);
}

//新增订阅关注POST /report/focus
export async function addTakeAttention(params) {
  return post(`/report/focus`, params);
}
// 更新订阅关注
export async function updataTakeAttention(params) {
  return put(`/report/focus`, params);
}
// 订阅关注分页查询
export async function getTakeAttention(params) {
  return get(`/report/focus/page`, params);
}
// 区域下拉列表
export async function getTakeSimple(params) {
  return post(`/report/focus/simple/${params.subUnitTypeNo}`);
}
//DELETE /report/focus/{id}
// 根据id删除订阅关注
export async function delTakeAttention(params) {
  return del(`/report/focus/${params.id}`);
}

//手动报表生成
export async function generateReport(params) {
  return get(`/report/generateReport/${params.id}`);
}

//邮箱推送
export async function mailDelivery(params) {
  return post(`/report/email/delivery/${params.id}`);
}
