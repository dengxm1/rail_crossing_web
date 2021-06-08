import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './Bottom.less';
import icon_lineNetwork from '../../../static/img/lineNetwork.png';
import icon_train from '../../../static/img/train.png';
import icon_bus from '../../../static/img/bus.png';
import icon_cross from '../../../static/img/cross.png';
import icon_up from '../../../static/img/up.png';
import icon_down from '../../../static/img/down.png';

@connect(({ home }) => ({ home }))
class Bottom extends Component {
  render() {
    const { BasisInfo } = this.props.home;
    const basisInfoArr = [
      {
        key: 'city_line_coverage',
        name: '城市线网覆盖率',
        icon: icon_lineNetwork,
      },
      { key: 'transfer_efficiency', name: '平均接驳时间', icon: icon_train },
      { key: 'passenger_cnt', name: '客运工作量', icon: icon_bus },
      { key: 'cross_coefficient', name: '线路交叉系数', icon: icon_cross },
    ];
    const getValue = key => {
      return BasisInfo.cur && BasisInfo.cur[key] ? BasisInfo.cur[key] : 0;
    };
    const getIconSrc = key => {
      return BasisInfo.cur &&
        BasisInfo.last &&
        BasisInfo.cur[key] &&
        BasisInfo.last[key]
        ? BasisInfo.cur[key] - BasisInfo.last[key] >= 0
          ? icon_up
          : icon_down
        : icon_up;
    };
    const getColor = key => {
      return BasisInfo.cur &&
        BasisInfo.last &&
        BasisInfo.cur[key] &&
        BasisInfo.last[key]
        ? BasisInfo.cur[key] - BasisInfo.last[key] >= 0
          ? '#da1414'
          : '#2CA150'
        : '#da1414';
    };
    const getRate = key => {
      return BasisInfo.cur &&
        BasisInfo.last &&
        BasisInfo.cur[key] &&
        BasisInfo.last[key] &&
        BasisInfo.cur[key] - BasisInfo.last[key]
        ? (
            (Math.abs(BasisInfo.cur[key] - BasisInfo.last[key]) /
              BasisInfo.last[key]) *
            100
          ).toFixed(0) + '%'
        : '0%';
    };
    return (
      <div className={styles.Bottom}>
        <ul>
          {basisInfoArr.map((item, index) => {
            return (
              <li key={index}>
                <div>
                  <div>
                    <img src={item.icon} alt="" />
                  </div>
                  <div>
                    <b>
                      {index === 0 ? getValue(item.key) * 100 + '%' : ''}
                      {index === 1 ? getValue(item.key) + '分钟' : ''}
                      {index === 2
                        ? getValue(item.key) / 1000 + '千万人次'
                        : ''}
                      {index === 3 ? getValue(item.key) : ''}
                    </b>
                    <span>{item.name}</span>
                  </div>
                  <div className={styles.rate}>
                    <img
                      className={styles.iconUp}
                      src={getIconSrc(item.key)}
                      alt=""
                    />
                    <i style={{ color: getColor(item.key) }}>
                      {getRate(item.key)}
                    </i>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
export default Bottom;
