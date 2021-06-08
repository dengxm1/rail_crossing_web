import React, { Component } from 'react';
import { connect } from 'dva';
import TrendAnalysis from './TrendAnalysis';
import TrainAnalysis from './TrainAnalysis';
import OperationAnalysis from './OperationAnalysis';
import styles from './index.less';
import { Card, Row, Col, Button } from 'antd';
import Corner from '../../../components/Corner';
import icon_goTo from '../../../static/img/icon_goTo.png';
import NavigationTag from '../../../components/NavigationTag';
import JudgeSuggest from '../../../components/judgeSuggest';
import { typeAnalyze } from '../../../services/correlation';
import { busLine, busShift, judgeAnalysis } from '../../../services/bus';
import { getEchartsColor, timeText24, transToTime } from '../../../utils/utils';
@connect(({ map }) => ({ map }))
class RightContent extends Component {
  state = {
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    tfcunitId: '', //分析列表项的tfcunitId
    flowChecked: [false, false, false],
    closeRightCard: false,
    optDetail: '',
    navigationTagSelected: '1',
    trendData: {}, //走向分析的数据
    lineModeLoding: false,
    lineTimeLoding: false,
    lineDistanceLoding: false,
    loadFactor: {}, //满载率
    capacityMatching: {}, //运能匹配度
    busLineInfo: {}, //线路运行分析
    turnover: {}, //客运周转量
    section: {}, //班次分析数据
    depShiftData: {}, //班次分析数据
    densityData: {}, //班次分析数据
    busShiftInfo: {}, //班次分析数据
    staionModeLoding: false,
    stationTimeLoding: false,
    stationDistanceLoding: false,
    avgTransTime: '', //研判分析数据
    densityMatch: '', //研判分析数据
    passengerFlow: '', //研判分析数据
    transFlowMatch: '', //研判分析数据
    lineOptDetail: null,
    shiftOptDetail: null,
  };

  temp = {
    isAlreadyGet1: false, //判断是否再次调用接口
    isAlreadyGet2: false,
    isAlreadyGet3: false,
    isAlreadyGet4: false,
  };

  componentDidMount() {
    const { unitData } = this.props;
    this.setState(
      {
        unitData,
      },
      () => {
        if (unitData) {
          this.getStudyAndJudg(); //获取研判的接口
        }
      },
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    let unitData = nextProps.unitData;
    let boolstatDate = unitData.statDate !== this.props.unitData.statDate;
    let boolIsUpDown = unitData.isUpDown !== this.props.unitData.isUpDown;
    let booldoeDate = unitData.doeDate !== this.props.unitData.doeDate;
    let boolstopId = unitData.stopId !== this.props.unitData.stopId;
    let boolRouteId = unitData.routeId !== this.props.unitData.routeId;
    let boolweather = unitData.weather !== this.props.unitData.weather;
    if (
      boolstatDate ||
      booldoeDate ||
      boolstopId ||
      boolweather ||
      boolRouteId ||
      boolIsUpDown
    ) {
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
          this.setCurType(false);
        },
      );
    }
  }
  // 判断是否是班次分析true, 其他false
  setCurType = bool => {
    const { metroId, cardFormData } = this.props.map;
    cardFormData.shiftAnalysis = bool;
    this.props.dispatch({
      type: `map/setMetroId`,
      payload: {
        metroId: metroId, //选中轨交id
        cardFormData: cardFormData, // 条件参数
        subFitBounds: false,
      },
    });
  };

  //判断调取哪一个接口
  getData = () => {
    const { navigationTagSelected, trendData } = this.state;
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
        this.getTypeAnalyze(); //获取运行分析数据
      } else {
        this.trendChild.setLineOption(trendData);
      }
    } else if (navigationTagSelected === '3') {
      if (!isAlreadyGet3) {
        this.getRunAnalyze(); //获取接驳线路分析数据
      } else {
        this.lineChild.initWalkTime();
        this.lineChild.initSiteFlow(); //客运周转量（客运量*运距）
        this.lineChild.initWaitTime(); //满载率
      }
    } else if (navigationTagSelected === '4') {
      if (!isAlreadyGet4) {
        this.getBusShift(); //接驳公交站点
      } else {
        this.stationChild.initSection(); //轨交站点断面出行人次
        this.stationChild.initBusStart(); //公交发车班次分布
        this.stationChild.initBusArrive(); //公交到站/班次密度
      }
    }
  };

  //获取研判接口
  getStudyAndJudg = () => {
    const { unitData } = this.state;
    this.setState({ suggusetLoding: true });
    judgeAnalysis({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stationId: unitData.stationId,
      stopId: unitData.stopId,
      routeId: unitData.routeId,
      isUpDown: unitData.isUpDown,
    }).then(res => {
      if (res && res.code === 200) {
        this.temp.isAlreadyGet1 = true;
        if (res.data) {
          let arr = [
            { key: 'avgTransTime', value: parseInt(res.data.avgTransTime) }, //平均换乘等待时间
            { key: 'densityMatch', value: parseInt(res.data.densityMatch) }, //班次匹配程度
            {
              key: 'passengerFlow',
              value: parseInt(res.data.passengerFlow),
            }, //公交客流强度
            {
              key: 'transFlowMatch',
              value: parseInt(res.data.transFlowMatch * 100),
            }, //换乘客流空间匹配度
          ];
          let avgTransTime = 0;
          let avgTransTimeTip = '';
          let densityMatch = 0;
          let densityMatchTip = '';
          let passengerFlow = 0;
          let passengerFlowTip = '';
          let transFlowMatch = 0;
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
              } else if (10 < item.value && item.value <= 15) {
                densityMatch = '110px';
              } else if (5 <= item.value && item.value <= 10) {
                densityMatch = '197px';
              } else if (item.value < 5) {
                densityMatch = '275px';
              }
            }
            if (item['key'] === 'passengerFlow') {
              if (75 < item.value && item.value <= 100) {
                passengerFlow = '28px';
                passengerFlowTip = '非常强';
              } else if (50 < item.value && item.value <= 75) {
                passengerFlow = '110px';
                passengerFlowTip = '强';
              } else if (25 < item.value && item.value <= 50) {
                passengerFlow = '197px';
                passengerFlowTip = '一般';
              } else if (0 <= item.value && item.value <= 25) {
                passengerFlow = '275px';
                passengerFlowTip = '弱';
              }
            }
            if (item['key'] === 'transFlowMatch') {
              if (item.value > 50) {
                transFlowMatch = '28px';
              } else if (40 < item.value && item.value <= 50) {
                transFlowMatch = '110px';
              } else if (30 <= item.value && item.value <= 40) {
                transFlowMatch = '197px';
              } else if (item.value < 30) {
                transFlowMatch = '275px';
              }
            }
          });
          this.setState({
            avgTransTime,
            densityMatch,
            passengerFlow,
            transFlowMatch,
            avgTransTimeTip,
            passengerFlowTip,
            suggusetLoding: false,
            lineOptDetail: res.data.lineOptDetail,
            shiftOptDetail: res.data.shiftOptDetail,
          });
        }
      }
    });
  };

  //获取班次分析接口
  getBusShift = () => {
    const { unitData } = this.state;
    this.setState({
      staionModeLoding: true,
      stationTimeLoding: true,
      stationDistanceLoding: true,
    });
    busShift({ ...unitData })
      .then(res => {
        this.setState({
          staionModeLoding: false,
          stationTimeLoding: false,
          stationDistanceLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            this.temp.isAlreadyGet4 = true;
            this.setOptDetail(res.data.optDetail);
            let busShiftInfo = res.data.busShiftInfo; //线路走向分析
            let sectionTraffic = res.data.sectionTraffic; //轨交站点断面出行人次
            let depShift = res.data.depShift; //公交发车班次分布
            let arrDensity = res.data.arrDensity; //公交到站/班次密度
            //轨交站点断面出行人次--出站客流
            let sectionOut = [];
            let sectionArrive = [];
            let secTionX = timeText24();
            let setOutCnt = sectionTraffic.getOutCnt;
            let arriveCnt = sectionTraffic.getInCnt;
            for (let key in setOutCnt) {
              sectionOut.push(setOutCnt[key]);
            }
            for (let key in arriveCnt) {
              sectionArrive.push(arriveCnt[key]);
            }
            let section = {
              sectionOut,
              sectionArrive,
              secTionX,
            };
            //公交发车班次分布
            let depShiftSeries = [];
            let depShiftX = [];
            let num = 0;
            for (let key in depShift) {
              let data = [];
              let seriesData = {
                type: 'line',
                smooth: 0.6,
                color: getEchartsColor(num), //moon_people_time_color
                symbol: 'circle',
              };
              depShift[key].forEach(item => {
                if (num === 0) {
                  depShiftX.push(transToTime(item.stepIndex));
                }

                data.push(item.depSum);
              });
              seriesData.name = key;
              seriesData.data = data;
              depShiftSeries.push(seriesData);
              num++;
            }
            let depShiftData = {
              depShiftSeries,
              depShiftX: timeText24(),
            };
            //公交到站/班次密度
            let densitySeries = [];
            let densityX = [];
            let num2 = 0;
            for (let key in arrDensity) {
              let data = [];
              let seriesData = {
                type: 'line',
                smooth: 0.6,
                color: getEchartsColor(num2), //moon_people_time_color
                symbol: 'circle',
              };
              arrDensity[key].forEach(item => {
                if (num2 === 0) {
                  densityX.push(transToTime(item.stepIndex));
                }

                data.push(item.arrDensity);
              });
              seriesData.name = key;
              seriesData.data = data;
              densitySeries.push(seriesData);
              num2++;
            }
            let densityData = {
              densitySeries,
              densityX: timeText24(),
            };
            this.setState(
              {
                section, //轨交站点断面出行人次
                depShiftData, //公交发车班次分布
                densityData, //公交到站/班次密度
                busShiftInfo, //线路走向分析
              },
              () => {
                this.stationChild.initSection(); //轨交站点断面出行人次
                this.stationChild.initBusStart(); //公交发车班次分布
                this.stationChild.initBusArrive(); //公交到站/班次密度
              },
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  onTrendRef = ref => {
    this.trendChild = ref;
  };
  onLineRef = ref => {
    this.lineChild = ref;
  };
  onStationRef = ref => {
    this.stationChild = ref;
  };

  //获取走向分析数据
  getTypeAnalyze = () => {
    const { unitData } = this.state;
    this.setState({
      trendLoding: true,
    });
    typeAnalyze({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stationId: unitData.stationId,
      stopId: unitData.stopId,
      routeId: unitData.routeId,
      isUpDown: unitData.isUpDown,
    })
      .then(res => {
        this.setState({
          trendLoding: false,
        });
        if (res && res.code === 200) {
          this.temp.isAlreadyGet2 = true;
          this.setState({
            trendData: res.data || {},
          });
          this.trendChild.setLineOption(res.data);
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          trendLoding: false,
        });
      });
  };

  //获取线路分析数据
  getRunAnalyze = () => {
    const { unitData } = this.state;
    this.setState({
      lineModeLoding: true,
      lineTimeLoding: true,
      lineDistanceLoding: true,
    });
    busLine({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      stationId: unitData.stationId,
      stopId: unitData.stopId,
      routeId: unitData.routeId,
      isUpDown: unitData.isUpDown,
    })
      .then(res => {
        this.setState({
          lineModeLoding: false,
          lineTimeLoding: false,
          lineDistanceLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            this.temp.isAlreadyGet3 = true;
            let curloadFactor = []; //满载率
            let lastloadFactor = [];
            let timeX = [];
            let curCapacityMatching = []; //运能匹配度
            let lastCapacityMatching = [];
            let capacityX = [];

            let curTurnover = []; //客运周转量
            let lastTurnover = []; //客运周转量
            let turnoverX = []; //客运周转量
            let busLineInfo = res.data.busLineInfo;
            res.data.loadFactor.curLoadFactor.forEach(item => {
              curloadFactor.push(Math.floor(item.loadRate * 100));
              timeX.push(this.lineChild.transToTime(item.stepIndex));
            });
            res.data.loadFactor.lastLoadFactor.forEach(item => {
              lastloadFactor.push(Math.floor(item.loadRate * 100));
            });
            res.data.capacityMatching.curCapacityMatching.forEach(item => {
              curCapacityMatching.push(Math.floor(item.axisY * 100));
              capacityX.push(this.lineChild.transToTime(item.axisX));
            });
            res.data.capacityMatching.lastCapacityMatching.forEach(item => {
              lastCapacityMatching.push(Math.floor(item.axisY * 100));
            });
            res.data.turnover.curTurnover.forEach(item => {
              curTurnover.push(item.passengerTurnover);
              turnoverX.push(item.dayOfWeek);
            });
            res.data.turnover.lastTurnover.forEach(item => {
              lastTurnover.push(item.passengerTurnover);
            });
            let loadFactor = {
              curloadFactor: curloadFactor,
              lastloadFactor: lastloadFactor,
              timeX: timeText24(),
            };
            let capacityMatching = {
              curCapacityMatching: curCapacityMatching,
              lastCapacityMatching: lastCapacityMatching,
              capacityX: timeText24(),
            };
            let turnover = {
              curTurnover,
              lastTurnover, //客运周转量
              turnoverX,
            };
            this.setState(
              {
                loadFactor, //满载率
                capacityMatching, //运能匹配度
                turnover, //客运周转量
                busLineInfo,
              },
              () => {
                this.lineChild.initWalkTime();
                this.lineChild.initSiteFlow(); //客运周转量（客运量*运距）
                this.lineChild.initWaitTime(); //满载率
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

  setOptDetail = value => {
    this.setState({
      optDetail: value,
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

  // tab页切换
  iconChoose = selectedTag => {
    this.setState(
      {
        navigationTagSelected: selectedTag,
      },
      () => {
        this.getData();
      },
    );
    const { navigationTagSelected } = this.state;
    if (
      (selectedTag === '4' && navigationTagSelected !== '4') ||
      (selectedTag !== '4' && navigationTagSelected === '4')
    ) {
      this.setCurType(!!(selectedTag === '4'));
    }
  };

  render() {
    const {
      hiddenSize,
      closeRightCard,
      optDetail,
      navigationTagSelected,
      trendData,
      lineModeLoding,
      lineTimeLoding,
      lineDistanceLoding,
      loadFactor, //满载率
      capacityMatching, //运能匹配度
      turnover, //客运周转量
      section, //轨交站点断面出行人次
      depShiftData, //公交发车班次分布
      densityData, //公交到站/班次密度
      staionModeLoding,
      stationTimeLoding,
      stationDistanceLoding,
      busShiftInfo,
      busLineInfo,
      avgTransTime,
      densityMatch,
      passengerFlow,
      transFlowMatch,
      suggusetLoding,
      trendLoding,
      lineOptDetail,
      shiftOptDetail,
      avgTransTimeTip,
      passengerFlowTip,
    } = this.state;
    const { unitData, isShowRight } = this.props;
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
              type="bus"
              selected={navigationTagSelected}
              onIconChoose={this.iconChoose}
            />
            {/*区域颜色提示*/}
            <div
              className={`${styles.right_chart_card} ${styles.crowdContent} ${
                closeRightCard ? styles.right_chart_card_visible : ''
              }`}
            >
              {navigationTagSelected === '1' && (
                <JudgeSuggest
                  avgTransTime={avgTransTime}
                  densityMatch={densityMatch}
                  passengerFlow={passengerFlow}
                  avgTransTimeTip={avgTransTimeTip}
                  passengerFlowTip={passengerFlowTip}
                  transFlowMatch={transFlowMatch}
                  suggusetLoding={suggusetLoding}
                  lineOptDetail={lineOptDetail}
                  shiftOptDetail={shiftOptDetail}
                  type="bus"
                  unitData={unitData}
                />
              )}
              {navigationTagSelected === '2' && (
                <TrendAnalysis
                  onRef={this.onTrendRef}
                  unitData={trendData}
                  busStopName={unitData.busStopName}
                  trendLoding={trendLoding}
                />
              )}
              {navigationTagSelected === '3' && (
                <OperationAnalysis
                  onRef={this.onLineRef}
                  lineModeLoding={lineModeLoding}
                  lineTimeLoding={lineTimeLoding}
                  lineDistanceLoding={lineDistanceLoding}
                  loadFactor={loadFactor}
                  capacityMatching={capacityMatching} //满载率
                  busStopName={unitData.busStopName}
                  unitData={unitData}
                  turnover={turnover}
                  busLineInfo={busLineInfo}
                />
              )}
              {navigationTagSelected === '4' && (
                <TrainAnalysis
                  onRef={this.onStationRef}
                  section={section}
                  depShiftData={depShiftData}
                  densityData={densityData}
                  staionModeLoding={staionModeLoding}
                  stationTimeLoding={stationTimeLoding}
                  stationDistanceLoding={stationDistanceLoding}
                  busShiftInfo={busShiftInfo}
                  busStopName={unitData.busStopName}
                  unitData={unitData}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default RightContent;
