import React, { Component } from 'react';
import { history } from 'umi';
import Header from '../components/Header/index';
import styles from './index.less';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

//全局
class Index extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <ConfigProvider locale={zhCN}>{this.props.children}</ConfigProvider>
        </div>
      </div>
    );
  }
}

export default Index;
