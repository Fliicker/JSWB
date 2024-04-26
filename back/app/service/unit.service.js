const unitDao = require('../dao/unit.dao');
const drawDao = require('../dao/draw.dao');
const pool = require('../db');
const MapService = require('./map.service')
const fileConfig = require('../../config/fileConfig')
const fs = require('fs')
const path = require('path');

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

  async insertAUnit(record) {
    return unitDao.insertAUnit(record);
  }

  async deleteUnitById(id) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // // 删除指定id所有标绘
      // await drawDao.deleteFeaturesByUnitId(client, id);
      // await drawDao.deleteVectorsByUnitId(client, id);

      // 删除文物信息
      await unitDao.deleteUnitById(client, id);

      await client.query('COMMIT');

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

  async getPDFPathById(id) {
    const results = await unitDao.getUnitById(id);
    if (results == null || results.length == 0) return null;

    const pdfPath = results[0].file_path;
    if (pdfPath == null) return null;
    const pdfDir = fileConfig.pdfPath;
    const pdfPath2 = path.join(pdfDir, pdfPath);

    return pdfPath2
  }

  async getImgListById(id) {
    const records = await unitDao.getUnitById(id);
    if (records == null || records.length == 0) return null;

    const survey3Id = records[0].survey3_id;
    const imgDir = fileConfig.imgPath;
    const imgDir2 = path.join(imgDir, survey3Id);

    try {
      const data = fs.readFileSync(path.join(imgDir2, `${survey3Id}-list.txt`), 'utf8');
      const lines = data.trim().split('\n').map(line => line.trim().replace(/\r$/, ''));
      const paths = lines.map(line => `/${survey3Id}/${line}`);
      return paths;
    } catch (err) {
      console.error('读取文件时出错：', err);
      return null;
    }
  }
}

module.exports = new UnitService();