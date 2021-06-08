import React, { Component } from 'react';
import styles from './index.less';
import Map from '../../components/Map';
import BusLeftCard from './LeftDataCard';
import BusRightContent from './RightContent';

export default class Index extends Component {
  state = {
    tabIndex: '0',
    cardType: '1',
    tabTitle: '站点分析',
    unitData: '',
    isShowRight: false, //是否显示右边的卡片
  };

  setTabIndex = key => {
    this.setState({
      tabTitle:
        key === '0' ? '站点分析' : key === '1' ? '线路分析' : '班次分析',
      tabIndex: key,
    });
  };

  //设置类型类型分析数据
  setUnitType = (unitData, isShowRight) => {
    this.setState({
      unitData,
      isShowRight,
    });
  };
  setIsShowRight = bool => {
    this.setState({
      isShowRight: bool,
    });
  };
  render() {
    const { tabIndex, tabTitle, cardType, unitData, isShowRight } = this.state;
    return (
      <div className={styles.wrap_index}>
        <Map page="AnalysisOfBus" />
        <BusLeftCard
          onSetTabIndex={this.setTabIndex}
          onSetIsShowRight={this.setIsShowRight}
          onSetUnitType={this.setUnitType}
        />
        <BusRightContent
          cardType={cardType}
          tabTitle={<span className={styles.rightTitle}>{tabTitle}</span>}
          tabIndex={tabIndex}
          unitData={unitData}
          isShowRight={isShowRight}
          onSetIsShowRight={this.setIsShowRight}
        />
      </div>
    );
  }
}
