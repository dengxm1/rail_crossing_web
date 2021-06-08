import React, { Component } from 'react';
import styles from './index.less';
import Map from '../../components/Map';
import CorrelationLeftCard from './LeftDataCard';
import CorrelationRightDataCard from './CorrelationRightContent';

export default class Index extends Component {
  state = {
    tabIndex: '0',
    unitData: '',
    isShowRight: false, //是否显示右边的卡片
    tabKey: '1',
  };
  setTabIndex = key => {
    this.setState({
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

  //设置右边卡片的tabkey
  setTabKey = key => {
    this.setState({
      tabKey: key,
    });
  };

  render() {
    const { tabIndex, unitData, isShowRight, tabKey } = this.state;
    return (
      <div className={styles.wrap_index}>
        <Map page="AnalysisOfCorrelation" />
        <CorrelationLeftCard
          onSetTabIndex={this.setTabIndex}
          onSetUnitType={this.setUnitType}
          onSetTabKey={this.setTabKey}
          onSetIsShowRight={this.setIsShowRight}
        />
        <CorrelationRightDataCard
          tabIndex={tabIndex}
          tabKey={tabKey}
          unitData={unitData}
          isShowRight={isShowRight}
          onSetTabKey={this.setTabKey}
          onSetIsShowRight={this.setIsShowRight}
        />
      </div>
    );
  }
}
