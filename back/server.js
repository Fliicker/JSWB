const express = require('express');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const { expressjwt: expressJWT } = require('express-jwt')
const jwtConfig = require('./config/jwtConfig')
const fileConfig = require('./config/fileConfig')
const multer = require('multer');

const unitController = require('./app/controller/unit.controller');
const drawController = require('./app/controller/draw.controller');
const mapController = require('./app/controller/map.controller');
const buildingController = require('./app/controller/building.controller');
const UserController = require('./app/controller/user.controller')

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));   //跨域设置
app.use(bodyParser.json());

// 配置jwt中间件
app.use(expressJWT({ secret: jwtConfig.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api/] })) //除了/api开头的请求都需验证token

// 错误处理中间件
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError' && err.message === 'invalid token') {
    res.status(401).send('无效的token')
  }
  // 不加此段会导致无headers时请求无响应
  res.status(500).send({
    status: 500,
    message: '未知的错误',
  })
})

// 解密中间件
app.use((req, res, next) => {
  const path = req.path.toLowerCase(); // 获取请求路径并转换为小写
  // 如果请求路径在需要验证的范围内，则执行 JWT 解密和验证逻辑
  if (!path.startsWith('/api')) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, jwtConfig.jwtSecretKey, (err, user) => {
      if (err) {
        return res.status(403).send({
          status: 403,
          message: '验证身份失败',
        });
      }
      req.user = user; // 将用户信息存储在请求对象中
      next();
    });
  } else {
    next()
  }
});


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({
  fileFilter: function (req, file, cb) {
    const allowedTypes = /xlsx|xls|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  },
  storage: storage
});

// 文物属性接口
app.get("/api/units/info", unitController.getUnitList);
app.get("/api/units/info/:id", unitController.getUnitById);
app.post("/units/info", unitController.insertAUnit)
app.post("/units/info/batch", unitController.insertUnits);
app.delete("/units/info/:id", unitController.deleteUnitById);
app.put('/units/info/:id', unitController.updateUnitById); //接收某一文物的属性记录，更新units数据库
app.post('/units/info/upload/excel', upload.single('file'), unitController.uploadExcel);

app.get('/units/resources/pdf/:id', unitController.exportPDFById);     //下载文物三普pdf
app.get('/api/units/resources/images/list/:id', unitController.getImgListById);    //获取三普预览图路径列表
app.use('/api/units/resources/images', express.static(fileConfig.imgPath)); //静态图片资源托管

// 文物标绘接口
app.get("/api/units/features/:id", drawController.getFeaturesByUnitId);
app.put('/units/features/:id', drawController.updateFeaturesByUnitId);  //接收一组标绘数据，更新空间数据库和features数据库
app.get('/units/features/export/geojson', drawController.exportGeojson);
app.get('/units/features/export/geojson/point', drawController.exportPoint);
app.get('/units/features/export/geojson/line', drawController.exportLine);
app.get('/units/features/export/geojson/polygon', drawController.exportPolygon);
app.get('/api/units/features/center/:id', drawController.getCenterByUnitId);

// 测绘数据接口
app.get('/api/buildings/geojson/centers', drawController.exportBuildingCenters);    //导出测绘数据中心点
app.get('/api/buildings/list', buildingController.getBuildingList);
app.get('/api/buildings/:id', buildingController.getBuildingById);
app.get('/buildings/export/geojson/:id', buildingController.exportGeojsonById)   //不能用post请求，两种请求分别用于什么场合？

// 地图接口
app.get('/api/map/mvt/units/:z/:x/:y', mapController.getUnitMvt);
app.get('/api/map/mvt/buildings/:z/:x/:y', mapController.getBuildingMvt);
app.get('/api/map/version', mapController.getMapVersion);

// 用户接口
app.post('/api/user/login', UserController.getUser);
app.post('/api/user/register', UserController.addUser);
app.get('/user/actions/', UserController.getUserActions)
app.get('/user/actions/:id', UserController.getUserActionsById)
app.get('/user/verification', UserController.verifyToken)


/////
//// 空间数据导出
/////
// app.get('/export/geojson/point', async (req, res) => {
//   try {
//     const features = await queryFeatures(0);
//     //await shapefile.write('point.shp', { type: 'FeatureCollection', features });
//     // var options = {
//     //   folder: 'myshapes',
//     //   types: {
//     //     point: 'mypoints',
//     //     polygon: 'mypolygons',
//     //     line: 'mylines'
//     //   }
//     // }

//     const geojson = { type: 'FeatureCollection', features: features };

//     res.status(200).json(geojson);
//     // shpwrite.zip({ type: 'FeatureCollection', features: features}, options).then(function(content) {
//     //   // let blob = self.Base64ToBlob('data:application/zip;base64,' + content)
//     //   // saveAs(blob, 'export.zip');
//     //   fs.writeFileSync('tmp/export.zip', content)
//     // });


//     // // 将Shapefile写入临时文件
//     // const tempFilePath = '/tmp/exported_data.zip';
//     // fs.writeFileSync(tempFilePath, shpBuffer);
//     // console.log(2)
//     // // 提供下载链接
//     // res.download(tempFilePath, 'exported_data.zip', (err) => {
//     //   // 删除临时文件
//     //   fs.unlinkSync(tempFilePath);
//     //   if (err) {
//     //     console.error('Error downloading file:', err);
//     //   }
//     // });
//   } catch (error) {
//     console.error('Error generate geojson', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/export/geojson/line', async (req, res) => {
//   try {
//     const features = await queryFeatures(1);
//     const geojson = { type: 'FeatureCollection', features: features };
//     res.status(200).json(geojson);

//   } catch (error) {
//     console.error('Error generate geojson', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/export/geojson/polygon', async (req, res) => {
//   try {
//     const features = await queryFeatures(2);
//     const geojson = { type: 'FeatureCollection', features: features };
//     res.status(200).json(geojson);

//   } catch (error) {
//     console.error('Error generate geojson', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
  console.log(`服务器运行端口： ${PORT}.`);
});
