import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { Menu, Dropdown, message, Switch } from 'antd';
import { withRouter, history } from 'umi';
import utils from '../../utils/utils';
import sysImg from '../../static/img/author.png';
import logo from '../../static/img/logo.png';
import { logoutUser } from '../../services/userServ';
import { get } from '../../utils/request';

@connect(({ global }) => ({ global }))
class Index extends Component {
  nowTime = null;

  state = {
    value: '',
    nowTime: '',
    userData: true,
    changeTheme: true,
    userInfo: {},
  };

  onClickMenu = e => {
    history.push(e.key);
  };

  NowTime = () => {
    //获取年月日
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    //获取时分秒
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    //检查是否小于10
    h = this.check(h);
    m = this.check(m);
    s = this.check(s);
    month = this.check(month);
    day = this.check(day);
    this.setState({
      nowTime: year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s,
    });
  };
  //时间数字小于10，则在之前加个“0”补位。
  check = i => {
    return i < 10 ? `0${i}` : i;
  };

  componentDidMount() {
    this.nowTime = setInterval(() => {
      this.NowTime();
    }, 1000);
    // // 获取用户信息
    // get(`/auto/isLogin`, {
    //   id_token: localStorage.getItem('id_token'),
    // }).then(res => {
    //   if (res.code === 200) {
    //     this.setState({
    //       userInfo: res.data
    //     })
    //   }
    // });
  }

  componentWillUnmount() {
    this.setState({ value: '' });
    clearInterval(this.nowTime);
  }

  changeColor = mapTheme => {
    this.props.dispatch({
      type: 'global/setMapTheme',
      payload: {
        mapTheme: mapTheme ? 'light' : 'dark',
      },
    });
  };

  userLogout = () => {
    const { userInfo } = this.props.global;
    const params = {
      appId: localStorage.getItem('appId'),
      enternalId: userInfo.externalId,
    };
    message.warning('退出登录中...');
    // 若需调用后端退出接口，则在入口html文件设置useLogout=1.
    if (localStorage.getItem('useLogout') === '1') {
      logoutUser(params).then(res => {
        message.info(res.message);
        if (res.success) {
          localStorage.removeItem('id_token');
          history.push('/userLogin');
        }
      });
    } else {
      localStorage.removeItem('id_token');
      history.push('/userLogin');
      setTimeout(() => {
        message.info('退出成功！');
      }, 1000);
    }
  };

  render() {
    const { userInfo } = this.props.global;
    const { nowTime } = this.state;
    const menu = (
      <Menu>
        <Menu.Item disabled>
          {' '}
          {userInfo.role === '1' ? '系统管理员' : '普通用户'}
        </Menu.Item>
        {userInfo.role === '1' && (
          <Menu.Item onClick={() => history.push('/userManagement')}>
            {' '}
            用户管理
          </Menu.Item>
        )}
        <Menu.Item onClick={this.userLogout}>退出登录</Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.forHeader}>
        <div className={styles.logo}>
          <img src={logo} alt="" />
          <span>轨交公交接驳优化分析系统</span>
        </div>
        <div className={styles.wrap_menu}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[this.props.location.pathname]}
            onClick={this.onClickMenu}
          >
            <Menu.Item key="/">全局概览</Menu.Item>
            <Menu.Item key="/AnalysisOfCorrelation">轨交站点分析</Menu.Item>
            <Menu.Item key="/AnalysisOfBus">接驳公交分析</Menu.Item>
            <Menu.Item key="/OptimizeScheme">接驳方案优化</Menu.Item>
            {userInfo.role === '1' && (
              <Menu.Item key="/AnalysisReport">分析报告</Menu.Item>
            )}
          </Menu>
          <div className={styles.admin}>
            <div className={styles.time}>{nowTime}</div>
            {/* <div className={styles.switch} title="主题切换">
              <Switch
                checkedChildren="浅"
                unCheckedChildren="深"
                defaultChecked={this.props.global.mapTheme !== 'dark'}
                onClick={this.changeColor}
              />
            </div> */}
            <Dropdown overlay={menu}>
              <div className={styles.user}>
                <img src={sysImg} alt="" />
                {userInfo.username}
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Index);
