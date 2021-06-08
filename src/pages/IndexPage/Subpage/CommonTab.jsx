import React, { Component } from 'react';
import styles from '../index.less';

export default class CommonTab extends Component {
  render() {
    const { children, title, height } = this.props;
    return (
      <div className={styles.CommonTab} style={{ height: height }}>
        <div
          className={styles.title}
          style={{ height: height === '25%' ? '20%' : '10%' }}
        >
          <span>{title}</span>
        </div>
        {children}
      </div>
    );
  }
}
