import React, { Component } from 'react';
import { Card, List } from 'antd';
import styles from './index.less';
import ChartTitle from '../ChartTitle';

const data = [
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
  { areaName: '工人路社区', odNum: '143245' },
];
class OdTrip extends Component {
  render() {
    return (
      <div className={styles.listContent}>
        <div className={styles.cardContent}>
          <Card
            className={styles.listCard}
            title={
              <div>
                <ChartTitle title="主要出发地" notNeedIntroduce={false} />
                <div className={styles.listTitle}>
                  <span className={styles.titleTip}>区域名称</span>
                  <span className={styles.titleTip}>出行人次</span>
                </div>
              </div>
            }
            bordered={false}
          >
            <List
              dataSource={data}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={'NO.' + index + 1}
                    title={item.areaName}
                  />
                  <div className={styles.listOdNum}>{item.odNum}</div>
                </List.Item>
              )}
            />
          </Card>
        </div>
        <div className={styles.cardContent}>
          <Card
            className={styles.listCard}
            title={
              <div>
                <ChartTitle title="主要目的地" notNeedIntroduce={false} />
                <div className={styles.listTitle}>
                  <span className={styles.titleTip}>区域名称</span>
                  <span className={styles.titleTip}>出行人次</span>
                </div>
              </div>
            }
            bordered={false}
          >
            <List
              dataSource={data}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={'NO.' + index + 1}
                    title={item.areaName}
                  />
                  <div className={styles.listOdNum}>{item.odNum}</div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    );
  }
}
export default OdTrip;
