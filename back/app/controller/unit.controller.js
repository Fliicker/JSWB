const unitService = require('../service/unit.service');
const userService = require('../service/user.service')
const fs = require('fs')
const xlsx = require('xlsx');

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

  async uploadExcel(req, res) {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      //定义sheetList中存放excel表格的sheet表，就是最下方的tab
      let sheet = workbook.SheetNames[0]; // 工作表名称(选第一个sheet)
      let worksheet = workbook.Sheets[sheet]; // 只能通过工作表名称来获取指定工作表
      let results = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0 }); // Xlsx解析工作表信息 header: 1 含表头  range: 0 从第一行开始读取不设置从有实际内容开始读取
      // 由行数组重构为对象数组
      const arr = [];

      results.forEach((row, index) => {
        const userInfo = {};
        if (index > 0) {
          results[0].forEach((field, i) => {
            userInfo[field] = row[i] || "";
          });
          arr.push(userInfo);
        }
      });

      fs.unlink(req.file.path);

      res.status(200).send({
        status: 200,
        data: arr,
        message: "success"
      });

    } catch (err) {

    }
  }
}

module.exports = new UnitController();