import React, { Component } from 'react';
import styles from './OtherClickBox.less';
import { Row, Col, Spin } from 'antd';
import echarts from 'echarts';
import { toptipAuto, timeText24 } from '../../utils/utils';
import { getStationInfo, getBusStopInfo } from '../../services/map';

export default class OtherClickBox extends Component {
  state = {
    detail: {},
    loading: false,
  };
  componentDidMount() {
    if (!this.props.stopData.shiftAnalysis) {
      this.otherClickChart = echarts.init(
        document.getElementById('otherClickChart'),
      );
    }
    this.fetchData(this.props.stopData);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.stopData.shiftAnalysis !== nextProps.stopData.shiftAnalysis
    ) {
      if (!nextProps.stopData.shiftAnalysis) {
        this.otherClickChart = echarts.init(
          document.getElementById('otherClickChart'),
        );
      }
      this.fetchData(nextProps.stopData);
    }
  }
  fetchData = data => {
    this.setState({
      loading: true,
    });
    if (data.stopType === 0) {
      getStationInfo({
        ...data,
      }).then(res => {
        this.setState({
          loading: false,
        });
        if (res.data) {
          this.setState({
            detail: { ...data, ...res.data },
          });
          if (!data.shiftAnalysis) {
            this.setLineOption(res.data.sectionTraffic);
          }
        }
      });
    } else {
      getBusStopInfo({
        ...data,
      }).then(res => {
        this.setState({
          loading: false,
        });
        if (res.data) {
          this.setState({
            detail: { ...data, ...res.data },
          });
          if (!data.shiftAnalysis) {
            this.setLineOption(res.data.busTraffic);
          }
        }
      });
    }
  };
  setLineOption = data => {
    let arriveCntArr = Object.values(data.getInCnt || {});
    let setOutCntArr = Object.values(data.getOutCnt || {});
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
        data: ['进站', '出站'],
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
          name: '进站',
          type: 'line',
          color: '#FFAC00',
          data: arriveCntArr,
          symbol: 'circle',
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
          name: '出站',
          type: 'line',
          data: setOutCntArr,
          symbol: 'circle',
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
    this.otherClickChart.clear();
    this.otherClickChart.setOption(option);
  };
  render() {
    const { detail, loading } = this.state;
    const data = this.props.stopData;
    const stopName = detail.stopName || detail.stopId || '';
    return (
      <div className={styles.OtherClickBox}>
        <Spin spinning={loading} tip={'数据加载中...'}>
          <h3 title={stopName.length > 12 ? stopName : ''}>
            站点名称：{stopName}
          </h3>
          <div
            className={styles.content}
            style={{ display: !data.shiftAnalysis ? 'block' : 'none' }}
          >
            <Row className={styles.params}>
              <Col span={12}>
                <b>
                  {detail.people || detail.upCnt || '0'}
                  <span>人</span>
                </b>
                {data.stopType === 0 ? '站点覆盖人数' : '站点上车客流'}
                <i />
              </Col>
              <Col span={12}>
                <b>
                  {detail.odTotal || detail.downCnt || '0'}
                  <span>{data.stopType === 0 ? '次' : '人'}</span>
                </b>
                {data.stopType === 0 ? '站点刷卡数' : '站点下车客流'}
              </Col>
            </Row>
            <div id="otherClickChart" className={styles.Chart}></div>
            <Row className={styles.busLines}>
              <Col span={24}>
                <span>
                  {data.stopType === 0
                    ? '与该站点接驳公交线路：'
                    : '经过本站点公交线路：'}
                </span>
              </Col>
              <Row className={styles.buses}>
                {(detail.busLineMsgItems || []).map((item, index) => {
                  if (!item.routeName) return '';
                  return (
                    <Col
                      span={6}
                      key={index}
                      title={`${item.startStopName}=>${item.endStopName}`}
                    >
                      <i>{item.routeName}路</i>
                    </Col>
                  );
                })}
              </Row>
            </Row>
          </div>
          <div
            className={styles.shiftAnalysis}
            style={{ display: data.shiftAnalysis ? 'block' : 'none' }}
          >
            <div className={styles.lineName}>
              线路名称：<span>{detail.routeName || ''}路</span>
            </div>
            <div className={styles.lineStopName}>{`${detail.startStopName ||
              ''}=>${detail.endStopName || ''}`}</div>
            <div className={styles.time}>
              <i>首</i>
              <span>{detail.firstStart || ''}</span>
              <b>末</b>
              <span>{detail.lastStart || ''}</span>
            </div>
            <div className={styles.line}>
              <span>工作日发车间隔：</span>
              {detail.headwayWork ? detail.headwayWork + 'min' : '暂无'}
            </div>
            <div className={styles.line}>
              <span>非工作日发车间隔：</span>
              {detail.headwayRest ? detail.headwayRest + 'min' : '暂无'}
            </div>
            <div className={styles.line}>
              <span>最早站点班次：</span>
              {detail.firstArrTime || ''}
            </div>
            <div className={styles.line}>
              <span>最晚站点班次：</span>
              {detail.lastArrTime || ''}
            </div>
            <div></div>
          </div>
        </Spin>
      </div>
    );
  }
}
