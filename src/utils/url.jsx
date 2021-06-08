/**
 * 后端服务ip+port
 * @type {string}
 * 打包部署不用切换
 */
let hostname = window.location.hostname;
let port = '8001';
if (hostname === 'localhost') {
  hostname = '172.17.168.60'; // 本地开发调(测试库)
  // port = '8002';
  // hostname = '172.17.168.61'; // 本地开发调(生产库)
  // hostname = '172.16.3.147'; // 本地开发调后端本地
  // hostname = '118.178.56.54'; // 本地开发调后端公网
} else if (hostname === '172.17.168.60') {
  // port = '8002';
} else if (hostname === '59.207.61.20') {
  port = '11439'; // 后端政务外网映射端口
}

export const ip_port = `${hostname}:${port}`; // websocket使用

/***
 * 统一api，配置转发代理请求识别
 * **/
// export const api = '/api';
export const api = `http://${hostname}:${port}`; // 后端接口

/**
 * 地图url
 * @type {string}
 */
// 外网
// export const map_url_white =
//   'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}';
// export const map_url_blue =
//   'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
// export const map_url_blue_poi =
//   'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
// 内网
// export const map_url_white = 'http://172.17.168.54:25333/v3/tile?z={z}&x={x}&y={y}'; //内网
// export const map_url_blue = 'http://172.17.168.54:25003/v3/tile?z={z}&x={x}&y={y}'; //内网
// export const map_url_blue_poi = 'http://172.17.168.54:25033/v3/tile?z={z}&x={x}&y={y}'; //内网

/***************正式*****************/
// export const map_url_white =
//   window.location.hostname === 'localhost'
//     ? 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}'
//     : 'http://59.207.61.20:11433/v3/tile?z={z}&x={x}&y={y}'; //内网-白色底图
export const map_url_white =
  'http://59.207.61.20:11433/v3/tile?z={z}&x={x}&y={y}'; //内网-白色底图
export const map_url_blue =
  'http://59.207.61.20:11431/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色底图
export const map_url_blue_poi =
  'http://59.207.61.20:11432/v3/tile?z={z}&x={x}&y={y}'; //内网-蓝色的poi
