const MapService = require('../service/map.service');

class MapController {
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