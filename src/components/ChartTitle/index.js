import React, { Component } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import introduce from '../../static/img/introduce.png';
import styles from './index.less';
import qs from 'qs';
import { api } from '../../utils/url';

export default class ChartTitle extends Component {
  downLoadChartData = () => {
    const { title, title2, unitData, apiUrl } = this.props;
    unitData.sheetName = title2 ? title2 : title;
    unitData['id_token'] = localStorage.getItem('id_token');
    window.open(api + `${apiUrl}?${qs.stringify(unitData)}`);
  };
  render() {
    const { title, notNeedIntroduce, isShowDownLoad } = this.props;
    return (
      <div className={styles.title_content}>
        <div>
          <span className={styles.title}>{title}</span>
          {notNeedIntroduce ? (
            <img style={{ marginLeft: '5px' }} src={introduce} />
          ) : (
            ''
          )}
        </div>
        {isShowDownLoad && (
          <DownloadOutlined
            className={styles.downLoadBtn}
            onClick={this.downLoadChartData}
          />
        )}
      </div>
    );
  }
}
