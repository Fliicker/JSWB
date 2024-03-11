const fs = require('fs');
const path = require('path');

class MapService {
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
    catch (err){
      console.log("版本号获取错误!")
      return null;
    }
  }
}

module.exports = MapService;