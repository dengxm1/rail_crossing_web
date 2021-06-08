import React, { Component } from 'react';
import styles from './index.less';
import { Empty, List, Popover } from 'antd';
import go from '../../static/img/go_icon.png';
import arrive from '../../static/img/arrive_icon.png';
import { getFloat } from '../../utils/utils';
import { ArrowRightOutlined } from '@ant-design/icons';

class FlowSortList extends Component {
  flowItemChoose = item => {
    this.props.onFlowItemChoose(item);
  };
  render() {
    const { flowData, showNone, type } = this.props;
    return (
      <>
        {flowData.length ? (
          <List
            className={styles.listContent}
            locale={null}
            dataSource={flowData}
            renderItem={(item, index) => (
              <List.Item
                className={`${styles.analyzeListItem} ${
                  item['flag'] ? styles.showBar : ''
                }`}
                onClick={() => this.flowItemChoose(item)}
                extra={
                  type == 0 ? (
                    <div className={styles.itemExtra}>
                      <div className={styles.itemTip}>
                        <img src={go} />
                        <span>出发:{item.setOutCnt || ''}</span>
                      </div>
                      <div className={styles.itemTip}>
                        <img src={arrive} />
                        <span>到达:{item.arriveCnt || ''}</span>
                      </div>
                    </div>
                  ) : null
                }
              >
                <List.Item.Meta
                  avatar={<div className={styles.itemIndex}>{index + 1}</div>}
                  title={
                    (item.stopName || '').length > 10 ? (
                      <Popover
                        content={
                          <div className={styles.analyzeTitle}>
                            <div className={styles.busNum}>
                              {item.stopName || ''}
                            </div>
                          </div>
                        }
                      >
                        <div className={styles.analyzeTitle}>
                          <div className={styles.busNum}>
                            {item.stopName || ''}
                          </div>
                        </div>
                      </Popover>
                    ) : (
                      <div className={styles.analyzeTitle}>
                        <div className={styles.busNum}>
                          {item.stopName || ''}
                        </div>
                      </div>
                    )
                  }
                  description={
                    <div className={styles.analyzeDescription}>
                      <div className={styles.description}>
                        {type == 0
                          ? `OD总量:${item.odTotal || ''}`
                          : type === 1
                          ? `平均出行时间：${item.avgTrlTime}min`
                          : `平均出行距离：${getFloat(
                              item.avgTrlDistance / 1000,
                              2,
                            )}KM`}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div>
            {showNone && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </div>
        )}
      </>
    );
  }
}

export default FlowSortList;
