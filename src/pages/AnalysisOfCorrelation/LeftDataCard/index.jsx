import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { Card, Spin } from 'antd';
import CardForm from '../../../components/CardForm';
import Corner from '../../../components/Corner';
import { typesAnalyze, stationQuery } from '../../../services/correlation';
import moment from 'moment';
import { getUrlParam, setDataToTop } from '../../../utils/utils';
import Filtrate from '../../../components/Filtrate';
import FlowSortList from '../../../components/FlowSortList';

@connect(({ map }) => ({ map }))
class CorrelationLeftCard extends Component {
  state = {
    isShow: true, //是否显示左边选项卡片
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    cardTabIndex: '0', //左边卡片tab
    statMonth: moment('2020-08', 'YYYYMM'), //月份
    dayPeriod: '0', //出行方式
    doeDate: '-1', //工作日/非工作日
    statDate: moment()
      .subtract(1, 'months')
      .format('YYYYMM'), //出发月份
    stationId: '地铁1号线', //出发地点
    weather: '-1', //天气  晴天/阴雨天
    arrowDirection: '', //分析列表箭头的方向
    showNone: false,
    analyzeLoading: false, //分析列表的加载状态
    isShowRight: false, //是否显示右边的卡片
    analyzeData: [],
    tabIndex: '1',
    flowLoading: false,
    flowData: [],
    routeId: '',
    stopId: '',
    filterType: 0, //0客流强度，1出行时间 2.出行距离
  };

  componentDidMount() {
    this.onTabChange(getUrlParam('key') || '1');
  }

  //点击箭头显示或隐藏卡片
  arrowClick = value => {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow,
    });
  };

  //卡片标签页变化
  onTabChange = key => {
    const { tabIndex } = this.state;
    if (tabIndex === key) return;
    this.props.onSetTabIndex(key);
    this.props.onSetIsShowRight(false);
    this.setState({
      tabIndex: key,
      routeId: '',
      stopId: '',
      analyzeData: [],
      flowData: [],
      showNone: false,
    });
    this.props.dispatch({ type: 'map/clearAllMapData' }); //清除地图标志
  };

  //分析接口
  onFinish = params => {
    this.props.onSetIsShowRight();
    this.props.onSetTabKey('1');
    console.log('params', params);
    this.setState(
      {
        analyzeLoading: true,
        statDate: params.statDate,
        doeDate: params.doeDate,
        weather: params.travalWeather,
        stationId: params.exitOption,
        stopId: '',
      },
      () => {
        this.getStationQuery();
      },
    );
  };

  //客流分析单个类表选择
  flowItemChoose = target => {
    const {
      flowData,
      weather,
      statDate,
      doeDate,
      stopId,
      stationId,
    } = this.state;
    if (stopId === target.stopId) return;
    flowData.forEach(item => {
      if (target.stopId === item.stopId) {
        item['flag'] = true;
      } else {
        item['flag'] = false;
      }
    });
    this.setState({
      flowData,
      isShowRight: true,
      stopId: target.stopId,
    });
    target.weather = weather;
    target.statDate = statDate;
    target.doeDate = doeDate;
    target.stationId = stationId;
    this.props.onSetUnitType(target, true);
    // 站点地图定位
    this.selectStation(target);
    // 热力图渲染
    // this.props.dispatch({
    //   type: 'map/fetchHeatMapData',
    //   payload: target,
    // });
    // 地图公交线路渲染线路
    target.type = 0;
    // this.props.dispatch({
    //   type: 'map/fetchBusLineMsg',
    //   payload: target,
    // });
  };
  selectStation = target => {
    if (target.lat && target.lng) {
      this.props.dispatch({
        type: 'map/setSelectStation',
        payload: {
          stopId: target.stopId,
          lat: target.lat,
          lng: target.lng,
          stopName: target.stopName,
        },
      });
    }
  };

  //轨交结果列表筛选
  onFilterChange = type => {
    this.props.onSetIsShowRight(false);
    this.setState(
      {
        filterType: type,
        analyzeLoading: true,
      },
      () => {
        this.getStationQuery();
      },
    );
  };

  //分析结果接口调取
  getStationQuery = () => {
    const { statDate, doeDate, weather, stationId, filterType } = this.state;
    stationQuery({
      statDate,
      doeDate,
      stationId,
      weather,
      type: filterType,
    })
      .then(res => {
        if (res && res.code === 200) {
          const resData = setDataToTop(res.data, 'stopId', getUrlParam('id'));
          this.setState(
            {
              flowData: res.data || [],
              showNone: !res.data.length,
              analyzeLoading: false,
            },
            () => {
              if (getUrlParam('id')) {
                this.flowItemChoose(resData[0] || {});
                this.selectStation(resData[0] || {});
              }
            },
          );
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          showNone: false,
          analyzeLoading: false,
        });
      });
  };

  render() {
    const {
      isShow,
      showNone,
      analyzeLoading,
      tabIndex,
      flowData,
      filterType,
    } = this.state;
    return (
      <React.Fragment>
        {/*左边的卡片*/}
        <div className={isShow ? styles.optionContain : styles.hiddenContain}>
          <Corner classNL="relativeContainBgL" />
          <div className={styles.relativeContain}>
            <div>
              {/*表单*/}
              <Card
                bordered={false}
                className={styles.formCard}
                title={<span className={styles.busTitle}>轨交站点分析</span>}
              >
                <CardForm
                  tripTime="0"
                  tabIndex={tabIndex}
                  onFinish={this.onFinish}
                />
              </Card>
              {/* 分析列表*/}
              <div
                className={`${styles.analyzeContain2} ${
                  tabIndex === '0'
                    ? styles.correlationAnalyze
                    : styles.flowAnalyze
                }`}
              >
                {flowData.length ? (
                  <Filtrate
                    filterType={filterType}
                    onFilterChange={this.onFilterChange}
                  />
                ) : null}
                <Spin size="large" spinning={analyzeLoading}>
                  <FlowSortList
                    type={filterType}
                    flowData={flowData}
                    showNone={showNone}
                    onFlowItemChoose={this.flowItemChoose}
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default CorrelationLeftCard;
