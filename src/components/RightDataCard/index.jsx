import React, { Component } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import RightContent from '../../pages/AnalysisOfBus/RightContent';
import OptimizeRightContent from '../../pages/OptimizeScheme/OptimizeRightContent';
import styles from './index.less';
import { Card } from 'antd';
import Corner from '../Corner';

class RightDataCard extends Component {
  state = {
    hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    tfcunitId: '', //分析列表项的tfcunitId
    flowChecked: [false, false, false],
    closeRightCard: false,
  };

  //右边的卡片显示与隐藏
  rightArrowClick = () => {
    const { isShowRight } = this.props;
    this.props.onSetIsShowRight(!isShowRight);
    this.setState({
      isShowRight: !isShowRight,
      hiddenSize: '0',
    });
  };

  render() {
    const { hiddenSize, closeRightCard } = this.state;
    const { tabIndex, cardType, tabTitle, isShowRight } = this.props;
    return (
      <>
        {/*  右边的卡片*/}
        <div
          className={
            isShowRight
              ? styles.rightCard
              : hiddenSize === '0'
              ? styles.hiddenRelativeContain
              : styles.hiddenRightCard
          }
        >
          <Corner classNR="relativeContainBgR" />
          <div className={styles.rightRelativeContain}>
            {/*展开隐藏箭头*/}
            <div className={styles.rightflexibleContain}>
              <div
                className={styles.iconContain}
                onClick={this.rightArrowClick}
              >
                {isShowRight ? <RightOutlined /> : <LeftOutlined />}
              </div>
            </div>
            {/*区域颜色提示*/}
            <Card
              className={`${styles.right_chart_card} ${
                closeRightCard ? styles.right_chart_card_visible : ''
              }`}
              title={tabTitle}
            >
              {cardType === '1' && <RightContent tabIndex={tabIndex} />}
              {cardType === '2' && <OptimizeRightContent tabIndex={tabIndex} />}
            </Card>
          </div>
        </div>
      </>
    );
  }
}
export default RightDataCard;
