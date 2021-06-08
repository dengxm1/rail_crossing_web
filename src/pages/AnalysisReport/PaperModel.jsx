import React, { Component } from 'react';
import {
  Form,
  Input,
  Select,
  Modal,
  message,
  Checkbox,
  Spin,
  Empty,
} from 'antd';
import { addTakeAttention, updataTakeAttention } from '../../services/report';
import { connect } from 'dva';
import styles from './PaperModel.less';

const { Option } = Select;
@connect(({ map }) => ({ map }))
export default class PaperFormModal extends Component {
  form = React.createRef();
  state = {
    areaNameOption: [],
    modelLoading: false,
    selectLoading: false,
    showNone: false,
    open: false,
    subwayLine: [],
    stopMsgItems: [],
    areaType: false,
    loading: false,
  };

  componentDidMount() {
    const { record } = this.props;
    const { subwayLine } = this.props.map;
    this.setState({
      subwayLine,
    });
    if (record) {
      subwayLine.forEach(item => {
        if (item.stationId === record.stationId) {
          this.setState({ stopMsgItems: item.stopMsgItems, areaType: true });
        }
      });
    }
  }

  onSave = values => {
    const { record } = this.props;
    const handleData = this.props.record
      ? updataTakeAttention
      : addTakeAttention;
    this.setState({
      loading: true,
    });
    handleData({
      id: record ? record.id : '',
      reportTypeNo: values.type ? values.type.join(',') : '',
      stationId: values.name,
      stopId: values.email,
    }).then(res => {
      this.setState({
        loading: false,
      });
      if (res.code === 200) {
        this.props.showPaperModal(false);
        if (record) {
          this.props.getTakeList('update');
        } else {
          this.props.getTakeList('add');
        }
      }
    });
  };

  //区域类型改变时的回调
  areaTypeChange = value => {
    const { subwayLine } = this.state;
    subwayLine.forEach(item => {
      if (item.stationId === value) {
        this.setState({ stopMsgItems: item.stopMsgItems, areaType: true });
      }
    });
    this.form.current.setFieldsValue({
      email: null,
    });
  };
  //展开下拉菜单的回调
  dropdownVisibleChange = open => {
    const { areaType } = this.state;
    if (!areaType) {
      message.warning('请先选择轨交路线');
      this.setState({
        open: false,
      });
    } else {
      this.setState({
        open,
      });
    }
  };

  render() {
    const {
      modelLoading,
      selectLoading,
      open,
      subwayLine,
      stopMsgItems,
      loading,
    } = this.state;
    const { record } = this.props;
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const validateMessages = {
      required: '${label}不能为空!',
      types: {
        email: '${label}格式不对!',
      },
    };

    const options = [
      { label: '年', value: '年' },
      { label: '季', value: '季' },
      { label: '月', value: '月' },
      { label: '节假日', value: '节假日' },
    ];
    return (
      <div>
        <Modal
          title={`${record ? '编辑' : '新增'}`}
          width={600}
          visible={true}
          onCancel={() => this.props.showPaperModal(false)}
          // footer={<Button onClick={()=>this.props.showFormModal(false)}>关闭</Button>}
          onOk={() => this.form.current.submit()}
          confirmLoading={this.state.loading}
        >
          <Spin spinning={modelLoading}>
            <Form
              {...layout}
              ref={this.form}
              name="nest-messages"
              onFinish={this.onSave}
              validateMessages={validateMessages}
              initialValues={{
                name: record ? record.stationId : null,
                email: record ? record.stopId : null,
                type: record ? record.reportTypeNo.split(',') : null,
              }}
            >
              <Form.Item
                name={'name'}
                label="路线名称"
                rules={[{ required: true }]}
              >
                <Select placeholder="请选择" onChange={this.areaTypeChange}>
                  {subwayLine.map(item => (
                    <Option key={item.stationId} value={item.stationId}>
                      {item.stationName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name={'email'}
                label="站点名称"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="请选择"
                  open={open}
                  onDropdownVisibleChange={this.dropdownVisibleChange}
                  notFoundContent={
                    <div>
                      {selectLoading ? (
                        <Spin
                          tip="加载中"
                          className={styles.selectLoading}
                        ></Spin>
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  }
                >
                  {stopMsgItems.map(item => (
                    <Option key={item.stopId} value={item.stopId}>
                      {item.stopName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name={'type'}
                label="报告类型"
                rules={[{ required: true }]}
              >
                <Checkbox.Group options={options} />
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
