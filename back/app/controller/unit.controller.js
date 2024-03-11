const unitService = require('../service/unit.service');

class UnitController {
  async getUnitList(req, res) {
    const data = await unitService.getUnitList();
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

  async getUnitById(req, res) {
    const unitId = req.params.id;
    const data = await unitService.getUnitById(unitId);
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

  async insertUnits(req, res) {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        status: 400,
        data: null,
        message: 'Invalid JSON data. Expected an array.'
      });
      return;
    }

    var result = await unitService.insertUnits(req.body)
    if (result) {
      if (result.duplicate) {
        res.status(409).send({
          status: 409,
          message: '重复插入：ID-' + result.duplicate.id    // 显示冲突的记录
        });
      } else {
        res.status(500).send({
          status: 500,
          message: result.error
        })
      }
    }
    else {
      res.status(200).send({
        status: 200,
        message: "success"
      })
    }
  }

  async updateUnitById(req, res) {
    const unitId = req.params.id;
    const record = req.body;
    const data = await unitService.updateUnitById(unitId, record);
    if (data == null) {
      res.status(500).send({
        status: 500,
        message: "update data error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      message: "success"
    });
  }

  async deleteUnitById(req, res) {
    const unitId = req.params.id;
    const result = await unitService.deleteUnitById(unitId);
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
}

module.exports = new UnitController();