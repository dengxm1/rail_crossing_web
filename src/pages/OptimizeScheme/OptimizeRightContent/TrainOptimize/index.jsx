/**
 * 线路优化预评估
 * 邓小妹
 * */

import React, { Component } from 'react';
import styles from './index.less';
import { Card, Spin, Button } from 'antd';
import echarts from 'echarts';
import color from '../../../../utils/config';
import { shiftAssess, shiftOriginal } from '../../../../services/scheme';
import { timeText24, setLineOption } from '../../../../utils/utils';
import ChartTitle from '../../../../components/ChartTitle';

class TrainOptimize extends Component {
  state = {
    originalLoding: false,
    optimizationLoding: false,
    isOptimization: false,
  };

  componentDidMount() {
    const { unitData } = this.props;
    this.setState(
      {
        unitData,
      },
      () => {
        if (unitData) {
          this.getShiftOriginal();
        }
      },
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    let unitData = nextProps.unitData;
    let statDate = unitData.statDate !== this.props.unitData.statDate;
    let doeDate = unitData.doeDate !== this.props.unitData.doeDate;
    let routeId = unitData.routeId !== this.props.unitData.routeId;
    let isUpDown = unitData.isUpDown !== this.props.unitData.isUpDown;
    let dayPeriod = unitData.dayPeriod !== this.props.unitData.dayPeriod;
    let stationStopId =
      unitData.stationStopId !== this.props.unitData.stationStopId;
    if (
      statDate ||
      doeDate ||
      routeId ||
      isUpDown ||
      dayPeriod ||
      stationStopId
    ) {
      this.setState(
        {
          unitData,
          isOptimization: false, //结果状态
          isFirst: false, // 切换次数重置
        },
        () => {
          this.getShiftOriginal();
        },
      );
    }
  }

  //线路优化预评估 - 优化
  getShiftAssess = () => {
    const { unitData } = this.state;
    this.setState({
      optimizationLoding: true,
    });
    shiftAssess({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      routeId: unitData.routeId,
      isUpDown: unitData.isUpDown,
      dayPeriod: unitData.dayPeriod,
      stationId: unitData.stationId,
      stationStopId: unitData.stationStopId,
    })
      .then(res => {
        this.setState({
          optimizationLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            let cnt = res.data.cnt; //客流量分布
            let arrDensity = res.data.arrDensity; //公交发车班次分布
            let WaitingTime = res.data.WaitingTime; //接驳等待时间
            //客流量分布
            let cntDataArr = [];
            cnt.forEach(item => {
              cntDataArr.push(item.axisY);
            });
            let cntData = {
              cntData: cntDataArr,
              cntX: timeText24(),
            };
            //公交发车班次分布
            let arrOriginalData = [];
            let arrAssessData = [];
            arrDensity.original.forEach(item => {
              arrOriginalData.push(item.arrDensity);
            });
            arrDensity.assess.forEach(item => {
              arrAssessData.push(item.arrDensity);
            });
            let arrDensityData = {
              arrOriginalData: arrOriginalData,
              arrAssessData: arrAssessData,
              arrAssessX: timeText24(),
            };

            //接驳等待时间
            let carryOriginaData = [];
            let carryAssessData = [];
            WaitingTime.original.forEach(item => {
              carryOriginaData.push(item.waitingTime);
            });
            WaitingTime.assess.forEach(item => {
              carryAssessData.push(item.waitingTime);
            });
            let WaitingTimeData = {
              carryOriginaData: carryOriginaData,
              carryAssessData: carryAssessData,
              carryX: timeText24(),
            };
            this.setState(
              {
                cntData, //客流量分布
                arrDensityData, //公交发车班次分布
                WaitingTimeData, //接驳等待时间
              },
              () => {
                this.initWaitTime(); //接驳等待时间
                this.initArriveTime(); //客流量分布
                this.initPersonTime(); //公交发车班次分布
              },
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  //接驳等待时间 - 优化
  initWaitTime = () => {
    const { WaitingTimeData } = this.state;
    const waitTimeRef = echarts.init(document.getElementById('waitTimeRef'));
    let data = {
      xAxisData: WaitingTimeData.carryX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '分钟',
      },
      series: [
        {
          name: '原有线路',
          color: color.moon_people_time_color,
          data: WaitingTimeData.carryOriginaData,
          symbol: 'circle',
        },
        {
          name: '建议线路',
          color: color.moon_people_type_color,
          data: WaitingTimeData.carryAssessData,
          symbol: 'circle',
        },
      ],
    };
    waitTimeRef.setOption(setLineOption(data));
  };

  //客流量分布 - 优化
  initArriveTime = () => {
    const { cntData } = this.state;
    const arriveTimeRef = echarts.init(
      document.getElementById('arriveTimeRef'),
    );
    let data = {
      xAxisData: cntData.cntX,
      grid: {
        bottom: '7%',
      },
      yAxis: {
        name: '人次',
      },
      series: [
        {
          color: color.moon_people_time_color, //moon_people_time_color
          data: cntData.cntData,
          symbol: 'circle',
        },
      ],
    };
    arriveTimeRef.setOption(setLineOption(data));
  };

  //公交发车班次分布 - 优化
  initPersonTime = () => {
    const { arrDensityData } = this.state;
    const personTimeRef = echarts.init(
      document.getElementById('personTimeRef'),
    );
    let data = {
      xAxisData: arrDensityData.arrAssessX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '班/每小时',
        nameTextStyle: {
          align: 'center',
          verticalAlign: 'middle',
        },
      },
      series: [
        {
          name: '原有线路',
          color: color.moon_people_time_color, //moon_people_time_color
          data: arrDensityData.arrOriginalData,
          symbol: 'circle',
        },
        {
          name: '建议线路',
          color: color.moon_people_type_color, //moon_people_time_color
          data: arrDensityData.arrAssessData,
          symbol: 'circle',
        },
      ],
    };
    personTimeRef.setOption(setLineOption(data));
  };

  //轨交站点断面客流量 - 原始
  initOrigSection = () => {
    const { origSectionData } = this.state;
    const origSectionRef = echarts.init(
      document.getElementById('origSectionRef'),
    );
    let data = {
      xAxisData: origSectionData.origSectionX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '人次',
      },
      series: [
        {
          name: '出站客流',
          stack: '总量',
          color: color.moon_people_time_color,
          data: origSectionData.inData,
          symbol: 'circle',
        },
        {
          name: '进站客流',
          stack: '总量',
          color: color.moon_people_type_color,
          data: origSectionData.outData,
          symbol: 'circle',
        },
      ],
    };
    origSectionRef.setOption(setLineOption(data));
  };
  //公交接驳客流量 - 原始
  initBusFlow = () => {
    const { busFlowData } = this.state;
    const busFlowRef = echarts.init(document.getElementById('busFlowRef'));
    let data = {
      xAxisData: busFlowData.busFlowX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '人次',
      },
      series: [
        {
          name: '原有路线',
          type: 'line',
          smooth: 0.6,
          color: color.moon_people_time_color, //moon_people_time_color
          data: busFlowData.busFlowArr,
          symbol: 'circle',
        },
      ],
    };
    busFlowRef.setOption(setLineOption(data));
  };
  //公交发车班次分布 - 原始
  initBusTime = () => {
    const { busTimeData } = this.state;
    const busTimeRef = echarts.init(document.getElementById('busTimeRef'));
    let data = {
      xAxisData: busTimeData.busTimeX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '班/20分钟',
        nameTextStyle: {
          align: 'center',
          verticalAlign: 'middle',
        },
      },
      series: [
        {
          name: '原有路线',
          type: 'line',
          smooth: 0.6,
          color: color.moon_people_time_color, //moon_people_time_color
          data: busTimeData.busTimeArr,
          symbol: 'circle',
        },
      ],
    };
    busTimeRef.setOption(setLineOption(data));
  };

  //线路优化预评估 - 原始
  getShiftOriginal = () => {
    const { unitData } = this.state;
    this.setState({
      originalLoding: true,
    });
    shiftOriginal({
      statDate: unitData.statDate,
      doeDate: unitData.doeDate,
      routeId: unitData.routeId,
      isUpDown: unitData.isUpDown,
      dayPeriod: unitData.dayPeriod,
      stationId: unitData.stationId,
      stationStopId: unitData.stationStopId,
    })
      .then(res => {
        if (res) {
          if (res.code === 200) {
            this.setState({
              originalLoding: false,
            });
            let origSection = res.data.sectionTraffic; //轨交站点断面客流量
            let busFlow = res.data.shuttlePassengerFlow; //公交接驳客流量
            let busTime = res.data.arrDensity; //公交发车班次分布
            //轨交站点断面客流量
            let outData = [];
            let inData = [];
            let setOutCnt = origSection.getInCnt;
            let arriveCnt = origSection.getOutCnt;
            for (let key in setOutCnt) {
              outData.push(setOutCnt[key]);
            }
            for (let key in arriveCnt) {
              inData.push(arriveCnt[key]);
            }
            let origSectionData = {
              outData: outData,
              inData: inData,
              origSectionX: timeText24(),
            };
            //公交接驳客流量
            let busFlowArr = [];
            for (let item of busFlow) {
              busFlowArr.push(item.axisY);
            }
            let busFlowData = {
              busFlowArr: busFlowArr,
              busFlowX: timeText24(),
            };
            //公交发车班次分布
            let busTimeArr = [];
            busTime.forEach(item => {
              busTimeArr.push(item.arrDensity);
            });
            let busTimeData = {
              busTimeArr: busTimeArr,
              busTimeX: timeText24(),
            };
            this.setState(
              {
                origSectionData, //轨交站点断面客流量
                busFlowData, //公交接驳客流量
                busTimeData, //公交发车班次分布
              },
              () => {
                this.initOrigSection(); //轨交站点断面客流量
                this.initBusFlow(); //公交接驳客流量
                this.initBusTime(); //公交发车班次分布
              },
            );
          }
        }
      })
      .catch(e => {
        this.setState({
          originalLoding: false,
        });
        console.log(e);
      });
  };

  //切换转tai
  changeStatus = () => {
    const { isOptimization, isFirst } = this.state;
    if (!isOptimization) {
      this.setState(
        {
          isOptimization: true,
        },
        () => {
          if (!isFirst) {
            this.getShiftAssess();
          }
        },
      );
    } else {
      this.setState({
        isOptimization: false,
      });
    }
    this.setState({
      isFirst: true,
    });
  };

  render() {
    const { optimizationLoding, originalLoding, isOptimization } = this.state;
    const { unitData } = this.props;
    return (
      <div className={styles.mainContent}>
        {/* 原始 */}
        <div
          className={styles.cardContent}
          style={{ display: isOptimization ? 'none' : 'block' }}
        >
          <Card
            title={
              <ChartTitle
                title="轨交站点断面客流量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={originalLoding} className={styles.loading_style}>
              <div id="origSectionRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="公交接驳客流量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={originalLoding} className={styles.loading_style}>
              <div id="busFlowRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="公交发车班次分布"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={originalLoding} className={styles.loading_style}>
              <div id="busTimeRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
        </div>
        {/* 优化 */}
        <div
          className={styles.cardContent}
          style={{ display: isOptimization ? 'block' : 'none' }}
        >
          <Card
            title={
              <ChartTitle
                title="客流量分布"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={optimizationLoding}
              className={styles.loading_style}
            >
              <div id="arriveTimeRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="接驳等待时间"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={optimizationLoding}
              className={styles.loading_style}
            >
              <div id="waitTimeRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="公交发车班次分布"
                isShowDownLoad={true}
                apiUrl="/data/optimization/shift/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={optimizationLoding}
              className={styles.loading_style}
            >
              <div id="personTimeRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
        </div>

        {/*  预估测评按钮  style={{display: isOptimization ? 'none': 'block'}}*/}
        <div className={styles.btnContent}>
          <Button
            className={styles.assessBtn}
            onClick={this.changeStatus}
            type="primary"
          >
            {isOptimization ? '查看现状' : '优化结果预评估'}
          </Button>
        </div>
      </div>
    );
  }
}
export default TrainOptimize;
