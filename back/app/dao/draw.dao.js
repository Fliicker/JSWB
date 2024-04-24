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
    const { unit_id, name, type, geometry, description, style1, style2, style3, use_label, label } = record;
    await client.query('insert into features (unit_id, name, type, geometry, description, style1, style2, style3, use_label, label) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *',
      [unit_id, name, type, geometry, description, style1, style2, style3, use_label, label]);
  }

  async deleteFeaturesByUnitId(client, id) {
    await client.query('delete from features where unit_id = $1 returning *', [id]);
  }

  async insertPointByUnitId(client, id, name, geojsonStr, style1, style2, style3, use_label, label) {
    //默认4326坐标系
    await client.query('insert into point (unit_id, name, geom, radius, color, stroke_width, use_label, label) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5, $6, $7, $8)', [id, name, geojsonStr, style1, style2, style3, use_label, label]);
  }

  async insertLineByUnitId(client, id, name, geojsonStr, style1, style2, style3, use_label, label) {
    await client.query('insert into line (unit_id, name, geom, width, color, line_type, use_label, label) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5, $6, $7, $8)', [id, name, geojsonStr, style1, style2, style3, use_label, label]);
  }

  async insertPolygonByUnitId(client, id, name, geojsonStr, style1, style2, use_label, label) {
    await client.query('insert into polygon (unit_id, name, geom, color, opacity, use_label, label) values ($1, $2, ST_AsText(ST_GeomFromGeoJSON($3)), $4, $5, $6, $7)', [id, name, geojsonStr, style1, style2, use_label, label]);
  }

  // 删除postgis指定id图层
  async deleteVectorsByUnitId(client, id) {
    await client.query('delete from point where unit_id = $1', [id]);
    await client.query('delete from line where unit_id = $1', [id]);
    await client.query('delete from polygon where unit_id = $1', [id]);
  }

  async queryAllPoints() {
    return this.query(`SELECT 
                          ST_AsGeoJSON(p.geom)::json AS geometry, 
                          p.unit_id, 
                          p.name, 
                          p.radius, 
                          p.color, 
                          p.stroke_width, 
                          p.use_label, 
                          p.label 
                      FROM 
                          point p
                      JOIN 
                          units u ON p.unit_id = u.id AND u.is_deleted = false;`);
  }

  async queryAllLines() {
    return this.query(`SELECT 
                          ST_AsGeoJSON(l.geom)::json AS geometry, 
                          l.unit_id, 
                          l.name, 
                          l.color, 
                          l.width, 
                          l.line_type, 
                          l.use_label, 
                          l.label 
                      FROM 
                          line l
                      JOIN 
                          units u ON l.unit_id = u.id AND u.is_deleted = false;`);
  }

  async queryAllPolygons() {
    return this.query(`SELECT 
                          ST_AsGeoJSON(p.geom)::json AS geometry, 
                          p.unit_id, 
                          p.name, 
                          p.color, 
                          p.opacity, 
                          p.use_label, 
                          p.label 
                      FROM 
                          polygon p
                      JOIN 
                          units u ON p.unit_id = u.id AND u.is_deleted = false;`);
  }
}

module.exports = new DrawDao();