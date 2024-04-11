const pool = require('../db');

class UnitDao {
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

  async getUnitList() {
    return this.query('select * from units', []);
  }

  async getUnitById(id) {
    return this.query('select * from units where id = $1', [id]);
  }

  async insertUnits(data) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      for (var record of data) {
        const { survey3_id, name, type, age, address, person, tel } = record;
        var insertSql = 'insert into units (survey3_id, name, type, age, address, person, tel) values ($1, $2, $3, $4, $5, $6, $7) returning *';
        await pool.query(insertSql, [survey3_id, name, type, age, address, person, tel]);
      }

      await client.query('COMMIT');
      return null;

    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }

      // 捕获唯一键冲突的异常
      if (error.code === '23505') { // PostgreSQL唯一约束错误码
        console.error('重复插入:', record);
        await client.query('ROLLBACK');
        return { error: error, duplicate: record };
      } else {
        return { error: error, duplicate: null };
      }

    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async updateUnitById(id, record) {
    const { survey3_id, name, type, age, address, person, tel } = record;
    return this.query('UPDATE units SET type = $1, age = $2, address = $3, person = $4, tel = $5, name = $6, survey3_id = $7 WHERE id = $8 returning *', [type, age, address, person, tel, name, survey3_id ,id]);
  }

  async deleteUnitById(client, id) {
    //return this.query('delete from units where id = $1 returning *', [id]);
    await client.query('delete from units where id = $1 returning *', [id]);
  }
}

module.exports = new UnitDao();