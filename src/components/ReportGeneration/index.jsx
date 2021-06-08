import React from 'react';
import echarts from 'echarts';
import 'echarts-gl';
import { api } from '../../utils/url';
import { getUrlParam } from '../../utils/utils';

class ReportGeneration extends React.Component {
  // 获取网址上的参数
  getUrlParam = getUrlParam;

  componentDidMount() {
    const _this = this;
    this.myChartArr = []; // 生成4个备用 前面3个复用，最后一个给3d图用（larger size）
    let times = 1;
    for (let i = 0; i <= 3; i++) {
      this.myChartArr.push(echarts.init(document.getElementById('chart' + i))); // 初始化图表标签
      this.myChartArr[i].on('finished', function(e) {
        if (i === 3) {
          if (times === 3) {
            _this.saveImageData(this); //3d图表会出发3次finished，第三次的时候才能完整上传
          } else {
            times++;
          }
        } else {
          _this.saveImageData(this);
        }
      });
      this.myChartArr[i].on('mouseover', function(params) {
        this.dispatchAction({
          type: 'downplay',
        });
        this.dispatchAction({
          type: 'legendUnSelect',
        });
      });
    }
    this.fetchData();
  }
  // 图片上传
  saveImageData = Char => {
    // $.ajax(api+`/images`,{
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   data:JSON.stringify({
    //     "imageLocation": Char.imgId,
    //     "reportTypeNo": this.getUrlParam('reportTypeNo')||2,
    //     "url": Char.getDataURL()
    //   })
    // })
    fetch(api + `/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageLocation: Char.imgId,
        reportTypeNo: this.getUrlParam('reportTypeNo') || 2,
        url: Char.getDataURL(),
      }),
    });
  };

  fetchData = () => {
    const id = this.getUrlParam('id');
    const param = this.getUrlParam('param');
    const date = this.getUrlParam('date');
    const reportTypeNo = this.getUrlParam('reportTypeNo');
    const imageLocation = this.getUrlParam('imageLocation');
    // const id_token = localStorage.getItem('id_token') || '';
    if (!id) return;
    const url =
      api +
      `/images/${id}?param=${param || ''}` +
      `&date=${date || ''}&reportTypeNo=${reportTypeNo || ''}` +
      `&imageLocation=${imageLocation || ''}`; //&id_token=${id_token}
    // $.ajax(url,{
    //   method: 'GET',
    //   success: (res)=>{
    //     this.handleData(res)
    //   },
    // })
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.handleData(res);
      });
  };
  handleData = res => {
    const id = this.getUrlParam('id');
    if (res.data) {
      let i = 0; //记录序号
      for (let imgId in res.data) {
        let myChart = this.myChartArr[i];
        if (id === 'cntOverview') {
          // 121  122
          const resObj = {
            nameArr: ['轨交', '公交'],
            xAxisData: res.data[imgId].axisX,
            dataArr: [res.data[imgId].axisY.metro, res.data[imgId].axisY.bus],
          };
          if (imgId === '121') {
            myChart.setOption(this.getBarOption(resObj));
          } else if (imgId === '122') {
            myChart.setOption(this.getLineOption(resObj));
          }
        } else if (id === 'cntDistribution') {
          // 13
          let dataArr = [
            { name: '轨交', value: res.data[imgId].metro },
            { name: '公交', value: res.data[imgId].bus },
          ];
          myChart.setOption(this.getPieOption(dataArr));
        } else if (id === 'stopCnt') {
          // 21 31 41 ... 3d柱状图
          myChart = this.myChartArr[3];
          myChart.setOption(this.get3DBarOption(res.data[imgId]));
        } else if (id === 'cntAnalysis') {
          const color = imgId.indexOf('111') > -1 ? '#6394FA' : '#63DBAA';
          myChart.setOption(this.getOneBarOption(res.data[imgId], color));
        } else if (id === 'stopAnalysis') {
          const color = imgId.indexOf('121') > -1 ? '#6394FA' : '#63DBAA';
          myChart.setOption(this.getOneBarOption(res.data[imgId], color));
        } else if (id === 'lineAnalysis') {
          let nameArr = [],
            dataArr = [];
          const axisY = res.data[imgId].axisY;
          for (let i in axisY) {
            if (axisY[i].length > 0) {
              nameArr.push(i);
              dataArr.push(axisY[i]);
            }
          }
          const resObj = {
            nameArr: nameArr,
            xAxisData: res.data[imgId].axisX,
            dataArr: dataArr,
          };
          if (
            imgId.indexOf('132') > -1 ||
            imgId.indexOf('232') > -1 ||
            imgId.indexOf('332') > -1
          ) {
            myChart.setOption(this.getBarOption(resObj));
          } else {
            resObj.xAxisData = this.setHoursText(res.data[imgId].axisX);
            myChart.setOption(this.getLineOption(resObj, false));
          }
        } else if (id === 'shiftAnalysis') {
          let nameArr = [],
            dataArr = [];
          const axisY = res.data[imgId].axisY;
          for (let i in axisY) {
            if (axisY[i].length > 0) {
              nameArr.push(i);
              dataArr.push(axisY[i]);
            }
          }
          const resObj = {
            nameArr: nameArr,
            xAxisData: this.setHoursText(res.data[imgId].axisX),
            dataArr: dataArr,
          };
          myChart.setOption(this.getLineOption(resObj));
        }
        myChart.imgId = imgId;
        i++;
      }
    }
  };

  // 折线图
  getLineOption = (resObj, axisLabel = true) => {
    const { nameArr, xAxisData, dataArr } = resObj;
    const color = [
      '#6394FA',
      '#63DBAA',
      '#647797',
      '#C0504D',
      '#0B80EF',
      '#FFAC00',
      '#00C1DE',
      '#ff667f',
      '#fade64',
      '#7790ed',
    ];
    let seriesArr = [];
    for (let i = 0, len = nameArr.length; i < len; i++) {
      seriesArr.push({
        name: nameArr[i] || '',
        type: 'line',
        color: color[i % 10],
        symbol: 'circle', //折点设定为实心点
        symbolSize: 6, //设定实心点的大小
        data: dataArr[i] || [],
      });
    }
    return {
      grid: {
        left: '3%',
        right: '3%',
        // bottom: '3%',
        containLabel: true,
      },
      legend: {
        // bottom: 10,
        data: nameArr,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(v) {
            return axisLabel ? v : v === 0 ? 0 : `${v * 100}%`;
          },
        },
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
      },
      series: seriesArr,
    };
  };

  // 柱状图(默认叠加型，stack=false条状型)
  getBarOption = (resObj, stack = true, axisLabel = true) => {
    const { nameArr, xAxisData, dataArr } = resObj;
    const color = [
      '#6394FA',
      '#63DBAA',
      '#647797',
      '#C0504D',
      '#0B80EF',
      '#FFAC00',
      '#00C1DE',
      '#ff667f',
      '#fade64',
      '#7790ed',
    ];
    let seriesArr = [];
    for (let i = 0, len = nameArr.length; i < len; i++) {
      seriesArr.push({
        name: nameArr[i] || '',
        type: 'bar',
        barMaxWidth: 40,
        color: color[i % 10],
        stack: stack,
        data: dataArr[i] || [],
      });
    }
    return {
      grid: {
        left: '3%',
        right: '3%',
        // bottom: '3%',
        containLabel: true,
      },
      legend: {
        // bottom: 10,
        data: nameArr,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function(v) {
            return axisLabel ? v : v === 0 ? 0 : `${v * 100}%`;
          },
        },
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
      },
      series: seriesArr,
    };
  };

  // 柱状图(单条)
  getOneBarOption = (resObj, color = '#6394FA') => {
    const { axisX, axisY } = resObj;
    return {
      grid: {
        height: '55%',
        right: '19%',
      },
      xAxis: {
        type: 'category',
        data: axisX,
        axisLabel: { rotate: -40 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false }, //y轴
        axisTick: { show: false }, //刻度线
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 40,
          color: color,
          data: axisY,
          lable: {
            formatter: function(value) {
              return value;
            },
          },
        },
      ],
    };
  };

  // 饼图
  getPieOption = dataArr => {
    return {
      legend: {
        // bottom: 10,
      },
      color: ['#6394FA', '#63DBAA'],
      series: [
        {
          type: 'pie',
          label: {
            formatter: function(e) {
              return e.percent.toFixed(2) + '%';
            },
            // formatter: '{b} : {c} ({d}%)'
          },
          data: dataArr,
        },
      ],
    };
  };

  // 3D柱状图
  get3DBarOption = data => {
    let values = data.axisZ;
    let hours = data.axisX;
    let days = data.axisY;
    return {
      tooltip: {},
      visualMap: {
        max: data.max,
        show: false,
        inRange: {
          // color: ['#313695', '#74add1', '#a50026']
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026',
          ],
        },
      },
      xAxis3D: {
        type: 'category',
        data: this.setHoursText(hours),
        name: '时段',
      },
      yAxis3D: {
        type: 'category',
        data: days,
        name: '日期',
      },
      zAxis3D: {
        type: 'value',
        axisLabel: {
          formatter: function(value) {
            return value === 0 ? '' : value;
          },
        },
        name: '客流量',
      },
      grid3D: {
        boxWidth: 160,
        boxDepth: 90,
        viewControl: {
          //  autoRotate:true,//会有自动旋转查看动画出现,可查看每个维度信息
          distance: 250, //默认视角距离主体的距离(常用)
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true,
          },
          ambient: {
            intensity: 0.3,
          },
        },
      },
      series: [
        {
          type: 'bar3D',
          data: values.map(function(item) {
            let date = item[0];
            let num = date.substr(date.length - 2, 2);
            return {
              value: [parseInt(item[1]), parseInt(num) - 1, item[2]],
            };
          }),
          shading: 'lambert',
          label: {
            textStyle: {
              fontSize: 12,
              borderWidth: 1,
            },
          },
          emphasis: {
            label: {
              textStyle: {
                fontSize: 16,
                color: '#900',
              },
            },
            itemStyle: {
              color: '#900',
            },
          },
        },
      ],
    };
  };

  // 将3 => 1:00...
  setHoursText = hours => {
    let hoursArr = [];
    for (let i in hours) {
      hoursArr.push(`${hours[i]}:00`);
    }
    return hoursArr;
  };

  render() {
    const chart3dStyle = {
      width: 800,
      height: 600,
      position: 'absolute',
    };
    const chartStyle = {
      width: 600,
      height: 400,
    };
    return (
      <div>
        {[3, 0, 1, 2].map(item => {
          return (
            <div
              key={item}
              id={`chart` + item}
              style={item === 3 ? chart3dStyle : chartStyle}
            ></div>
          );
        })}
      </div>
    );
  }
}
export default ReportGeneration;
