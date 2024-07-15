const userService = require('../service/user.service');
const jwt = require('jsonwebtoken')
const config = require('../../config/jwtConfig');
const userDao = require('../dao/user.dao');

class UserController {
  async addUser(req, res) {
    const { username, password } = req.body;
    const result = await userService.addUser(username, password)
    if (result == null) {
      res.status(500).send({
        status: 500,
        message: "register error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      message: "success"
    });
  }

  async getUser(req, res) {
    const { username, password } = req.body;
    const userInfo = await userService.getUser(username, password)
    if (userInfo == null) {
      res.status(500).send({
        status: 500,
        data: null,
        message: "register error!"
      });
      return;
    }
    const token = jwt.sign({ id: userInfo.id, username: userInfo.username }, config.jwtSecretKey, {
      //expiresIn: config.expiresIn
    })
    res.status(200).send({
      status: 200,
      data: userInfo,
      token: 'Bearer ' + token,
      message: "success"
    });
  }

  async getUserActions(req, res) {
    const result = await userService.getUserActions();
    if (result == null){
      res.status(500).send({
        status: 500,
        data: null,
        message: "get user actions error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: result,
      message: "success"
    });
  }

  async getUserActionsById(req, res) {
    const unitId = req.params.id;
    const result = await userService.getUserActionsById(unitId);
    if (result == null){
      res.status(500).send({
        status: 500,
        data: null,
        message: "get user actions error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: result,
      message: "success"
    });
  }

  async getUserRoleById(req, res) {
    const unitId = req.params.id;
    const result = await userService.getUserRoleById(unitId);
    if (result == null){
      res.status(500).send({
        status: 500,
        data: null,
        message: "get user actions error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: result,
      message: "success"
    });
  }

  async verifyToken(req, res) {
    const id = req.user.id
    const userInfo = await userService.getUserInfoById(id);
    if (userInfo == null){
      res.status(500).send({
        status: 500,
        data: null,
        message: "get user data error!"
      });
      return;
    }
    res.status(200).send({
      status: 200,
      data: userInfo,
      message: "success"
    });
  }
}

module.exports = new UserController();