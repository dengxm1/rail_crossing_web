import React, { Component } from 'react';
import styles from './index.less';
import Map from '../../components/Map';
import OptimizeLeftDataCard from './LeftDataCard';
import OptimizeRightContent from './OptimizeRightContent';
import { getUrlParam } from '../../utils/utils';

export default class Index extends Component {
  state = {
    tabIndex: getUrlParam('key') || '1',
    cardType: '2',
    tabTitle: '班次优化评估',
    unitData: '',
    isShowRight: false,
    hiddenSize: '1',
  };

  setTabIndex = key => {
    this.setState({
      tabTitle: key === '0' ? '线路优化预评估' : '班次优化评估',
      tabIndex: key,
    });
  };
  setIsShowRight = bool => {
    this.setState({
      isShowRight: bool,
    });
  };

  //设置类型类型分析数据
  setUnitType = (unitData, isShowRight) => {
    this.setState({
      unitData,
      isShowRight,
    });
  };

  setHiddenSize = hiddenSize => {
    this.setState({
      hiddenSize,
    });
  };

  render() {
    const {
      tabIndex,
      tabTitle,
      hiddenSize,
      isShowRight,
      unitData,
    } = this.state;
    return (
      <div className={styles.wrap_index}>
        <Map page="OptimizeScheme" />
        <OptimizeLeftDataCard
          onSetTabIndex={this.setTabIndex}
          onSetUnitType={this.setUnitType}
          onSetIsShowRight={this.setIsShowRight}
          onSetHiddenSize={this.setHiddenSize}
        />
        <OptimizeRightContent
          unitData={unitData}
          tabTitle={<span className={styles.rightTitle}>{tabTitle}</span>}
          tabIndex={tabIndex}
          isShowRight={isShowRight}
          hiddenSize={hiddenSize}
          onSetHiddenSize={this.setHiddenSize}
          onSetIsShowRight={this.setIsShowRight}
        />
      </div>
    );
  }
}
