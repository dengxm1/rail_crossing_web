import React, { Component } from 'react';
import { List, Popover, Card, Spin, Empty } from 'antd';
import styles from './index.less';
import ChartTitle from '../../../../components/ChartTitle';
import echarts from 'echarts';
import {
  toptipAuto,
  congestionIndex,
  setBarOption,
} from '../../../../utils/utils';
import color from '../../../../utils/config';

class BusStation extends Component {
  state = {
    isNoneWalkTimeData: false,
    isNoneWaitTimeData: false,
  };
  componentDidMount() {
    this.props.onRef(this);
  }

  //步行时间
  initWalkTime = () => {
    const { walkTimeData } = this.props;
    const walkTimeRef = echarts.init(document.getElementById('walkTimeRef'));
    walkTimeRef.clear();
    if (walkTimeData.walkTimeSeriesData.length) {
      let data = {
        xAxisData: walkTimeData.walkTimeXdata,
        tooltip: {
          formatter: '{b0}: {c0}分钟',
          position: function(point, params, dom, rect, size) {
            return toptipAuto(point, size);
          },
        },
        legend: {
          isNone: true,
        },
        xAxis: {
          axisLabel: {
            show: false,
          },
        },
        series: [
          {
            name: '换乘步行时间',
            data: walkTimeData.walkTimeSeriesData,
          },
        ],
      };
      walkTimeRef.setOption(setBarOption(data));
      walkTimeRef.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: 0,
      });
    } else {
      this.setState({
        isNoneWalkTimeData: true,
      });
    }
  };

  //换乘等待您时间
  initWaitTime = () => {
    const { waitTimeData } = this.props;
    const waitTimeRef = echarts.init(document.getElementById('waitTimeRef'));
    waitTimeRef.clear();
    if (waitTimeData.waitTimeSeriesData.length) {
      let data = {
        xAxisData: waitTimeData.waitTimeXdata,
        tooltip: {
          formatter: '{b0}路: {c0}分钟',
        },
        legend: {
          isNone: true,
        },
        xAxis: {
          axisLabel:
            waitTimeData.waitTimeSeriesData.length < 11
              ? {
                  interval: 0, //横轴信息全部显示
                  color: 'rgba(0,0,0,0.65)',
                  rotate: -15,
                  margin: 12,
                  // inside:true
                }
              : false,
        },
        series: [
          {
            name: '换乘等待时间',
            data: waitTimeData.waitTimeSeriesData,
          },
        ],
      };
      waitTimeRef.setOption(setBarOption(data));
      waitTimeRef.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: 0,
      });
    } else {
      this.setState({
        isNoneWaitTimeData: true,
      });
    }
  };

  render() {
    const {
      stationTimeLoding,
      stationDistanceLoding,
      flowData,
      unitData,
    } = this.props;
    const { isNoneWalkTimeData, isNoneWaitTimeData } = this.state;
    return (
      <div className={styles.mainContent}>
        <Card
          className={`${styles.cardContent} ${styles.UnitCard} ${styles.list_wrap}`}
          title={<ChartTitle title="接驳公交站点" />}
          bordered={false}
        >
          <Spin spinning={stationTimeLoding} className={styles.loading_style}>
            <List
              className={styles.listContent}
              locale={null}
              dataSource={flowData}
              renderItem={(item, index) => (
                <List.Item
                  className={`${styles.analyzeListItem} ${
                    item['flag'] ? styles.showBar : ''
                  }`}
                  extra={
                    <div className={styles.itemExtra}>
                      <div className={styles.itemTip}>
                        站点周边道路拥堵指数：
                        <span
                          style={{
                            color: congestionIndex(item.roadCongestion, true),
                          }}
                        >
                          {congestionIndex(item.roadCongestion)}
                        </span>
                      </div>
                      <div className={styles.itemTip}>
                        站点周边累计车流量：{parseFloat(item.roadVolume) || ''}
                      </div>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={<div className={styles.itemIndex}>{index + 1}</div>}
                    title={
                      (item.busStopName || '').length > 10 ? (
                        <Popover
                          content={
                            <div className={styles.analyzeTitle}>
                              <div className={styles.busNum}>
                                {item.busStopName || ''}
                              </div>
                            </div>
                          }
                        >
                          <div className={styles.analyzeTitle}>
                            <div className={styles.busNum}>
                              {item.busStopName || ''}
                            </div>
                          </div>
                        </Popover>
                      ) : (
                        <div className={styles.analyzeTitle}>
                          <div className={styles.busNum}>
                            {item.busStopName || ''}
                          </div>
                        </div>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Card>
        <Card
          title={
            <ChartTitle
              title="换乘步行时间"
              unitData={unitData}
              isShowDownLoad={true}
              apiUrl="/data/metro/site"
            />
          }
          bordered={false}
          className={`${styles.cardContent} ${styles.UnitCard}`}
        >
          <Spin spinning={stationTimeLoding} className={styles.loading_style}>
            {!isNoneWalkTimeData ? (
              <div id="walkTimeRef" className={styles.tripTime}></div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
        <Card
          title={
            <ChartTitle
              title="换乘等待时间"
              unitData={unitData}
              isShowDownLoad={true}
              apiUrl="/data/metro/site"
            />
          }
          bordered={false}
          className={`${styles.cardContent} ${styles.UnitCard}`}
        >
          <Spin
            spinning={stationDistanceLoding}
            className={styles.loading_style}
          >
            {!isNoneWaitTimeData ? (
              <div id="waitTimeRef" className={styles.tripTime}></div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
      </div>
    );
  }
}
export default BusStation;
