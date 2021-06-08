import React, { Component } from 'react';
import { connect } from 'dva';
import { Empty } from 'antd';
import styles from './Right.less';
import CommonTab from './CommonTab';
import echarts from 'echarts';

@connect(({ home }) => ({ home }))
class Right extends Component {
  componentDidMount() {
    // Echart初始化
    for (let i = 0; i < 5; i++) {
      this[`lineTop${i}`] = echarts.init(
        document.getElementById(`lineTop${i}`),
      );
    }
    this.lineLowest = echarts.init(document.getElementById('lineLowest'));
    this.lineLowest.on('click', params => {
      this.props.onSelect(params.name)
    })
    // setOption
    this.setEchartOption();
  }
  setEchartOption = () => {
    const { TopLoad, LastLoad } = this.props.home;
    for (let i in [1, 2, 3, 4, 5]) {
      if (this[`lineTop${i}`]) {
        this[`lineTop${i}`].setOption(
          this.getLineTopOption(TopLoad[i] ? TopLoad[i].load_rate : 0),
        );
      }
    }
    if (this.lineLowest) {
      this.lineLowest.setOption(this.getLineLowestOption(LastLoad));
    }
  };
  getLineTopOption = num => {
    return {
      color: ['#D4D4D4', '#D4D4D4'],
      series: [
        {
          name: '满载率',
          type: 'pie',
          radius: ['70%', '90%'],
          avoidLabelOverlap: false,
          emphasis: {
            lable: {
              show: true,
              textStyle: {
                fontSize: '20',
                fontWeight: 'bold',
              },
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: function() {
                return (num * 100).toFixed(0) + '%';
              },
              textStyle: {
                fontSize: document.body.clientWidth > 1600 ? 14 : 12,
                color: 'rgba(0,0,0,0.85)',
              },
            },
          },
          data: [
            {
              name: '已使用',
              value: num,
              itemStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    colorStops: [
                      // !! 在此添加想要的渐变过程色 !!
                      { offset: 0, color: '#5CCFFA' },
                      { offset: 1, color: '#2F7BF4' },
                    ],
                  },
                },
              },
              hoverAnimation: false,
            },
            {
              name: '未使用',
              value: 1 - num,
              hoverAnimation: false,
            },
          ],
        },
      ],
    };
  };
  getLineLowestOption = data => {
    let xAxisArr = [];
    let dataArr = [];
    for (let item of data) {
      xAxisArr.push(item.route_name || '');
      dataArr.push(item.load_rate || 0);
    }
    return {
      grid: {
        left: '5%',
        right: '8%',
        bottom: '1%',
        top: '8%',
        containLabel: true, //grid 区域是否包含坐标轴的刻度标签
      },
      tooltip: {
        // trigger: 'axis',
        formatter: function(data) {
          return data.name + ' : ' + (data.value * 100 || 0).toFixed(0) + '%';
        },
      },
      xAxis: {
        axisLine: {
          show: false, //x轴
        },
        axisTick: {
          show: false, //刻度线
        },
        type: 'category',
        data: xAxisArr,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(v) {
            return v === 0 ? 0 : `${v * 100}%`;
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false, //刻度线
        },
        splitLine: {
          lineStyle: {
            type: 'dotted',
            // color: ['#ccc']
          },
        },
      },
      series: [
        {
          data: dataArr,
          itemStyle: {
            normal: {
              color: function(params) {
                let colorList = [
                  // '#0B80EF',
                  'rgba(11,128,239,0.3)',
                  'rgba(11,128,239,1)',
                  // '#00C1DE',
                  'rgba(0,193,222,0.3)',
                  'rgba(0,193,222,1)',
                  // '#FFAC00',
                  'rgba(255,172,0,0.3)',
                  'rgba(255,172,0,1)',
                  // '#E25959',
                  'rgba(226,89,89,0.3)',
                  'rgba(226,89,89,1)',
                  // '#856BE4',
                  'rgba(133,107,228,0.3)',
                  'rgba(133,107,228,1)',
                ];
                // return colorList[params.dataIndex];
                let color1 = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: colorList[params.dataIndex * 2 + 1] },
                  { offset: 1, color: colorList[params.dataIndex * 2] },
                ]);
                return color1;
              },
              barBorderRadius: [50, 50, 0, 0],
            },
          },
          barWidth: '25%',
          type: 'bar',
        },
      ],
    };
  };

  render() {
    const { TopStop, LastStop, TopLoad, LastLoad } = this.props.home;
    // setOption
    this.setEchartOption();
    return (
      <div className={styles.Right}>
        <div className={styles.scrollbar}>
          <CommonTab title="线路排名" height="50%">
            <div className={styles.lineTop}>
              <h3>
                <i />
                满载率最高接驳公交线路TOP5
              </h3>
              <ul>
                {[0, 1, 2, 3, 4].map(i => {
                  return (
                    <li key={i} onClick={()=>this.props.onSelect(TopLoad[i].route_name)}>
                      <div id={`lineTop${i}`}></div>
                      {TopLoad.length ? (
                        <span>
                          <i>NO.{i + 1}</i>
                          {TopLoad[i].route_name || ''}
                        </span>
                      ) : (
                        ''
                      )}
                    </li>
                  );
                })}
                {!TopLoad.length && (
                  <div className={styles.emptyBox} >
                    <div className={styles.empty}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  </div>
                )}
              </ul>
              <h3 style={{ marginTop: '4%' }}>
                <i />
                满载率最低接驳公交线路TOP5
              </h3>
              <div
                style={{
                  width: '100%',
                  height: 'calc(46% - 32px)',
                  position: 'relative',
                }}
              >
                <div
                  id="lineLowest"
                  style={{ width: '100%', height: '100%' }}
                ></div>
                {!LastLoad.length && (
                  <div className={styles.emptyBox} >
                    <div className={styles.empty}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CommonTab>
          <CommonTab title="站点排名" height="50%">
            <div className={styles.passengerFlow}>
              <h3>
                <i />
                客流量最高轨交站点TOP5
              </h3>
              <ul className={styles.highest}>
                {TopStop.map((item, index) => {
                  return (
                    <li key={index} onClick={()=>this.props.onSelect(item.stop_name)}>
                      <i>{index + 1}</i>
                      <span>{item.stop_name}</span>
                      <b>{item.passenger_cnt || 0}人</b>
                    </li>
                  );
                })}
                {!TopStop.length ? (
                  <div className={styles.empty}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                ) : (
                  ''
                )}
              </ul>
              <h3>
                <i />
                客流量最低轨交站点TOP5
              </h3>
              <ul className={styles.highest}>
                {LastStop.map((item, index) => {
                  return (
                    <li key={index} onClick={()=>this.props.onSelect(item.stop_name)}>
                      <i>{index + 1}</i>
                      <span>{item.stop_name}</span>
                      <b>{item.passenger_cnt || 0}人</b>
                    </li>
                  );
                })}
                {!LastStop.length ? (
                  <div className={styles.empty}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                ) : (
                  ''
                )}
              </ul>
              {/* <ul className={styles.lowest}>
                {LastStop.map((item, index) => {
                  return (
                    <li key={index}>
                      <span
                        title={
                          (item.stop_name || '').length > 6
                            ? item.stop_name
                            : ''
                        }
                      >
                        {item.stop_name}
                      </span>
                      <i
                        style={{
                          width:
                            (item.passenger_cnt / LastStop[0].passenger_cnt) *
                            60,
                        }}
                      />
                      <b>{item.passenger_cnt}</b>
                    </li>
                  );
                })}
                {!LastStop.length ? (
                  <div className={styles.empty}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                ) : (
                  ''
                )}
              </ul> */}
            </div>
          </CommonTab>
        </div>
      </div>
    );
  }
}
export default Right;
