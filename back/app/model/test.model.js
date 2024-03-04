import pg from 'pg'
import fs from 'fs'
import path from 'path';

//创建链接对象
const con = {
  host: 'localhost',//对应服务器，如果是本地，则为localhost
  user: 'postgres',
  password: '2001092000',
  port: '5432',
  database: 'jiangshan'
}

const pool = new pg.Pool(con);

pool.connect(function (err) {
  if (err) {
    return console.error('数据库连接出错', err);
  }
  return console.log('数据库连接成功')
})


export const getUnitList = function () {
  //常用sql语句，和mysql语句基本一致
  var sql = 'select id, name, type, age, address, person, tel from units';
  return pool.query(sql)
    .then(res => {
      return res.rows;//传出查询到的数据
    })
    .catch(err => {
      console.log('查询失败' + err)
      return false
    }
    )
}

export const insertUnits = async function (data) {
  try {
    await pool.query('BEGIN');

    for (var record of data) {
      const { id, name, type, age, address, person, tel } = record;
      try {
        var insertSql = 'insert into units (id, name, type, age, address, person, tel) values ($1, $2, $3, $4, $5, $6, $7)';
        await pool.query(insertSql, [id, name, type, age, address, person, tel]);
      } catch (error) {
        // 捕获唯一键冲突的异常
        if (error.code === '23505') { // PostgreSQL唯一约束错误码
          // // 将导致冲突的记录返回给前端
          // res.status(409).json({ message: 'Duplicate record', record });
          console.error('重复插入:', record);
          await pool.query('ROLLBACK');
          return { success: false, duplicate: record };
        } else {
          return { success: false, duplicate: null };
        }
      }
    }

    await pool.query('COMMIT');

    return { success: true, duplicate: null };
  } catch (error) {
    console.error('Error inserting JSON data:', error);
    res.status(500).json({ message: 'Error inserting JSON data' });
    return { success: false, duplicate: null };
  }
}

export const deleteUnitById = async function (id) {
  // 先删除其他表中相关记录, 防止违反外键约束
  await pool.query(`delete from features where unit_id = '${id}'`);
  await pool.query(`delete from point where unit_id = '${id}'`);
  await pool.query(`delete from line where unit_id = '${id}'`);
  await pool.query(`delete from polygon where unit_id = '${id}'`);
  var sql = `delete from units where (id = '${id}')`;
  await pool.query(sql)

  clearCache('D:/WebGIS/GeoServer/data_dir/gwc/jswbservice_wb_features');
  console.log('已清空缓存!');
  updateConfig()
}

export const getFeaturesByUnitId = function (id) {
  var sql = `select unit_id, name, type, geometry, style, description from features where unit_id = '${id}'`;
  console.log(sql)
  return pool.query(sql)
    .then(res => {
      return res.rows;//传出查询到的数据
    })
    .catch(err => {
      console.log('查询失败' + err)
      return false
    }
    )
}

export const getInfoByUnitId = function (id) {
  var sql = `select id, name, type, age, address, person, tel from units where id = '${id}'`;
  console.log(sql)
  return pool.query(sql)
    .then(res => {
      return res.rows[0];//传出查询到的数据
    })
    .catch(err => {
      console.log('查询失败' + err)
      return false
    }
    )
}

export const updateFeatures = async function (items) {
  //TODO: 允许items为空, 使能够全部清空, 请求参数中包含id
  if (items.length == 0)    //防止items[0].unit_id无法获取id
    return
  //更新features数据库
  var unitid = items[0].unit_id;
  var deleteSql = `delete from features where unit_id = '${unitid}'`;
  await pool.query(deleteSql);

  for (var item of items) {
    const { unit_id, name, type, geometry, style, description } = item;
    const result = await pool.query(
      'insert into features (unit_id, name, type, geometry, style, description) values ($1, $2, $3, $4, $5, $6) returning *',
      [unit_id, name, type, geometry, style, description]
    );

    const insertedRecord = result.rows[0];
  }

  //更新空间数据库
  await pool.query(`delete from point where unit_id = '${unitid}'`);
  await pool.query(`delete from line where unit_id = '${unitid}'`);
  await pool.query(`delete from polygon where unit_id = '${unitid}'`);
  for (var item of items) {
    console.log(item)
    var geom = JSON.parse(item.geometry);
    var style = JSON.parse(item.style)
    console.log(style)

    var sql = '';
    switch (item.type) {
      case 0: {
        var geojsonStr = JSON.stringify({ "type": "Point", "coordinates": geom });
        //默认4326坐标系
        sql = `insert into point (unit_id, name, geom, radius, color, stroke_width, stroke_color) values 
        ('${unitid}', '${item.name}', ST_AsText(ST_GeomFromGeoJSON('${geojsonStr}')),
        '${style['circle-radius']}','${style['circle-color']}','${style['circle-stroke-width']}','${style['circle-stroke-color']}')`;
        break;
      }
      case 1: {
        var lineType = style["line-dasharray"].toString() == [1, 0].toString() ? 0 : 1;       //0为实线，1为虚线
        var geojsonStr = JSON.stringify({ "type": "Linestring", "coordinates": geom });
        sql = `insert into line (unit_id, name, geom, width, color, line_type) values 
        ('${unitid}', '${item.name}', ST_AsText(ST_GeomFromGeoJSON('${geojsonStr}')),
        '${style['line-width']}','${style['line-color']}', '${lineType}')`;
        break;
      }
      case 2: {
        var geojsonStr = JSON.stringify({ "type": "Polygon", "coordinates": geom });
        sql = `insert into polygon (unit_id, name, geom, color, opacity) values 
        ('${unitid}', '${item.name}', ST_AsText(ST_GeomFromGeoJSON('${geojsonStr}')),
        '${style['fill-color']}','${style['fill-opacity']}')`;
        break;
      }
      default:
        break;
    }

    await pool.query(sql);
  }

  clearCache('D:/WebGIS/GeoServer/data_dir/gwc/jswbservice_wb_features');
  console.log('已清空缓存!');
  updateConfig()

  //return await getFeaturesByUnitId(unitid)
}

export const updateInfo = async function (item) {
  var unitid = item.id;
  console.log(item.type)
  var updateSql = `update units set type='${item.type}', age='${item.age}', 
    address='${item.address}', person='${item.person}' where id = '${unitid}'`;
  await pool.query(updateSql);
}

const clearCache = function (folderPath) {
  if (!fs.existsSync(folderPath)) {
    return;
  }

  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      clearCache(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });
}

const updateConfig = function () {
  const configFilePath = '././config/mapConfig.json'
  const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
  var config = JSON.parse(configFileContent);
  config.version++;
  console.log(config.version)

  // 将新的版本号写入配置文件
  fs.writeFileSync(configFilePath, JSON.stringify(config, null), 'utf-8');
  console.log('配置文件已更新。');
}




export const queryFeatures = async function (geomtype) {
  var sql = "";
  var features = [];
  switch (geomtype) {
    case 0: {
      sql = 'SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, radius, color, stroke_color, stroke_width FROM point';
      var queryResult = await pool.query(sql);
      features = queryResult.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: { unit_id: row.unit_id, name: row.name, radius: row.radius, color: row.color, stroke_color: row.stroke_color, stroke_width: row.stroke_width },
      }));
      break;
    }
    case 1: {
      sql = 'SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, color, width, line_type FROM line';
      var queryResult = await pool.query(sql);
      features = queryResult.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: { unit_id: row.unit_id, name: row.name, color: row.color, width: row.width, line_type: row.line_type },
      }));
      break;
    }
    case 2: {
      sql = 'SELECT ST_AsGeoJSON(geom)::json AS geometry, unit_id, name, color, opacity FROM polygon';
      var queryResult = await pool.query(sql);
      features = queryResult.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: { unit_id: row.unit_id, name: row.name, color: row.color, opacity: row.opacity },
      }));
      break;
    }
    default: break;
  }

  return features
}

//关闭连接
//pool.end();