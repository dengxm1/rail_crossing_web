import React, { Component } from 'react';
import { connect } from 'dva';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './index.less';
import { Tabs } from 'antd';
import CrowdGraph from './PassengerFlow/CrowdGraph';
import SetOutToAnalysis from './PassengerFlow/SetOutToAnalysis';
import Corner from '../../../components/Corner';
import BusStation from './BusStation';
import NavigationTag from '../../../components/NavigationTag';
import JudgeSuggest from '../../../components/judgeSuggest';
import {
  crowdTravel,
  setOutAndArrive,
  shuttleBusStop,
  stationStudyAndJudge,
} from '../../../services/correlation';
import echarts from 'echarts';
import { getGradualColor, timeText24 } from '../../../utils/utils';

const { TabPane } = Tabs;

@connect(({ map }) => ({ map }))
class CorrelationRightDataCard extends Component {
  state = {
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    tfcunitId: '', //分析列表项的tfcunitId
    flowChecked: [false, false, false],
    isAlreadyGet1: false, //研判接口是否调取
    isAlreadyGet2: false, //客流
    isAlreadyGet3: false, //出行od
    isAlreadyGet4: false, //接驳公交站点
    closeRightCard: false,
    unitData: '',
    isChange: false,
    loadFactor: [], //满载率
    capacityMatching: [], //运能匹配度
    turnover: [], //客运周转量
    tabKey: '1',
    navigationTagSelected: '1',
    tripModeLoding: false,
    tripTimeLoding: false,
    tripDistanceLoding: false,
    originData: [],
    destinationData: [],
    originDataLoading: false,
    timeThan: {},
    sectionTraffic: {},
    passengerFlow: {},
    showNone: false,
    stationTimeLoding: false,
    stationDistanceLoding: false,
    walkTimeData: {},
    waitTimeData: {},
    flowData: [],
    flyLineData: [],
    avgTransTime: '', //研判分析数据
    densityMatch: '', //研判分析数据
    passengerFlow1: '', //研判分析数据
    transFlowMatch: '', //研判分析数据
    lineFocusList: [], //研判公交分析建议
    shiftFocusList: [], //研判公交分析建议
    optDetail: '', //研判公交分析建议
  };
  temp = {
    isAlreadyGet1: false,
    isAlreadyGet2: false,
    isAlreadyGet3: false,
    isAlreadyGet4: false,
  };

  componentDidMount() {
    const { unitData } = this.props;
    if (unitData) {
      this.setState(
        {
          unitData,
        },
        () => {
          this.getStudyAndJudg(); //获取研判的接口
          this.getOutAndArrive(); //获取od出行表格数据(地图画飞线需要)
        },
      );
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    let unitData = nextProps.unitData;
    let boolstatDate = unitData.statDate !== this.props.unitData.statDate;
    let booldoeDate = unitData.doeDate !== this.props.unitData.doeDate;
    let boolstopId = unitData.stopId !== this.props.unitData.stopId;
    let boolweather = unitData.weather !== this.props.unitData.weather;
    if (boolstatDate || booldoeDate || boolstopId || boolweather) {
      // this.getCrowdTravel(unitData);
      this.temp.isAlreadyGet1 = false;
      this.temp.isAlreadyGet2 = false;
      this.temp.isAlreadyGet3 = false;
      this.temp.isAlreadyGet4 = false;
      this.setState(
        {
          unitData,
          navigationTagSelected: '1',
        },
        () => {
          this.getData(); //获取研判的接口
          this.getOutAndArrive(); //获取od出行表格数据(地图画飞线需要)
        },
      );
    }
  }
  //获取研判接口
  getStudyAndJudg = () => {
    const { unitData } = this.state;
    this.setState({ suggusetLoding: true });
    stationStudyAndJudge({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stopId: unitData.stopId,
      weather: unitData.weather,
      stationId: unitData.stationId,
    })
      .then(res => {
        if (res && res.code === 200) {
          this.temp.isAlreadyGet1 = true;
          if (res.data) {
            let arr = [
              { key: 'avgTransTime', value: parseInt(res.data.avgTrlTime) }, //出行时间
              {
                key: 'densityMatch',
                value: parseInt(res.data.avgTrlDistance / 1000),
              }, //出行距离
              {
                key: 'passengerFlow',
                value: res.data.passengerFlow,
              }, //轨交客流强度
              {
                key: 'transFlowMatch',
                value: parseInt(res.data.periodFlowRaiot * 100),
              }, //换乘客流空间匹配度
            ];
            let avgTransTime = 0;
            let avgTransTimeTip = '';
            let densityMatch = 0;
            let densityMatchTip = '';
            let passengerFlow1 = 0;
            let passengerFlowTip = '';
            let transFlowMatch = 0;
            let lineFocusList = res.data.lineFocusList || []; //线路走向
            let shiftFocusList = res.data.shiftFocusList || []; //班次分布
            let optDetail = res.data.optDetail; //分析建议详情
            let flowPeople = res.data.passengerFlow
              ? res.data.passengerFlow
              : 0;
            arr.forEach(item => {
              if (item['key'] === 'avgTransTime') {
                if (item.value > 60) {
                  avgTransTime = '28px';
                  avgTransTimeTip = '>60min';
                } else if (40 < item.value && item.value <= 60) {
                  avgTransTime = '110px';
                  avgTransTimeTip = '40~60min';
                } else if (20 <= item.value && item.value <= 40) {
                  avgTransTime = '197px';
                  avgTransTimeTip = '20~40min';
                } else if (item.value < 20) {
                  avgTransTime = '275px';
                  avgTransTimeTip = '<20min';
                }
              }
              if (item['key'] === 'densityMatch') {
                if (item.value > 15) {
                  densityMatch = '28px';
                  densityMatchTip = '>15KM';
                } else if (10 < item.value && item.value <= 15) {
                  densityMatch = '110px';
                  densityMatchTip = '10-15KM';
                } else if (5 <= item.value && item.value <= 10) {
                  densityMatch = '197px';
                  densityMatchTip = '5-10KM';
                } else if (item.value < 5) {
                  densityMatch = '275px';
                  densityMatchTip = '<5KM';
                }
              }
              if (item['key'] === 'passengerFlow') {
                if (75 < item.value) {
                  passengerFlow1 = '28px';
                  passengerFlowTip = '非常强';
                } else if (50 < item.value && item.value <= 75) {
                  passengerFlow1 = '110px';
                  passengerFlowTip = '强';
                } else if (25 < item.value && item.value <= 50) {
                  passengerFlow1 = '197px';
                  passengerFlowTip = '一般';
                } else if (0 <= item.value && item.value <= 25) {
                  passengerFlow1 = '275px';
                  passengerFlowTip = '弱';
                }
              }
              if (item['key'] === 'transFlowMatch') {
                if (item.value >= 75) {
                  transFlowMatch = '28px';
                } else if (50 <= item.value && item.value < 75) {
                  transFlowMatch = '110px';
                } else if (25 <= item.value && item.value < 50) {
                  transFlowMatch = '197px';
                } else if (item.value < 25) {
                  transFlowMatch = '275px';
                }
              }
            });
            this.setState({
              avgTransTime,
              densityMatch,
              passengerFlow1,
              transFlowMatch,
              suggusetLoding: false,
              lineFocusList,
              shiftFocusList,
              optDetail,
              avgTransTimeTip,
              densityMatchTip,
              passengerFlowTip,
              flowPeople,
            });
          }
        }
      })
      .catch(e => {
        this.setState({
          suggusetLoding: false,
        });
      });
  };

  //获取客流分析接口
  getCrowdTravel = () => {
    const { unitData } = this.state;
    this.setState({
      tripModeLoding: true,
      tripTimeLoding: true,
      tripDistanceLoding: true,
    });
    let params = '';
    if (unitData.doeDate === '-1' && unitData.weather !== '-1') {
      params = {
        statDate: unitData.statDate,
        stopId: unitData.stopId,
        weather: unitData.weather !== '-1' ? unitData.weather : '',
      };
    }
    if (unitData.doeDate !== '-1' && unitData.weather === '-1') {
      params = {
        statDate: unitData.statDate,
        doeDate: unitData.doeDate !== '-1' ? unitData.doeDate : '',
        stopId: unitData.stopId,
      };
    }
    if (unitData.doeDate === '-1' && unitData.weather === '-1') {
      params = {
        statDate: unitData.statDate,
        stopId: unitData.stopId,
      };
    }
    if (unitData.doeDate !== '-1' && unitData.weather !== '-1') {
      params = {
        statDate: unitData.statDate,
        doeDate: unitData.doeDate !== '-1' ? unitData.doeDate : '',
        stopId: unitData.stopId,
        weather: unitData.weather !== '-1' ? unitData.weather : '',
      };
    }
    crowdTravel(params)
      .then(res => {
        this.setState({
          tripModeLoding: false,
          tripTimeLoding: false,
          tripDistanceLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            this.temp.isAlreadyGet2 = true;
            let timeX = ['0-10', '10-20', '20-30', '30-40', '>40'];
            let curTimeData = [];
            let lastTimeData = [];

            //出行时间占比
            timeX.forEach(itemX => {
              res.data.timeThan.curTimeThan.forEach(item => {
                if (itemX == item.timeQuantum) {
                  curTimeData.push(parseInt(item.avgTrlDur * 100));
                }
              });
              res.data.timeThan.lastTimeThan.forEach(item => {
                if (itemX == item.timeQuantum) {
                  lastTimeData.push(parseInt(item.avgTrlDur * 100));
                }
              });
            });
            let timeThan = {
              timeX,
              curTimeData,
              lastTimeData,
            };
            //轨交站点断面客流量
            let sectionOutCnt = [];
            let sectionArriveCnt = [];
            let arriveCnt = res.data.sectionTraffic.getInCnt;
            let setOutCnt = res.data.sectionTraffic.getOutCnt;
            for (let key in setOutCnt) {
              sectionOutCnt.push(setOutCnt[key]);
            }
            for (let key in arriveCnt) {
              sectionArriveCnt.push(arriveCnt[key]);
            }
            let sectionTraffic = {
              sectionX: timeText24(),
              sectionOutCnt,
              sectionArriveCnt,
            };
            //出行客流分布
            let passengerOut = [];
            let passengerArrive = [];
            let passengerX = [];
            res.data.passengerFlowDistribution.getOutCnt.forEach(item => {
              passengerX.push(item.statDate);
              passengerOut.push(item.cnt);
            });
            res.data.passengerFlowDistribution.getInCnt.forEach(item => {
              passengerArrive.push(item.cnt);
            });
            let passengerFlow = {
              passengerOut,
              passengerArrive,
              passengerX,
            };
            this.setState(
              {
                timeThan,
                sectionTraffic,
                passengerFlow,
              },
              () => {
                this.flowChild.initSiteFlow(); //调用子组件的dream方法
                this.flowChild.initWalkTime(); //调用子组件的dream方法
                this.flowChild.initWaitTime(); //调用子组件的dream方法
              },
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          tripModeLoding: false,
          tripTimeLoding: false,
          tripDistanceLoding: false,
        });
      });
  };

  getFlyData = (data, type) => {
    const { selectStation } = this.props.map;
    let flyData = [];
    for (let item of data) {
      flyData.push({
        from:
          type === '出发'
            ? [selectStation.lng, selectStation.lat]
            : [item.lng, item.lat],
        to:
          type === '到达'
            ? [selectStation.lng, selectStation.lat]
            : [item.lng, item.lat],
        color: '#02afff',
      });
    }
    return flyData;
  };
  setFlyLineData = data => {
    const { flyLineData } = this.state;
    this.props.dispatch({
      type: 'map/setFlyLineData',
      payload: data ? data : flyLineData,
    });
  };

  //获取od出行表格数据
  getOutAndArrive = () => {
    const { unitData } = this.state;
    this.setState({
      originDataLoading: true,
    });
    setOutAndArrive({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stopId: unitData.stopId,
      weather: unitData.weather,
    })
      .then(res => {
        if (res) {
          if (res.code === 200) {
            this.temp.isAlreadyGet3 = true;
            this.setState(
              {
                originData: res.data.origin || [],
                destinationData: res.data.destination || [],
                originDataLoading: false,
                flyLineData: [
                  ...this.getFlyData(res.data.origin, '出发'),
                  ...this.getFlyData(res.data.destination, '到达'),
                ],
              },
              () => {
                this.setFlyLineData();
              },
            );
          }
        }
      })
      .catch(e => {
        this.setState({
          originDataLoading: false,
        });
        console.log(e);
      });
  };

  // 设置接驳公交站点数据
  setMapBusStop = data => {
    const { flowData } = this.state;
    this.props.dispatch({
      type: 'map/setBusStopInfo',
      payload: data ? data : flowData,
    });
  };

  //轨交站点分析-接驳公交站点
  getSuttleBusStop = () => {
    const { unitData } = this.state;
    this.setState({
      showNone: false,
      stationTimeLoding: true,
      stationDistanceLoding: true,
    });
    shuttleBusStop({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stopId: unitData.stopId,
      weather: unitData.weather,
    })
      .then(res => {
        if (res && res.code === 200) {
          this.temp.isAlreadyGet4 = true;
          let busStopItem = res.data.busStopItem; //轨交公交站点
          let transferTime = res.data.transferTime; //换乘步行时间
          let transferWaitTime = res.data.transferWaitTime; //换乘等待时间
          let walkTimeXdata = [];
          let walkTimeSeriesData = [];
          let waitTimeXdata = [];
          let waitTimeSeriesData = [];
          transferTime.forEach((item, index) => {
            walkTimeXdata.push(item.stopName);
            let data = {
              name: item.stopName,
              value: parseFloat(item.transferTime),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: getGradualColor(index, 'top'),
                  },
                  {
                    offset: 1,
                    color: getGradualColor(index, 'bottom'),
                  },
                ]),
              },
            };
            walkTimeSeriesData.push(data);
          });
          transferWaitTime.forEach((item, index) => {
            waitTimeXdata.push(item.routeName);
            let data = {
              name: item.routeName,
              value: parseFloat(item.transferWaitTime),
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: getGradualColor(index, 'top'),
                  },
                  {
                    offset: 1,
                    color: getGradualColor(index, 'bottom'),
                  },
                ]),
              },
            };
            waitTimeSeriesData.push(data);
          });
          let walkTimeData = {
            walkTimeXdata,
            walkTimeSeriesData,
          };
          let waitTimeData = {
            waitTimeXdata,
            waitTimeSeriesData,
          };
          this.setState(
            {
              walkTimeData,
              waitTimeData,
              flowData: busStopItem || [],
              showNone: !busStopItem.length,
              stationTimeLoding: false,
              stationDistanceLoding: false,
            },
            () => {
              this.setMapBusStop(); // 地图绘制接驳公交站点
              this.stationChild.initWalkTime(); //调用子组件的dream方法
              this.stationChild.initWaitTime(); //调用子组件的dream方法
            },
          );
        }
      })
      .catch(e => {
        this.setState({
          showNone: true,
          stationTimeLoding: false,
          stationDistanceLoding: false,
        });
      });
  };

  //右边的卡片显示与隐藏
  rightArrowClick = () => {
    const { isShowRight } = this.props;
    this.props.onSetIsShowRight(!isShowRight);
    this.setState({
      hiddenSize: '0',
    });
  };

  //出行分析类型变化
  changeTravelAnalysis = key => {
    this.props.onSetTabKey(key);
  };

  iconChoose = navigationTagSelected => {
    this.setState(
      {
        navigationTagSelected,
      },
      () => {
        this.getData();
      },
    );
    const { flyLineData, flowData } = this.state;
    if (navigationTagSelected === '4') {
      this.setFlyLineData([]);
      if (flowData.length) {
        this.setMapBusStop();
      }
    } else {
      this.setMapBusStop([]);
      if (flyLineData.length) {
        this.setFlyLineData();
      }
    }
  };

  //判断调取哪一个接口
  getData = () => {
    const { navigationTagSelected } = this.state;
    const {
      isAlreadyGet1,
      isAlreadyGet2,
      isAlreadyGet3,
      isAlreadyGet4,
    } = this.temp;
    if (navigationTagSelected === '1' && !isAlreadyGet1) {
      this.getStudyAndJudg(); //获取研判接口
    } else if (navigationTagSelected === '2') {
      if (!isAlreadyGet2) {
        this.getCrowdTravel(); //获取客流接口
      } else {
        this.flowChild.initSiteFlow(); //调用子组件的dream方法
        this.flowChild.initWalkTime(); //调用子组件的dream方法
        this.flowChild.initWaitTime(); //调用子组件的dream方法
      }
    } else if (navigationTagSelected === '3') {
      if (!isAlreadyGet3) {
        this.getOutAndArrive(); //获取od出行接口
      }
    } else if (navigationTagSelected === '4') {
      if (!isAlreadyGet4) {
        this.getSuttleBusStop(); //接驳公交站点
      } else {
        this.stationChild.initWalkTime(); //调用子组件的dream方法
        this.stationChild.initWaitTime(); //调用子组件的dream方法
      }
    }
  };

  onRef = ref => {
    this.flowChild = ref;
  };
  onOdRef = ref => {
    this.odChild = ref;
  };
  onStationRef = ref => {
    this.stationChild = ref;
  };
  setAlreadyGet = params => {
    this.setState(params);
  };

  render() {
    const {
      hiddenSize,
      navigationTagSelected,
      timeThan,
      sectionTraffic,
      passengerFlow,
      originData,
      destinationData,
      originDataLoading,
      showNone,
      stationTimeLoding,
      stationDistanceLoding,
      walkTimeData,
      waitTimeData,
      flowData,
      tripModeLoding,
      tripTimeLoding,
      tripDistanceLoding,
      avgTransTime,
      densityMatch,
      passengerFlow1,
      transFlowMatch,
      suggusetLoding,
      lineFocusList,
      shiftFocusList,
      optDetail,
      avgTransTimeTip,
      densityMatchTip,
      passengerFlowTip,
      flowPeople,
    } = this.state;
    const { isShowRight, unitData } = this.props;
    return (
      <div>
        {/*  右边的卡片*/}
        <div
          className={
            isShowRight
              ? styles.rightCard
              : hiddenSize === '0'
              ? styles.hiddenRelativeContain
              : styles.hiddenRightCard
          }
        >
          <Corner classNR="relativeContainBgR" />
          <div className={styles.rightRelativeContain}>
            <NavigationTag
              selected={navigationTagSelected}
              onIconChoose={this.iconChoose}
              type="station"
            />
            {/*区域颜色提示*/}
            {isShowRight && (
              <div className={styles.right_card_content}>
                {navigationTagSelected === '1' && (
                  <JudgeSuggest
                    avgTransTime={avgTransTime}
                    densityMatch={densityMatch}
                    passengerFlow={passengerFlow1}
                    transFlowMatch={transFlowMatch}
                    avgTransTimeTip={avgTransTimeTip}
                    densityMatchTip={densityMatchTip}
                    passengerFlowTip={passengerFlowTip}
                    flowPeople={flowPeople}
                    suggusetLoding={suggusetLoding}
                    lineFocusList={lineFocusList}
                    shiftFocusList={shiftFocusList}
                    optDetail={optDetail}
                    type="station"
                    unitData={unitData}
                  />
                )}
                {navigationTagSelected === '2' && (
                  <CrowdGraph
                    onRef={this.onRef}
                    unitData={unitData}
                    onSetAlreadyGet={this.setAlreadyGet}
                    tripModeLoding={tripModeLoding}
                    tripTimeLoding={tripTimeLoding}
                    tripDistanceLoding={tripDistanceLoding}
                    timeThan={timeThan}
                    sectionTraffic={sectionTraffic}
                    passengerFlow={passengerFlow}
                  />
                )}
                {navigationTagSelected === '3' && (
                  <SetOutToAnalysis
                    onRef={this.onOdRef}
                    originData={originData}
                    destinationData={destinationData}
                    originDataLoading={originDataLoading}
                  />
                )}
                {navigationTagSelected === '4' && (
                  <BusStation
                    onRef={this.onStationRef}
                    showNone={showNone}
                    stationTimeLoding={stationTimeLoding}
                    stationDistanceLoding={stationDistanceLoding}
                    walkTimeData={walkTimeData}
                    waitTimeData={waitTimeData}
                    flowData={flowData}
                    unitData={unitData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default CorrelationRightDataCard;
