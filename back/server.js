import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs'
// import shpwrite from '@mapbox/shp-write';
import path from 'path';
import { getUnitList, getFeaturesByUnitId, getFeaturesByUnitId2, getInfoByUnitId, updateFeatures, updateFeatures2, updateInfo, insertUnits, queryFeatures, deleteUnitById } from './app/model/test.model.js';

//import fs from 'fs';

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));   //跨域设置
app.use(bodyParser.json());

app.get("/unitList", async (req, res) => {
  const data = await getUnitList();
  res.status(200).send({
    status: 200,
    data: data,
    message: "success"
  });
});

app.post("/addUnits", async (req, res) => {
  if (!Array.isArray(req.body)) {
    res.status(400).json({ message: 'Invalid JSON data. Expected an array.' });
    return;
  }

  var result = await insertUnits(req.body)
  if (result.success) {
    res.status(200).send({
      status: 200,
      //data: result,
      message: 'Data inserted successfully!'
    });
  } else {
    if (result.duplicate) {
      res.status(409).json({ message: '重复插入：ID-' + result.duplicate.id });    // 显示冲突的记录
    } else {
      res.status(500).json({ message: 'Error inserting JSON data' });
    }
  }
});

app.delete("/deleteUnitById/:id", async (req, res) => {
  try {
    const id = req.params.id;
    deleteUnitById(id)
    res.status(200).send({
      status: 200,
      //data: result,
      message: "success"
    });
  } catch (error) {
    console.error('Error delete record:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// app.get("/getFeaturesByUnitId/:unitId", async (req, res) => {
//   const unitId = req.params.unitId;
//   const data = await getFeaturesByUnitId(unitId);

//   res.status(200).send({
//     status: 200,
//     data: data,
//     message: "success"
//   });
// });

app.get("/getFeaturesByUnitId2/:unitId", async (req, res) => {
  const unitId = req.params.unitId;
  const data = await getFeaturesByUnitId2(unitId);

  res.status(200).send({
    status: 200,
    data: data,
    message: "success"
  });
})


// //接收一组标绘数据，更新空间数据库和features数据库
// app.post('/updateFeatures', async (req, res) => {
//   try {
//     //const result = await updateFeatures(req.body)
//     await updateFeatures(req.body)
//     res.status(200).send({
//       status: 200,
//       //data: result,
//       message: "success"
//     });
//   } catch (error) {
//     console.error('Error inserting record:', error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

//接收一组标绘数据，更新空间数据库和features数据库
app.post('/updateFeatures2', async (req, res) => {
  try {
    //const result = await updateFeatures(req.body)
    await updateFeatures2(req.body)
    res.status(200).send({
      status: 200,
      //data: result,
      message: "success"
    });
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get("/getInfoByUnitId/:unitId", async (req, res) => {
  const unitId = req.params.unitId;
  const data = await getInfoByUnitId(unitId);

  res.status(200).send({
    status: 200,
    data: data,
    message: "success"
  });
})

//接收某一文物的属性记录，更新units数据库
app.post('/updateInfo', async (req, res) => {
  try {
    //const result = await updateFeatures(req.body)
    await updateInfo(req.body)
    res.status(200).send({
      status: 200,
      //data: result,
      message: "success"
    });
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/mapVersion', async (req, res) => {
  const configFilePath = 'config/mapConfig.json'
  const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
  let config = JSON.parse(configFileContent);
  console.log(`当前版本号: ${config.version}`);
  res.status(200).send({
    status: 200,
    data: config.version,
    message: "success"
  });
})


//接收一组标绘数据，更新空间数据库和features数据库
app.post('/upload', async (req, res) => {
  try {
    console.log(req)
  } catch (error) {
    console.error('Error inserting record:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


/////
//// 空间数据导出
/////
app.get('/export/geojson/point', async (req, res) => {
  try {
    const features = await queryFeatures(0);
    //await shapefile.write('point.shp', { type: 'FeatureCollection', features });
    // var options = {
    //   folder: 'myshapes',
    //   types: {
    //     point: 'mypoints',
    //     polygon: 'mypolygons',
    //     line: 'mylines'
    //   }
    // }

    const geojson = { type: 'FeatureCollection', features: features };

    res.status(200).json(geojson);
    // shpwrite.zip({ type: 'FeatureCollection', features: features}, options).then(function(content) {
    //   // let blob = self.Base64ToBlob('data:application/zip;base64,' + content)
    //   // saveAs(blob, 'export.zip');
    //   fs.writeFileSync('tmp/export.zip', content)
    // });


    // // 将Shapefile写入临时文件
    // const tempFilePath = '/tmp/exported_data.zip';
    // fs.writeFileSync(tempFilePath, shpBuffer);
    // console.log(2)
    // // 提供下载链接
    // res.download(tempFilePath, 'exported_data.zip', (err) => {
    //   // 删除临时文件
    //   fs.unlinkSync(tempFilePath);
    //   if (err) {
    //     console.error('Error downloading file:', err);
    //   }
    // });
  } catch (error) {
    console.error('Error generate geojson', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/export/geojson/line', async (req, res) => {
  try {
    const features = await queryFeatures(1);
    const geojson = { type: 'FeatureCollection', features: features };
    res.status(200).json(geojson);

  } catch (error) {
    console.error('Error generate geojson', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/export/geojson/polygon', async (req, res) => {
  try {
    const features = await queryFeatures(2);
    const geojson = { type: 'FeatureCollection', features: features };
    res.status(200).json(geojson);

  } catch (error) {
    console.error('Error generate geojson', error);
    res.status(500).send('Internal Server Error');
  }
});



const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
  console.log(`服务器运行端口： ${PORT}.`);
});
