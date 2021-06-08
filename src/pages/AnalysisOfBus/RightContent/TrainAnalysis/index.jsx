/**
 * 班次分析
 * 邓小妹
 * */
import React, { Component } from 'react';
import styles from './index.less';
import { Card, Spin } from 'antd';
import echarts from 'echarts';
import color from '../../../../utils/config';
import { toptipAuto, getFloat, setLineOption } from '../../../../utils/utils';
import ChartTitle from '../../../../components/ChartTitle';
import { api } from '../../../../utils/url';

class TrainAnalysis extends Component {
  state = {
    tripModeLoding: false,
    tripTimeLoding: false,
    tripDistanceLoding: false,
    isNoneSection: false,
    isNoneDepShiftData: false,
    isNoneDensityData: false,
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  //轨交站点断面出行人次
  initSection = () => {
    const { section } = this.props;
    const sectionRef = echarts.init(document.getElementById('sectionRef'));
    sectionRef.clear();
    if (section.sectionArrive.length || section.sectionOut.length) {
      let data = {
        xAxisData: section.secTionX,
        grid: {
          bottom: '7%',
          height: '65%',
        },
        yAxis: {
          name: '人次',
          axisLabel: {
            formatter: function(value) {
              return value > 9999
                ? (value / 10000).toFixed(value > 29999 ? 0 : 1) + '万'
                : value;
            },
          },
        },
        series: [
          {
            name: '出站客流',
            stack: '总量',
            areaStyle: {},
            color: color.moon_people_time_color,
            data: section.sectionOut,
          },
          {
            name: '进站客流',
            stack: '总量',
            areaStyle: {},
            color: color.moon_people_type_color,
            data: section.sectionArrive,
          },
        ],
      };
      sectionRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneSection: true,
      });
    }
  };

  echartsConfig = {
    grid: {
      bottom: '7%',
      left: '5%',
      right: '6%',
      height: '60%',
      containLabel: true,
    },
    legend: {
      type: 'scroll',
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      left: 'center',
      right: -10,
      top: '4%',
      width: '270px',
    },
  };
  //公交发车班次分布
  initBusStart = () => {
    const { depShiftData } = this.props;
    const busStartRef = echarts.init(document.getElementById('busStartRef'));
    busStartRef.clear();
    if (depShiftData.depShiftSeries.length) {
      let data = {
        xAxisData: depShiftData.depShiftX,
        ...this.echartsConfig,
        tooltip: {
          position: function(point, params, dom, rect, size) {
            return toptipAuto(point, size);
          },
        },
        yAxis: {
          name: '班/20分钟',
          axisLabel: {},
          nameTextStyle: {
            align: 'center',
            verticalAlign: 'middle',
          },
        },
        series: depShiftData.depShiftSeries,
      };
      busStartRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneDepShiftData: true,
      });
    }
  };

  //公交到站/班次密度
  initBusArrive = () => {
    const { densityData } = this.props;
    const busArriveRef = echarts.init(document.getElementById('busArriveRef'));
    busArriveRef.clear();
    if (densityData.densitySeries.length) {
      let data = {
        xAxisData: densityData.densityX,
        ...this.echartsConfig,
        grid: {
          bottom: '7%',
          height: '65%',
        },

        yAxis: {
          name: '班/20分钟',
          nameTextStyle: {
            align: 'center',
            verticalAlign: 'middle',
          },
        },
        series: densityData.densitySeries,
      };
      busArriveRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneDensityData: true,
      });
    }
  };

  render() {
    const {
      staionModeLoding,
      stationTimeLoding,
      stationDistanceLoding,
      busStopName,
      busShiftInfo,
      unitData,
    } = this.props;
    const { isNoneSection, isNoneDepShiftData, isNoneDensityData } = this.state;
    return (
      <div className={styles.cardContent}>
        {/* 线路走向分析*/}
        <div className={styles.lineTrend}>
          <Spin spinning={staionModeLoding} className={styles.loading_style}>
            <div className={styles.titleContent}>
              <span className={styles.title}>线路运行分析</span>
            </div>
            <div className={styles.first_outerBody}>
              <div className={styles.bodyWrap}>
                <div className={styles.busName}>{busStopName}</div>
                <div className={styles.trend_rate}>
                  早晚班服务时间匹配度:
                  {`${getFloat(busShiftInfo.timeMatch * 100, 2)}%`}
                </div>
              </div>
              <div className={styles.bodyWrap_two}>
                <div className={styles.flowprobability}>
                  线路运行速度:{`${busShiftInfo.runSpeed}km/h`}
                </div>
                <div className={styles.repeat}>
                  平均换乘等待时间:
                  {`${parseFloat(busShiftInfo.transferWaitTime)}分钟`}
                </div>
              </div>
            </div>
          </Spin>
        </div>
        <div className={styles.card_wrap}>
          <Card
            title={
              <ChartTitle
                title="轨交站点断面出行人次"
                isShowDownLoad={true}
                apiUrl="/data/bus/shift"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={staionModeLoding} className={styles.loading_style}>
              {!isNoneSection ? (
                <div id="sectionRef" className={styles.tripTime}></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="公交发车班次分布"
                isShowDownLoad={true}
                apiUrl="/data/bus/shift"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin spinning={stationTimeLoding} className={styles.loading_style}>
              {!isNoneDepShiftData ? (
                <div id="busStartRef" className={styles.tripTime}></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="公交到站/班次密度"
                isShowDownLoad={true}
                apiUrl="/data/bus/shift"
                unitData={unitData}
              />
            }
            bordered={false}
            className={styles.UnitCard}
          >
            <Spin
              spinning={stationDistanceLoding}
              className={styles.loading_style}
            >
              {!isNoneDensityData ? (
                <div id="busArriveRef" className={styles.tripTime}></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </Card>
        </div>
      </div>
    );
  }
}
export default TrainAnalysis;
