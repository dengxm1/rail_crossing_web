import React, { Component } from 'react';
import { Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { introduceContent } from './data';

class Introduce extends Component {
  render() {
    const { index } = this.props;
    return (
      <div className={styles.tips}>
        <Popover
          placement="right"
          content={
            <div className={styles.popoverContent}>
              <div className={styles.introduceTitle}>指标算法</div>
              <div className={styles.introduceContent}>
                {introduceContent[index]['arithmetic']}
              </div>
              <div className={styles.introduceTitle}>指标定义</div>
              <div className={styles.introduceContent}>
                {introduceContent[index]['definition']}
              </div>
            </div>
          }
          trigger="click"
        >
          <InfoCircleOutlined />
        </Popover>
      </div>
    );
  }
}
export default Introduce;
