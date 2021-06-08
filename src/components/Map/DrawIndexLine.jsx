import React, { Component } from 'react';
import { connect } from 'dva';
import { Popup } from 'react-leaflet';
import './DrawIndexLine.less';
import _ from 'lodash';
import moment from 'moment';
import icon_transfer from '../../static/img/transfer.png';
import icon_station_red from '../../static/img/station_red.png';
import icon_red from '../../static/img/icon_red.png';
import icon_yellow from '../../static/img/icon_yellow.png';
import icon_green from '../../static/img/icon_green.png';
import { latlngStrToArr } from '../../utils/utils';
import { ip_port } from '../../utils/url';
import '../../../public/leaflet/leaflet-heat';
import { getIndexMapMsg, getIndexBusLineLatLngs } from '../../services/map';
import IndexClickBox from './IndexClickBox';

const transfer = [
  [34.755883731239884, 113.61354589462282],
  [34.762186416790186, 113.68206560611725],
  [34.7592426801175, 113.77488613128664],
  [34.77460938568944, 113.68204414844513],
  [34.72048552500939, 113.68117511272432],
  [34.76675331189373,113.72541010379793],
  [34.77882222657249,113.72956752777101],
  [34.74699985119566,113.72644007205965],
  [34.72091506472893,113.72208416461946],
  [34.81947213325437,113.68170619010927],
  [34.74454933040788,113.77385079860689],
  [34.749054039173494,113.68208169937135],
  [34.75244334509134,113.66546809673311],
  [34.774019314911925,113.64972889423372]
];
const subwayInfo = {
  地铁1号线: {
    color: '#F5130D',
    text: '1',
  },
  地铁2号线: {
    color: '#EC9306',
    text: '2',
  },
  地铁3号线: {
    color: '#d34f00',
    text: '3',
  },
  地铁4号线: {
    color: '#9400D3',
    text: '4',
  },
  地铁5号线: {
    color: '#048239',
    text: '5',
  },
  地铁城郊线路: {
    color: '#8D9124',
    text: '郊',
  },
};
const markerArr = [];
const busLineMarkerArr = [];
const subwayMarkerArr = [];
let busStartEndHover = [];
let busStartEndClick = [];
let selectedLineMarker = null;
let busLineArr = [];
@connect(({ map }) => ({ lineData: map }))
class DrawIndexLine extends Component {
  map = this.props['map'];
  lineColor = ['#00842E', '#EC9306', '#F5130D'];
  iconColor = [icon_green, icon_yellow, icon_red];
  layerData = [];
  state = {
    position: null, //[34.68151262956488,113.75656127929688]
    id: '',
    isUpDown: '0'
  };
  componentDidMount() {
    this.map.on('click', this.onMapClick);
    const { subwayLine, selectedLayer } = this.props.lineData;
    if (selectedLayer !== 5) {
      if (subwayLine.length) {
        this.drawSubwayLineAndTransfer();
      } else {
        this.props.dispatch({
          type: 'map/fetchSubwayLine',
          callback: () => {
            setTimeout(() => {
              this.drawSubwayLineAndTransfer();
            });
          },
        });
      }
    }
    if (selectedLayer === 99) {
      this.drawIndexBusLine(this.props.selectedMonth, selectedLayer, false); //绘制公交线
    }
    this.renderIndexMapMsg();
  }

  // 绘制轨交线和换乘
  drawSubwayLineAndTransfer = () => {
    for (let marker of subwayMarkerArr) {
      marker.remove();
    }
    const { subwayLine } = this.props.lineData;
    for (let item of subwayLine) {
      this.drawSubway(item.latlngArr, item.stopMsgItems, item.stationName); // 绘制轨交线路
    }
    if(subwayLine.length){
      for (let i in transfer) {
        this.drawTransfer(transfer[i]); // 绘制换乘站点
      }
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ position: null });
    if (nextProps.selectedMonth !== this.props.selectedMonth) {
      if (this.ws) {
        this.ws.close();
      }
      for (let marker of busLineMarkerArr) {
        if (marker) {
          marker.remove();
        }
      }
      this.props.dispatch({
        type: 'map/setIndexBusLine',
        payload: [],
      });
      this.drawIndexBusLine(
        nextProps.selectedMonth,
        nextProps.selectedLayer,
        true,
      );
      this.getIndexBusLineLatLngs(nextProps.selectedMonth);
    } else if (nextProps.selectedLayer !== this.props.selectedLayer) {
      this.renderIndexMapMsg(nextProps.selectedLayer);
      if (nextProps.selectedLayer === 99) {
        this.drawIndexBusLine(
          nextProps.selectedMonth,
          nextProps.selectedLayer,
          true,
        ); //绘制公交线
      }
    } else if (nextProps.scopeChecked !== this.props.scopeChecked) {
      this.renderIndexMapMsg(nextProps.selectedLayer, nextProps.scopeChecked);
    }
    else if (nextProps.selectedIdRandom !== this.props.selectedIdRandom) {
      this.renderIndexMapMsg(nextProps.selectedLayer, null, nextProps.selectedId);
    }
  }
  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }
  getIndexBusLineLatLngs = selectedMonth => {
    getIndexBusLineLatLngs({
      statDate: selectedMonth,
    }).then(res => {
      if (res.data) {
        let buslatlngs = {};
        for (let item of res.data) {
          buslatlngs[item.routeId] = latlngStrToArr(item.lnglatSeq);
        }
        if (res.data.length) {
          localStorage.setItem('buslatlngs', JSON.stringify(buslatlngs));
        }
        this.renderIndexMapMsg();
      }
    });
  };
  // 渲染首页公交线路(websocket)
  drawIndexBusLine = (date, layer, changeData = false) => {
    const { indexBusLine } = this.props.lineData;
    if (layer === 99) {
      if (indexBusLine.length && !changeData) {
        for (let item of indexBusLine) {
          busLineMarkerArr.push(
            this.drawPolyline(item, '#0B80EF', 1.5, 1, false),
          );
        }
      } else {
        const _this = this;
        let ws = new WebSocket(`ws://${ip_port}/indexWebSocket`);
        this.ws = ws;
        ws.onopen = function(evt) {
          console.log('Connection open ...');
          busLineArr = [];
          ws.send(date);
        };
        ws.onmessage = function(evt) {
          if (evt.data === '发送完毕') {
            _this.props.dispatch({
              type: 'map/setIndexBusLine',
              payload: busLineArr,
            });
            ws.close();
          } else {
            busLineArr.push(latlngStrToArr(evt.data));
            busLineMarkerArr.push(
              _this.drawPolyline(
                latlngStrToArr(evt.data),
                '#0B80EF',
                1.5,
                1,
                false,
              ),
            );
          }
        };
        ws.onclose = function(evt) {
          console.log('Connection closed.');
        };
      }
    }
  };
  // 渲染首页地图展示
  renderIndexMapMsg = (layer, scopeChecked, selectedId) => {
    for (let marker of markerArr) {
      marker.remove();
    }
    const { selectedLayer, selectedMonth } = this.props.lineData;
    const type = layer > -1 ? layer : selectedLayer;
    if (type === 1 || type === 2 || type === 99) {
      this.drawSubwayLineAndTransfer();
    } else {
      for (let marker of subwayMarkerArr) {
        marker.remove();
      }
    }
    if (type !== 99) {
      for (let marker of busLineMarkerArr) {
        marker.remove();
      }
      if (this.ws) {
        this.ws.close();
      }
      if(scopeChecked){
        let newLayerData = [];
        for(let item of this.layerData){
          let colorIndex = this.getColorIndex(type, item.cnt || item.transferWaitTime);
          if(scopeChecked.indexOf(`${colorIndex}`)>-1){
            newLayerData.push(item)
          }
        }
        this.drawLayer(newLayerData, type);
      }else if(selectedId){
        this.drawLayer(this.layerData, type, selectedId);
      }else{
        getIndexMapMsg({
          statDate: selectedMonth,
          type: type,
        }).then(res => {
          if (res.data) {
            this.drawLayer(res.data, type);
            this.layerData = res.data;
          }
        });
      }
    }
  };
  drawLayer = (data, layer, selectedId) => {
    if(!data.length) return;
    if (layer === 1 || layer === 2) {
      let selectedIndex = -1;
      for (let i=0, len=data.length; i<len; i++) {
        if (data[i].lat && data[i].lng) {
          data[i].icon = this.iconColor[this.getColorIndex(layer, data[i].cnt)];
          this.drawIndexStation(data[i]); // 绘制站点
        }
        if(selectedId && data[i].metroStopId===selectedId){
          selectedIndex = i; //右侧选中的时候找到了
        }
      }
      this.setState({
        position: null,
      },()=>{
        if(selectedId && selectedIndex===-1) return;
        selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
        this.setState({
          id: data[selectedIndex].metroStopId,
          position: [data[selectedIndex].lat, data[selectedIndex].lng],
        });
      });
    } else {
      if (localStorage.getItem('buslatlngs')) {
        const buslatlngs = JSON.parse(localStorage.getItem('buslatlngs'));
        let firstTime = true;
        let selectedIndex = -1;
        let curIndex = 0;
        for (let item of data) {
          item.latlngArr = buslatlngs[item.routeId] || [];
          const colorIndex = this.getColorIndex(
            layer,
            item.routeRepeatRate ||
              item.passengerFlowCoverage ||
              item.transferWaitTime,
          );
          item.color = this.lineColor[colorIndex];
          let polyline = this.drawPolyline(
            item.latlngArr,
            item.color,
            2,
            1,
          ); // 绘制公交线路
          if(selectedId && item.routeId===selectedId){
            selectedIndex = curIndex; //右侧选中的时候找到了
          }
          if((!selectedId && firstTime) || (selectedId && item.routeId===selectedId)){
            polyline.setStyle({ weight: 6 });
            selectedLineMarker = polyline;
            if (item.latlngArr.length) {
              busStartEndClick.push(this.drawBusStartEnd(item, 'start'));
              busStartEndClick.push(this.drawBusStartEnd(item, 'end'));
            }
          }
          firstTime = false;
          const _this = this;
          polyline.on('click', function(e) {
            _this.setState(
              {
                position: null,
              },
              () => {
                _this.setState({
                  position: [e.latlng.lat, e.latlng.lng],
                  id: item.routeId,
                  isUpDown: item.isUpDown,
                });
              },
            );
            this.setStyle({ weight: 6 });
            if(selectedLineMarker){
              selectedLineMarker.setStyle({ weight: 2 });
            }
            selectedLineMarker = this;
            for(let marker of busStartEndClick){
              marker.remove();
            }
            if (item.latlngArr.length) {
              busStartEndClick = [];
              busStartEndClick.push(_this.drawBusStartEnd(item, 'start'));
              busStartEndClick.push(_this.drawBusStartEnd(item, 'end'));
            }
          });
          polyline.on('mouseover', function(e) {
            this.setStyle({ weight: 6 });
            if (item.latlngArr.length) {
              busStartEndHover = [];
              busStartEndHover.push(_this.drawBusStartEnd(item, 'start'));
              busStartEndHover.push(_this.drawBusStartEnd(item, 'end'));
            }
          });
          polyline.on('mouseout', function() {
            if(selectedLineMarker !== this){
              this.setStyle({ weight: 2 });
            }
            for(let marker of busStartEndHover){
              marker.remove();
            }
          });
          curIndex++;
        }
        this.setState({
          position: null,
        },()=>{
          if(selectedId && selectedIndex===-1) return;
          selectedIndex = selectedIndex === -1 ? 0 : selectedIndex;
          this.setState({
            id: data[selectedIndex].routeId,
            isUpDown: data[selectedIndex].isUpDown,
            position: buslatlngs[data[selectedIndex].routeId][selectedIndex],
          });
        });
      } else {
        this.getIndexBusLineLatLngs(this.props.selectedMonth);
      }
    }
  }
  // 获取颜色序号
  getColorIndex = (type, val) => {
    if (type === 0 || type === 3) {
      return val > 0.3 ? (val > 0.5 ? 2 : 1) : 0;
    } else if (type === 1 || type === 2) {
      return val > 50000 ? (val > 100000 ? 2 : 1) : 0;
    } else if (type === 4) {
      return val > 10 ? (val > 15 ? 2 : 1) : 0;
    }
  };
  // 绘制首页站点（轨交+公交）
  drawIndexStation = data => {
    const html = `<img class="stationIcon" src="${data.icon}"/>`;
    let IndexStationMarker = this.drawDivIcon(
      [data.lat, data.lng],
      html,
      [17, 21],
      5,
      [8.5, 21],
    );
    const _this = this;
    IndexStationMarker.on('click', function(e) {
      if (_this.subwayStationInfoMarker) {
        _this.subwayStationInfoMarker.remove();
      }
      // _this.map.setView([data.lat, data.lng]);
      _this.setState(
        {
          position: null,
        },
        () => {
          _this.setState({
            position: [e.latlng.lat, e.latlng.lng],
            id: data.metroStopId || data.busStopId,
          });
        },
      );
    });
    return IndexStationMarker;
  };

  onMapClick = e => {
    console.log(`[${e.latlng.lat},${e.latlng.lng}]`);
    // this.map.setView([e.latlng.lat,e.latlng.lng])
  };

  // 首页绘制地铁线
  drawSubway = (data = [], station = [], name) => {
    const color = subwayInfo[name].color;
    const text = subwayInfo[name].text;
    subwayMarkerArr.push(this.drawPolyline(data, color, 3, 1, false));
    for (let i in station) {
      subwayMarkerArr.push(
        this.drawDot([station[i].lat, station[i].lng], color),
      );
    }
    subwayMarkerArr.push(this.drawSubwayStartEnd(data[0], text, color));
    subwayMarkerArr.push(
      this.drawSubwayStartEnd(data[data.length - 1], text, color),
    );
  };

  // 绘制线
  drawPolyline = (
    latlngs,
    color,
    weight = 3,
    opacity = 1,
    saveMarker = true,
  ) => {
    let polyline = L.polyline(latlngs, {
      color: color,
      weight: weight,
      opacity: opacity,
    }).addTo(this.map);
    // zoom the map to the polyline   fitBounds
    // this.map.fitBounds(polyline.getBounds());
    if (saveMarker) {
      markerArr.push(polyline);
    }
    return polyline;
  };
  // 底层marker
  drawDivIcon = (
    latlng,
    html,
    size,
    zIndex = 1,
    iconAnchor = null,
    saveMarker = true,
  ) => {
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
    if (saveMarker) {
      markerArr.push(marker);
    }
    return marker;
  };
  // 绘制小圆点
  drawDot = (latlng, color = '#F5130D') => {
    const html = `<div class="dotIcon" style="background:${color};"></div>`;
    return this.drawDivIcon(latlng, html, [12, 12], -1, null, false);
  };
  // 绘制地铁的起点和终点
  drawSubwayStartEnd = (latlng, text, color = '#F5130D') => {
    const html = `<div class="SubwayStartEnd" style="background:${color}; box-shadow: 0 1px 8px 0 ${color};">${text}</div>`;
    return this.drawDivIcon(latlng, html, [20, 20], 5, null, false);
  };
  // 绘制公交的起点和终点
  drawBusStartEnd = (data, type) => {
    const latlng =
      type === 'start'
        ? data.latlngArr[0]
        : data.latlngArr[data.latlngArr.length - 1];
    const html = `<div class="BusStartEnd" style="background:${data.color};">${data.routeId}</div>`;
    let startOrEndStop = this.drawDivIcon(latlng, html, [42, 18], 5);
    let _this = this;
    startOrEndStop.on('click', function(e) {
      _this.setState(
        {
          position: null,
        },
        () => {
          _this.setState({
            position: [e.latlng.lat, e.latlng.lng],
            id: data.routeId,
          });
        },
      );
    });
    return startOrEndStop
  };
  // 绘制地铁相交点
  drawTransfer = latlng => {
    const html = `<img class="transferIcon" src="${icon_transfer}"/>`;
    subwayMarkerArr.push(this.drawDivIcon(latlng, html, [34, 34], 1));
  };

  render() {
    const { position, id, isUpDown } = this.state;
    return (
      <div>
        {position ? (
          <Popup position={position} style={{ maxWidth: 320 }} width={320}>
            <IndexClickBox
              {...this.props}
              id={id}
              isUpDown={isUpDown}
              lineColor={this.lineColor}
              getColorIndex={this.getColorIndex}
            />
          </Popup>
        ) : (
          ''
        )}
      </div>
    );
  }
}
export default DrawIndexLine;
