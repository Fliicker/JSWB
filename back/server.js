const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const unitController = require('./app/controller/unit.controller');
const drawController = require('./app/controller/draw.controller');
const mapController = require('./app/controller/map.controller');

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));   //跨域设置
app.use(bodyParser.json());

// // 文物属性接口
// app.get("/unitList", unitController.getUnitList);
// app.get("/getInfoByUnitId/:id", unitController.getUnitById);
// app.post("/addUnits", unitController.insertUnits);
// app.delete("/deleteUnitById/:id", unitController.deleteUnitById);
// app.post('/updateInfo/:id', unitController.updateUnitById); //接收某一文物的属性记录，更新units数据库

// // 文物标绘接口
// app.get("/getFeaturesByUnitId2/:id", drawController.getFeaturesByUnitId);
// app.post('/updateFeatures2/:id', drawController.updateFeaturesByUnitId);  //接收一组标绘数据，更新空间数据库和features数据库
// app.get('/export/geojson', drawController.exportGeojson);
// app.get('/export/geojson/point', drawController.exportPoint);
// app.get('/export/geojson/line', drawController.exportLine);
// app.get('/export/geojson/polygon', drawController.exportPolygon);

// // 地图接口
// app.get('/mapVersion', mapController.getMapVersion);

// 文物属性接口
app.get("/api/units/info", unitController.getUnitList);
app.get("/api/units/info/:id", unitController.getUnitById);
app.post("/api/units/info", unitController.insertUnits);
app.delete("/api/units/info/:id", unitController.deleteUnitById);
app.put('/api/units/info/:id', unitController.updateUnitById); //接收某一文物的属性记录，更新units数据库

// 文物标绘接口
app.get("/api/units/features/:id", drawController.getFeaturesByUnitId);
app.put('/api/units/features/:id', drawController.updateFeaturesByUnitId);  //接收一组标绘数据，更新空间数据库和features数据库
app.get('/api/units/features/export/geojson', drawController.exportGeojson);
app.get('/api/units/features/export/geojson/point', drawController.exportPoint);
app.get('/api/units/features/export/geojson/line', drawController.exportLine);
app.get('/api/units/features/export/geojson/polygon', drawController.exportPolygon);

// 地图接口
app.get('/api/map/getMvt/:z/:x/:y', mapController.getMvt);
app.get('/api/map/version', mapController.getMapVersion);



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
