import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, DatePicker, Form, Radio, Select } from 'antd';
import styles from './index.less';
import moment from 'moment';
import { getUrlParam } from '../../utils/utils';

const { Option } = Select;
const optionsDoeDate = [
  { label: '全部', value: '-1' },
  { label: '工作日', value: '99' },
  { label: '非工作日', value: '100' },
];
const optionsTravalTime = [
  { label: '全天', value: '5' },
  { label: '早高峰', value: '1' },
  { label: '晚高峰', value: '3' },
];
const optionsTravalWeather = [
  { label: '全部', value: '-1' },
  { label: '晴天', value: '1' },
  { label: '阴雨天', value: '0' },
];
@connect(({ map }) => ({ map }))
class CardForm extends Component {
  formRef = React.createRef();

  componentDidMount() {
    this.props.dispatch({ type: 'map/clearAllMapData' });
    // 优化方案会刷两次，原因待查，暂用this.props.optKey !=='99'处理
    // if (
    //   getUrlParam('metro') &&
    //   getUrlParam('statDate') &&
    //   this.props.optKey !== '99'
    // ) {
    //   this.formRef.current.submit();
    // }
    this.formRef.current.submit();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.tabIndex !== this.props.tabIndex ||
      nextProps.index !== this.props.index
    ) {
      this.formRef.current.resetFields();
    }
  }

  //开始分析
  onFinish = values => {
    this.props.dispatch({ type: 'map/clearAllMapData' });
    try {
      let stopMsgItems = [];
      const { subwayLine } = this.props.map;
      for (let item of subwayLine) {
        if (item.stationId === values.exitOption) {
          stopMsgItems = JSON.parse(JSON.stringify(item.stopMsgItems)); //深拷贝，不然会影响原数组
        }
      }
      values.statDate = values.statDate.format('YYYYMM');
      // if (values.doeDate === '-1') {
      //   delete values.doeDate; // 工作日/非工作日
      // }
      // if (values.travalWeather === '-1') {
      //   delete values.travalWeather; //'晴天/阴雨天'
      // }
      // if (values.dayPeriod === '5') {
      //   delete values.dayPeriod; //  '早高峰/晚高峰'
      // }
      let cardFormData = { ...values };
      cardFormData.shiftAnalysis = false;
      // if (this.props.index === '2') {
      //   cardFormData.shiftAnalysis = true; // 记录进入班次分析
      //   cardFormData.Analysis = true;
      //   cardFormData.type = 1;
      // } else if (this.props.index === '1') {
      //   cardFormData.Analysis = true; // 记录进入线路分析
      //   cardFormData.type = 1;
      // } else if (this.props.index === '0') {
      //   cardFormData.Analysis = true; // 记录进入站点分析
      //   cardFormData.stopAnalysis = true;
      //   cardFormData.type = 0;
      // } else {
      //   cardFormData.type = 0;
      // }
      if (this.props.optKey === '1') {
        cardFormData.shiftAnalysis = true; // 记录进入优化方案-班次分析
      }
      this.props.onFinish(values, stopMsgItems);
      this.props.dispatch({
        type: `map/setMetroId`,
        payload: {
          metroId: values.exitOption, //选中轨交id
          cardFormData: cardFormData, // 条件参数
          subFitBounds: true,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  //不可选的月份
  disabledDate = current => {
    return (
      current &&
      current >
        moment()
          .subtract(1, 'months')
          .endOf('day')
    );
  };

  render() {
    const { tripTime, tabIndex } = this.props;
    const { subwayLine } = this.props.map;
    return (
      <div className={styles.analyzeCard2}>
        <Form
          ref={this.formRef}
          name="control-ref"
          onFinish={this.onFinish}
          initialValues={{
            exitOption: getUrlParam('metro') || '地铁1号线',
            statDate: getUrlParam('statDate')
              ? moment(getUrlParam('statDate'), 'YYYYMM')
              : moment().subtract(1, 'months'),
            dayPeriod: '5', //出行方式  早高峰/晚高峰
            doeDate: getUrlParam('doeDate') || '-1', //出行周期  工作日/非工作日
            travalWeather: '-1', //天气  晴天/阴雨天
          }}
          // onValuesChange={}
        >
          {/*选择路线*/}
          <Form.Item
            name="exitOption"
            rules={[
              {
                required: true,
                message: '请选择路线',
              },
            ]}
          >
            <Select placeholder="请选择路线" allowClear>
              {subwayLine.map(item => (
                <Option key={item.stationId} value={item.stationId}>
                  {item.stationName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/*选择日期*/}
          <Form.Item
            name="statDate"
            rules={[
              {
                required: true,
                message: '请选择月份',
              },
            ]}
          >
            <DatePicker picker="month" disabledDate={this.disabledDate} />
          </Form.Item>
          {/*出行周期*/}
          <Form.Item
            name="doeDate"
            rules={[
              {
                required: true,
                message: '请选择出行周期',
              },
            ]}
          >
            <Radio.Group
              options={optionsDoeDate}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
          {/*出行天气*/}
          {tabIndex === '1' && (
            <Form.Item
              name="travalWeather"
              rules={[
                {
                  required: true,
                  message: '请选择出行天气',
                },
              ]}
            >
              <Radio.Group
                options={optionsTravalWeather}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          )}
          {/*出行时间*/}
          {!tripTime && (
            <Form.Item
              name="dayPeriod"
              rules={[
                {
                  required: true,
                  message: '请选择出行时间',
                },
              ]}
            >
              <Radio.Group
                options={optionsTravalTime}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          )}

          <Form.Item>
            <div className={styles.btnContain}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  history.pushState(null, null, window.location.pathname);
                }}
                className={styles.analyzeBtn}
              >
                开始分析
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
export default CardForm;
