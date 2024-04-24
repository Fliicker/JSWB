const unitService = require('../service/unit.service');
const userService = require('../service/user.service')
const fs = require('fs')

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

  async insertAUnit(req, res) {
    const record = req.body;
    const result = await unitService.insertAUnit(record);
    if (result == null) {
      res.status(500).send({
        status: 500,
        message: "insert data error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      message: "success"
    });

    await userService.addUserAction(req.user.id, 0, result[0].id, 0)
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

    await userService.addUserAction(req.user.id, 1, unitId, 0)
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

      await userService.addUserAction(req.user.id, 2, unitId, 0)
    }
  }

  async exportPDFById(req, res) {
    const unitId = req.params.id;
    const filePath = await unitService.getPDFPathById(unitId)
    if (filePath == null) {
      res.status(500).send({
        status: 500,
        message: "export pdf error!"
      });
      return;
    }
    try {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err) {
      console.error(err)
      res.status(404).send({
        status: 404,
        message: "cannot find resource!"
      });
      return;
    }
  }

  async getImgListById(req, res) {
    const unitId = req.params.id;
    const imgPaths = await unitService.getImgListById(unitId)
    if (imgPaths == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "get images error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: imgPaths,
      message: "success"
    });
  }
}

module.exports = new UnitController();