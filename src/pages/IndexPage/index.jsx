import React, { Component } from 'react';
import { connect } from 'dva';
import { DatePicker, Spin } from 'antd';
import moment from 'moment';
import styles from './index.less';
import Map from '../../components/Map';
import MapLegend from '../../components/MapLegend';
import Corner from '../../components/Corner';
import Left from './Subpage/Left';
import Right from './Subpage/Right';
import Bottom from './Subpage/Bottom';

@connect(({ map, home, loading }) => ({
  map,
  home,
  leftLoading:
    loading.effects['home/fetchBasisInfo'] ||
    loading.effects['home/fetchBusPass'] ||
    loading.effects['home/fetchSubwayPass'],
  rightLoading:
    loading.effects['home/fetchTopLoad'] ||
    loading.effects['home/fetchLastLoad'] ||
    loading.effects['home/fetchTopStop'] ||
    loading.effects['home/fetchLastStop'],
  bottomLoading: loading.effects['home/fetchBasisInfo'],
}))
class Index extends Component {
  layerList = [
    {
      name: '接驳线网分布',
      key: 99,
      icon: require('../../static/img/layerBtnIcon/icon_network.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_network_white.png'),
    },
    {
      name: '接驳公交走向',
      key: 0,
      icon: require('../../static/img/layerBtnIcon/icon_bus_blue.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_bus_white.png'),
    },
    {
      name: '轨交客流分布',
      key: 1,
      icon: require('../../static/img/layerBtnIcon/icon_group.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_group_white.png'),
    },
    {
      name: '换乘客流分布',
      key: 2,
      icon: require('../../static/img/layerBtnIcon/icon_peopel.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_peopel_white.png'),
    },
    {
      name: '客流覆盖情况',
      key: 3,
      icon: require('../../static/img/layerBtnIcon/icon_cover.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_cover_white.png'),
    },
    {
      name: '换乘等待时间',
      key: 4,
      icon: require('../../static/img/layerBtnIcon/icon_wait.png'),
      iconActive: require('../../static/img/layerBtnIcon/icon_wait_white.png'),
    },
  ];
  state = {
    scopeChecked: ["2", "1", "0"],
    selectedId: '',
    selectedIdRandom: ''
  }
  // 范围筛选
  onScopeChecked = (values) => {
    this.setState({
      scopeChecked: values,
    });
  } 
  // 线路或站点选中
  onItemSelect = (id) => {
    this.setState({
      selectedId: id,
      selectedIdRandom: Math.random()
    })
  }

  componentDidMount() {
    const { selectedMonth } = this.props.map;
    const { BasisInfo } = this.props.home;
    if (JSON.stringify(BasisInfo) === '{}') {
      this.onMonthChange('', selectedMonth);
    }
  }

  onMonthChange = (e, dateString) => {
    const date = dateString.split('-').join('');
    if (dateString) {
      this.props.dispatch({
        type: 'map/setSelectedMonth',
        payload: {
          month: date,
        },
      });
      // this.getIndexBusLineLatLngs(date);
      let apiArr = [
        'fetchBasisInfo',
        'fetchBusPass',
        'fetchSubwayPass',
        'fetchTopLoad',
        'fetchLastLoad',
        'fetchTopStop',
        'fetchLastStop',
      ];
      for (let item of apiArr) {
        this.props.dispatch({
          type: `home/${item}`,
          payload: {
            statDate: date,
          },
        });
      }
    }
  };
  disabledDate = current => {
    // 不能选择未来日期
    return (
      current &&
      current >
        moment()
          .subtract(1, 'months')
          .endOf('day')
    );
  };
  onLayerChange = layer => {
    this.setState({
      scopeChecked: ["2", "1", "0"],
    })
    this.props.dispatch({
      type: 'map/setSelectedLayer',
      payload: {
        layer: layer,
      },
    });
  };
  render() {
    const { selectedMonth, selectedLayer } = this.props.map;
    const { leftLoading, rightLoading, bottomLoading } = this.props;
    const { scopeChecked, selectedId, selectedIdRandom } = this.state;
    return (
      <div className={styles.IndexPage + ' IndexPage'}>
        <Map
          page="index"
          selectedMonth={selectedMonth}
          selectedLayer={selectedLayer}
          scopeChecked={scopeChecked}
          selectedId={selectedId}
          selectedIdRandom={selectedIdRandom}
        />
        <div className={styles.month}>
          <DatePicker
            picker="month"
            placeholder=""
            onChange={this.onMonthChange}
            defaultValue={moment(selectedMonth, 'YYYYMM')}
            disabledDate={this.disabledDate}
          />
        </div>
        <div className={styles.layerList}>
          <ul>
            {this.layerList.map((item, index) => {
              if (index === 1 || index === 3 || index === 4) return '';
              return (
                <li
                  key={index}
                  className={item.key === selectedLayer ? styles.active : ''}
                  onClick={() => this.onLayerChange(item.key)}
                >
                  <img
                    src={
                      item.key === selectedLayer ? item.iconActive : item.icon
                    }
                    alt=""
                  />
                  <span>{item.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Left />
        <Corner classNL="boxBgLeft" classNR="boxBgRight" />
        <Right onSelect={this.onItemSelect} />
        <Bottom />
        <div className={styles.mapLegend}>
          <MapLegend  
            scopeChecked={scopeChecked}
            selectedLayer={selectedLayer} 
            onChecked={this.onScopeChecked}
          />
        </div>
        {leftLoading ? (
          <div className={styles.leftLoading}>
            <Spin className={styles.spin}></Spin>
          </div>
        ) : (
          ''
        )}
        {rightLoading ? (
          <div className={styles.rightLoading}>
            <Spin className={styles.spin}></Spin>
          </div>
        ) : (
          ''
        )}
        {bottomLoading ? (
          <div className={styles.bottomLoading}>
            <Spin className={styles.spin}></Spin>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
export default Index;
