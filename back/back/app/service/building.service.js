const buildingDao = require('../dao/building.dao');
const fileConfig = require('../../config/fileConfig')
const path = require('path');
const fs = require('fs')

class BuildingService {
  async getBuildingList() {
    return buildingDao.getBuildingList();
  }

  async getBuildingById(id) {
    return buildingDao.getBuildingById(id);
  }

  async getDataPathById(id) {
    const result = await buildingDao.getSourceById(id);
    const source = result[0].cad_source;
    // 根据环境变量选择文件路径
    const fileDir = fileConfig.buildingPath;
    const geojsonPath = path.join(fileDir, source);

    return geojsonPath
  }
}

module.exports = new BuildingService();