const pool = require('../db');

class MapDao {

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

  async getUnitMVT(xmin, ymin, xmax, ymax) {
    let sql1 =
      ` 
      SELECT ST_AsMVT(P,'point',4096,'geom') AS "mvt"
      FROM
      (
          SELECT t.unit_id, t.name, t.radius, t.stroke_width, t.color, t.use_label, t.label, u.confirmed, ST_AsMVTGeom (ST_Transform(t.geom,3857),ST_Transform(ST_MakeEnvelope (${xmin},${ymin},${xmax},${ymax},4326),3857),4096,64,TRUE) geom
          FROM point t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS P
      `
    //第一个point指返回的切片图层名称
    let sql2 =
      ` 
      SELECT ST_AsMVT ( P,'line',4096,'geom' ) AS "mvt"
      FROM
      (
          SELECT t.unit_id, t.name, t.width, t.line_type, t.color, t.use_label, t.label, ST_AsMVTGeom (ST_Transform (t.geom, 3857 ),ST_Transform (ST_MakeEnvelope ( ${xmin},${ymin},${xmax},${ymax},4326 ),3857),4096,64,TRUE ) geom
          FROM line t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS P 
      `

    let sql3 =
      ` 
      SELECT ST_AsMVT ( P,'polygon',4096,'geom' ) AS "mvt"
      FROM
      (
          SELECT t.unit_id, t.name, t.color, t.opacity, t.use_label, t.label, ST_AsMVTGeom (ST_Transform (ST_Simplify(t.geom, 0.0),3857 ),ST_Transform (ST_MakeEnvelope ( ${xmin},${ymin},${xmax},${ymax},4326 ),3857),4096,64,TRUE ) geom
          FROM polygon t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS P
      `

    let sql = `select (${sql1})||(${sql2})||(${sql3}) as mvt`;

    return this.query(sql);
  }

  async getBuildingMVT(xmin, ymin, xmax, ymax) {
    let sql =
      ` 
      SELECT ST_AsMVT(P,'building_line',4096,'geom') AS "mvt"
      FROM
      (
          SELECT id, b.name, fid, color, cad_type, highlight, ST_AsMVTGeom (ST_Transform(geom,3857),ST_Transform(ST_MakeEnvelope (${xmin},${ymin},${xmax},${ymax},4326),3857),4096,64,TRUE) geom
          FROM building_line l join buildings b
          using (id)
      ) AS P
      `
    return this.query(sql);
  }

  async getBuildingCenters() {
    let sql = 'SELECT name, center_x, center_y from buildings'
    return this.query(sql);
  }

  async getMVT2(x, y, z) {
    let sql1 =
      ` 
      SELECT ST_AsMVT (a, 'point',4096,'geom') As tile
      FROM
      (
        SELECT st_asmvtgeom (ST_Transform(t.geom, 3857), ST_TileEnvelope(${z},${x},${y},4490),4096,0,false) AS geom
        FROM point t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS a where a.geom is not null
      `
    //第一个point指返回的切片图层名称
    let sql2 =
      ` 
      SELECT ST_AsMVT (a, 'line',4096,'geom') As tile
      FROM
      (
        SELECT st_asmvtgeom (ST_Transform(t.geom, 3857), ST_TileEnvelope(${z},${x},${y},4490),4096,0,false) AS geom
        FROM line t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS a where a.geom is not null
      `

    let sql3 =
      ` 
      SELECT ST_AsMVT (a, 'polygon',4096,'geom') As tile
      FROM
      (
        SELECT st_asmvtgeom (ST_Transform(t.geom, 3857), ST_TileEnvelope(${z},${x},${y},3857),4096,0,false) AS geom
        FROM polygon t JOIN units u ON t.unit_id = u.id AND u.is_deleted = false
      ) AS a where a.geom is not null
      `

    let sql = `select (${sql1})||(${sql2})||(${sql3}) as mvt`;

    return this.query(sql);
  }
}

module.exports = new MapDao();