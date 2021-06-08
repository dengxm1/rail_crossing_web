import {
  getSubwayLine,
  busLineMsg,
  corBusLine,
  busLineHeatMap,
  optLineHeatMap,
  optBusLine,
  getIndexMapMsg,
} from '../services/map';
import moment from 'moment';
import { addlatlngArr, getUrlParam } from '../utils/utils';

export default {
  namespace: 'map', // 默认与文件名相同
  state: {
    selectedLayer: 99,
    selectedMonth: moment()
      .subtract(1, 'months')
      .format('YYYYMM'),
    subwayLine: [], //轨交线路
    subFitBounds: false, // 判断轨交渲染后是否要缩放地图
    busFitBounds: false, // 判断公交渲染后是否要缩放地图
    indexBusLine: [], //首页公交线路
    indexMapMsg: [], //公交线路[] //轨交站点[] //公交站点[] //公交线路[] //公交线路[]

    metroId: getUrlParam('metro') || '', //选中轨交id
    cardFormData: '', // 条件参数

    flyLineData: [], // 飞线数据

    corBusLineMsg: [], // 站点分析-公交线路信息-地图
    busStopInfo: [], // 站点分析-接驳公交站点-地图

    busLineMsg: [], //接驳公交分析-公交线路信息-地图
    busLineHeatMapData: [], //接驳公交分析-线路分析-热力图
    selectStation: {}, // 接驳公交分析-选中轨交站点的名称和经纬度

    optLineHeatMapData: [], //优化方案-线路分析-热力图
    optBusLineMsg: [],
    optStopMsgItems: [], //
  },
  subscriptions: {
    setup({ dispatch, history }) {
      // 默认执行
      if (localStorage.getItem('id_token')) {
        dispatch({ type: 'fetchSubwayLine' });
      } else {
        history.listen(location => {
          if (location.pathname === '/' && localStorage.getItem('id_token')) {
            dispatch({ type: 'fetchSubwayLine' });
          }
        });
      }
    },
  },
  effects: {
    *fetchSubwayLine({ type, payload, callback }, { put, call, select }) {
      const response = yield call(getSubwayLine, payload);
      if (callback && typeof callback === 'function') {
        callback(response); // 返回结果
      }
      yield put({
        type: 'setSubwayLine',
        payload: response,
      });
    },
    *fetchBusLineMsg({ payload }, { put, call }) {
      const response = yield call(busLineMsg, payload);
      yield put({
        type: 'setBusLineMsg',
        payload: response,
      });
    },
    *fetchCorBusLine({ payload }, { put, call }) {
      const response = yield call(corBusLine, payload);
      yield put({
        type: 'setCorBusLine',
        payload: response,
      });
    },
    *fetchHeatMapData({ payload }, { put, call }) {
      const response = yield call(busLineHeatMap, payload);
      yield put({
        type: 'setHeatMapData',
        payload: response,
      });
    },
    *fetchOptHeatMapData({ payload }, { put, call }) {
      const response = yield call(optLineHeatMap, payload);
      yield put({
        type: 'setOptHeatMapData',
        payload: response,
      });
    },
    *fetchOptBusLineMsg({ payload }, { put, call }) {
      const response = yield call(optBusLine, payload);
      yield put({
        type: 'setOptBusLineMsg',
        payload: response,
      });
    },
    *fetchIndexMapMsg({ payload }, { put, call }) {
      const response = yield call(getIndexMapMsg, payload);
      yield put({
        type: 'setIndexMapMsg',
        payload: response,
      });
    },
  },
  reducers: {
    setSubwayLine(state, { payload }) {
      return {
        ...state,
        subwayLine: addlatlngArr(payload.data),
      };
    },
    setSubFitBounds(state, { payload }) {
      return {
        ...state,
        subFitBounds: payload,
      };
    },
    setBusFitBounds(state, { payload }) {
      return {
        ...state,
        busFitBounds: payload,
      };
    },
    setIndexBusLine(state, { payload }) {
      return {
        ...state,
        indexBusLine: payload,
      };
    },
    setBusLineMsg(state, { payload }) {
      return {
        ...state,
        busLineMsg: addlatlngArr(payload.data),
      };
    },
    setCorBusLine(state, { payload }) {
      return {
        ...state,
        corBusLineMsg: addlatlngArr([payload.data]),
        busFitBounds: true,
      };
    },
    setBusStopInfo(state, { payload }) {
      return {
        ...state,
        busStopInfo: payload,
      };
    },
    setMetroId(state, { payload }) {
      return {
        ...state,
        metroId: payload.metroId,
        cardFormData: payload.cardFormData,
        subFitBounds: payload.subFitBounds,
      };
    },
    setSelectStation(state, { payload }) {
      if (payload.resetShift) {
        state.cardFormData.shiftAnalysis = false;
        delete payload.resetShift;
      }
      return {
        ...state,
        selectStation: payload,
        cardFormData: state.cardFormData,
      };
    },
    setHeatMapData(state, { payload }) {
      return {
        ...state,
        busLineHeatMapData: payload.data,
      };
    },
    setOptHeatMapData(state, { payload }) {
      return {
        ...state,
        optLineHeatMapData: payload.data,
      };
    },
    setOptBusLineMsg(state, { payload }) {
      return {
        ...state,
        optBusLineMsg: addlatlngArr([payload.data]),
        busFitBounds: true,
      };
    },
    setIndexMapMsg(state, { payload }) {
      return {
        ...state,
        indexMapMsg: payload.data,
      };
    },
    setSelectedMonth(state, { payload }) {
      return {
        ...state,
        selectedMonth: payload.month,
      };
    },
    setSelectedLayer(state, { payload }) {
      return {
        ...state,
        selectedLayer: payload.layer,
      };
    },
    setOptStopMsgItems(state, { payload }) {
      return {
        ...state,
        optStopMsgItems: payload,
      };
    },
    setFlyLineData(state, { payload }) {
      return {
        ...state,
        flyLineData: payload,
      };
    },
    clearAllMapData(state) {
      return {
        ...state,
        metroId: '', //选中轨交id
        cardFormData: '', // 条件参数
        busLineMsg: [], //接驳公交分析-公交线路信息-地图
        busLineHeatMapData: [], //接驳公交分析-线路分析-热力图
        corBusLineMsg: [], // 接驳相关性分析-公交线路信息-地图
        busStopInfo: [], // 站点分析-接驳公交站点-地图
        selectStation: {}, // 接驳公交分析-选中轨交站点的名称和经纬度
        optLineHeatMapData: [], //接驳公交分析-线路分析-热力图
        optBusLineMsg: [],
        optStopMsgItems: [],
        flyLineData: [],
      };
    },
  },
};
