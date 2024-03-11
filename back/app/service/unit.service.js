const unitDao = require('../dao/unit.dao');
const drawDao = require('../dao/draw.dao');
const pool = require('../db');
const MapService = require('./map.service')

class UnitService {
  async getUnitList() {
    return unitDao.getUnitList();
  }

  async getUnitById(id) {
    return unitDao.getUnitById(id);
  }

  async insertUnits(data) {
    return unitDao.insertUnits(data);
  }

  async deleteUnitById(id) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // 删除指定id所有标绘
      await drawDao.deleteFeaturesByUnitId(client, id);
      await drawDao.deleteVectorsByUnitId(client, id);

      // 删除文物信息
      await unitDao.deleteUnitById(client, id);

      await client.query('COMMIT');

      MapService.clearCache('D:/WebGIS/GeoServer/data_dir/gwc/jswbservice_wb_features');
      console.log('已清空缓存!');
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

  async updateUnitById(id, record) {
    return unitDao.updateUnitById(id, record);
  }
}

module.exports = new UnitService();