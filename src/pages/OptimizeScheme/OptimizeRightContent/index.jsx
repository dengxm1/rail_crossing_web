import React, { Component } from 'react';
import LineOptimize from './LineOptimize';
import TrainOptimize from './TrainOptimize';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './index.less';
import img2 from '../../../static/img/station_blue.png';
import img1 from '../../../static/img/station_cyan.png';
import { Card, Row, Col } from 'antd';
import Corner from '../../../components/Corner';

class OptimizeRightContent extends Component {
  state = {
    isShowRight: true,
    // hiddenSize: '1', //右边卡片隐藏的尺寸 1 -620px 0 -400px
    tfcunitId: '', //分析列表项的tfcunitId
    flowChecked: [false, false, false],
    closeRightCard: false,
    showAdvance: false,
  };
  componentDidMount() {}

  //右边的卡片显示与隐藏
  rightArrowClick = () => {
    const { isShowRight } = this.props;
    this.props.onSetIsShowRight(!isShowRight);
    this.props.onSetHiddenSize('0');
  };

  // isShowAdvance = (bool) =>{
  //   this.setState({
  //     showAdvance:bool
  //   })
  // }

  render() {
    const { closeRightCard } = this.state;
    const {
      tabIndex,
      unitData,
      isShowRight,
      tabTitle,
      hiddenSize,
    } = this.props;
    return (
      <div>
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
            {/*优化建议*/}
            {(isShowRight || hiddenSize != 1) && (
              <div className={styles.optimizeAdvice}>
                <Row>
                  <Col span={7}>
                    <div className={styles.advanceTip}>优化建议</div>
                  </Col>
                  <Col span={17}>
                    <span className={styles.adjustLine}>
                      {unitData.optDesc}
                    </span>
                  </Col>
                  <Row className={styles.resonAndContent}>
                    <Col span={5}>原因：</Col>
                    <Col span={19}>{unitData.optReason}</Col>
                    <Col span={5}>内容：</Col>
                    <Col span={19}>{unitData.optDetail}</Col>
                  </Row>
                </Row>
              </div>
            )}
            {(isShowRight || hiddenSize != 1) && (
              <div
                className={styles.linePrompt}
                style={{ display: tabIndex === '0' ? 'block' : 'none' }}
              >
                <div className={styles.lineTip}>
                  <img className={styles.serial} src={img1} />
                  <div className={styles.suggestTip}>建议线路</div>
                </div>
                <div className={styles.lineTip}>
                  <img className={styles.serial} src={img2} />
                  <div className={styles.suggestTip}>原有线路</div>
                </div>
              </div>
            )}
            {/*区域颜色提示*/}
            <Card
              className={`${styles.right_chart_card} ${
                closeRightCard ? styles.right_chart_card_visible : ''
              } ${tabIndex === '1' ? styles.classesOptimize : ''}`}
              title={tabTitle}
            >
              {tabIndex === '0' && <LineOptimize unitData={unitData} />}
              {tabIndex === '1' && <TrainOptimize unitData={unitData} />}
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
export default OptimizeRightContent;
