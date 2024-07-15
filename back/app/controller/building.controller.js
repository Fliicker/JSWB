const buildingService = require('../service/building.service');
const fs = require('fs')
const path = require('path')

class BuildingController {
  async getBuildingList(req, res) {
    const data = await buildingService.getBuildingList();
    if (data == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "query data error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: data,
      message: "success"
    });
  }

  async getBuildingById(req, res) {
    const id = req.params.id;
    const data = await buildingService.getBuildingById(id);
    if (data == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "query data error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: data[0],
      message: "success"
    });
  }

  async exportGeojsonById(req, res) {
    const id = req.params.id;
    const filePath = await buildingService.getDataPathById(id)
    if (filePath == null) {
      res.status(500).send({
        status: 500,
        message: "export data error!"
      });
      return;
    }
    try {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err) {
      res.status(404).send({
        status: 404,
        message: "cannot find resource!"
      });
      return;
    }
  }
}

module.exports = new BuildingController();