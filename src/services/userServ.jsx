import request, { get, post, put } from '../utils/request';
import { stringify } from 'qs';
//获取当前用户信息
export async function getUserInfo(params) {
  return get(`/auto/isLogin`, params);
}

//请求用户列表
export async function getUserList(params) {
  return get(`/auto/jwtAccountPage`, params);
}

//新增用户
export async function addUser(params) {
  return get(`/auto/addAccount`, params);
}

//修改用户
export async function editUser(params) {
  return post(`/auto/updateAccount?${stringify(params)}`);
}

//删除用户
export async function delUser(params) {
  return get(`/auto/delAccount`, params);
}

//退出登录
export async function logoutUser(params) {
  return get(`/auto/loginOut`, params);
}

//重置密码
export async function resetPassword(params) {
  return get(`/auto/resetPwd`, params);
}
