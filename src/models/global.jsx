import { getSubwayLine } from '../services/global';
import { getUserInfo } from '../services/userServ';
export default {
  namespace: 'global', // 默认与文件名相同
  state: {
    mapTheme: 'light', //地图主题light or dark
    userInfo: {},
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 默认执行
      const id_token = localStorage.getItem('id_token');
      if (id_token) {
        dispatch({ type: 'fetchUserInfo' });
      }
    },
  },
  effects: {
    *fetchUserInfo({ payload, callback }, { put, call }) {
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
      const response = yield call(getUserInfo, payload);
      yield put({
        type: 'setUserInfo',
        payload: response,
      });
    },
  },
  reducers: {
    setMapTheme(state, { payload }) {
      return {
        ...state,
        mapTheme: payload.mapTheme,
      };
    },
    setUserInfo(state, { payload }) {
      return {
        ...state,
        userInfo: payload.data,
      };
    },
  },
};
