import {
  getBasisInfo,
  getBusPass,
  getSubwayPass,
  getTopLoad,
  getLastLoad,
  getTopStop,
  getLastStop,
} from '../services/home';

export default {
  namespace: 'home', // 默认与文件名相同
  state: {
    selectedMonth: '',
    BasisInfo: {},
    BusPass: {},
    SubwayPass: {},
    TopLoad: [],
    LastLoad: [],
    TopStop: [],
    LastStop: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 默认执行
    },
  },
  effects: {
    *fetchBasisInfo({ payload }, { put, call }) {
      const response = yield call(getBasisInfo, payload);
      yield put({
        type: 'setBasisInfo',
        payload: response,
      });
    },
    *fetchBusPass({ payload }, { put, call }) {
      const response = yield call(getBusPass, payload);
      yield put({
        type: 'setBusPass',
        payload: response,
      });
    },
    *fetchSubwayPass({ payload }, { put, call }) {
      const response = yield call(getSubwayPass, payload);
      yield put({
        type: 'setSubwayPass',
        payload: response,
      });
    },
    *fetchTopLoad({ payload }, { put, call }) {
      const response = yield call(getTopLoad, payload);
      yield put({
        type: 'setTopLoad',
        payload: response,
      });
    },
    *fetchLastLoad({ payload }, { put, call }) {
      const response = yield call(getLastLoad, payload);
      yield put({
        type: 'setLastLoad',
        payload: response,
      });
    },
    *fetchTopStop({ payload }, { put, call }) {
      const response = yield call(getTopStop, payload);
      yield put({
        type: 'setTopStop',
        payload: response,
      });
    },
    *fetchLastStop({ payload }, { put, call }) {
      const response = yield call(getLastStop, payload);
      yield put({
        type: 'setLastStop',
        payload: response,
      });
    },
  },
  reducers: {
    setSelectedMonth(state, { payload }) {
      return {
        ...state,
        selectedMonth: payload.month,
      };
    },
    setBasisInfo(state, { payload }) {
      return {
        ...state,
        BasisInfo: payload.data,
      };
    },
    setBusPass(state, { payload }) {
      return {
        ...state,
        BusPass: payload.data,
      };
    },
    setSubwayPass(state, { payload }) {
      return {
        ...state,
        SubwayPass: payload.data,
      };
    },
    setTopLoad(state, { payload }) {
      let data = payload.data;
      data.sort((a, b) => {
        return b.load_rate - a.load_rate;
      });
      return {
        ...state,
        TopLoad: data,
      };
    },
    setLastLoad(state, { payload }) {
      let data = payload.data;
      data.sort((a, b) => {
        return b.load_rate - a.load_rate;
      });
      return {
        ...state,
        LastLoad: data,
      };
    },
    setTopStop(state, { payload }) {
      let data = payload.data;
      data.sort((a, b) => {
        return b.passenger_cnt - a.passenger_cnt;
      });
      return {
        ...state,
        TopStop: data,
      };
    },
    setLastStop(state, { payload }) {
      let data = payload.data;
      data.sort((a, b) => {
        return b.passenger_cnt - a.passenger_cnt;
      });
      return {
        ...state,
        LastStop: data,
      };
    },
  },
};
