const pool = require('../db');

class BuildingDao {
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

  async getBuildingList() {
    return this.query('select id, name, cad_source from buildings', []);
  }

  async getBuildingById(id) {
    return this.query('select * from buildings where id = $1', [id]);
  }

  async getSourceById(id) {
    return this.query('select cad_source from buildings where id = $1', [id]);
  }
}

module.exports = new BuildingDao();