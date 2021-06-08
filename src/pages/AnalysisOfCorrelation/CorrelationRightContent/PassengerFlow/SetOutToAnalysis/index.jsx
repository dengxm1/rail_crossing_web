/**
 * 客流分析之出发到达分析
 * 邓小妹
 * */

import React, { Component } from 'react';
import styles from './index.less';
import { Card, Table, Badge } from 'antd';
import { setOutAndArrive } from '../../../../../services/correlation';
import ChartTitle from '../../../../../components/ChartTitle';

class SetOutToAnalysis extends Component {
  state = {
    originData: [],
    destinationData: [],
    originDataLoading: false,
  };
  componentDidMount() {}

  render() {
    const { originData, destinationData, originDataLoading } = this.props;
    const color = ['#F5130D', '#EC9306', '#0B80EF'];
    const columns = [
      {
        title: '区域名称',
        dataIndex: 'tfcunitName',
        className: 'areaName',
        render: (text, record, index) => (
          <span>
            <span style={{ color: color[index], marginRight: 10 }}>
              NO.{index + 1}
            </span>
            {text}
          </span>
        ),
      },
      {
        title: '出行人次',
        width: '20%',
        align: 'center',
        className: 'outPersonNum',
        dataIndex: 'passenger',
        render: (text, record, index) => (
          <span style={{ color: color[index] }}>{text}</span>
        ),
      },
    ];
    return (
      <div className={styles.typeAnalysis}>
        {/*主要出发地*/}
        <Card
          title={<ChartTitle title="主要出发地" notNeedIntroduce={true} />}
          bordered={false}
        >
          <Table
            size="small"
            columns={columns}
            dataSource={originData}
            pagination={false}
            loading={originDataLoading}
          />
        </Card>

        {/*主要目的地*/}
        <div type={{ margin: '20px' }}>
          <Card
            title={<ChartTitle title="主要目的地" notNeedIntroduce={true} />}
            bordered={false}
          >
            <Table
              size="small"
              columns={columns}
              dataSource={destinationData}
              pagination={false}
              loading={originDataLoading}
            />
          </Card>
        </div>
      </div>
    );
  }
}
export default SetOutToAnalysis;
