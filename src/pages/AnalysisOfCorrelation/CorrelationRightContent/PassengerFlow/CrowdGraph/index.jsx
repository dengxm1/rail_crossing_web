import React, { Component } from 'react';
import echarts from 'echarts';
import styles from './index.less';
import { Card, Spin } from 'antd';
import color from '../../../../../utils/config';
import ChartTitle from '../../../../../components/ChartTitle';
import { toptipToRate, setLineOption } from '../../../../../utils/utils';

class CrowdGraph extends Component {
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
    isNonePassengerFlow: false,
    isNoneSectionTraffic: false,
    isNoneTimeThan: false,
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  //出行客流分布
  initSiteFlow = () => {
    const { passengerFlow } = this.props;
    const tripModeRef = echarts.init(document.getElementById('tripModeRef'));
    if (
      passengerFlow.passengerOut.length ||
      passengerFlow.passengerArrive.length
    ) {
      const data = {
        xAxisData: passengerFlow.passengerX,
        yAxis: {
          name: '人次',
        },
        series: [
          {
            name: '出站客流',
            areaStyle: {},
            stack: '总量',
            color: color.moon_people_time_color,
            data: passengerFlow.passengerOut,
          },
          {
            name: '进站客流',
            areaStyle: {},
            stack: '总量',
            color: color.moon_people_type_color,
            data: passengerFlow.passengerArrive,
          },
        ],
      };
      tripModeRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNonePassengerFlow: true,
      });
    }
  };

  //轨交站点断面客流量
  initWalkTime = () => {
    const { sectionTraffic } = this.props;
    const tripTimeRef = echarts.init(document.getElementById('tripTimeRef'));
    if (
      sectionTraffic.sectionArriveCnt.length ||
      sectionTraffic.sectionOutCnt.length
    ) {
      const data = {
        xAxisData: sectionTraffic.sectionX,
        legend: {
          icon: 'react',
        },
        yAxis: {
          name: '人次',
        },
        series: [
          {
            name: '出站客流',
            smooth: 0.6,
            symbol: 'circle',
            color: color.moon_people_time_color,
            data: sectionTraffic.sectionOutCnt,
          },
          {
            name: '进站客流',
            smooth: 0.6,
            symbol: 'circle',
            color: color.moon_people_type_color,
            data: sectionTraffic.sectionArriveCnt,
          },
        ],
      };
      tripTimeRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneSectionTraffic: true,
      });
    }
  };

  //出行时间占比
  initWaitTime = () => {
    const { timeThan } = this.props;
    const tripDistanceRef = echarts.init(
      document.getElementById('tripDistanceRef'),
    );
    if (timeThan.curTimeData.length || timeThan.lastTimeData.length) {
      const data = {
        xAxisData: timeThan.timeX,
        legend: {
          icon: 'react',
        },
        xAxis: {
          name: 'min',
        },
        yAxis: {
          axisLabel: {
            formatter: '{value}%',
          },
        },
        grid: {
          right: '10%',
        },
        series: [
          {
            name: '当月',
            smooth: 0.6,
            symbol: 'circle',
            color: color.moon_people_time_color,
            data: timeThan.curTimeData,
          },
          {
            name: '上月',
            smooth: 0.6,
            symbol: 'circle',
            color: color.moon_people_type_color,
            data: timeThan.lastTimeData,
          },
        ],
      };
      tripDistanceRef.setOption(setLineOption(data));
    } else {
      this.setState({
        isNoneTimeThan: true,
      });
    }
  };

  render() {
    const {
      tripModeLoding,
      tripTimeLoding,
      tripDistanceLoding,
      unitData,
    } = this.props;
    const {
      isNonePassengerFlow,
      isNoneSectionTraffic,
      isNoneTimeThan,
    } = this.state;
    return (
      <div className={styles.crowdContent}>
        <Card
          title={
            <ChartTitle
              title="出行客流分布"
              isShowDownLoad={true}
              apiUrl="/data/metro/travel"
              unitData={unitData}
            />
          }
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripModeLoding} className={styles.loading_style}>
            {!isNonePassengerFlow ? (
              <div id="tripModeRef" className={styles.tripTime}></div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
        <Card
          title={
            <ChartTitle
              title="轨交站点断面客流量"
              isShowDownLoad={true}
              apiUrl="/data/metro/travel"
              unitData={unitData}
            />
          }
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripTimeLoding} className={styles.loading_style}>
            {!isNoneSectionTraffic ? (
              <div id="tripTimeRef" className={styles.tripTime}></div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
        <Card
          title={
            <ChartTitle
              title="出行时间占比"
              isShowDownLoad={true}
              apiUrl="/data/metro/travel"
              unitData={unitData}
            />
          }
          className={styles.unitCard}
          bordered={false}
        >
          <Spin spinning={tripDistanceLoding} className={styles.loading_style}>
            {!isNoneTimeThan ? (
              <div id="tripDistanceRef" className={styles.tripTime}></div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
      </div>
    );
  }
}
export default CrowdGraph;
