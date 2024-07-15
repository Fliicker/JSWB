const mapDao = require('../dao/map.dao');
const fs = require('fs');
const path = require('path');

class MapService {
  // 生成矢量瓦片
  async getUnitMvt(x, y, z) {
    let [xmin, ymin] = this.xyz2lonlat(x, y, z)
    let [xmax, ymax] = this.xyz2lonlat(x + 1, y + 1, z)

    const rows = await mapDao.getUnitMVT(xmin, ymin, xmax, ymax)
    //const rows = await mapDao.getMVT2(x, y, z)

    if (rows == null) return null

    return rows[0].mvt
  }

  async getBuildingMvt(x, y, z) {
    let [xmin, ymin] = this.xyz2lonlat(x, y, z)
    let [xmax, ymax] = this.xyz2lonlat(x + 1, y + 1, z)

    const rows = await mapDao.getBuildingMVT(xmin, ymin, xmax, ymax)
    if (rows == null) return null
    return rows[0].mvt
  }

  xyz2lonlat(x, y, z) {
    const n = Math.pow(2, z);
    const lon_deg = (x / n) * 360.0 - 180.0;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
    const lat_deg = (180 * lat_rad) / Math.PI;
    return [lon_deg, lat_deg];
  }

  // 清除GeoServer本地缓存（已弃用）
  static clearCache(folderPath) {
    if (!fs.existsSync(folderPath)) {
      return;
    }

    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        this.clearCache(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }

  static updateConfig() {
    const configFilePath = '././config/mapConfig.json'
    const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
    var config = JSON.parse(configFileContent);
    config.version++;
    console.log(config.version)

    // 将新的版本号写入配置文件
    fs.writeFileSync(configFilePath, JSON.stringify(config, null), 'utf-8');
    console.log('配置文件已更新。');
  }

  static getMapVersion() {
    try {
      const configFilePath = '././config/mapConfig.json'
      const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
      let config = JSON.parse(configFileContent);
      console.log(`当前版本号: ${config.version}`);
      return config.version;
    }
    catch (err) {
      console.log("版本号获取错误!")
      return null;
    }
  }
}

module.exports = MapService;