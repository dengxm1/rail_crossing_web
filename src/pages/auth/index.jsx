/**
 * 路由级别权限控制
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { Spin } from 'antd';
import UnAuth from '../../components/noAuth/index';
@connect(({ global }) => ({ global }))
class Index extends Component {
  render() {
    const { userInfo } = this.props.global;
    const isLogin = localStorage.getItem('id_token');
    const currentRole = userInfo.role;
    const currentPath = window.location.pathname;
    const normalAuth = [
      '/AnalysisOfCorrelation',
      '/AnalysisOfBus',
      '/OptimizeScheme',
      '/',
    ]; //普通用户只有权限访问这些页面
    if (isLogin) {
      if (currentRole === '1') {
        return <>{this.props.children}</>;
      } else if (currentRole === '2') {
        const find = normalAuth.findIndex(item => item === currentPath);
        if (find !== -1) {
          return <>{this.props.children}</>;
        } else {
          return <UnAuth />;
        }
      } else {
        return (
          <div
            style={{
              height: '100%',
              width: '100%',
              textAlign: 'center',
              paddingTop: 'calc(50vh - 60px)',
            }}
          >
            <Spin tip={'页面加载中，请稍后...'} />
          </div>
        );
      }
    } else {
      return <Redirect to="/userLogin" />;
    }
  }
}
export default Index;
