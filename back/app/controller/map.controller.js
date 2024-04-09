const MapService = require('../service/map.service');

class MapController {
  async getMvt(req, res) {
    const url = req.url

    const mapService = new MapService();

    const { x, y, z } = req.params;

    const mvt = await mapService.getMvt(parseInt(x), parseInt(y), parseInt(z));
    if (mvt == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "get vector layer error!"
      });
      return;
    }
    res.status(200).send(mvt);
  }

  async getMapVersion(req, res) {
    const version = MapService.getMapVersion();
    if (version == null) {
      res.status(500).send({
        status: 500,
        message: "get map version error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: version,
      message: "success"
    });
  }
}

module.exports = new MapController();