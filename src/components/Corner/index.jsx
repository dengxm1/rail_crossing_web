import React, { Component, Fragment } from 'react';
import styles from './index.less';

export default class index extends Component {
  render() {
    const boxBgLeft = styles[this.props.classNL];
    const boxBgRight = styles[this.props.classNR];
    return (
      <Fragment>
        {this.props.classNL === 'boxBgLeft' ||
        this.props.classNL === 'relativeContainBgL' ||
        this.props.classNL === 'reportBgL' ? (
          <div className={styles.boxBg + ' ' + boxBgLeft}>
            <div className={styles.corner + ' ' + styles.leftTopCorner}></div>
            <div className={styles.corner + ' ' + styles.rightTopCorner}></div>
            <div
              className={styles.corner + ' ' + styles.leftBottomCorner}
            ></div>
            <div
              className={styles.corner + ' ' + styles.rightBottomCorner}
            ></div>
          </div>
        ) : (
          ''
        )}
        {this.props.classNR === 'boxBgRight' ||
        this.props.classNR === 'relativeContainBgR' ? (
          <div className={styles.boxBg + ' ' + boxBgRight}>
            <div className={styles.corner + ' ' + styles.leftTopCorner}></div>
            <div className={styles.corner + ' ' + styles.rightTopCorner}></div>
            <div
              className={styles.corner + ' ' + styles.leftBottomCorner}
            ></div>
            <div
              className={styles.corner + ' ' + styles.rightBottomCorner}
            ></div>
          </div>
        ) : (
          ''
        )}
      </Fragment>
    );
  }
}
