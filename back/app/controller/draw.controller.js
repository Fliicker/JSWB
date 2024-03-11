const drawService = require('../service/draw.service');

class DrawController {
  async getFeaturesByUnitId(req, res) {
    const unitId = req.params.id;
    const data = await drawService.getFeaturesByUnitId(unitId)
    console.log(data)
    if (data == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "query features error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: data,
      message: "success"
    });
  }

  async updateFeaturesByUnitId(req, res) {
    const unitId = req.params.id;
    const result = await drawService.updateFeaturesByUnitId(unitId, req.body);
    if (result) {
      res.status(500).send({
        status: 500,
        message: result.error
      });
    }
    else {
      res.status(200).send({
        status: 200,
        message: "success"
      });
    }
  }

  async exportGeojson(req, res) {
    const geojson = await drawService.generateGeojson();
    if (geojson == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "export geojson error!"
      });
      return;
    }
    res.status(200).json(geojson);
  }

  async exportPoint(req, res) {
    const geojson = await drawService.generateGeojsonByType(0);
    if (geojson == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "export geojson error!"
      });
      return;
    }
    res.status(200).json(geojson);
  }

  async exportLine(req, res) {
    const geojson = await drawService.generateGeojsonByType(1);
    if (geojson == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "export geojson error!"
      });
      return;
    }
    res.status(200).json(geojson);
  }

  async exportPolygon(req, res) {
    const geojson = await drawService.generateGeojsonByType(2);
    if (geojson == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "export geojson error!"
      });
      return;
    }
    res.status(200).json(geojson);
  }
}

module.exports = new DrawController();