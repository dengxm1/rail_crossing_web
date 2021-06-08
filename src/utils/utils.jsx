import color from './config';
//传入[0,72]的整数，转换成间距为20分钟的时间段
export function transToTime(num) {
  let hour = parseInt(num / 3) + '';
  let min = (num % 3) * 20 + '';
  if (min === '0') {
    min = '00';
  }
  return hour + ':' + min;
}

// 返回01:00——24:00区间24个时间段
export function timeText24() {
  let timeText24 = [];
  for (let i = 0; i < 24; i++) {
    timeText24.push(`${i < 9 ? '0' : ''}${i + 1}:00`);
  }
  return timeText24;
}

// 获取网址上的参数
export function getUrlParam(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  let result = window.location.search.substr(1).match(reg);
  return result ? decodeURIComponent(result[2]) : null;
}

// 将经纬度字符串转化成数组
export function latlngStrToArr(lnglatStr) {
  if (!lnglatStr) return [];
  let latlngArr = [];
  for (let latlng of lnglatStr.split(';')) {
    latlngArr.push([latlng.split(',')[1], latlng.split(',')[0]]);
  }
  return latlngArr;
}

// 将数组中的经纬度字符串转化成数组，添加latlngArr参数
export function addlatlngArr(dataArr, color = true) {
  let idColor = {};
  if (color) {
    let idArr = [];
    for (let item of dataArr) {
      if (idArr.indexOf(item.routeId) === -1) {
        idArr.push(item.routeId);
      }
    }
    for (let i in idArr) {
      idColor[idArr[i]] = getEchartsColor(i);
    }
  }

  let resArr = [];
  for (let item of dataArr) {
    resArr.push({
      ...item,
      latlngArr: latlngStrToArr(item.lnglatSeq),
      color: color ? idColor[item.routeId] : null,
    });
  }
  return resArr;
}

/**
 * 数组去重
 * @param {array} 原数组
 * @param {string} 重复字段名称
 */
export function unique(arr, refield) {
  var hash = [];
  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (refield) {
        if (arr[i][refield] === arr[j][refield]) {
          ++i;
        } else if (arr[i] === arr[j]) {
          ++i;
        }
      }
    }
    hash.push(arr[i]);
  }
  return hash;
}

/**
 * 接驳公交分析--站点分析--查询结果
 * @param {index} 站点周边道路拥堵指数
 */
export function congestionIndex(index, signColor) {
  let tipText = '畅通';
  let tipColor = 'green';
  if (index >= 6 && index < 100) {
    tipText = '非常拥堵';
    tipColor = 'red';
  } else if (index >= 3 && index < 6) {
    tipText = '一般拥堵';
    tipColor = '#FFA300';
  } else if (index >= 0 && index <= 2) {
    tipText = '畅通';
    tipColor = 'green';
  }
  if (signColor) {
    return tipColor;
  } else {
    return tipText;
  }
}

/**F
 * echarts 设置提示框位置随鼠标移动，并解决提示框显示不全的问题
 * @param {point} 鼠标所在位置
 * @param {size} 外层div大小
 */
export function toptipAuto(point, size) {
  // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
  // 提示框位置
  var x = 0; // x坐标位置
  var y = 0; // y坐标位置

  // 当前鼠标位置
  var pointX = point[0];
  var pointY = point[1];

  // 外层div大小
  // var viewWidth = size.viewSize[0];
  // var viewHeight = size.viewSize[1];

  // 提示框大小
  var boxWidth = size.contentSize[0];
  var boxHeight = size.contentSize[1];

  // boxWidth > pointX 说明鼠标左边放不下提示框
  if (boxWidth > pointX) {
    x = 5;
  } else {
    // 左边放的下
    x = pointX - boxWidth;
  }

  // boxHeight > pointY 说明鼠标上边放不下提示框
  if (boxHeight > pointY) {
    y = 5;
  } else {
    // 上边放得下
    y = pointY - boxHeight;
  }

  return [x, y];
}

/**
 * echarts toptip用百分比
 */
export function toptipToRate(params, multiple = 1) {
  let relVal = params[0].name;
  for (let i = 0, l = params.length; i < l; i++) {
    relVal +=
      '<br/>' +
      '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
      params[i].color +
      '"></span>' +
      params[i].seriesName +
      ':' +
      params[i].value +
      '%';
  }
  return relVal;
}

/**
 * 获取echarts图的颜色
 */
export function getEchartsColor(index) {
  const colors = [
    '#0B80EF',
    '#FFAC00',
    '#00C1DE',
    '#ff667f',
    '#fade64',
    '#7790ed',
    '#80cc3d',
    '#5F9EA0',
    '#8c3ebb',
    '#A0522D',
  ];
  return colors[index % 10];
}

/**
 * 设置idass用户信息
 * @param key
 * @param infoData
 */
const localUserInfoSet = (key = 'IDaaSUserInfo', infoData) => {
  localStorage.setItem(key, JSON.stringify(infoData));
};

/**
 * 获取idass用户信息
 * @param key
 * @returns {any}
 */
const localUserInfoGet = (key = 'IDaaSUserInfo') => {
  return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {};
};

/**
 * 将数据中的某一条最前面显示
 * @param data 原数据
 *  @param key 字段名
 * @param value 值 例
 */
export const setDataToTop = (data, key, value, isUpDown = '0', stopId = '') => {
  if (!value) return data;
  for (let i = 0, len = data.length; i < len; i++) {
    let isSameStopId = stopId ? data[i].stationStopId === stopId : true; // 方案优化基于的轨交站点相同
    if (
      data[i][key] === value &&
      (key !== 'routeId' || (data[i].isUpDown === isUpDown && isSameStopId))
    ) {
      let item = data.splice(i, 1);
      data.unshift(item[0]); //移到最前
      return data;
    }
  }
  return data;
};

/**
 * 轨交站点分析 获取柱状条的渐变色
 * @param index
 * @param location 'top'柱状条上面的颜色 'bottom' 柱状条下侧位置
 */
export const getGradualColor = (index, location) => {
  let color1 = [
    'rgb(11,127,239)',
    'rgb(0,193,222)',
    'rgb(133,107,228)',
    'rgb(255,172,0)',
    'rgb(226,89,89)',
  ];
  let color2 = [
    'rgba(11,127,239,0.3)',
    'rgb(0,193,222,0.3)',
    'rgba(133,107,228,0.3)',
    'rgba(255,172,0,0.3)',
    'rgba(226,89,89,0.3)',
  ];
  if (location === 'top') {
    return color1[index % 5];
  } else {
    return color2[index % 5];
  }
};
/**
 *  默认将小数取3位四舍五入
 * @param number  原本数值
 * @param n 保留几位小数
 * @param needAddLength 是否需要补足位数，例如0 显示为0.00
 * @returns {string|number}
 */
export const getFloat = (number, n = 3, needAddLength = false) => {
  n = n ? parseInt(n) : 0;
  if (n <= 0) {
    return Math.round(number);
  }
  number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n); //四舍五入
  number = needAddLength ? Number(number).toFixed(n) : number; //补足位数
  // return typeof number === 'number' ? number : 0;
  return number;
};

/**
 * 获取研判分析倒三角的颜色
 * */
export const getArrowColor = px => {
  let arrowColor = '#EA2A25';
  if (px === '28px') {
    arrowColor = '#EA2A25';
  } else if (px === '110px') {
    arrowColor = '#FA6D35';
  } else if (px === '197px') {
    arrowColor = '#FDC539';
  } else if (px === '275px') {
    arrowColor = '#F6EF7F';
  }
  return arrowColor;
};

/**
 * 将数值转换为万、千万...
 * @param value
 * @param float   保留几位小数
 * @param returnArray  是否返回为数组格式，默认false
 */
function transform(value, float = 3, returnArray = false) {
  if (!value) return 0;
  let newValue = ['', '', ''];
  let fr = 1000;
  const ad = 1;
  let num = 3;
  const fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
  }
  if (num <= 4) {
    // 千
    // newValue[1] = '千';
    // newValue[0] = value / 1000 + '';
    newValue[0] = value;
  } else if (num <= 8) {
    // 万
    const text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万';
    // tslint:disable-next-line:no-shadowed-variable
    const fm = '万' === text1 ? 10000 : 10000000;
    newValue[1] = text1;
    newValue[0] = value / fm + '';
  } else if (num <= 16) {
    // 亿
    let text1 = (num - 8) / 3 > 1 ? '千亿' : '亿';
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1;
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1;
    // tslint:disable-next-line:no-shadowed-variable
    let fm = 1;
    if ('亿' === text1) {
      fm = 100000000;
    } else if ('千亿' === text1) {
      fm = 100000000000;
    } else if ('万亿' === text1) {
      fm = 1000000000000;
    } else if ('千万亿' === text1) {
      fm = 1000000000000000;
    }
    newValue[1] = text1;
    newValue[0] = value / fm + '';
  }
  /* if (value < 1000) {
     newValue[1] = '';
     newValue[0] = value + '';
   }*/
  newValue[0] = getFloat(newValue[0], float);
  if (returnArray) return newValue;
  return newValue.join('');
}

// 折线图option
export const setLineOption = data => {
  const { series, xAxisData, xAxis, grid, legend, tooltip, yAxis } = data;
  let resOption = {
    grid: {
      bottom: '8%',
      left: '5%',
      right: '6%',
      height: '70%',
      containLabel: true,
    },
    legend: {
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 30,
      top: '4%',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line', // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    xAxis: {
      type: 'category',
      nameLocation: 'end',
      boundaryGap: true,
      nameGap: 8,
      nameTextStyle: {
        color: 'rgba(0,0,0,0.85)',
      },
      axisTick: {
        show: false,
        alignWithLabel: true,
        interval: 0,
      },
      axisLabel: {
        color: 'rgba(0,0,0,0.85)',
      },
      axisLine: {
        lineStyle: {
          color: color.xAxis_line_color,
        },
      },
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        align: 'right',
        verticalAlign: 'middle',
      },
      axisLine: {
        show: false,
      }, //y轴
      axisLabel: {
        formatter: '{value}',
      },
      axisTick: { show: false }, //刻度线
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: 'rgba(0,0,0,0.10)',
          onZero: false, // y轴是否在x轴0刻度上
        },
      },
    },
    series: [],
  };
  if (grid) {
    if (grid.right) {
      resOption.grid.right = grid.right;
    }
    if (grid.height) {
      resOption.grid.height = grid.height;
    }
  }
  if (legend) {
    if (legend.isNone) {
      resOption.legend = legend;
    }
    if (legend.type) {
      resOption.legend.type = legend.type;
    }
    if (legend.top) {
      resOption.legend.top = legend.top;
    }
    if (legend.icon) {
      resOption.legend.icon = legend.icon;
    }
    if (legend.left) {
      resOption.legend.left = legend.left;
    }
    if (legend.right) {
      resOption.legend.right = legend.right;
    }
    if (legend.width) {
      resOption.legend.width = legend.width;
    }
  }
  if (yAxis) {
    if (yAxis.name) {
      resOption.yAxis.name = yAxis.name;
    }
    if (yAxis.axisLabel) {
      resOption.yAxis.axisLabel = yAxis.axisLabel;
    }
    if (yAxis.nameTextStyle) {
      resOption.yAxis.nameTextStyle = yAxis.nameTextStyle;
    }
  }
  if (xAxis) {
    if (xAxis.name) {
      resOption.xAxis.name = xAxis.name;
    }
    if (xAxis.axisLabel) {
      resOption.xAxis.axisLabel = xAxis.axisLabel;
    }
  }
  if (tooltip) {
    if (tooltip.formatter) {
      resOption.tooltip.formatter = tooltip.formatter;
    }
    if (tooltip.position) {
      resOption.tooltip.position = tooltip.position;
    }
  }
  if (series) {
    series.forEach((item, index) => {
      let seriesItem = {
        type: 'line',
        smooth: 0.6,
      };
      if (item.name) {
        seriesItem.name = item.name;
      }
      if (item.data) {
        seriesItem.data = item.data;
      }
      if (item.areaStyle) {
        seriesItem.areaStyle = {};
      }
      if (item.color) {
        seriesItem.color = item.color;
      }
      if (item.stack) {
        seriesItem.stack = item.stack;
      }
      if (item.smooth) {
        seriesItem.smooth = item.smooth;
      }
      if (item.symbol) {
        seriesItem.symbol = item.symbol;
      }

      resOption.series.push(seriesItem);
    });
  }
  return resOption;
};

// 柱状图
export const setBarOption = (data, option = {}) => {
  const { xAxisData, series, tooltip, xAxis, yAxis, grid, legend } = data;
  let resOption = {
    grid: {
      bottom: '8%',
      left: '5%',
      right: '6%',
      height: '70%',
      containLabel: true,
    },
    legend: {
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 30,
      top: '4%',
    },
    tooltip: {
      trigger: 'axis',
      alwaysShowContent: true,
      // position: function(point, params, dom, rect, size) {
      //   return toptipAuto(point, size);
      // },
      axisPointer: {
        type: 'line',
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      axisTick: {
        interval: 0, //横轴信息全部显示
        show: false,
        alignWithLabel: true,
      },
      nameTextStyle: {
        color: 'rgba(0,0,0,0.85)',
      },
      axisLabel: {
        color: 'rgba(0,0,0,0.85)',
      },
      // axisLabel: false,
      axisLine: {
        lineStyle: {
          color: color.xAxis_line_color,
        },
      },
      data: xAxisData,
    },
    yAxis: {
      name: '分钟',
      nameTextStyle: {
        color: 'rgba(0,0,0,0.45)',
        align: 'right',
        verticalAlign: 'middle',
      },
      axisLabel: {
        color: 'rgba(0,0,0,0.65)',
      },
      axisLine: { show: false }, //y轴
      axisTick: { show: false }, //刻度线
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: 'rgba(0,0,0,0.10)',
          onZero: false, // y轴是否在x轴0刻度上
        },
      },
      type: 'value',
    },
    series: [],
  };
  if (series) {
    series.forEach(item => {
      let seriesItem = {
        type: 'bar',
        barMaxWidth: 10,
        itemStyle: {
          barBorderRadius: [10, 10, 0, 0], //（顺时针左上，右上，右下，左下）
        },
      };
      if (item.color) {
        seriesItem.color = item.color;
      }
      if (item.name) {
        seriesItem.name = item.name;
      }
      if (item.barGap) {
        seriesItem.barGap = item.barGap;
      }
      if (item.data) {
        seriesItem.data = item.data;
      }
      resOption.series.push(seriesItem);
    });
  }
  if (legend) {
    if (legend.isNone) {
      resOption.legend.show = false;
    }
    if (legend.icon) {
      resOption.legend.icon = legend.icon;
    }
  }
  if (tooltip) {
    if (tooltip.isNone) {
      resOption.tooltip = {};
    } else {
      if (tooltip.formatter) {
        resOption.tooltip.formatter = tooltip.formatter;
      }
      if (tooltip.position) {
        resOption.tooltip.position = tooltip.position;
      }
    }
  }
  if (xAxis) {
    if (xAxis.axisLabel) {
      resOption.xAxis.axisLabel = xAxis.axisLabel;
    }
  }
  if (yAxis) {
    if (yAxis.name) {
      resOption.yAxis.name = yAxis.name;
    }
    if (yAxis.name) {
      resOption.yAxis.name = yAxis.name;
    }
    if (yAxis.axisLabel) {
      resOption.yAxis.axisLabel = yAxis.axisLabel;
    }
    if (yAxis.nameTextStyle) {
      resOption.yAxis.nameTextStyle = yAxis.nameTextStyle;
    }
  }
  if (grid) {
    if (grid.bottom) {
      resOption.grid.bottom = grid.bottom;
    }
  }
  return resOption;
};

export default { localUserInfoSet, localUserInfoGet, getUrlParam };
