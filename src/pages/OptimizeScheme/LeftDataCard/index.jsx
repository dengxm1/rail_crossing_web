import React, { Component } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Card, Empty, List, Spin } from 'antd';
import CardForm from '../../../components/CardForm';
import Corner from '../../../components/Corner';
import { lineQuery } from '../../../services/scheme';
import { setDataToTop, getUrlParam } from '../../../utils/utils';

const tabList = [
  {
    key: '1',
    tab: '班次优化',
  },
  {
    key: '0',
    tab: '线路优化',
  },
];
@connect(({ map }) => ({ map }))
class OptimizeLeftDataCard extends Component {
  state = {
    isShow: true, //是否显示左边选项卡片
    analysisPageNum: 1, //分析页分析页数
    analysisPageSize: 20, //分析页1页的大小
    tabIndex: '99', //左边卡片tab
    doeDate: '-1', //出行周期
    travalTime: '0', //出发时间
    exitOption: '', //出发地点
    arrowDirection: '', //分析列表箭头的方向
    showNoneAnalyze: false,
    analyzeLoading: false, //分析列表的加载状态
    isShowRight: false, //是否显示右边的卡片
    analyzeResult: [],
    flowData: [],
    dayPeriod: 5,
  };

  componentDidMount() {
    // this.onTabChange(getUrlParam('key') || '1');
    if (getUrlParam('key')) {
      this.props.onSetTabIndex(getUrlParam('key') || '1');
    }
    this.setState({
      tabIndex: getUrlParam('key') || '1',
    });
  }

  //点击箭头显示或隐藏卡片
  arrowClick = value => {
    const { isShow } = this.state;
    this.setState({
      isShow: !isShow,
    });
  };

  /**
   * 切换分页
   * */
  onChangePage = page => {
    this.setState({
      analysisPageNum: page,
    });
  };
  setIsShowRight = bool => {
    this.setState({
      isShowRight: bool,
    });
  };
  //卡片标签页变化
  onTabChange = key => {
    const { tabIndex } = this.state;
    if (tabIndex === key) return;
    history.pushState(null, null, window.location.pathname);
    this.props.onSetTabIndex(key);
    this.props.onSetIsShowRight(false);
    this.props.onSetHiddenSize('1');
    this.setState({
      tabIndex: key,
      routeId: '',
      stopId: '',
      analyzeResult: [],
      flowData: [],
      showNoneAnalyze: false,
    });
    this.props.dispatch({ type: 'map/clearAllMapData' }); //清除地图标志
    this.props.dispatch({
      type: 'map/setSelectStation',
      payload: {},
    });
  };

  //分析列表选中
  itemChoose = data => {
    const {
      analyzeResult,
      statDate,
      doeDate,
      dayPeriod,
      tabIndex,
    } = this.state;
    analyzeResult.forEach(item => {
      if (
        data.routeId === item.routeId &&
        data.isUpDown === item.isUpDown &&
        data.stationStopId === item.stationStopId
      ) {
        item['flag'] = true;
      } else {
        item['flag'] = false;
      }
    });
    this.setState({
      analyzeResult,
      isShowRight: true,
      routeId: data.routeId,
    });
    let unitData = {
      statDate,
      doeDate,
      dayPeriod,
      routeId: data.routeId,
      isUpDown: data.isUpDown,
      optDesc: data.optDesc,
      optReason: data.optReason,
      optDetail: data.optDetail,
      stationId: this.props.map.metroId,
      stationStopId: data.stationStopId,
    };
    this.props.onSetUnitType(unitData, true);
    // 热力图渲染
    if (tabIndex === '0') {
      this.props.dispatch({
        type: 'map/fetchOptHeatMapData',
        payload: unitData,
      });
    }
    // 地图公交线路渲染线路
    this.props.dispatch({
      type: 'map/fetchOptBusLineMsg',
      payload: {
        ...unitData,
        stationId: this.props.map.metroId,
        optType: tabIndex,
      },
    });
    this.props.dispatch({
      type: 'map/setOptStopMsgItems',
      payload: [
        {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          stopId: data.stationStopId,
          stopName: data.stationStopId,
        },
      ],
    });
  };

  //报告
  onFinish = params => {
    const { tabIndex } = this.state;
    this.setState({
      showNone: false,
      analyzeLoading: true,
      statDate: params.statDate,
      doeDate: params.doeDate,
      dayPeriod: params.dayPeriod,
      analyzeResult: [],
      stopId: '',
    });
    this.props.onSetIsShowRight(false);
    lineQuery({
      statDate: params.statDate,
      doeDate: params.doeDate,
      stationId: params.exitOption,
      optType: tabIndex,
      dayPeriod: params.dayPeriod,
    })
      .then(res => {
        this.setState({
          analyzeLoading: false,
        });
        if (res && res.code === 200) {
          const resData = setDataToTop(
            res.data,
            'routeId',
            getUrlParam('id'),
            getUrlParam('isUpDown'),
            getUrlParam('stopId'),
          );
          this.setState(
            {
              analyzeResult: resData,
              showNoneAnalyze: !resData.length,
            },
            () => {
              if (
                getUrlParam('id') &&
                getUrlParam('stopId') &&
                resData.length
              ) {
                this.itemChoose(resData[0] || {});
              }
            },
          );
        }
      })
      .catch(e => {
        console.log(e);
      });
    // 清除热力图数据
    this.props.dispatch({
      type: 'map/setOptHeatMapData',
      payload: { data: [] },
    });
  };

  render() {
    const {
      isShow,
      showNoneAnalyze,
      analyzeLoading,
      analyzeResult,
      tabIndex,
    } = this.state;
    return (
      <React.Fragment>
        {/*左边的卡片*/}
        <div className={isShow ? styles.optionContain : styles.hiddenContain}>
          <Corner classNL="relativeContainBgL" />
          <div className={styles.relativeContain}>
            {/*展开 收缩按钮*/}
            <div className={styles.flexibleContain}>
              <div className={styles.iconContain} onClick={this.arrowClick}>
                {isShow ? <LeftOutlined /> : <RightOutlined />}
              </div>
            </div>
            {/*表单*/}
            <Card
              bordered={false}
              className={styles.formCard}
              tabList={tabList}
              activeTabKey={tabIndex}
              onTabChange={key => {
                this.onTabChange(key, 'key');
              }}
            >
              <CardForm
                onFinish={this.onFinish}
                key={tabIndex}
                optKey={tabIndex}
                tripTime="0"
              />
            </Card>
            {/* 分析列表*/}
            <div className={styles.analyzeContain}>
              <Spin size="large" spinning={analyzeLoading}>
                {analyzeResult.length ? (
                  <List
                    dataSource={analyzeResult}
                    renderItem={(item, index) => (
                      <List.Item
                        className={`${styles.analyzeListItem} ${
                          item['flag'] ? styles.showBar : ''
                        }`}
                        onClick={() => this.itemChoose(item)}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className={styles.itemIndex}>{index + 1}</div>
                          }
                          title={
                            <div>
                              {item.routeName}
                              <span>
                                ({item.startStopName || ''}
                                -&gt;
                                {item.endStopName || ''})
                              </span>
                            </div>
                          }
                          description={
                            <div className={styles.analyzeTitle}>
                              <div className={styles.path}>
                                优化基于接驳轨交站点：
                                <span>{item.stationStopId}</span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div>
                    {showNoneAnalyze && (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </div>
                )}
              </Spin>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default OptimizeLeftDataCard;
