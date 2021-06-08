import React, { Component } from 'react';
import { connect } from 'dva';
import { Map, TileLayer } from 'react-leaflet';
import DrawOtherLine from './DrawOtherLine';
import DrawIndexLine from './DrawIndexLine';
import styles from './index.less';
import { map_url_white, map_url_blue, map_url_blue_poi } from '../../utils/url';

@connect(({ global, map }) => ({ global, mapData: map }))
class Index extends Component {
  componentDidMount() {
    this.map = this.refs.map.contextValue.map;
    this.setState({});
  }
  render() {
    const { mapTheme } = this.props.global;
    return (
      <Map
        ref="map"
        zoomControl={false}
        className={styles.map}
        center={[34.7497117322845, 113.68412017822267]}
        minZoom={4}
        maxZoom={18}
        zoom={12}
        attribution={''}
      >
        <TileLayer
          url={mapTheme === 'light' ? map_url_white : map_url_blue}
          subdomains={[]}
        />
        {mapTheme === 'dark' ? (
          <TileLayer url={map_url_blue_poi} subdomains={[]} />
        ) : (
          ''
        )}
        {this.props.page==='index'?
        <DrawIndexLine {...this.props} map={this.map} />
        :
        <DrawOtherLine {...this.props} map={this.map} />}
      </Map>
    );
  }
}
export default Index;
