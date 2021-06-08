import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './Left.less';
import { Empty, Radio } from 'antd';
import CommonTab from './CommonTab';
import icon_up from '../../../static/img/up.png';
import icon_down from '../../../static/img/down.png';
import echarts from 'echarts';
import { transToTime, timeText24, toptipAuto } from '../../../utils/utils';

@connect(({ home }) => ({ home }))
export default class Left extends Component {
  state = {};
  componentDidMount() {
    // Echart初始化
    this.myChart300 = echarts.init(document.getElementById('myChart300'));
    this.myChart500 = echarts.init(document.getElementById('myChart500'));
    this.myChartLine = echarts.init(document.getElementById('myChart_line'));
    // setOption
    this.setEchartOption();
  }
  setEchartOption = () => {
    const { BasisInfo, BusPass } = this.props.home;
    if (this.myChart300 && this.myChart500) {
      this.myChart300.setOption(
        this.getPieOption(
          '300米',
          BasisInfo.last ? BasisInfo.last.coverage_rate_3 : 0.001,
          BasisInfo.cur ? BasisInfo.cur.coverage_rate_3 : 0.001,
        ),
      );
      this.myChart500.setOption(
        this.getPieOption(
          '500米',
          BasisInfo.last ? BasisInfo.last.coverage_rate_5 : 0.001,
          BasisInfo.cur ? BasisInfo.cur.coverage_rate_5 : 0.001,
        ),
      );
    }
    if (this.myChartLine && JSON.stringify(BusPass) !== '{}') {
      this.myChartLine.setOption(this.getLineOption(BusPass));
    }
  };
  getPieOption = (text = '300米', lastRate = 0.5, curRate = 0.5) => {
    return {
      title: {
        text: text,
        textStyle: {
          color: '#2C92F2',
          fontSize: 11,
          fontWeight: 400,
        },
        left: 'center',
        top: 'center',
      },
      tooltip: {
        position: function(point, params, dom, rect, size) {
          return toptipAuto(point, size);
        },
        // formatter: '{a} <br/>{b}: {c}%',
        formatter: function(data) {
          return (
            data.seriesName +
            '<br/>' +
            data.name +
            ' : ' +
            data.value.toFixed(0) +
            '%'
          );
        },
      },
      angleAxis: {
        max: 100,
        z: 10,
        // 隐藏刻度线
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      radiusAxis: {
        type: 'category',
        data: ['', '上月 ', '当月 '],
        z: 10,
        axisLabel: {
          interval: 0,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      polar: {
        radius: '85%', //图形大小
      },
      series: [
        {
          type: 'bar',
          barWidth: '60%',
          label: {
            show: true,
            position: 'inside',
          },
          data: [
            {
              value: 100,
              itemStyle: {
                normal: {
                  color: '#E8EDF4',
                },
              },
              tooltip: {
                show: false,
              },
            }, //空出一个
            {
              value: lastRate * 100,
              itemStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    colorStops: [
                      { offset: 1, color: '#19E1FF' },
                      { offset: 0, color: '#B0F5FF' },
                    ],
                  },
                },
              },
            },
            {
              value: curRate * 100,
              itemStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    colorStops: [
                      { offset: 0, color: '#D1E8FF' },
                      { offset: 1, color: '#0B80EF' },
                    ],
                  },
                },
              },
            },
          ],
          coordinateSystem: 'polar',
          roundCap: true,
          name: '覆盖率',
          z: 2,
        },
        {
          name: '背景1',
          type: 'pie',
          radius: ['0', '25%'],
          tooltip: {
            show: false,
          },
          label: {
            show: false,
          },
          data: [
            {
              value: 0,
              hoverAnimation: false,
              itemStyle: {
                normal: {
                  color: '#E8EDF4',
                },
              },
            },
          ],
          z: 1,
        },
        {
          name: '背景2',
          type: 'pie',
          radius: ['69%', '72%'],
          tooltip: {
            show: false,
          },
          label: {
            show: false,
          },
          data: [
            {
              value: 0,
              hoverAnimation: false,
              itemStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    colorStops: [{ offset: 0, color: '#D1E8FF' }],
                  },
                },
              },
            },
          ],
          z: 1,
        },
        {
          name: '背景3',
          type: 'pie',
          radius: ['42%', '45%'],
          tooltip: {
            show: false,
          },
          label: {
            show: false,
          },
          data: [
            {
              value: 0,
              hoverAnimation: false,
              itemStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    colorStops: [{ offset: 0, color: '#B0F5FF' }],
                  },
                },
              },
            },
          ],
          z: 1,
        },
      ],
    };
  };
  getLineOption = data => {
    let xAxisArr = [];
    let curArr = [];
    let lastArr = [];
    if (data) {
      let lableArr = Object.keys(data);
      for (let key in data[lableArr[1]]) {
        xAxisArr.push(key);
        curArr.push(data[lableArr[1]][key]);
      }
      for (let key in data[lableArr[0]]) {
        lastArr.push(data[lableArr[0]][key]);
      }
    }
    return {
      grid: {
        left: '5%',
        right: '8%',
        bottom: '8%',
        top: '25%',
        containLabel: true, //grid 区域是否包含坐标轴的刻度标签
      },
      tooltip: {
        trigger: 'axis',
        position: function(point, params, dom, rect, size) {
          return toptipAuto(point, size);
        },
        formatter: function(e) {
          let str1 = e[0]
            ? `${e[0].name}<br/>${e[0].seriesName}: ${(
                e[0].value / 10000
              ).toFixed(2)}万人`
            : '';
          let str2 = e[1]
            ? `<br/>${e[1].seriesName}: ${(e[1].value / 10000).toFixed(2)}万人`
            : '';
          return str1 + str2;
        },
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
        data: timeText24(), //xAxisArr,
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
          verticalAlign: 'middle',
        },
        axisLabel: {
          formatter: function(value) {
            return (value / 10000).toFixed(0) + '万';
          },
        },
        splitLine: {
          lineStyle: {
            color: [
              'rgba(44,161,80,0.6)',
              'rgba(115,161,27,0.6)',
              'rgba(255,185,38,0.6)',
              'rgba(255,157,51,0.6)',
              'rgba(255,0,0,0.6)',
              'rgba(255,0,0,0.6)',
              'rgba(255,0,0,0.6)',
            ],
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '当月',
          type: 'line',
          data: curArr,
          itemStyle: {
            normal: {
              lineStyle: {
                // 系列级个性化折线样式 ==昨天
                width: 2,
                type: 'solid',
                color: '#2876FF',
                // color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
                //   {
                //     //渐变色
                //     offset: 0,
                //     color: 'rgba(44,161,80,0.4)',
                //   },
                //   {
                //     offset: 0.3,
                //     color: 'rgba(255,185,38,1)',
                //   },
                //   {
                //     offset: 0.6,
                //     color: 'rgba(255,0,0,1)',
                //   },
                //   {
                //     offset: 1,
                //     color: 'rgba(44,161,80,1)',
                //   },
                // ]), //线条渐变色
              },
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: 'rgba(209,229,254,0.1)',
              },
              {
                offset: 1,
                color: 'rgba(209,229,254,1)',
              },
            ]),
          },
          showSymbol: false,
          smooth: true,
        },
        {
          name: '上月',
          type: 'line',
          color: 'rgba(44,161,80,0.4)',
          data: lastArr,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2,
                type: 'dotted', //dashed
                color: '#FFAC00',
              },
            },
          },
          showSymbol: false,
          smooth: true,
        },
      ],
    };
  };
  onTransChange = e => {
    const { BusPass, SubwayPass } = this.props.home;
    if (this.myChartLine) {
      if (e.target.value === 'bus') {
        this.myChartLine.setOption(this.getLineOption(BusPass));
      } else {
        this.myChartLine.setOption(this.getLineOption(SubwayPass));
      }
    }
  };
  render() {
    const { BasisInfo, BusPass, SubwayPass } = this.props.home;
    this.setEchartOption();
    const options = [
      { label: '公交', value: 'bus' },
      { label: '轨交', value: 'train' },
    ];
    const basisInfoArr = [
      { key: 'metro_line', name: '轨交线路总数（条）' },
      { key: 'bus_routes', name: '接驳公交线路总数（条）' },
      { key: 'metro_shuttle', name: '接驳公交车辆总数（辆）' },
      { key: 'transfer_station', name: '接驳站点总数（个）' },
      { key: 'avg_line_load', name: '平均线路负荷（人次/公里）' },
    ];
    const getValue = key => {
      return BasisInfo.cur && BasisInfo.cur[key] ? BasisInfo.cur[key] : 0;
    };
    const getIconSrc = key => {
      return BasisInfo.cur &&
        BasisInfo.last &&
        BasisInfo.cur[key] &&
        BasisInfo.last[key]
        ? BasisInfo.cur[key] - BasisInfo.last[key] >= 0
          ? icon_up
          : icon_down
        : icon_up;
    };
    const getRate = key => {
      return BasisInfo.cur &&
        BasisInfo.last &&
        BasisInfo.cur[key] &&
        BasisInfo.last[key] &&
        BasisInfo.cur[key] - BasisInfo.last[key]
        ? (
            (Math.abs(BasisInfo.cur[key] - BasisInfo.last[key]) /
              BasisInfo.last[key]) *
            100
          ).toFixed(0) + '%'
        : '0%';
    };
    return (
      <div className={styles.Left}>
        <div className={styles.scrollbar}>
          <CommonTab title="基础设施数据概览" height="50%">
            <div className={styles.basicItems}>
              <ul>
                {basisInfoArr.map((item, index) => {
                  return (
                    <li key={index}>
                      <p>{item.name}</p>
                      <div className={styles.param}>
                        <i>{getValue(item.key)}</i>
                        <span>
                          环比
                          <img src={getIconSrc(item.key)} alt="" />
                          <b>{getRate(item.key)}</b>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CommonTab>
          <CommonTab title="接驳站点覆盖率" height="25%">
            <div className={styles.basicItems} style={{ height: '80%' }}>
              <div
                id="myChart300"
                style={{ width: '50%', height: '100%', float: 'left' }}
              ></div>
              <div
                id="myChart500"
                style={{ width: '50%', height: '100%', float: 'right' }}
              ></div>
            </div>
          </CommonTab>
          <CommonTab title="客流量分析" height="25%">
            <div className={styles.type}>
              <Radio.Group
                options={options}
                onChange={this.onTransChange}
                // value={value}
                defaultValue={'bus'}
                optionType="button"
                buttonStyle="solid"
                size="small"
              />
            </div>
            <div className={styles.basicItems} style={{ height: '80%' }}>
              {JSON.stringify(BusPass).length > 50 ||
              JSON.stringify(SubwayPass).length > 50 ? (
                <div className={styles.legend}>
                  <i></i>
                  <span>当月</span>
                  <i></i>
                  <span>上月</span>
                </div>
              ) : (
                ''
              )}
              <div
                id="myChart_line"
                style={{ width: '100%', height: '100%' }}
              ></div>
              {JSON.stringify(BusPass).length < 50 &&
              JSON.stringify(SubwayPass).length < 50 ? (
                <div className={styles.empty}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : (
                ''
              )}
            </div>
          </CommonTab>
        </div>
      </div>
    );
  }
}
