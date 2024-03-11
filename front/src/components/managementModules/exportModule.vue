<template>
  <div class="content">
    <el-scrollbar>
      <div class="box-area">
        <el-row class="bold-text">导出文保单位信息：</el-row>
        <el-row align="middle">
          <el-col :span="6">请选择导出格式：</el-col>
          <el-col :span="14">
            <el-radio-group v-model="infoExportType">
              <el-radio label="type1">Excel</el-radio>
              <el-radio label="type2">CSV</el-radio>
            </el-radio-group>
          </el-col>
          <el-col :span="4">
            <el-button class="btn-export" @click="exportInfo">导出</el-button></el-col
          >
        </el-row>
      </div>
      <div class="box-area">
        <el-row class="bold-text">导出地图标绘：</el-row>
        <el-row align="middle">
          <el-col :span="6">请选择导出格式：</el-col>
          <el-col :span="14">
            <el-radio-group v-model="featureExportType">
              <el-radio label="type1">ESRI Shapefile</el-radio>
              <el-radio label="type2">GeoJson</el-radio>
            </el-radio-group>
          </el-col>
          <el-col :span="4">
            <el-button class="btn-export" @click="exportFeature">导出</el-button></el-col
          >
        </el-row>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import axios from "axios";
import Papa from "papaparse";
import Xlsx from "xlsx";
import shpwrite from "@mapbox/shp-write";

export default defineComponent({
  name: "exportModule",
  components: {},
});
</script>

<script setup>
const infoExportType = ref("type1");
const featureExportType = ref("type1");

const fileName = ref("");
var exportInfoData = null;

function exportInfo() {
  axios
    .get("http://localhost:8181/api/units/info", { responseType: "json" })
    .then((res) => {
      exportInfoData = res.data.data;

      if (infoExportType.value === "type1") {
        const worksheet = Xlsx.utils.json_to_sheet(exportInfoData);
        const workbook = Xlsx.utils.book_new();
        Xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        Xlsx.writeFile(workbook, "文保单位信息.xlsx");
      } else if (infoExportType.value === "type2") {
        const csvData = Papa.unparse(exportInfoData, {
          quotes: true, // 将所有字段用引号括起来
          encoding: "utf-8", // 指定编码为UTF-8
        });

        const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "文保单位信息.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    })
    .catch((error) => {
      console.error("API Error:", error.response.data);
      ElNotification({
        title: "失败",
        message: "导出失败",
        position: "bottom-right",
        type: "error",
      });
    });
}

async function exportFeature() {
  try {
    if (featureExportType.value == "type1") {
      const point = await axios.get("http://localhost:8181/api/units/features/export/geojson/point");
      const line = await axios.get("http://localhost:8181/api/units/features/export/geojson/line");
      const polygon = await axios.get("http://localhost:8181/api/units/features/export/geojson/polygon");
      var options1 = {
        //folder: "my_internal_shapes_folder",
        filename: "地图标绘_点",
        outputType: "blob", // 避免导出空文件
        //compression: "DEFLATE",
        types: {
          point: "points",
          polygon: "polygons",
          polyline: "lines",
        },
      };
      var options2 = {
        filename: "地图标绘_线",
        outputType: "blob", // 避免导出空文件
        types: {
          point: "points",
          polygon: "polygons",
          polyline: "lines",
        },
      };
      var options3 = {
        filename: "地图标绘_面",
        outputType: "blob", // 避免导出空文件
        types: {
          point: "points",
          polygon: "polygons",
          polyline: "lines",
        },
      };

      shpwrite.download(point.data, options1);
      shpwrite.download(line.data, options2);
      shpwrite.download(polygon.data, options3);

      //TODO:线标绘shp有bug
      // 属性表中文乱码

      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "point.shp");
      // document.body.appendChild(link);
      // link.click();
    } else if (featureExportType.value == "type2") {
      const geojson = await axios.get("http://localhost:8181/api/units/features/export/geojson");
      downloadJson(geojson.data, "地图标绘.geojson");
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    ElNotification({
      title: "失败",
      message: "导出失败",
      position: "bottom-right",
      type: "error",
    });
  }
}

function downloadJson(jsondata, filename) {
  const blob = new Blob([JSON.stringify(jsondata)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // 保持 DOM 清洁
  window.URL.revokeObjectURL(url); // 释放 URL 对象
}
</script>

<style lang="scss" scoped>
.content {
  height: 40vh;
  padding: 1vh 0;

  .bold-text {
    font-family: 思源黑体Bold;
  }

  .box-area {
    margin: 2vh 0;
    padding: 2vh 1vw;
    border-radius: 5px;
    border: 1px solid #cacaca;
  }

  .btn-export {
    width: 5vw;
    height: 4vh;
    font-size: calc(0.6vw + 0.6vh);
    background-color: rgb(81, 103, 101);
    color: white;
    font-family: 思源黑体N;
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* 选中后圆圈的背景颜色 */
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: #414141 !important;
    border-color: #414141 !important;
  }

  // /* 选中后的字体颜色 */
  // :deep(.el-radio__input.is-checked + .el-radio__label) {
  //   color: #494949 !important;
  // }

  /* 选中后的字体颜色 */
  :deep(.el-radio__input + .el-radio__label) {
    color: #414141 !important;
  }
}
</style>
