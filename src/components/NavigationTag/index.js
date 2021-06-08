import React, { Component } from 'react';
import styles from './index.less';

class NavigationTag extends Component {
  stationTabData = [
    {
      key: '1',
      name: '研判分析',
      icon: require('../../static/img/anlysisTabIcon/judge_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/judge_selected_icon.png'),
    },
    {
      key: '2',
      name: '客流分析',
      icon: require('../../static/img/anlysisTabIcon/flow_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/flow_selected_icon.png'),
    },
    {
      key: '3',
      name: '出行OD',
      icon: require('../../static/img/anlysisTabIcon/odgo_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/odgo_selected_icon.png'),
    },
    {
      key: '4',
      name: '接驳公交站点',
      icon: require('../../static/img/anlysisTabIcon/bus_staion_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/bus_staion_selected_icon.png'),
    },
  ];
  busTabData = [
    {
      key: '1',
      name: '研判分析',
      icon: require('../../static/img/anlysisTabIcon/judge_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/judge_selected_icon.png'),
    },
    {
      key: '2',
      name: '走向分析',
      icon: require('../../static/img/anlysisTabIcon/trend_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/trend_selected_icon.png'),
    },
    {
      key: '3',
      name: '线路分析',
      icon: require('../../static/img/anlysisTabIcon/line_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/line_selected_icon.png'),
    },
    {
      key: '4',
      name: '班次分析',
      icon: require('../../static/img/anlysisTabIcon/banci_icon.png'),
      selectedIcon: require('../../static/img/anlysisTabIcon/banci_selected_icon.png'),
    },
  ];
  iconChoose = selected => {
    this.props.onIconChoose(selected);
  };
  render() {
    const { selected, type } = this.props;
    const tabData = type === 'bus' ? this.busTabData : this.stationTabData;
    return (
      <div className={styles.tagContent}>
        {tabData.map((item, index) => {
          return (
            <div
              key={index}
              className={`${styles.default_icon} ${
                selected === item.key ? styles.selected_icon : ''
              }`}
              onClick={() => this.iconChoose(item.key)}
            >
              <div className={styles.iconContent}>
                <img
                  src={`${
                    selected === item.key ? item.selectedIcon : item.icon
                  }`}
                />
                <span
                  className={`${styles.iconTip}  ${
                    selected === item.key ? styles.selected_tip : ''
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
export default NavigationTag;
