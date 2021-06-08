/**
 * 接驳公交分析---线路分析
 * */
import React, { Component } from 'react';
import echarts from 'echarts';
import styles from './index.less';
import { Card, Spin, Popover } from 'antd';
import color from '../../../../utils/config';
import { runAnalyze } from '../../../../services/correlation';
import Introduce from '../../../../components/introduce';
import ChartTitle from '../../../../components/ChartTitle';
import {
  transToTime,
  timeText24,
  toptipToRate,
  getFloat,
  setBarOption,
  setLineOption,
} from '../../../../utils/utils';
import { api } from '../../../../utils/url';

class OperationAnalysis extends Component {
  state = {
    tripModeXAxis: [], //出行方式柱状图x轴
    tripModeCurData: [], //当月人群出行方式占比
    tripModeLastData: [], //上月人群出行方式占比
    curData: [], //当月人群出行距离占比折线图数据
    lastData: [], //上月人群出行距离占比折线图数据
    curTimeData: [], //当月人群出行时间占比折线图数据
    lastTimeData: [], //上月人群出行时间占比折线图数据
    echartDataId: this.props.tfcunitId, //用于显示echart数据的参数id
    tripModeLoding: false,
    tripTimeLoding: false,
    tripDistanceLoding: false,
    loadFactor: [],
    capacityMatching: [],
    curTurnover: [],
    isNoneTurnover: false,
    isNoneLoadFactor: false,
    isNoneCapacityMatching: false,
  };
  componentDidMount() {
    this.props.onRef(this);
  }

  //传入[0,72]的整数，转换成间距为20分钟的时间段
  transToTime = num => {
    let hour = parseInt(num / 3) + '';
    let min = (num % 3) * 20 + '';
    if (min === '0') {
      min = '00';
    }
    return hour + ':' + min;
  };
  //客运周转量（客运量*运距）
  initSiteFlow = () => {
    const { turnover } = this.props;
    const tripModeRef = echarts.init(document.getElementById('tripModeRef'));
    if (turnover.curTurnover.length || turnover.lastTurnover.length) {
      tripModeRef.clear();
      let data = {
        xAxisData: turnover.turnoverX,
        tooltip: {
          isNone: true,
        },
        grid: {
          bottom: '7%',
        },
        legend: {
          icon: 'react',
        },
        // xAxis:{
        //   axisLabel:true
        // },
        yAxis: {
          name: '人*公里',
        },
        series: [
          {
            name: '当月',
            barGap: '50%',
            color: color.moon_people_time_color, //moon_people_time_color
            data: turnover.curTurnover,
          },
          {
            name: '上月',
            color: color.moon_people_type_color,
            data: turnover.lastTurnover,
          },
        ],
      };
      tripModeRef.setOption(setBarOption(data));
    } else {
      this.setState({
        isNoneTurnover: true,
      });
    }
  };

  //满载率
  initWalkTime = () => {
    const { loadFactor } = this.props;
    const tripTimeRef = echarts.init(document.getElementById('tripTimeRef'));
    if (loadFactor.curloadFactor.length || loadFactor.lastloadFactor.length) {
      let data = {
        xAxisData: loadFactor.timeX,
        tooltip: {
          formatter: function(e) {
            return toptipToRate(e);
          },
        },
        grid: {
          bottom: '8%',
        },
        yAxis: {
          axisLabel: {
            formatter: '{value}%',
          },
        },
        legend: {
          top: '5%',
          icon: 'react',
        },
        series: [
          {
            name: '当月',
            smooth: 0.6,
            color: color.moon_people_time_color, //moon_people_time_color
            data: loadFactor.curloadFactor,
            symbol: 'circle',
          },
          {
            name: '上月',
            smooth: 0.6,
            color: color.moon_people_type_color,
            data: loadFactor.lastloadFactor,
            symbol: 'circle',
          },
        ],
      };
      tripTimeRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneLoadFactor: true,
      });
    }
  };

  //运能匹配度
  initWaitTime = () => {
    const { capacityMatching } = this.props;
    const tripDistanceRef = echarts.init(
      document.getElementById('tripDistanceRef'),
    );
    if (
      capacityMatching.curCapacityMatching.length ||
      capacityMatching.lastCapacityMatching.length
    ) {
      let data = {
        xAxisData: capacityMatching.capacityX,
        tooltip: {
          formatter: function(e) {
            return toptipToRate(e);
          },
        },
        legend: {
          top: '5%',
          icon: 'react',
        },
        yAxis: {
          axisLabel: {
            formatter: '{value}%',
          },
        },
        grid: {
          bottom: '7%',
        },
        series: [
          {
            name: '当月',
            smooth: 0.6,
            color: color.moon_people_time_color, //moon_people_time_color
            data: capacityMatching.curCapacityMatching,
            symbol: 'circle',
          },
          {
            name: '上月',
            smooth: 0.6,
            color: color.moon_people_type_color,
            data: capacityMatching.lastCapacityMatching,
            symbol: 'circle',
          },
        ],
      };
      tripDistanceRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneCapacityMatching: true,
      });
    }
  };

  render() {
    const {
      lineModeLoding,
      lineTimeLoding,
      lineDistanceLoding,
      busStopName,
      busLineInfo,
      unitData,
    } = this.props;
    const {
      isNoneTurnover,
      isNoneLoadFactor,
      isNoneCapacityMatching,
    } = this.state;
    return (
      <div className={styles.crowdContent}>
        {/* 线路走向分析*/}
        <div className={styles.lineTrend}>
          <Spin spinning={lineModeLoding} className={styles.loading_style}>
            <div className={styles.titleContent}>
              <ChartTitle title="线路运行分析" />
              {/*<span className={styles.title}>线路运行分析</span>*/}
            </div>
            <div className={styles.first_outerBody}>
              <div className={styles.bodyWrap}>
                <div className={styles.busName}>{busStopName}</div>
                <div className={styles.trend_rate}>
                  客流覆盖率：
                  {`${getFloat(busLineInfo.passengerFlowCoverage * 100, 2)}%`}
                </div>
              </div>
              <div className={styles.wrap_content}>
                <div className={styles.repeat}>
                  供求匹配率：
                  {`${getFloat(busLineInfo.capacityMatch * 100, 2)}%`}
                </div>
                <div className={styles.flowprobability}>
                  小区覆盖率：
                  {`${getFloat(busLineInfo.cellCoverage * 100, 2)}%`}
                </div>
              </div>
            </div>
          </Spin>
        </div>
        <div className={styles.card_wrap}>
          <Card
            title={
              <ChartTitle
                title="客运周转量(客运量*运距)"
                title2="客运周转量"
                isShowDownLoad={true}
                apiUrl="/data/bus/line"
                unitData={unitData}
              />
            }
            className={styles.UnitCard}
            bordered={false}
          >
            <Spin spinning={lineModeLoding} className={styles.loading_style}>
              {!isNoneTurnover ? (
                <div id="tripModeRef" className={styles.tripTime}></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="满载率"
                isShowDownLoad={true}
                apiUrl="/data/bus/line"
                unitData={unitData}
              />
            }
            className={styles.UnitCard}
            bordered={false}
          >
            <Spin spinning={lineTimeLoding} className={styles.loading_style}>
              {!isNoneLoadFactor ? (
                <div id="tripTimeRef" className={styles.tripTime}></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </Card>
          <Card
            title={
              <ChartTitle
                title="运能匹配度"
                isShowDownLoad={true}
                apiUrl="/data/bus/line"
                unitData={unitData}
              />
            }
            className={styles.UnitCard}
            bordered={false}
          >
            <Spin
              spinning={lineDistanceLoding}
              className={styles.loading_style}
            >
              {!isNoneCapacityMatching ? (
                <div id="tripDistanceRef" className={styles.tripTime}></div>
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
export default OperationAnalysis;
