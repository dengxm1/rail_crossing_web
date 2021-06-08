import React, { Component } from 'react';
import { Checkbox } from 'antd';
import styles from './index.less';
import icon_bus from '../../static/img/icon_bus.png';

export default class index extends Component {
  legendText = [
    ['大于0.3', '0.1～0.3', '低于0.1'],
    ['大于10万', '5万～10万', '低于5万'],
    ['大于5万', '1万～5万', '低于1万'],
    ['大于50%', '30%～50%', '低于30%'],
    ['大于15分钟', '10～15分钟', '低于10分钟'],
  ];
  onChange = (checkedValues) => {
    // console.log('checked = ', checkedValues);
    this.props.onChecked(checkedValues)
  }
  render() {
    const { selectedLayer, scopeChecked } = this.props;
    // console.log('selectedLayer',selectedLayer);
    return (
      <>
        {selectedLayer === 99 && (
          <div className={styles.mapLegend}>
            <ul>
              <li>
                <i>1</i>
                <span>1号线</span>
              </li>
              <li>
                <i>2</i>
                <span>2号线</span>
              </li>
              <li>
                <i>3</i>
                <span>3号线</span>
              </li>
              <li>
                <i>4</i>
                <span>4号线</span>
              </li>
              <li>
                <i>5</i>
                <span>5号线</span>
              </li>
              <li>
                <i>郊</i>
                <span>城郊线</span>
              </li>
              <li>
                <i>
                  <img src={icon_bus} alt="公" />
                </i>
                <span>公交线路</span>
              </li>
            </ul>
          </div>
        )}
        {(selectedLayer === 1 || selectedLayer === 4) && (
          <div className={styles.mapLegend2} style={{width: selectedLayer === 1 ? 118 : 130 }}>
            <Checkbox.Group style={{ width: '100%' }} value={scopeChecked} onChange={this.onChange}>
              <Checkbox value="2">
                <i />
                <b>{this.legendText[selectedLayer][0]}</b>
              </Checkbox>
              <Checkbox value="1">
                <i className={styles.i2} />
                <b>{this.legendText[selectedLayer][1]}</b>
              </Checkbox>
              <Checkbox value="0">
                <i className={styles.i3} />
                <b>{this.legendText[selectedLayer][2]}</b>
              </Checkbox>
            </Checkbox.Group>
          </div>
        )}
        {/* {(selectedLayer === 1 || selectedLayer === 4) && (
          <div className={styles.mapLegend2} style={{height: '78px'}}>
            <ul>
              <li>
                <i />
                <span>{this.legendText[selectedLayer][0]}</span>
              </li>
              <li>
                <i className={styles.i2} />
                <span>{this.legendText[selectedLayer][1]}</span>
              </li>
              <li>
                <i className={styles.i3} />
                <span>{this.legendText[selectedLayer][2]}</span>
              </li>
            </ul>
          </div>
        )} */}
      </>
    );
    // return (

    // );
  }
}
