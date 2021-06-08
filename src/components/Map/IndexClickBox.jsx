import React, { Component } from 'react';
import { getIndexMarkerClick } from '../../services/map';
import { Row, Col, Button, Menu, Dropdown, Spin } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './IndexClickBox.less';
import icon_goTo from '../../static/img/icon_goTo.png';
import { congestionIndex } from '../../utils/utils';

export default class IndexClickBox extends Component {
  boxText = [
    {
      title: '接驳公交走向',
      lable: ['公交线路: ', '接驳轨交线路: '],
      lableFieldName: ['routeName', 'stationName'],
      param: ['重叠线路长度', '线路重复系数', '分散客流概率'],
      paramFieldName: [
        'routeRepeatLen',
        'routeRepeatRate',
        'scatteredPassengerFlow',
      ],
      units: ['km', '', ''],
      url: '/AnalysisOfCorrelation',
    },
    {
      title: '轨交客流分布',
      lable: ['轨交站点: ', '站点所属线路: '],
      lableFieldName: ['metroStopName', 'stationName'],
      param: ['轨交客流总数', '进站总客流数', '出站总客流数'],
      paramFieldName: ['totalCnt', 'upCnt', 'downCnt'],
      units: ['人', '人', '人'],
      url: '/AnalysisOfCorrelation',
    },
    {
      title: '换乘客流分布',
      lable: ['公交站点: ', '接驳轨交线路: '],
      lableFieldName: ['busStopName', 'stationName'],
      param: ['换乘客流总数', '周边道路拥堵指数', '换乘步行时间'],
      paramFieldName: ['cnt', 'roadCongestion', 'transferTime'],
      units: ['人', '', '分钟'],
      url: '/AnalysisOfBus',
    },
    {
      title: '客流覆盖情况',
      lable: ['公交线路: ', '接驳轨交线路: '],
      lableFieldName: ['routeName', 'stationName'],
      param: ['客流覆盖率', '小区覆盖率', '供求匹配率'],
      paramFieldName: [
        'passengerFlowCoverage',
        'cellCoverage',
        'capacityMatch',
      ],
      units: ['', '', ''],
      url: '/AnalysisOfBus',
    },
    {
      title: '换乘等待时间',
      lable: ['公交线路: ', '接驳轨交线路: '],
      lableFieldName: ['routeName', 'stationName'],
      param: ['换乘等待时间', '服务时间匹配度', ''],
      paramFieldName: ['transferWaitTime', 'timeMatch', ''],
      units: ['分钟', '', ''],
      url: '/AnalysisOfBus',
    },
  ];
  paramDataHandle = name => {
    const data = this.state.dataList[this.state.curIndex] || {};
    const fieldName = [
      // 'routeRepeatRate',
      'scatteredPassengerFlow',
      'passengerFlowCoverage',
      'cellCoverage',
      'capacityMatch',
    ];
    if (fieldName.indexOf(name) > -1) {
      return data[name] ? (data[name] * 100).toFixed(2) + '%' : '0%';
    } else if (name === 'roadCongestion') {
      return data[name] ? congestionIndex(data[name]) : '暂无';
    } else if (name === 'routeRepeatLen') {
      return data[name] && parseFloat(data[name]) > 0
        ? parseFloat(data[name]).toFixed(2)
        : 0;
    } else {
      return data[name] || 0;
    }
  };
  getColor = name => {
    const data = this.state.dataList[this.state.curIndex] || {};
    const { lineColor, getColorIndex } = this.props;
    const fieldName = [
      'routeRepeatRate',
      'totalCnt',
      'cnt',
      'passengerFlowCoverage',
      'transferWaitTime',
    ];
    const type = fieldName.indexOf(name);
    return type > -1 ? lineColor[getColorIndex(type, data[name])] : null;
  };
  state = {
    curIndex: 0,
    dataList: [[]],
    loading: false,
  };
  componentDidMount() {
    this.getIndexMarkerClick();
  }
  getIndexMarkerClick = () => {
    this.setState({
      loading: true,
    });
    const { selectedLayer, selectedMonth, id, isUpDown } = this.props;
    getIndexMarkerClick({
      statDate: selectedMonth,
      id: id,
      type: selectedLayer,
      isUpDown: isUpDown
    }).then(res => {
      this.setState({
        loading: false,
      });
      if (res.data) {
        this.setState({
          dataList: res.data,
        });
      }
    });
  };
  goToDepthAnalysis = (url, data) => {
    const { selectedLayer, selectedMonth, isUpDown } = this.props;
    const id = selectedLayer === 0 ? data.routeName : data.metroStopName;
    const routeId =
      selectedLayer === 3 || selectedLayer === 4
        ? `&routeId=${data.routeName}&isUpDown=${isUpDown}`
        : '';
    window.open(`${url}?metro=${data.stationName}&statDate=${selectedMonth}&id=${id}${routeId}`);
  };

  render() {
    const { selectedLayer } = this.props;
    const { dataList, curIndex, loading } = this.state;
    const context = this.boxText[selectedLayer];
    const data = dataList[curIndex] || [];
    const menu = (
      <Menu>
        {dataList.map((item, index) => {
          return (
            <Menu.Item
              key={index}
              onClick={e => this.setState({ curIndex: parseInt(e.key) })}
            >
              {item.stationName}
            </Menu.Item>
          );
        })}
      </Menu>
    );
    const isStop = selectedLayer === 1 || selectedLayer === 2;
    return (
      <div
        className={styles.IndexClickBox}
        style={{ height: isStop ? 220 : 192 }}
      >
        <Spin spinning={loading}>
          <h3>{context.title}</h3>
          <div className={styles.content}>
            <Row className={styles.main}>
              <Col
                span={isStop ? 24 : 9}
                className={isStop ? styles.stopOrLine : ''}
              >
                {context.lable[0]}
                <span>{data[context.lableFieldName[0]]}</span>
              </Col>
              <Col span={isStop ? 24 : 15} className={styles.metro}>
                {context.lable[1]}
                {dataList.length > 1 ? (
                  <Dropdown overlay={menu} trigger={['click']}>
                    <a
                      className="ant-dropdown-link"
                      onClick={e => e.preventDefault()}
                    >
                      <span className={styles.subwayName}>
                        {data.stationName}
                      </span>
                      {data.stationName ? (
                        <DownOutlined className={styles.DownOutlined} />
                      ) : (
                        ''
                      )}
                    </a>
                  </Dropdown>
                ) : (
                  <span>{data.stationName}</span>
                )}
              </Col>
            </Row>
            <Row className={styles.params}>
              <Col
                span={selectedLayer === 2 ? 7 : selectedLayer === 4 ? 12 : 8}
              >
                <b style={{ color: this.getColor(context.paramFieldName[0]) }}>
                  {this.paramDataHandle(context.paramFieldName[0])}
                  <span>{context.units[0]}</span>
                </b>
                {context.param[0]}
                <i />
              </Col>
              <Col
                span={selectedLayer === 2 ? 10 : selectedLayer === 4 ? 12 : 8}
              >
                <b style={{ color: this.getColor(context.paramFieldName[1]) }}>
                  {this.paramDataHandle(context.paramFieldName[1])}
                  <span>{context.units[1]}</span>
                </b>
                {context.param[1]}
                {selectedLayer !== 4 ? <i /> : ''}
              </Col>
              {selectedLayer !== 4 ? (
                <Col span={selectedLayer === 2 ? 7 : 8}>
                  <b
                    style={{ color: this.getColor(context.paramFieldName[2]) }}
                  >
                    {this.paramDataHandle(context.paramFieldName[2])}
                    <span>{context.units[2]}</span>
                  </b>
                  {context.param[2]}
                </Col>
              ) : (
                ''
              )}
            </Row>
            <Button
              type="primary"
              className={styles.btn}
              disabled={!data.stationName}
              onClick={() => this.goToDepthAnalysis(context.url, data)}
            >
              前往深入分析
              <img src={icon_goTo} alt="" />
            </Button>
          </div>
        </Spin>
      </div>
    );
  }
}
