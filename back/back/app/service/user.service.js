const userDao = require('../dao/user.dao');

class UserService {
  async addUser(username, password) {
    return userDao.addUser(username, password);
  }

  async getUser(username, password) {
    const result = await userDao.getUser(username, password);
    if (result.length == 0 || result == null) return null;
    return result[0];
  }

  async getUserInfoById(id) {
    const result = await userDao.getUserInfoById(id);
    if (result.length == 0 || result == null) return null;
    return result[0];
  }

  async addUserAction(userId, actionId, unitId, infoType) {
    return userDao.addUserAction(userId, actionId, unitId, infoType)
  }

  async getUserActions() {
    return userDao.getUserActions()
  }

  async getUserActionsById(id) {
    return userDao.getUserActionsById(id)
  }
}

module.exports = new UserService();