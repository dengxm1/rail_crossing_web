/**
 * 请求方法
 */
import qs from 'qs';
import { message } from 'antd';
import { api } from '../utils/url';

const fetch = require('dva').fetch;
message.config({
  maxCount: 1,
});
const checkStatus = res => {
  if (200 >= res.status < 300) {
    return res;
  }
  if (res.msg) {
    message.error(`${res.msg}`);
  }
  /*  message.error(`网络请求失败,${res.status}`);
    const error = new Error(res.statusText);
    error.response = response;
    throw error;*/
};

/**
 *  捕获成功登录过期状态码等
 * @param res
 * @returns {*}
 */
const judgeOkState = async res => {
  const cloneRes = await res.clone().json();
  if (cloneRes.code === 904) {
    //904未登录状态无权进入系统
    if (window.location.pathname !== '/userLogin') {
      message.error('登录已过期，请重新登录！');
      // window.location.href = '/userLogin';
    }
    return;
  }
  if (cloneRes.code !== 200) {
    if (cloneRes.msg) {
      message.error(`${cloneRes.msg}`);
    }
  }
  return res;
};

class http {
  /**
   *静态的fetch请求通用方法
   * @param url
   * @param options
   * @returns {Promise<unknown>}
   */
  static async staticFetch(url = '', options = {}) {
    const defaultOptions = {
      /*允许携带cookies*/
      credentials: 'include',
      /*允许跨域**/
      mode: 'cors',
      headers: {
        id_token: localStorage.getItem('id_token'),
        // token: null,
        // Authorization: null,
        // 当请求方法是POST，如果不指定content-type是其他类型的话，默认为如下:
        // 'content-type': 'application/x-www-form-urlencoded',
      },
    };
    if (options.method === 'POST' || 'PUT') {
      defaultOptions.headers['Content-Type'] =
        'application/json; charset=utf-8';
    }
    const newOptions = { ...defaultOptions, ...options };
    return fetch(api + url, newOptions)
      .then(checkStatus)
      .then(judgeOkState)
      .then(res => res.json());
  }

  /**
   *post请求方式
   * @param url
   * @returns {Promise<unknown>}
   */
  post(url, params = {}, option = {}) {
    const options = Object.assign({ method: 'POST' }, option);
    //一般我们常用场景用的是json，所以需要在headers加Content-Type类型
    options.body = JSON.stringify(params);

    //可以是上传键值对形式，也可以是文件，使用append创造键值对数据
    if (options.type === 'FormData' && options.body !== 'undefined') {
      let params = new FormData();
      for (let key of Object.keys(options.body)) {
        params.append(key, options.body[key]);
      }
      options.body = params;
    }
    return http.staticFetch(url, options); //类的静态方法只能通过类本身调用
  }

  /**
   * put方法
   * @param url
   * @returns {Promise<unknown>}
   */
  put(url, params = {}, option = {}) {
    const options = Object.assign({ method: 'PUT' }, option);
    options.body = JSON.stringify(params);
    return http.staticFetch(url, options); //类的静态方法只能通过类本身调用
  }

  /**
   * get请求方式
   * @param url
   * @param option
   */
  get(url, option = {}) {
    return http.staticFetch(url + '?' + qs.stringify(option), {
      method: 'GET',
    });
  }

  /**
   * delete请求方式
   * @param url
   */
  del(url) {
    return http.staticFetch(url, { method: 'DELETE' });
  }
}

const request = new http(); //new生成实例
export const { post, get, put, del } = request;
export default request;
