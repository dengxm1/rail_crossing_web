import React, { Component } from 'react';
import { Radio, Button } from 'antd';
import styles from './index.less';
import img1 from '../../static/img/filter_icon.png';

class Filtrate extends Component {
  state = {
    showSelected: false,
  };

  radioChange = e => {
    this.props.onFilterChange(e.target.value);
    this.setState({
      showSelected: false,
    });
  };

  isShowSelect = () => {
    this.setState(prev => ({
      showSelected: !prev.showSelected,
    }));
  };

  render() {
    const { filterType } = this.props;
    const { showSelected } = this.state;
    return (
      <div className={styles.filt_comp}>
        <div className={styles.fiter_icon} onClick={this.isShowSelect}>
          <img src={img1} />
          <span className={styles.filter_tip}>筛选</span>
        </div>
        <div
          className={`${styles.filt_content} ${
            showSelected ? styles.show_selected : ''
          }`}
        >
          <div className={styles.filt_content_wrap}>
            <Radio.Group onChange={this.radioChange} value={filterType}>
              <Radio className={styles.radioStyle} value={0}>
                按客流强度
              </Radio>
              <Radio className={styles.radioStyle} value={1}>
                按出行时间
              </Radio>
              <Radio className={styles.radioStyle} value={2}>
                按出行距离
              </Radio>
            </Radio.Group>
            {/*    <div className={styles.footer}>
              <Button
                size="small"
                className={styles.filterButton}
                onClick={this.isShowSelect}
              >
                取消
              </Button>
              <Button
                type="primary"
                size="small"
                className={styles.filterButton}
                onClick={this.filterChange}
              >
                确定
              </Button>
            </div>*/}
          </div>
        </div>
      </div>
    );
  }
}
export default Filtrate;
