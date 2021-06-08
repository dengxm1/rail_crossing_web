import React from 'react';
import styles from './index.less';
import ChartTitle from '../ChartTitle';
import { Card, Progress, Spin, Button } from 'antd';
import { getArrowColor } from '../../utils/utils';
import icon_goTo from '../../static/img/icon_goTo.png';

// 前往优化 key=1班次  key=0线路
const goToOpt = (unitData, key) => {
  const doeDate = unitData.doeDate ? `&doeDate=${unitData.doeDate}` : '';
  const url = `/OptimizeScheme?key=${key}&metro=${unitData.stationId}&statDate=${unitData.statDate}&id=${unitData.routeId}&stopId=${unitData.stopId}&isUpDown=${unitData.isUpDown}${doeDate}`;
  window.open(url);
};

// 前往公交分析
const goToBus = (unitData, item) => {
  const doeDate = unitData.doeDate ? `&doeDate=${unitData.doeDate}` : '';
  const url = `/AnalysisOfBus?metro=${unitData.stationId}&statDate=${unitData.statDate}&id=${unitData.stopId}&routeId=${item.routeId}&isUpDown=${item.isUpDown}${doeDate}`;
  window.open(url);
};

function JudgeSuggest({
  avgTransTime = '284px',
  densityMatch = '284px',
  passengerFlow = '284px',
  transFlowMatch = '284px',
  suggusetLoding = false,
  flowPeople = 0,
  lineFocusList = [],
  shiftFocusList = [],
  optDetail = '',
  type = 'bus',
  lineOptDetail = null,
  shiftOptDetail = null,
  unitData,
  avgTransTimeTip,
  densityMatchTip,
  passengerFlowTip,
}) {
  return (
    <div className={styles.content}>
      <Spin spinning={suggusetLoding} className={styles.suggest_loading}>
        <Card
          className={styles.progress_card}
          title={
            <div className={styles.card_title}>
              <div className={styles.title_icon_content}>
                <span className={styles.circle_icon} />
              </div>
              <span className={styles.title_name}>
                {type === 'bus' ? '平均换乘时间' : '出行时间'}
              </span>
            </div>
          }
        >
          <div className={styles.progress_graph}>
            <div
              className={`${styles.triangle} ${styles.first}`}
              style={{
                left: avgTransTime,
                borderTop: `12px solid ${getArrowColor(avgTransTime)}`,
              }}
            />
            <Progress
              strokeColor={{
                '0%': '#EA2A25',
                '25%': '#FA6D35',
                '50%': '#FDC539',
                '100%': '#F6EF7F',
              }}
              percent={100}
            />
          </div>
          <div className={styles.labelContent}>
            <span>{'>60min'}</span>
            <span>40~60min</span>
            <span>20~40min</span>
            <span>{'<20min'}</span>
          </div>
        </Card>
        <Card
          className={styles.progress_card}
          title={
            <div className={styles.card_title}>
              <div className={styles.title_icon_content}>
                <span className={styles.circle_icon} />
              </div>
              <span className={styles.title_name}>
                {type === 'bus' ? '班次匹配程度' : '出行距离'}
              </span>
            </div>
          }
        >
          <div className={styles.progress_graph}>
            <div
              className={`${styles.triangle} ${styles.second}`}
              style={{
                left: densityMatch,
                borderTop: `12px solid ${getArrowColor(densityMatch)}`,
              }}
            />
            <Progress
              strokeColor={{
                '0%': '#EA2A25',
                '25%': '#FA6D35',
                '50%': '#FDC539',
                '100%': '#F6EF7F',
              }}
              percent={100}
            />
          </div>
          {type === 'bus' ? (
            <div className={styles.labelContent}>
              <span>{'>75%'}</span>
              <span>75%-50%</span>
              <span> 50%-25%</span>
              <span>{'<25%'}</span>
            </div>
          ) : (
            <div className={styles.labelContent}>
              <span>{'>15KM'}</span>
              <span>10-15KM</span>
              <span> 5-10KM</span>
              <span>{'<5KM'}</span>
            </div>
          )}
        </Card>
        <Card
          className={styles.progress_card}
          title={
            <div className={styles.card_title}>
              <div className={styles.title_icon_content}>
                <span className={styles.circle_icon} />
              </div>
              <span className={styles.title_name}>
                {type === 'bus' ? '公交客流强度' : '轨交客流强度'}
              </span>
            </div>
          }
        >
          <div className={styles.progress_graph}>
            <div
              className={`${styles.triangle} ${styles.third}`}
              style={{
                left: passengerFlow,
                borderTop: `12px solid ${getArrowColor(passengerFlow)}`,
              }}
            />
            <Progress
              strokeColor={{
                '0%': '#EA2A25',
                '25%': '#FA6D35',
                '50%': '#FDC539',
                '100%': '#F6EF7F',
              }}
              percent={100}
            />
          </div>
          <div className={styles.labelContent}>
            <span>非常强</span>
            <span>强</span>
            <span>一般</span>
            <span>弱</span>
          </div>
        </Card>
        <Card
          className={styles.progress_card}
          title={
            <div className={styles.card_title}>
              <div className={styles.title_icon_content}>
                <span className={styles.circle_icon} />
              </div>
              <span className={styles.title_name}>
                {type === 'bus' ? '供求匹配程度' : '早晚高峰进站客流占比'}
              </span>
            </div>
          }
        >
          <div className={styles.progress_graph}>
            <div
              className={`${styles.triangle} ${styles.four}`}
              style={{
                left: transFlowMatch,
                borderTop: `12px solid ${getArrowColor(transFlowMatch)}`,
              }}
            />
            <Progress
              strokeColor={{
                '0%': '#EA2A25',
                '25%': '#FA6D35',
                '50%': '#FDC539',
                '100%': '#F6EF7F',
              }}
              percent={100}
            />
          </div>
          <div className={styles.labelContent}>
            <span>{'>75%'}</span>
            <span>75%~50%</span>
            <span>50%~25%</span>
            <span>{'<25%'}</span>
          </div>
        </Card>
        <Card
          className={styles.suggest_card}
          title={<ChartTitle title="分析建议" />}
        >
          {type === 'bus' ? (
            <>
              <p>
                该公交线路客流强度
                <span style={{ color: '#0B80EF' }}>{passengerFlowTip}</span>，
                平均换乘时间主要以
                <span style={{ color: '#0B80EF' }}>{avgTransTimeTip}</span>
                为主，
                {densityMatch === '28px' ? (
                  <span>
                    公交班次与轨交班次之间的匹配程度
                    <span style={{ color: '#0B80EF' }}>很高</span>，
                    {shiftOptDetail
                      ? '建议进行公交/轨交接驳班次优化，实现接驳客流与运力匹配，提高接驳线路运行效率，扩大轨交的辐射能力。'
                      : ''}
                  </span>
                ) : (
                  ''
                )}
                {densityMatch === '110px' ? (
                  <span>
                    公交班次与轨交班次之间的匹配程度
                    <span style={{ color: '#0B80EF' }}>高</span>，
                    {shiftOptDetail
                      ? '建议进行公交/轨交接驳班次优化，实现接驳客流与运力匹配，提高接驳线路运行效率，扩大轨交的辐射能力。'
                      : ''}
                  </span>
                ) : (
                  ''
                )}
                {densityMatch === '197px' ? (
                  <span>
                    公交班次与轨交班次之间的匹配程度
                    <span style={{ color: '#0B80EF' }}>一般</span>
                    {shiftOptDetail
                      ? '，建议进行公交/轨交接驳班次优化，实现接驳客流与运力匹配，提高接驳线路运行效率，扩大轨交的辐射能力。'
                      : '，可以进一步加强关注班次分布情况。'}
                  </span>
                ) : (
                  ''
                )}
                {densityMatch === '275px' ? (
                  <span>
                    公交班次与轨交班次之间的匹配程度
                    <span style={{ color: '#0B80EF' }}>低</span>
                    {shiftOptDetail
                      ? '，建议进行公交/轨交接驳班次优化，实现接驳客流与运力匹配，提高接驳线路运行效率，扩大轨交的辐射能力。'
                      : '，可以进一步加强关注班次分布情况。'}
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '28px' ? (
                  <span>
                    接驳线路走向与出行客流之间匹配程度
                    <span style={{ color: '#0B80EF' }}>很高</span>
                    {lineOptDetail
                      ? '，建议针对现有接驳线路进行调整与优化，从而扩大轨道交通的吸引范围，满足更多的客户需求，为换乘轨交的乘客提供更加快捷方便舒适的乘车条件，减少乘客的换乘时间和换乘次数。'
                      : ''}
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '110px' ? (
                  <span>
                    接驳线路走向与出行客流之间匹配程度
                    <span style={{ color: '#0B80EF' }}>高</span>
                    {lineOptDetail
                      ? '，建议针对现有接驳线路进行调整与优化，从而扩大轨道交通的吸引范围，满足更多的客户需求，为换乘轨交的乘客提供更加快捷方便舒适的乘车条件，减少乘客的换乘时间和换乘次数。'
                      : ''}
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '197px' ? (
                  <span>
                    接驳线路走向与出行客流之间匹配程度
                    <span style={{ color: '#0B80EF' }}>一般</span>
                    {lineOptDetail
                      ? '，建议针对现有接驳线路进行调整与优化，从而扩大轨道交通的吸引范围，满足更多的客户需求，为换乘轨交的乘客提供更加快捷方便舒适的乘车条件，减少乘客的换乘时间和换乘次数。'
                      : '，可以进一步关注线路走向。'}
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '275px' ? (
                  <span>
                    接驳线路走向与出行客流之间匹配程度
                    <span style={{ color: '#0B80EF' }}>低</span>
                    {lineOptDetail
                      ? '，建议针对现有接驳线路进行调整与优化，从而扩大轨道交通的吸引范围，满足更多的客户需求，为换乘轨交的乘客提供更加快捷方便舒适的乘车条件，减少乘客的换乘时间和换乘次数。'
                      : '，可以进一步关注线路走向。'}
                  </span>
                ) : (
                  ''
                )}
              </p>
              {/* <p>{lineOptDetail}</p> */}
              {/* <p>{shiftOptDetail}</p> */}
              {lineOptDetail ? (
                <Button
                  className={styles.btn}
                  onClick={() => goToOpt(unitData, 0)}
                  type="primary"
                  block
                >
                  前往线路优化
                  <img src={icon_goTo} alt="" />
                </Button>
              ) : (
                ''
              )}
              {shiftOptDetail ? (
                <Button
                  className={styles.btn}
                  onClick={() => goToOpt(unitData, 1)}
                  type="primary"
                  block
                >
                  前往班次优化
                  <img src={icon_goTo} alt="" />
                </Button>
              ) : (
                ''
              )}
            </>
          ) : (
            <>
              <p>
                该轨交站点客流强度
                <span style={{ color: '#0B80EF' }}>{passengerFlowTip}</span>,
                &nbsp;出行时间主要以
                <span style={{ color: '#0B80EF' }}>{avgTransTimeTip}</span>
                为主，客流出行 距离分布在
                <span style={{ color: '#0B80EF' }}>{densityMatchTip}</span>
                区间范围内，
                {transFlowMatch === '28px' ? (
                  <span>
                    <span style={{ color: '#0B80EF' }}>
                      早高峰进站人数远多于晚高峰进站人数
                    </span>
                    ，属于居住区周边的轨交站点。
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '110px' ? (
                  <span>
                    <span style={{ color: '#0B80EF' }}>
                      早高峰进站人数略多于晚高峰进站人数
                    </span>
                    ，站点周边居住人口比例较高。
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '197px' ? (
                  <span>
                    <span style={{ color: '#0B80EF' }}>
                      晚高峰进站人数略多于早高峰进站人数
                    </span>
                    ，站点周边工作人口比例较高。
                  </span>
                ) : (
                  ''
                )}
                {transFlowMatch === '275px' ? (
                  <span>
                    <span style={{ color: '#0B80EF' }}>
                      晚高峰进站人数远多于早高峰进站人数
                    </span>
                    ，属于工作区周边的轨交站点。
                  </span>
                ) : (
                  ''
                )}
              </p>
              {/* <p>{optDetail}</p> */}
              <p>
                {lineFocusList.length ? '线路走向需要进一步关注:' : ''}
                {lineFocusList.map(item => (
                  <span
                    title={`${item.startStopName}=>${item.endStopName}`}
                    onClick={() => goToBus(unitData, item)}
                    className={styles.linebus}
                  >{`${item.routeId}路`}</span>
                ))}
              </p>
              <p>
                {shiftFocusList.length ? '班次分布需要进一步关注:' : ''}
                {shiftFocusList.map(item => (
                  <span
                    title={`${item.startStopName}=>${item.endStopName}`}
                    onClick={() => goToBus(unitData, item)}
                    className={styles.linebus}
                  >{`${item.routeId}路`}</span>
                ))}
              </p>
            </>
          )}
        </Card>
      </Spin>
    </div>
  );
}

export default JudgeSuggest;
