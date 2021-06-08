import React, { Component } from 'react';
import { Button } from 'antd';
import styles from './404.less';

export default class Page404 extends Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          background: '#fff',
          height: '100%',
          width: '100%',
        }}
      >
        <div className={styles.err_inner}>
          <div className={styles.content}>
            <div className={styles.img_content}></div>
            <div className={styles.tip_content}>
              <div className={styles.status_tip}>404</div>
              <div className={styles.friend_tip}>抱歉，你访问的页面不存在</div>
              <Button
                type="primary"
                onClick={() => (window.location.href = '/')}
                className={styles.go_back}
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
