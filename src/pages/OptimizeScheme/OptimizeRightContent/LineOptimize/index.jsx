/**
 * 线路优化预评估
 * 邓小妹
 * */

import React, { Component } from 'react';
import styles from './index.less';
import { Card, Spin, Button } from 'antd';
import echarts from 'echarts';
import color from '../../../../utils/config';
import { lineAssess, lineActuality } from '../../../../services/scheme';
import {
  transToTime,
  timeText24,
  toptipToRate,
  setLineOption,
  setBarOption,
} from '../../../../utils/utils';
import ChartTitle from '../../../../components/ChartTitle';
import { api } from '../../../../utils/url';

class LineOptimize extends Component {
  state = {
    tripModeLoding: false,
    tripTimeLoding: false,
    tripDistanceLoding: false,
    resultStatus: '0', //结果状态
  };

  componentDidMount() {
    const { unitData } = this.props;
    this.setState(
      {
        unitData,
      },
      () => {
        if (unitData) {
          this.getLineActuality();
        }
      },
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    let unitData = nextProps.unitData;
    if (unitData) {
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
            resultStatus: '0', //结果状态
            isFirst: false, // 切换次数重置
          },
          () => {
            this.getLineActuality();
          },
        );
      }
    }
  }

  //线路优化原始路线
  getLineActuality = () => {
    const { unitData } = this.state;
    this.setState({
      tripModeLoding: true,
      tripTimeLoding: true,
      tripDistanceLoding: true,
    });
    lineActuality({
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
          tripModeLoding: false,
          tripTimeLoding: false,
          tripDistanceLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            let loadRate = res.data.loadRate; //满载率
            let turnover = res.data.turnover; //周转量
            let cnt = res.data.siteTraffic; //各站点客流分析
            //满载率
            let loadRateSeries = [];
            let loadRateX = [];
            let data = [];
            let seriesData = {
              name: '原有路线',
              type: 'line',
              smooth: 0.6,
              color: '#0B80EF', //moon_people_time_color
              symbol: 'circle',
            };
            loadRate.forEach(item => {
              loadRateX.push(transToTime(item.stepIndex));
              data.push(Math.floor(item.loadRate * 100));
            });
            seriesData.data = data;
            loadRateSeries.push(seriesData);
            let loadRateData = {
              loadRateSeries,
              loadRateX: timeText24(),
            };
            //周转量
            let turnoverX = [];
            let turData = [];
            let turnoverSeries = [];
            let turSeries = {
              name: '原有线路',
              type: 'bar',
              color: color.moon_people_time_color, //moon_people_time_color
              barWidth: 10,
              barGap: '50%',
              itemStyle: {
                barBorderRadius: [10, 10, 0, 0], //（顺时针左上，右上，右下，左下）
              },
            };

            turnover.forEach(item => {
              turData.push(item.passengerTurnover);
              turnoverX.push(item.dayOfWeek);
            });
            turSeries.data = turData;
            turnoverSeries.push(turSeries);
            let turnoverData = {
              turnoverX,
              turnoverSeries,
            };
            //各站点客流分布
            let cntSeries = [];
            let cntX = timeText24();
            let seriesData2 = {
              name: '原有路线',
              type: 'line',
              color: color.moon_people_time_color, //moon_people_time_color
              data: Object.values(cnt),
              smooth: 0.6,
              symbol: 'circle',
            };
            let grid = {
              bottom: '7%',
              left: '5%',
              right: '6%',
              height: '70%',
              containLabel: true,
            };
            cntSeries.push(seriesData2);
            let cntData = {
              cntSeries,
              cntX,
              grid,
            };
            this.setState(
              {
                loadRateData, //满载率
                turnoverData,
                cntData,
              },
              () => {
                this.initWalkTime(); //各站点客流分布
                this.initOptimizeRevolve(); //周转量
                this.initOptimizeLoad(); //满载率
              },
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  //线路优化预评估
  getLineAssess = () => {
    const { unitData } = this.state;
    this.setState({
      tripModeLoding: true,
      tripTimeLoding: true,
      tripDistanceLoding: true,
      resultStatus: '1',
      loadRateData: '', //满载率
      turnoverData: '',
      cntData: '', //客流量
    });
    lineAssess({
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
          tripModeLoding: false,
          tripTimeLoding: false,
          tripDistanceLoding: false,
        });
        if (res) {
          if (res.code === 200) {
            // let color = ['#0B80EF', '#00C1DE', '#F2B00C'];
            let loadRate = res.data.loadRate; //满载率
            let turnover = res.data.turnover; //周转量
            let cnt = res.data.cnt; //各站点客流分析
            //满载率
            let loadRateSeries = [];
            let loadRateX = [];
            let data1 = [];
            let data2 = [];
            let oldloadRate = {
              name: '原有路线',
              type: 'line',
              smooth: 0.6,
              color: '#0B80EF', //moon_people_time_color
              symbol: 'circle',
            };
            let curloadRate = {
              name: '建议路线',
              type: 'line',
              smooth: 0.6,
              color: '#F2B00C', //moon_people_time_color
              symbol: 'circle',
            };
            loadRate.original.forEach(item => {
              loadRateX.push(transToTime(item.stepIndex));
              data1.push(Math.floor(item.loadRate * 100));
            });
            loadRate.assess.forEach(item => {
              data2.push(Math.floor(item.loadRate * 100));
            });
            oldloadRate.data = data1;
            curloadRate.data = data2;
            loadRateSeries.push(oldloadRate, curloadRate);
            let loadRateData = {
              loadRateSeries,
              loadRateX: timeText24(),
            };
            //周转量
            let turnoverSeries = [];
            let turnoverX = [];
            let originData = [];
            let assessData = [];
            let originSer = {
              name: '原有线路',
              type: 'bar',
              color: color.moon_people_time_color, //moon_people_time_color
              barWidth: 10,
              barGap: '50%',
              itemStyle: {
                barBorderRadius: [10, 10, 0, 0], //（顺时针左上，右上，右下，左下）
              },
            };
            let assessSer = {
              name: '建议线路',
              type: 'bar',
              color: color._yellow, //moon_people_time_color
              barWidth: 10,
              barGap: '50%',
              itemStyle: {
                barBorderRadius: [10, 10, 0, 0], //（顺时针左上，右上，右下，左下）
              },
            };
            turnover.original.forEach(item => {
              originData.push(item.passengerTurnover);
              turnoverX.push(item.dayOfWeek);
            });
            turnover.assess.forEach(item => {
              assessData.push(item.passengerTurnover);
            });
            originSer.data = originData;
            assessSer.data = assessData;
            turnoverSeries.push(originSer, assessSer);
            let turnoverData = {
              turnoverX,
              turnoverSeries,
            };
            //各站点客流分布
            let cntSeries = [];
            let cntX = [];
            let cData1 = [];
            let cData2 = [];
            let oldCnt = {
              name: '原有路线',
              type: 'line',
              smooth: 0.6,
              color: '#0B80EF', //moon_people_time_color
              symbol: 'circle',
            };
            let curCnt = {
              name: '建议路线',
              type: 'line',
              smooth: 0.6,
              color: '#F2B00C', //moon_people_time_color
              symbol: 'circle',
            };
            let original = cnt.original;
            let assess = cnt.assess;
            for (let key in original) {
              cntX.push(key);
              cData1.push(original[key]);
            }
            for (let key in assess) {
              cData2.push(assess[key]);
            }
            oldCnt.data = cData1;
            curCnt.data = cData2;
            cntSeries.push(oldCnt, curCnt);
            let grid = {
              bottom: '7%',
              left: '5%',
              right: '6%',
              height: '70%',
              containLabel: true,
            };
            let cntData = {
              cntSeries,
              cntX: timeText24(),
              grid,
            };
            this.setState(
              {
                loadRateData, //满载率
                turnoverData,
                cntData, //客流量
              },
              () => {
                this.initWalkTime(); //各站点客流分布
                this.initOptimizeRevolve(); //周转量
                this.initOptimizeLoad(); //满载率
              },
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  //各站点客流分布
  initWalkTime = () => {
    const { cntData, resultStatus } = this.state;
    const walkTimeRef = echarts.init(
      document.getElementById(
        resultStatus === '0' ? 'walkTimeRef' : 'walkTimeRef2',
      ),
    );
    walkTimeRef.clear();
    let data = {
      xAxisData: cntData.cntX,
      grid: cntData.grid,
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '人次',
        nameTextStyle: {
          align: 'center',
        },
      },
      series: cntData.cntSeries,
    };
    walkTimeRef.setOption(setLineOption(data));
  };

  //周转量
  initOptimizeRevolve = () => {
    const { turnoverData, resultStatus } = this.state;
    const optimizeRevolveRef = echarts.init(
      document.getElementById(
        resultStatus === '0' ? 'optimizeRevolveRef' : 'optimizeRevolveRef2',
      ),
    );
    let data = {
      xAxisData: turnoverData.turnoverX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      yAxis: {
        name: '人*公里',
        nameTextStyle: {
          align: 'right',
          verticalAlign: 'middle',
          color: 'rgba(0,0,0,0.85)',
        },
      },
      series: turnoverData.turnoverSeries,
    };
    optimizeRevolveRef.setOption(setBarOption(data));
  };

  //满载率
  initOptimizeLoad = () => {
    const { loadRateData, resultStatus } = this.state;
    const optimizeLoadRef = echarts.init(
      document.getElementById(
        resultStatus === '0' ? 'optimizeLoadRef' : 'optimizeLoadRef2',
      ),
    );
    let data = {
      xAxisData: loadRateData.loadRateX,
      grid: {
        bottom: '7%',
      },
      legend: {
        icon: 'react',
      },
      tooltip: {
        formatter: function(e) {
          return toptipToRate(e);
        },
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: loadRateData.loadRateSeries,
    };
    optimizeLoadRef.setOption(setLineOption(data));
  };

  //切换转tai
  changeStatus = () => {
    const { resultStatus, isFirst } = this.state;
    if (resultStatus === '0') {
      this.setState(
        {
          resultStatus: '1',
        },
        () => {
          if (!isFirst) {
            this.getLineAssess();
          }
        },
      );
    } else {
      this.setState({
        resultStatus: '0',
      });
    }
    this.setState({
      isFirst: true,
    });
  };

  render() {
    const {
      tripModeLoding,
      tripTimeLoding,
      tripDistanceLoding,
      resultStatus,
    } = this.state;
    const { unitData } = this.props;
    return (
      <div className={styles.mainContent}>
        <div
          className={styles.cardContent}
          style={{ display: resultStatus === '0' ? 'block' : 'none' }}
        >
          <Card
            title={
              <ChartTitle
                title="客流量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={tripModeLoding} className={styles.loading_style}>
              <div id="walkTimeRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="周转量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={tripTimeLoding} className={styles.loading_style}>
              <div id="optimizeRevolveRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="满载率"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/actuality"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={tripDistanceLoding}
              className={styles.loading_style}
            >
              <div id="optimizeLoadRef" className={styles.tripTime}></div>
            </Spin>
          </Card>
        </div>
        <div
          className={styles.cardContent}
          style={{ display: resultStatus === '0' ? 'none' : 'block' }}
        >
          <Card
            title={
              <ChartTitle
                title="客流量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={tripModeLoding} className={styles.loading_style}>
              <div id="walkTimeRef2" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="周转量"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={tripTimeLoding} className={styles.loading_style}>
              <div id="optimizeRevolveRef2" className={styles.tripTime}></div>
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="满载率"
                isShowDownLoad={true}
                apiUrl="/data/optimization/line/assess"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={tripDistanceLoding}
              className={styles.loading_style}
            >
              <div id="optimizeLoadRef2" className={styles.tripTime}></div>
            </Spin>
          </Card>
        </div>
        {/*  预估测评按钮   style={{display: resultStatus === '1' ? 'none': 'block'}}*/}
        <div className={styles.btnContent}>
          <Button
            className={styles.assessBtn}
            type="primary"
            onClick={this.changeStatus}
          >
            {resultStatus === '0' ? '优化结果预评估' : '查看现状'}
          </Button>
        </div>
      </div>
    );
  }
}
export default LineOptimize;
