/**
 * 类型分析之运行分析
 * 邓小妹
 * */

import React, { Component } from 'react';
import styles from './index.less';
import Introduce from '../../../../components/introduce';
import { Row, Col, Spin, Empty } from 'antd';
import echarts from 'echarts';
import { toptipAuto, timeText24, getFloat } from '../../../../utils/utils';
import { typeAnalyze } from '../../../../services/correlation';

class TypeAnalysis extends Component {
  state = {
    Loading: false,
    unitData: {},
  };
  componentDidMount() {
    this.props.onRef(this);
    this.trendChart = echarts.init(document.getElementById('trendChart'));
  }

  setLineOption = data => {
    if (!data) return;
    let busArr = Object.values(data.busIndexFlowMap || {});
    let subwayArr = Object.values(data.subwayIndexFlowMap || {});
    let busLength = busArr.length;
    let subLength = busLength.length;
    if (!(busLength || subLength)) {
      this.setState({
        isShowChart: true,
      });
    }
    let option = {
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        top: '24%',
        containLabel: true, //grid 区域是否包含坐标轴的刻度标签
      },
      tooltip: {
        trigger: 'axis',
        position: function(point, params, dom, rect, size) {
          return toptipAuto(point, size);
        },
        // formatter: function(e) {
        //   let str1 = e[0]
        //     ? `${e[0].name}<br/>${e[0].seriesName}: ${(
        //         e[0].value / 10000
        //       ).toFixed(2)}万人`
        //     : '';
        //   let str2 = e[1]
        //     ? `<br/>${e[1].seriesName}: ${(e[1].value / 10000).toFixed(2)}万人`
        //     : '';
        //   return str1 + str2;
        // },
      },
      legend: {
        data: ['轨交', '公交'],
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          show: false, //x轴
        },
        axisTick: {
          //x轴刻度线
          show: false,
        },
        data: timeText24(),
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false, //y轴
        },
        axisTick: {
          //y轴刻度线
          show: false,
        },
        name: '人次',
        nameTextStyle: {
          align: 'right',
        },
        // axisLabel: {
        //   formatter: function(value) {
        //     return (value / 10000).toFixed(0) + '万';
        //   },
        // },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '轨交',
          type: 'line',
          color: '#FFAC00',
          data: subwayArr,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: 'solid',
                color: '#FFAC00',
              },
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: 'rgba(255,172,0,0.01)',
              },
              {
                offset: 1,
                color: 'rgba(255,172,0,0.2)',
              },
            ]),
          },
          showSymbol: false,
          smooth: true,
        },
        {
          name: '公交',
          type: 'line',
          data: busArr,
          color: '#2876FF',
          itemStyle: {
            normal: {
              lineStyle: {
                // 系列级个性化折线样式 ==昨天
                width: 2,
                type: 'solid',
                color: '#2876FF',
              },
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: 'rgba(40,118,255,0.1)',
              },
              {
                offset: 1,
                color: 'rgba(40,118,255,0.3)',
              },
            ]),
          },
          showSymbol: false,
          smooth: true,
        },
      ],
    };
    this.trendChart.setOption(option);
  };

  handleStr = str => {
    if (!str) return '无';
    const strArr = str.split(';');
    const len = strArr.length;
    let newStr = '';
    strArr.forEach((item, index) => {
      let strBrr = item.split(',');
      newStr += `${strBrr[0]}(${strBrr[1]}人次)${index < len ? '、' : ''}`;
    });
    return newStr;
  };

  render() {
    const { unitData, busStopName, trendLoding } = this.props;
    const { isShowChart } = this.state;
    const relation = ['平行关系', '相交关系', '混合关系', '其他复杂关系'];
    const location = [
      '始发方向相反',
      '始发线路方向与途径线路方向垂直',
      '交叉线路',
      '单点衔接',
    ];
    return (
      <div className={styles.typeAnalysis}>
        <Spin spinning={trendLoding} className={styles.suggest_loading}>
          {/* 线路走向分析*/}
          <div className={styles.lineTrend}>
            <div className={styles.titleContent}>
              <span className={styles.title}>线路走向分析</span>
            </div>
            <div className={styles.first_outerBody}>
              <div className={styles.bodyWrap}>
                <div className={styles.busName}>{busStopName}</div>
                <div className={styles.rateContent}>
                  <div className={styles.repeat}>
                    线路重复系数：
                    {`${getFloat(unitData.routeRepeatRate * 100, 2)}%`}
                  </div>
                  <div className={styles.flowprobability}>
                    分散客流概率：
                    {`${getFloat(unitData.scatteredPassengerFlow * 100, 2)}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.chart_content}>
            {/* 线路信息*/}
            <div className={styles.lineInfo}>
              <div className={styles.titleContent}>
                <span className={styles.title}>线路信息</span>
              </div>
              <div className={styles.outerBody}>
                <div className={styles.bodyContent}>
                  <div className={styles.unitBody}>
                    <div className={styles.distance}>
                      {parseFloat(unitData.basLength || 0).toFixed(2)} <i>km</i>
                    </div>
                    <div className={styles.distanceTip}>公交线路长度</div>
                  </div>
                  <div className={`${styles.unitBody} ${styles.centerBody}`}>
                    <div>
                      <div className={styles.distance}>
                        {parseFloat(unitData.subwayLength || 0).toFixed(1)}{' '}
                        <i>km</i>
                      </div>
                      <div className={styles.distanceTip}>轨交线路长度</div>
                    </div>
                  </div>
                  <div className={styles.unitBody}>
                    <div className={styles.distance}>
                      {parseFloat(unitData.routeRepeatLen || 0).toFixed(2)}{' '}
                      <i>km</i>
                    </div>
                    <div className={styles.distanceTip}>重复长度</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.chart_wrap}>
              {/* 公交轨交关系分析 */}
              <div className={styles.busRail}>
                <div className={styles.busRailTitle}>
                  <span className={styles.title}>
                    公交轨交关系分析
                    {/*<Introduce index={4} />*/}
                  </span>
                </div>
                <div className={styles.outerBody}>
                  <div className={styles.busRailBody}>
                    <div className={styles.innerBody}>
                      <Row>
                        <Col span={8}>接驳关系分析：</Col>
                        <Col span={16}>
                          {relation[(unitData.busandtrafficRelation || 99) - 1]}
                        </Col>
                        <Col span={8}>接驳位置分析：</Col>
                        <Col span={16}>
                          {location[(unitData.shuttleRelation || 99) - 1]}
                        </Col>
                        <Col span={8}>重叠公交路段：</Col>
                        <Col span={16}>
                          {this.handleStr(unitData.busStationFlow)}
                        </Col>
                        <Col span={8}>重叠轨交路段：</Col>
                        <Col span={16}>
                          {this.handleStr(unitData.subwayStationFlow)}
                        </Col>
                      </Row>
                      {isShowChart ? null : (
                        <div
                          id="trendChart"
                          className={styles.trendChart}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}
export default TypeAnalysis;
