import React, { Component } from 'react';
import { connect } from 'dva';
import { Popup } from 'react-leaflet';
import './DrawOtherLine.less';
import _ from 'lodash';
import icon_station_red from '../../static/img/station_red.png';
import icon_station_blue from '../../static/img/station_blue.png';
import icon_station_cyan from '../../static/img/station_cyan.png';
import '../../../public/leaflet/leaflet-heat';
import '../../../public/leaflet/leaflet.curve.arrow';
import OtherClickBox from './OtherClickBox';
import { latlngStrToArr } from '../../utils/utils';

const busStationIcon = {
  '#0B80EF': require('../../static/img/busIcon/#0B80EF.png'),
  '#FFAC00': require('../../static/img/busIcon/#FFAC00.png'),
  '#00C1DE': require('../../static/img/busIcon/#00C1DE.png'),
  '#5F9EA0': require('../../static/img/busIcon/#5F9EA0.png'),
  '#fade64': require('../../static/img/busIcon/#fade64.png'),
  '#7790ed': require('../../static/img/busIcon/#7790ed.png'),
  '#80cc3d': require('../../static/img/busIcon/#80cc3d.png'),
  '#ff667f': require('../../static/img/busIcon/#ff667f.png'),
  '#8c3ebb': require('../../static/img/busIcon/#8c3ebb.png'),
  '#A0522D': require('../../static/img/busIcon/#A0522D.png'),
};

const subwayInfo = {
  地铁1号线: {
    color: '#F5130D',
    text: '1',
    iconSrc: icon_station_red,
  },
  地铁2号线: {
    color: '#EC9306',
    text: '2',
    iconSrc: icon_station_red,
  },
  地铁3号线: {
    color: '#d34f00',
    text: '3',
    iconSrc: icon_station_red,
  },
  地铁4号线: {
    color: '#9400D3',
    text: '4',
    iconSrc: icon_station_red,
  },
  地铁5号线: {
    color: '#048239',
    text: '5',
    iconSrc: icon_station_red,
  },
  地铁城郊线路: {
    color: '#8D9124',
    text: '郊',
    iconSrc: icon_station_red,
  },
};
const markerArr = [];
const busStopMarkerArr = [];
@connect(({ map }) => ({ lineData: map }))
class DrawOtherLine extends Component {
  map = this.props['map'];
  state = {
    position: null,
  };
  componentDidMount() {
    this.map.on('click', this.onMapClick);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.mapData) !== JSON.stringify(this.props.mapData)
    ) {
      if (this.map && this.heatMapLayer) {
        this.map.removeLayer(this.heatMapLayer);
      }
      const newSelectStation = nextProps.mapData.selectStation;
      if (
        JSON.stringify(newSelectStation) !==
        JSON.stringify(this.props.mapData.selectStation)
      ) {
        this.setState({ position: null }, () => {
          setTimeout(() => {
            this.renderAll(nextProps.mapData);
          }, 50);
          if (nextProps.mapData && newSelectStation && newSelectStation.lat) {
            this.map.setView([newSelectStation.lat, newSelectStation.lng], 13);
          }
        });
      } else {
        setTimeout(() => {
          this.renderAll(nextProps.mapData);
        }, 50);
      }
    } else {
      this.renderAll(nextProps.mapData);
    }
  }
  // 点击左侧轨交站点 请求数据 渲染站点信息框
  renderSelectStation = (data, cardFormData) => {
    if (data.lat && data.lng) {
      const { metroId } = this.props.lineData;
      this.setState({
        position: [data.lat, data.lng],
        stopData: {
          stopId: data.stopName,
          routeId: metroId,
          stopType: 0,
          ...cardFormData,
        },
      });
      // this.map.setView([data.lat, data.lng]);
    } else {
      this.setState({ position: null });
    }
  };
  renderAll = mapData => {
    for (let marker of markerArr) {
      marker.remove();
    }
    const page = this.props.page;
    const {
      subwayLine,
      busLineMsg,
      busLineHeatMapData,
      corBusLineMsg,
      busStopInfo,
      selectStation,
      optLineHeatMapData,
      optBusLineMsg,
      metroId,
      cardFormData,
      optStopMsgItems,
      flyLineData,
    } = mapData; //this.props.lineData
    if (page === 'AnalysisOfCorrelation') {
      for (let item of subwayLine) {
        if (item.stationId === metroId) {
          // item.stopMsgItems = selectStation;
          let newItem = JSON.parse(JSON.stringify(item));
          for (let i of item.stopMsgItems) {
            if (i.stopId === selectStation.stopId) {
              newItem.stopMsgItems = [i];
            }
          }
          this.drawSubwayOrBus('subway', newItem); // 绘制轨交线路（单条）
        }
      }
      // for (let item of corBusLineMsg) {
      //   this.drawSubwayOrBus('bus', item, false); //绘制公交线 走向分析
      // }
      if (busStopInfo.length && selectStation.lat && selectStation.lng) {
        this.map.setView([selectStation.lat, selectStation.lng], 12);
      }
      for (let item of busStopInfo) {
        this.drawStation(item, icon_station_blue, 'bus'); //绘制接驳公交站点
      }
      // for (let item of busLineMsg) {
      //   this.drawSubwayOrBus('bus', item); //绘制公交线 客流分析
      // }
      this.drawFlyLine(flyLineData); // 飞线
      // this.renderHeatMap(busLineHeatMapData); // 热力图
      this.renderSelectStation(selectStation, cardFormData); // 选中的公交站点
    } else if (page === 'AnalysisOfBus') {
      for (let item of subwayLine) {
        if (item.stationId === metroId) {
          let newItem = JSON.parse(JSON.stringify(item));
          for (let i of item.stopMsgItems) {
            if (i.stopId === selectStation.stopId) {
              newItem.stopMsgItems = [i];
            }
          }
          this.drawSubwayOrBus('subway', newItem); // 绘制轨交线路（单条）
        }
      }
      for (let item of busLineMsg) {
        this.drawSubwayOrBus(
          'bus',
          item,
          false,
          item.simple === false ? false : true,
        ); //绘制公交线 0000
      }
      // this.renderHeatMap(busLineHeatMapData); // 热力图
      // this.map.setView()
      // this.renderSelectStation(selectStation, cardFormData); // 选中的公交站点
    } else if (page === 'OptimizeScheme') {
      // 方案优化
      for (let item of subwayLine) {
        if (item.stationId === metroId) {
          let newItem = { ...item };
          newItem.stopMsgItems = optStopMsgItems;
          this.drawSubwayOrBus('subway', newItem); // 绘制轨交线路（单条）
        }
      }
      for (let item of optBusLineMsg) {
        this.drawSubwayOrBus('bus', item, false); //绘制公交线
        if (!cardFormData.shiftAnalysis) {
          this.drawOptBusLine(item || {});
        }
      }
      this.renderHeatMap(optLineHeatMapData); // 热力图
      if (this.busStationInfoMarker) {
        this.busStationInfoMarker.remove();
      }
    }
  };
  // 绘制优化后的公交线路
  drawOptBusLine = data => {
    if (!data.optimizeStopLngLats && !data.optLnglatSeq) return;
    for (let item of data.optimizeStopLngLats) {
      this.drawStation(item, icon_station_cyan, 'bus'); // 绘制站点
    }
    let polyline = L.polyline(latlngStrToArr(data.optLnglatSeq), {
      color: '#00C1DE',
      weight: 3,
      opacity: 1,
      dashArray: 6,
      animate: { duration: 8000, iterations: Infinity },
    }).addTo(this.map);
    markerArr.push(polyline);
  };
  onMapClick = e => {
    // console.log(`[${e.latlng.lat},${e.latlng.lng}]`);
    // this.map.setView([e.latlng.lat,e.latlng.lng])
    // this.map.panTo([e.latlng.lat,e.latlng.lng])
  };
  // 飞线
  drawFlyLine = flyLineData => {
    if (this.flyLine) {
      //清空飞线
      this.flyLine.setData();
      this.flyLine = null;
    }
    this.flyLine = new L.migrationLayer({
      map: this.map,
      data: flyLineData || [],
      pulseRadius: 12, // 圆的大小
      pulseBorderWidth: 1, // 圆边粗细
      arcWidth: 1, // 曲线粗细
      arcLabel: false, // 是否显示label
      arcLabelFont: '10px sans-serif',
    });
    this.flyLine.addTo(this.map);
  };
  // 热力图
  renderHeatMap = data => {
    if (this.map && this.heatMapLayer) {
      this.map.removeLayer(this.heatMapLayer);
    }
    let dataArr = [];
    for (let item of data) {
      dataArr.push([item.lat, item.lng, item.passenger / 100]);
    }
    let max = 1;
    // if (dataArr.length) {
    // max = dataArr[Math.floor(dataArr.length / 2)][2];
    // }
    this.heatMapLayer = L.heatLayer(dataArr, {
      max: max,
      radius: 30,
      blur: 30,
    }).addTo(this.map);
  };
  // 分析页绘制轨交公交
  drawSubwayOrBus = (type, data = {}, lineInfo = true, simple = false) => {
    if (!data.latlngArr.length) {
      return;
    }
    if (type === 'subway') {
      const text = subwayInfo[data.stationName].text;
      const color = subwayInfo['地铁1号线'].color;
      const iconSrc = subwayInfo['地铁1号线'].iconSrc;
      let polyline = this.drawPolyline(data.latlngArr, color, 3, 1, 'subway'); // 绘制轨交线路
      for (let item of data.stopMsgItems) {
        this.drawStation(item, iconSrc, type); // 绘制站点
      }
      this.drawSubwayStartEnd(data.latlngArr[0], text, color);
      this.drawSubwayStartEnd(
        data.latlngArr[data.latlngArr.length - 1],
        text,
        color,
      );
    } else if (type === 'bus') {
      const weight = simple ? 1.5 : 2;
      let polyline = this.drawPolyline(
        data.latlngArr,
        '#0B80EF',
        weight,
        1,
        'bus',
      ); // 绘制公交线路 data.color
      if (!simple) {
        this.onFitBounds(polyline);
        const _this = this;
        if (lineInfo) {
          polyline.on('mouseover', function(e) {
            this.setStyle({ weight: 6, zIndex: 999999 });
          });
          polyline.on('click', function(e) {
            _this.drawBusStop(data);
          });
          polyline.on('mouseout', function() {
            this.setStyle({ weight: 3, zIndex: 999 });
            // _this.subwayOrBusPolyline.remove();
            // _this.subwayOrBusPolyline = null;
          });
        } else {
          this.drawBusStop(data);
        }
      }
      this.drawBusStartEnd(data, 'start');
      this.drawBusStartEnd(data, 'end');
    }
  };
  //绘制公交站点
  drawBusStop = data => {
    for (let item of busStopMarkerArr) {
      item.remove();
    }
    for (let item of data.stopMsgItems) {
      item.routeId = data.routeId;
      item.isUpDown = data.isUpDown;
      busStopMarkerArr.push(
        this.drawStation(item, busStationIcon['#0B80EF'], 'bus'), //data.color
      ); // 绘制站点
    }
  };
  // 绘制线
  drawPolyline = (
    latlngs,
    color,
    weight = 3,
    opacity = 1,
    type,
    saveMarker = true,
  ) => {
    let polyline = L.polyline(latlngs, {
      color: color,
      weight: weight,
      opacity: opacity,
    }).addTo(this.map);
    // zoom the map to the polyline   fitBounds &&
    if (type === 'subway' && this.props.lineData.subFitBounds) {
      // this.map.fitBounds(polyline.getBounds());
      this.onFitBounds(polyline);
      this.props.dispatch({
        type: 'map/setSubFitBounds',
        payload: false,
      });
    } else if (type === 'bus' && this.props.lineData.busFitBounds) {
      // this.map.fitBounds(polyline.getBounds());
      this.onFitBounds(polyline);
      this.props.dispatch({
        type: 'map/setBusFitBounds',
        payload: false,
      });
    }
    if (saveMarker) {
      markerArr.push(polyline);
    }
    return polyline;
  };
  onFitBounds = obj => {
    //定位居中到该区域描边中心 =polygon是改区域的数组
    this.map.fitBounds(obj.getBounds(), {
      paddingTopLeft: [0, 150],
      paddingBottomRight: [0, 150],
      pan: { animate: true, duration: 1.1 },
    });
  };
  // 底层marker
  drawDivIcon = (latlng, html, size, zIndex = 1, iconAnchor = null) => {
    let marker = L.marker(latlng, {
      icon: L.divIcon({
        html: html,
        className: '',
        iconSize: size,
        iconAnchor: iconAnchor ? iconAnchor : [size[0] / 2, size[1] / 2],
      }),
      opacity: 1,
      zIndexOffset: zIndex,
      riseOnHover: true,
    }).addTo(this.map);
    markerArr.push(marker);
    return marker;
  };
  // 绘制地铁的起点和终点
  drawSubwayStartEnd = (latlng, text, color = '#F5130D') => {
    const html = `<div class="SubwayStartEnd" style="background:${color}; box-shadow: 0 1px 8px 0 ${color};">${text}</div>`;
    this.drawDivIcon(latlng, html, [20, 20], 5);
  };
  // 绘制公交的起点和终点
  drawBusStartEnd = (data, type) => {
    const { cardFormData } = this.props.lineData;
    const latlng =
      type === 'start'
        ? data.latlngArr[0]
        : data.latlngArr[data.latlngArr.length - 1];
    const html = `<div class="BusStartEnd" style="background:${'#0B80EF'};">${
      data.routeId
    }</div>`; //data.color
    let startOrEndStop = this.drawDivIcon(latlng, html, [42, 18], 5);
    // let _this = this;
    // startOrEndStop.on('click', function(e) {
    //   _this.drawBusStop(data); //0000
    // });
  };

  // 绘制站点
  drawStation = (data, iconSrc, type) => {
    const html = `<img class="stationIcon" src="${iconSrc}"/>`;
    let stationMarker = this.drawDivIcon(
      [data.lat, data.lng],
      html,
      [17, 21],
      6,
      [8.5, 21],
    );
    const _this = this;
    stationMarker.on('click', function(e) {
      _this.map.panTo([data.lat, data.lng]);
      const { cardFormData, metroId } = _this.props.lineData;
      setTimeout(() => {
        _this.setState(
          {
            position: null,
          },
          () => {
            _this.setState({
              position: [e.latlng.lat, e.latlng.lng],
              stopData: {
                stopId: data.stopId || data.stopName,
                busStopId: data.busStopId || data.stopId,
                stopType: type === 'subway' ? 0 : 1,
                isUpDown: data.isUpDown,
                routeId: data.routeId || cardFormData.exitOption,
                ...cardFormData,
              },
            });
          },
        );
      }, 50);
    });
    return stationMarker;
  };

  render() {
    const { position, stopData } = this.state;
    return (
      <div>
        {position ? (
          <Popup position={position}>
            <OtherClickBox {...this.props} stopData={stopData} />
          </Popup>
        ) : (
          ''
        )}
      </div>
    );
  }
}
export default DrawOtherLine;
