const pool = require('../db');

pool.connect(function (err) {
  if (err) {
    return console.error('数据库连接出错', err);
  }
  return console.log('数据库连接成功')
})

class DrawDao {
  async query(queryText, params) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(queryText, params);
      return result.rows;
    } catch (err) {
      console.log('数据库查询错误: ' + err.message);
      return null;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getFeaturesByUnitId(id) {
    return this.query('select * from features where unit_id = $1', [id]);
  }

  async insertFeaturesByUnitId(client, record) {
    const { unit_id, name, type, geometry, description, style1, style2, style3 } = record;
    await client.query('insert into features (unit_id, name, type, geometry, description, style1, style2, style3) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *',
      [unit_id, name, type, geometry, description, style1, style2, style3]);
  }

  async deleteFeaturesByUnitId(client, id) {
    await client.query('delete from features where unit_id = $1 returning *', [id]);
  }

  async insertPointByUnitId(client, id, name, geojsonStr, style1, style2, style3) {
    //默认4326坐标系
    console.log(geojsonStr)
    await client.query('insert into point (unit_id, name, geom, radius, color, stroke_width) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5, $6)', [id, name, geojsonStr, style1, style2, style3]);
  }

  async insertLineByUnitId(client, id, name, geojsonStr, style1, style2, style3) {
    await client.query('insert into line (unit_id, name, geom, width, color, line_type) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5, $6)', [id, name, geojsonStr, style1, style2, style3]);
  }

  async insertPolygonByUnitId(client, id, name, geojsonStr, style1, style2) {
    await client.query('insert into polygon (unit_id, name, geom, color, opacity) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5)', [id, name, geojsonStr, style1, style2]);
  }

  // 删除postgis指定id图层
  async deleteVectorsByUnitId(client, id) {
    await client.query('delete from point where unit_id = $1', [id]);
    await client.query('delete from line where unit_id = $1', [id]);
    await client.query('delete from polygon where unit_id = $1', [id]);
  }

  async queryAllPoints() {
    return this.query('SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, radius, color, stroke_width FROM point');
  }

  async queryAllLines() {
    return this.query('SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, color, width, line_type FROM line');
  }

  async queryAllPolygons() {
    return this.query('SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, color, opacity FROM polygon');
  }
}

module.exports = new DrawDao();