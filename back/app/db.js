const pg = require('pg');

//创建链接对象
const con = {
  host: 'localhost',//对应服务器，如果是本地，则为localhost
  user: 'postgres',
  password: '2001092000',
  port: '5432',
  database: 'jiangshan'
}

const pool = new pg.Pool(con);

module.exports = pool;