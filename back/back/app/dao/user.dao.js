const pool = require('../db');

class UserDao {
  async query(queryText, params) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(queryText, params);
      return result.rows;
    } catch (err) {
      console.error('数据库查询错误: ' + err.message);
      return null;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async addUser(username, password) {
    return this.query('insert into users (username, password) values ($1, $2) returning *', [username, password]);
  }

  async getUser(username, password) {
    return this.query('select id, username, role_id from users where username = $1 and password = $2', [username, password]);
  }

  async getUserInfoById(id) {
    return this.query('select id, username, role_id from users where id = $1', [id]);
  }

  async addUserAction(userId, actionId, unitId, infoType) {
    const actions = { 0: "新增", 1: "更新", 2: "删除" };
    const infoTypes = { 0: "信息", 1: "标绘" }
    return this.query('insert into user_actions (user_id, action, unit_id, info_type) values ($1, $2, $3, $4) returning *', [userId, actions[actionId], unitId, infoTypes[infoType]]);
  }

  async getUserActions() {
    const sql = `SELECT username, users.role_id, units.name, action, info_type, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS time 
    FROM user_actions "action"
    join users on (action.user_id = users.id)
    join units on (action.unit_id = units.id)
    ORDER BY timestamp DESC`
    return this.query(sql, [])
  }

  async getUserActionsById(id) {
    const sql = `SELECT username, users.role_id, units.name, action, info_type, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS time 
      FROM user_actions "action"
      join users on (action.user_id = users.id)
      join units on (action.unit_id = units.id)
      where users.id = $1 ORDER BY timestamp DESC;`
    return this.query(sql, [id])
  }
}

module.exports = new UserDao();