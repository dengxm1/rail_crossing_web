import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { Card, Collapse, Empty, List, Pagination, Spin, Row, Col } from 'antd';
import CardForm from '../../../components/CardForm';
import Corner from '../../../components/Corner';
import { getUrlParam, setDataToTop } from '../../../utils/utils';
import { busLineQuery } from '../../../services/bus';
import { getSubwayLine } from '../../../services/map';
const { Panel } = Collapse;

@connect(({ map }) => ({ map }))
class BusLeftCard extends Component {
  state = {
    isShow: true, //是否显示左边选项卡片
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    analysisPageNum: 1, //分析页分析页数
    analysisPageSize: 20, //分析页1页的大小
    tabIndex: '0', //左边卡片tab
    arrowDirection: -1, //分析列表箭头的方向
    analyzeData: [],
    showNone: false,
    analyzeLoading: false,
    selectedLine: '',
    stationId: '地铁1号线',
  };

  componentDidMount() {
    
  }

  //手风琴onChange事件
  panelChange = value => {
    const { statDate, doeDate, dayPeriod, analyzeData } = this.state;
    this.setState({
      arrowDirection: Number(value),
      selectedLine: '',
    });
    this.props.onSetIsShowRight(false); //关闭右边卡片
    if (typeof value === 'undefined') return;
    let stopId = '';
    analyzeData.forEach((item, index) => {
      if (index === Number(value)) {
        this.setSelectStation(item);
        stopId = item.stopId;
      }
    });
    if (stopId !== getUrlParam('id')) {
      history.pushState(null, null, window.location.pathname);
    }
    this.setState({
      isLoadStopItems: true,
      stopId,
    });
    busLineQuery({
      statDate,
      doeDate,
      dayPeriod,
      stationStopId: analyzeData[Number(value)]['stopId'],
      stationId: this.props.map.metroId,
    })
      .then(res => {
        this.setState({
          isLoadStopItems: false,
        });
        if (res.data) {
          this.props.dispatch({
            type: 'map/setBusLineMsg',
            payload: {
              data: res.data,
            },
          });
          if (getUrlParam('routeId')) {
            res.data = setDataToTop(
              res.data,
              'routeId',
              getUrlParam('routeId'),
              getUrlParam('isUpDown'),
            );
          }
          res.data.forEach(item => {
            item.busStopId = item.routeId;
            item.busStopName = item.routeName;
            item.roadCongestion = item.passengerFlowCoverage;
            item.roadVolume = item.capacityMatch;
          });
          let analyzeLineData = [...analyzeData];
          analyzeLineData[Number(value)]['busStopItems'] = res.data;
          this.setState(
            {
              analyzeData: analyzeLineData,
              showNoneStopItems: !res.data,
            },
            () => {
              if (getUrlParam('routeId')) {
                this.onSelectBusLine(analyzeLineData[0].busStopItems[0]);
              }
            },
          );
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          showNoneStopItems: false,
        });
      });
  };

  //分析接口
  onFinish = (params, stopMsgItems) => {
    this.props.onSetIsShowRight(false);
    this.setState(
      {
        statDate: params.statDate,
        doeDate: params.doeDate,
        dayPeriod: params.dayPeriod,
        stationId: params.exitOption,
        analyzeData: [],
        analyzeLoading: true,
        arrowDirection: -1, //分析列表箭头的方向
      },
      () => {
        if (getUrlParam('metro')) {
          getSubwayLine().then(res => {
            if (res.data) {
              for (let item of res.data) {
                if (getUrlParam('metro') === item.stationId) {
                  const stopItems = setDataToTop(
                    JSON.parse(JSON.stringify(item.stopMsgItems)),
                    'stopId',
                    getUrlParam('id'),
                  );
                  this.setState(
                    {
                      analyzeData: stopItems,
                      showNone: !stopItems.length,
                      analyzeLoading: false,
                    },
                    () => {
                      this.panelChange('0');
                    },
                  );
                }
              }
            }
          });
        } else {
          let _this = this;
          setTimeout(function() {
            _this.setState(
              {
                analyzeData: stopMsgItems,
                showNone: !stopMsgItems.length,
                analyzeLoading: false,
              },
              () => {
                if (getUrlParam('id')) {
                  _this.panelChange('0');
                }
              },
            );
          }, 500);
        }
      },
    );
    this.props.dispatch({
      type: 'map/setSelectStation',
      payload: {},
    });
  };

  // 站点地图定位
  setSelectStation = itemData => {
    if (itemData.lat && itemData.lng) {
      this.props.dispatch({
        type: 'map/setSelectStation',
        payload: {
          stopId: itemData.stopId,
          lat: itemData.lat,
          lng: itemData.lng,
          stopName: itemData.stopName,
          resetShift: true,
        },
      });
    }
  };
  onSelectBusLine = item => {
    if (!item) return;
    const { stationId, statDate, doeDate, stopId, dayPeriod } = this.state;
    this.setState({
      selectedLine: item.routeId + item.isUpDown,
    });
    let params = {
      stationId: stationId,
      statDate: statDate,
      doeDate: doeDate,
      stopId: stopId,
      busStopId: item.busStopId,
      dayPeriod: dayPeriod,
      type: 1,
      routeId: item.routeId,
      isUpDown: item.isUpDown,
      busStopName: `${item.busStopName}路`,
    };
    delete params.busStopItems;
    // 地图公交线路渲染线路
    item.simple = false;
    this.props.dispatch({
      type: 'map/setBusLineMsg',
      payload: {
        data: [item],
      },
    });
    this.props.onSetUnitType(params, true);
  };

  render() {
    const {
      isShow,
      arrowDirection,
      analyzeData,
      showNone,
      analyzeLoading,
      isLoadStopItems,
      showNoneStopItems,
      selectedLine,
    } = this.state;
    return (
      <React.Fragment>
        {/*左边的卡片*/}
        <div className={isShow ? styles.optionContain : styles.hiddenContain}>
          <Corner classNL="relativeContainBgL" />
          <div className={styles.relativeContain}>
            {/*表单*/}
            <div>
              <Card
                bordered={false}
                className={styles.formCard}
                title={<span className={styles.busTitle}>接驳公交分析</span>}
              >
                <CardForm onFinish={this.onFinish} index={1} />
              </Card>
              {/* 分析列表*/}
              <div className={styles.analyzeContain}>
                <Spin size="large" spinning={analyzeLoading}>
                  {analyzeData.length ? (
                    <Collapse
                      accordion
                      expandIconPosition="right"
                      onChange={this.panelChange}
                      activeKey={[arrowDirection]}
                      expandIcon={() => null}
                    >
                      {analyzeData.map((item, index) => (
                        <Panel
                          key={index}
                          header={
                            <div className={styles.panelHeader}>
                              <div className={styles.panelNum}>{index + 1}</div>
                              <div className={styles.panelTitle}>
                                {item.stopName || ''}
                              </div>
                            </div>
                          }
                          extra={
                            <div
                              className={
                                arrowDirection === index
                                  ? styles.arrowDown
                                  : styles.arrow
                              }
                            />
                          }
                        >
                          <Spin
                            size="large"
                            spinning={isLoadStopItems}
                            className={styles.loading_style}
                          >
                            {item['busStopItems'] ? (
                              <List
                                dataSource={item['busStopItems'] || []}
                                className={styles.lineList}
                                renderItem={item => (
                                  <List.Item
                                    extra={
                                      <Row
                                        onClick={() =>
                                          this.onSelectBusLine(item)
                                        }
                                        className={`${styles.lineItems} ${
                                          selectedLine ===
                                          item.routeId + item.isUpDown
                                            ? styles.lineItemsActive
                                            : ''
                                        }`}
                                      >
                                        <Col
                                          span={24}
                                          className={styles.busLineName}
                                        >
                                          <span>
                                            {item.busStopName || ''}路
                                          </span>
                                          <i
                                            title={
                                              (
                                                item.busStopName +
                                                item.startStopName +
                                                item.endStopName
                                              ).length > 16
                                                ? `${item.startStopName}=>${item.endStopName}`
                                                : ''
                                            }
                                          >
                                            (
                                            <b
                                              style={{
                                                maxWidth:
                                                  165 +
                                                  (4 -
                                                    (item.busStopName || '')
                                                      .length) *
                                                    9,
                                              }}
                                            >
                                              {`${item.startStopName}=>${item.endStopName}`}
                                            </b>
                                            )
                                          </i>
                                        </Col>
                                        <Col
                                          span={24}
                                          className={styles.extraTip}
                                        >
                                          换乘时间：
                                          {`${item.transferTime || 0}分钟`}
                                        </Col>
                                      </Row>
                                    }
                                  ></List.Item>
                                )}
                              />
                            ) : (
                              <div>
                                {showNoneStopItems && (
                                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                              </div>
                            )}
                          </Spin>
                        </Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <div>
                      {showNone && (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  )}
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default BusLeftCard;
