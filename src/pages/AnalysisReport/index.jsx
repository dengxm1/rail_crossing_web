import React, { Component } from 'react';
import styles from './index.less';
import { Card, Radio, Button, Table, Popconfirm, Tag, message } from 'antd';
import {
  getEmial,
  delEmial,
  getReport,
  getTakeAttention,
  delTakeAttention,
  generateReport,
  mailDelivery,
} from '../../services/report';
import LogModal from './LogModal';
import FormModal from './FormModal';
import PaperFormModal from './PaperModel';
import Corner from '../../components/Corner';
import { api } from '../../utils/url';

const reportTimeType = { 0: '年', 1: '季', 2: '月', 3: '节假日' };
class AnalysisReport extends Component {
  state = {
    reportType: '', //报告类型
    reportColumns: [], //报告表格字段名
    reportData: [], //报告表格数据  reportMockData.data.records
    reportPageSize: 10, //每页条数
    reportCurrent: 1, //当前页
    reportTotal: 0, //总数
    loading: false, //报告表格是否在加载中
    cardStatus: 0, // 0分析报告 1订阅设置 2关注设置
    subscribeData: [], // 订阅表格数据  subscribeMockData.data.records
    subscribePageSize: 10, //每页条数
    subscribeCurrent: 1, //当前页
    subscribeTotal: 0, //总数
    logModalVisible: false, //是否显示日志弹窗
    formModalVisible: false, //是否显示订阅新增编辑弹窗
    paperModalVisible: false, //是否显示设置新增编辑弹窗
    attentionCurrent: 1,
    attentionPageSize: 10,
    attentionTotal: 0,
    attentionData: [],
    pushLoading: false,
  };

  componentDidMount() {
    this.getReportList();
    this.getSubscribeList();
    this.getTakeList();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    const _this = this;
    this.timeInterval = setInterval(function() {
      _this.updateReportList();
    }, 5000);
  }
  componentWillUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
  // 定时有条件刷新列表
  updateReportList = () => {
    const {
      cardStatus,
      reportType,
      reportPageSize,
      reportCurrent,
      reportData,
    } = this.state;
    if (cardStatus === 0) {
      getReport({
        reportTypeNo: reportType,
        pageNum: reportCurrent,
        pageSize: reportPageSize,
      }).then(res => {
        if (res.data) {
          let isUpdate = false;
          for (let i in reportData) {
            if (
              reportData[i].id === (res.data.records[i] || 0).id &&
              reportData[i].state !== (res.data.records[i] || 0).state
            ) {
              isUpdate = true;
            }
          }
          if (isUpdate) {
            this.setState({
              reportData: res.data.records,
            });
          }
        }
      });
    }
  };

  // 获取订阅邮箱
  getSubscribeList = (reportType = '', size = 10, current = 1) => {
    this.setState({
      reportType: reportType,
      subscribePageSize: size, //每页条数
      subscribeCurrent: current, //当前页
      loading: true,
    });
    getEmial({
      reportTypeNo: reportType === '' ? '' : reportTimeType[reportType],
      pageNum: current,
      pageSize: size,
    })
      .then(res => {
        this.setState({
          loading: false,
        });
        if (res.data) {
          this.setState({
            subscribeData: res.data.records,
            subscribePageSize: res.data.size,
            subscribeTotal: res.data.total,
          });
        }
      })
      .catch(e => {
        this.setState({
          loading: false,
        });
      });
  };
  // 获取分析报告
  getReportList = (reportType = '', size = 10, current = 1) => {
    this.setState({
      reportPageSize: size, //每页条数
      reportCurrent: current, //当前页
      loading: true,
    });
    getReport({
      reportTypeNo: reportType,
      pageNum: current,
      pageSize: size,
    })
      .then(res => {
        this.setState({
          loading: false,
        });
        if (res.data) {
          this.setState({
            reportData: res.data.records,
            reportPageSize: res.data.size,
            reportTotal: res.data.total,
          });
        }
      })
      .catch(e => {
        this.setState({
          loading: false,
        });
      });
  };
  //获取订阅关注数据
  getTakeList = (flag = '') => {
    const { attentionCurrent, attentionPageSize, reportType } = this.state;
    this.setState({
      loading: true,
    });
    getTakeAttention({
      pageNum: attentionCurrent,
      pageSize: attentionPageSize,
      reportTypeNo: reportType === '' ? '' : reportTimeType[reportType],
    })
      .then(res => {
        this.setState({
          loading: false,
        });
        if (res) {
          if (res.code === 200) {
            if (flag === 'add') {
              message.success('新增成功');
            }
            if (flag === 'update') {
              message.success('修改成功');
            }
            this.setState({
              attentionData: res.data.records,
              attentionTotal: res.data.total,
            });
          }
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({
          loading: false,
        });
      });
  };
  onSearch = () => {
    const {
      cardStatus,
      reportType,
      reportPageSize,
      reportCurrent,
      subscribePageSize,
      subscribeCurrent,
    } = this.state;
    if (!cardStatus) {
      this.getReportList(reportType, reportPageSize, reportCurrent);
    } else if (cardStatus === 1) {
      this.getSubscribeList(reportType, subscribePageSize, subscribeCurrent);
    } else {
      this.getTakeList();
    }
  };

  //删除订阅设置
  onDelete = id => {
    delEmial({ id }).then(res => {
      if (res.code === 200) {
        message.success('删除成功');
        if (this.state.subscribeData.length > 1) {
          this.onSearch();
        } else {
          //当删除当前也最后一条数据时返回第一页
          this.setState(
            {
              subscribeCurrent: 1,
            },
            () => {
              this.onSearch();
            },
          );
        }
      }
    });
  };

  //选择报告类型
  selectReportType = e => {
    const { cardStatus } = this.state;
    const val = e.target.value;
    this.setState(
      {
        reportType: val,
        attentionCurrent: 1,
        attentionPageSize: 10,
      },
      () => {
        //分析报告
        if (cardStatus === 0) {
          this.getReportList(val === '' ? '' : val);
        } else if (cardStatus === 1) {
          this.getSubscribeList(val);
        } else {
          this.getTakeList();
        }
      },
    );
  };
  //pageSize变化的回调
  onShowSizeChange = (current, size) => {
    const { cardStatus } = this.state;
    this.setState(
      cardStatus === 0
        ? { reportPageSize: size }
        : cardStatus === 1
        ? { subscribePageSize: size }
        : { attentionPageSize: size },
      () => {
        this.onSearch();
      },
    );
  };

  //页码改变的回调，参数是改变后的页码及每页条数
  onPageChange = (page, pageSize) => {
    const { cardStatus } = this.state;
    this.setState(
      cardStatus === 0
        ? {
            reportCurrent: page,
            reportPageSize: pageSize,
          }
        : cardStatus === 1
        ? {
            subscribeCurrent: page,
            subscribePageSize: pageSize,
          }
        : {
            attentionCurrent: page,
            attentionPageSize: pageSize,
          }, //当前页
      () => {
        this.onSearch();
      },
    );
  };

  //订设置完成按钮--切换回分析报告
  subscribeOrComplete = type => {
    this.setState(
      {
        cardStatus: type,
        reportType: '',
        subscribeCurrent: 1,
        subscribePageSize: 10,
        reportCurrent: 1,
        reportPageSize: 10,
      },
      () => {
        if (type === 0) {
          this.getReportList();
        } else if (type === 1) {
          this.getSubscribeList();
        } else if (type === 2) {
          this.getTakeList();
        }
      },
    );
  };

  //日志弹窗显示和关闭
  showLogModal = bool => {
    this.setState({
      logModalVisible: bool,
    });
  };
  // 订阅新增编辑弹窗显示和关闭
  showFormModal = bool => {
    this.setState({
      formModalVisible: bool,
    });
  };

  //是否显示订阅设置弹窗的开关
  showPaperModal = bool => {
    this.setState({
      paperModalVisible: bool, //是否显示设置新增编辑弹窗
    });
  };

  //订阅设置删除
  paperDelete = tfcunitId => {
    delTakeAttention({ id: tfcunitId })
      .then(res => {
        if (res) {
          if (res.data) {
            this.getTakeList();
            message.success('删除成功');
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  //订阅日志编辑
  paperEdit = logRecord => {
    this.setState({
      paperRecord: logRecord,
      paperModalVisible: true,
    });
  };

  //新增
  addTable = () => {
    const { cardStatus } = this.state;
    if (cardStatus === 1) {
      this.setState({ record: null, formModalVisible: true });
    } else {
      this.setState({
        paperRecord: null,
        paperModalVisible: true,
      });
    }
  };

  //生成报告
  createReport = id => {
    generateReport({
      id,
    })
      .then(res => {
        if (res) {
          if (res.code === 200) {
            this.getReportList();
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  //推送邮箱
  mailDelivery = id => {
    this.setState({
      pushLoading: true,
      selectReportId: id,
    });
    mailDelivery({
      id,
    })
      .then(res => {
        this.setState({ pushLoading: false });
        if (res) {
          if (res.code === 200) {
            message.success('推送成功');
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  render() {
    const {
      reportType,
      reportData,
      reportPageSize,
      reportCurrent,
      reportTotal,
      subscribeData,
      subscribePageSize,
      subscribeCurrent,
      subscribeTotal,
      loading,
      cardStatus,
      logModalVisible,
      formModalVisible,
      record,
      logRecord,
      paperModalVisible,
      attentionCurrent,
      attentionPageSize,
      attentionTotal,
      paperRecord,
      attentionData,
      pushLoading,
      selectReportId,
    } = this.state;
    // 报告设置
    const reportColumns = [
      {
        title: '序号',
        key: 'id',
        dataIndex: 'id',
        width: 80,
        align: 'center',
        render: (id, record, index) => {
          return index + 1;
        },
      },
      {
        title: '标题',
        key: 'fileName',
        dataIndex: 'fileName',
        // align: 'center',
      },
      {
        title: '报告类型',
        key: 'reportTypeNo',
        width: 150,
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              <Tag color="green">{reportTimeType[reportTypeNo]}</Tag>
            </div>
          );
        },
      },
      {
        title: '创建时间',
        key: 'createTime',
        width: 300,
        dataIndex: 'createTime',
        align: 'center',
      },
      {
        title: '状态',
        key: 'state',
        dataIndex: 'state',
        width: 150,
        align: 'center',
        render: state => {
          return state === 1 ? '成功' : state === 2 ? '失败' : '生成中';
        },
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        width: 360,
        align: 'center',
        render: (operator, logRecord) => (
          <div className={styles.operatorTool}>
            <Button
              type="link"
              disabled={logRecord.state === 0}
              onClick={() => this.createReport(logRecord.id)}
              className={styles.first}
            >
              报告生成
            </Button>
            <Button
              type="link"
              disabled={logRecord.state !== 1}
              onClick={() =>
                window.open(
                  api +
                    `/report/fileDetails?id=${
                      logRecord.id
                    }&id_token=${window.localStorage.getItem('id_token')}`,
                )
              }
              className={styles.centerBtn}
            >
              预览
            </Button>
            <Button
              type="link"
              disabled={logRecord.state !== 1}
              onClick={() =>
                window.open(
                  api +
                    `/report/fileDetails?id=${
                      logRecord.id
                    }&isDownload=1&id_token=${window.localStorage.getItem(
                      'id_token',
                    )}`,
                )
              }
            >
              下载
            </Button>
            <Button
              type="link"
              onClick={() =>
                this.setState({ logRecord, logModalVisible: true })
              }
              className={styles.centerBtn}
            >
              查看日志
            </Button>
            <Button
              type="link"
              disabled={logRecord.state !== 1}
              onClick={() => this.mailDelivery(logRecord.id)}
              className={styles.last}
              loading={logRecord.id === selectReportId && pushLoading}
            >
              邮箱推送
            </Button>
          </div>
        ),
      },
    ];
    //订阅设置
    const subscribeColumns = [
      {
        title: '序号',
        key: 'id',
        dataIndex: 'id',
        width: 80,
        align: 'center',
        render: (id, record, index) => {
          return index + 1;
        },
      },
      {
        title: '抄送人',
        key: 'ccPeople',
        dataIndex: 'ccPeople',
        align: 'center',
      },
      {
        title: '邮箱地址',
        key: 'emailAddress',
        dataIndex: 'emailAddress',
        align: 'center',
      },
      {
        title: '报告类型',
        key: 'reportTypeNo',
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              {(reportTypeNo || '').split(',').map((item, index) => {
                return (
                  <Tag key={index} color="green">
                    {item}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        align: 'center',
        render: (text, record, index) => {
          return (
            <div className={styles.operatorTool}>
              <Button
                className={styles.firstBtn}
                type="link"
                onClick={() => {
                  this.setState({ record, formModalVisible: true });
                }}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定删除吗?"
                onConfirm={() => {
                  this.onDelete(record.id);
                }}
              >
                <Button type="link"> 删除 </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    //关注设置
    const attentionColumns = [
      {
        title: '序号',
        key: 'id',
        dataIndex: 'id',
        width: 80,
        align: 'center',
        render: (id, record, index) => {
          return index + 1;
        },
      },
      {
        title: '线路名称',
        key: 'stationName',
        dataIndex: 'stationName',
        align: 'center',
      },
      {
        title: '站点名称',
        key: 'stopId',
        dataIndex: 'stopId',
        align: 'center',
      },
      {
        title: '订阅报告',
        key: 'reportTypeNo',
        dataIndex: 'reportTypeNo',
        align: 'center',
        render: reportTypeNo => {
          return (
            <div>
              {(reportTypeNo || '').split(',').map((item, index) => {
                return (
                  <Tag key={index} color="green">
                    {item}
                  </Tag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'operator',
        dataIndex: 'operator',
        align: 'center',
        render: (operator, logRecord) => (
          <div className={styles.operatorTool}>
            <Popconfirm
              title="确定删除吗?"
              onConfirm={() => {
                this.paperDelete(logRecord.id);
              }}
            >
              <Button type="link"> 删除 </Button>
            </Popconfirm>
            <Button type="link" onClick={() => this.paperEdit(logRecord)}>
              编辑
            </Button>
          </div>
        ),
      },
    ];
    //卡片的标题
    const cardTitle = (
      <div className={styles.analyzeTitle}>
        <div className={styles.topTip}>
          {cardStatus === 0
            ? '分析报告设置'
            : cardStatus === 1
            ? '订阅设置'
            : '关注设置'}
        </div>
        {cardStatus === 0 ? (
          <div>
            <Button
              type="primary"
              className={styles.takeBtn}
              onClick={() => this.subscribeOrComplete(2)}
            >
              关注设置
            </Button>
            <Button
              type="primary"
              className={`${styles.takeBtn} ${styles.twoBtn}`}
              onClick={() => this.subscribeOrComplete(1)}
            >
              订阅设置
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            className={styles.takeBtn}
            onClick={() => this.subscribeOrComplete(0)}
          >
            完成
          </Button>
        )}
      </div>
    );
    return (
      <div className={styles.wrap_index}>
        {logModalVisible ? (
          <LogModal record={logRecord} showLogModal={this.showLogModal} />
        ) : (
          ''
        )}
        {formModalVisible ? (
          <FormModal
            record={record}
            getSubscribeList={this.getSubscribeList}
            showFormModal={this.showFormModal}
          />
        ) : (
          ''
        )}
        {paperModalVisible ? (
          <PaperFormModal
            record={paperRecord}
            getTakeList={this.getTakeList}
            showPaperModal={this.showPaperModal}
          />
        ) : (
          ''
        )}
        <Corner classNL="reportBgL" />
        <div className={styles.boxReportBg}>
          <div className={styles.topTitle}>{cardTitle}</div>
          <div className={styles.wrap_content}>
            <Card bordered={false} className={styles.tableContain}>
              {/* 按钮行*/}
              <div className={styles.selectContain}>
                <div>
                  <span className={styles.buttonTitle}>报告类型:</span>
                  <Radio.Group
                    value={reportType}
                    onChange={this.selectReportType}
                  >
                    <Radio.Button value="">全部</Radio.Button>
                    <Radio.Button value="0">按年</Radio.Button>
                    <Radio.Button value="1">按季</Radio.Button>
                    <Radio.Button value="2">按月</Radio.Button>
                    <Radio.Button value="3">按节假日</Radio.Button>
                  </Radio.Group>
                </div>
                {cardStatus !== 0 && (
                  <Button
                    type="primary"
                    className={styles.takeBtn}
                    onClick={this.addTable}
                  >
                    新增
                  </Button>
                )}
              </div>
              <Table
                rowKey={record => record.id}
                className={styles.tableStyle}
                columns={
                  cardStatus === 0
                    ? reportColumns
                    : cardStatus === 1
                    ? subscribeColumns
                    : attentionColumns
                }
                dataSource={
                  cardStatus === 0
                    ? reportData
                    : cardStatus === 1
                    ? subscribeData
                    : attentionData
                }
                size="middle"
                loading={loading}
                scroll={{ y: 'calc(100vh - 330px)' }}
                pagination={{
                  size: 'large',
                  showSizeChanger: true,
                  showQuickJumper: true,
                  current:
                    cardStatus === 0
                      ? reportCurrent
                      : cardStatus === 1
                      ? subscribeCurrent
                      : attentionCurrent,
                  pageSize:
                    cardStatus === 0
                      ? reportPageSize
                      : cardStatus === 1
                      ? subscribePageSize
                      : attentionPageSize,
                  total:
                    cardStatus === 0
                      ? reportTotal
                      : cardStatus === 1
                      ? subscribeTotal
                      : attentionTotal,
                  showTotal: () => {
                    return `共${
                      cardStatus === 0
                        ? reportTotal
                        : cardStatus === 1
                        ? subscribeTotal
                        : attentionTotal
                    }条记录`;
                  },
                  onChange: this.onPageChange,
                }}
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default AnalysisReport;
