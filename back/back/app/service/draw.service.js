const drawDao = require('../dao/draw.dao');
const mapDao = require('../dao/map.dao');
const pool = require('../db');
//const turf = require('@turf/helpers');
const turf = require('@turf/turf')

const MapService = require('./map.service')

class DrawService {
  async getFeaturesByUnitId(id) {
    return drawDao.getFeaturesByUnitId(id);
  }

  async updateFeaturesByUnitId(id, records) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 删除指定id所有标绘
      await drawDao.deleteFeaturesByUnitId(client, id);

      // 更新features数据库
      for (const record of records) {
        await drawDao.insertFeaturesByUnitId(client, record);
      }

      //更新空间数据库
      await drawDao.deleteVectorsByUnitId(client, id);

      for (const record of records) {
        //style1-3对应标绘图层的几种样式
        const { name, type, geometry, style1, style2, style3, use_label, label } = record
        var geom = JSON.parse(geometry);

        switch (type) {
          case 0: {
            var geojsonStr = JSON.stringify({ "type": "Point", "coordinates": geom });
            drawDao.insertPointByUnitId(client, id, name, geojsonStr, style1, style2, style3, use_label, label)
            break;
          }
          case 1: {
            var geojsonStr = JSON.stringify({ "type": "Linestring", "coordinates": geom });
            drawDao.insertLineByUnitId(client, id, name, geojsonStr, style1, style2, style3, use_label, label)
            break;
          }
          case 2: {
            var geojsonStr = JSON.stringify({ "type": "Polygon", "coordinates": geom });
            drawDao.insertPolygonByUnitId(client, id, name, geojsonStr, style1, style2, use_label, label)
            break;
          }
          default:
            break;
        }
      }

      await client.query('COMMIT');

      // MapService.clearCache('D:/WebGIS/GeoServer/data_dir/gwc/jswbservice_wb_features');
      // console.log('已清空缓存!');
      MapService.updateConfig()

      return null;

    } catch (err) {
      if (client) {
        await client.query('ROLLBACK');
      }
      return err;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async generateFeatureCollection(geomType) {
    let features = [];
    switch (geomType) {
      case 0: {
        const queryResult = await drawDao.queryAllPoints();
        if (queryResult == null) return null;
        features = queryResult.map(row => ({
          type: 'Feature',
          geometry: row.geometry,
          properties: { unit_id: row.unit_id, name: row.name, radius: row.radius, color: row.color, stroke_width: row.stroke_width, use_label: row.use_label, label: row.label },
        }));
        break;
      }
      case 1: {
        const queryResult = await drawDao.queryAllLines();
        if (queryResult == null) return null;
        features = queryResult.map(row => ({
          type: 'Feature',
          geometry: row.geometry,
          properties: { unit_id: row.unit_id, name: row.name, color: row.color, width: row.width, line_type: row.line_type, use_label: row.use_label, label: row.label },
        }));
        break;
      }
      case 2: {
        const queryResult = await drawDao.queryAllPolygons();
        if (queryResult == null) return null;
        features = queryResult.map(row => ({
          type: 'Feature',
          geometry: row.geometry,
          properties: { unit_id: row.unit_id, name: row.name, color: row.color, opacity: row.opacity, use_label: row.use_label, label: row.label },
        }));
        break;
      }
      default:
        return null;
    }

    return features;
  }

  async generateGeojsonByType(geomType) {
    const features = await this.generateFeatureCollection(geomType)
    if (features == null) return null;
    const geojson = { type: 'FeatureCollection', features: features };
    return geojson;
  }

  async generateGeojson() {
    const pointCollection = await this.generateFeatureCollection(0);
    const lineCollection = await this.generateFeatureCollection(1);
    const polygonCollection = await this.generateFeatureCollection(2);
    if (pointCollection == null || lineCollection == null || polygonCollection == null) return null;
    const geojson = turf.featureCollection([...pointCollection, ...lineCollection, ...polygonCollection]);
    return geojson;
  }

  // 获取中心点
  async getCenterByUnitId(id) {
    const features = await drawDao.getFeaturesByUnitId(id);
    if (features.length == 0 || features == null) return null;

    let collection = [];
    for (var item of features) {
      let geom = JSON.parse(item.geometry);
      switch (item.type) {
        case 0: {
          var feature = turf.point(geom);
          break;
        }
        case 1: {
          var feature = turf.lineString(geom);
          break;
        }
        case 2: {
          var feature = turf.polygon(geom);
          break;
        }
        default:
          break;
      }
      collection.push(feature);
    }
    const geojson = turf.featureCollection(collection);
    const center = turf.center(geojson).geometry.coordinates

    return center;
  }

  // 生成测绘数据中心点geojson
  async generateBuildingGeojson() {
    const rows = await mapDao.getBuildingCenters()
    if (rows == null) return null

    const points = []
    for (var row of rows) {
      let { center_x, center_y, name } = row
      let point = turf.point([center_x, center_y], { name: name })
      points.push(point)
    }
    const collection = turf.featureCollection(points)

    return collection;
  }
}

module.exports = new DrawService();