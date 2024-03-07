<template>
  <el-container id="layer-container" class="map-overlay-right">
    <el-main>
      <el-row justify="center"
        ><span id="title">&nbsp;&nbsp; {{ unitName }}</span></el-row
      >
      <el-row><span class="subtitle">&nbsp;&nbsp; 标绘管理</span></el-row>
      <div class="draw-manage">
        <div id="draw-layers">
          <el-empty v-if="drawData.length == 0" :image-size="0.1" description="无标绘" />
          <el-scrollbar>
            <!-- <el-table :data="drawData" style="width: 100%">
            <el-table-column prop="name" label="标绘名称">
              <template #default="scope">
                <div>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table> -->
            <el-collapse
              class="collapse box-overlay"
              v-model="currentFeatureName"
              accordion
              v-show="drawData.length != 0"
            >
              <el-collapse-item v-for="(item, index) in drawData" :name="item.name">
                <template #title>
                  {{ item.name }}
                </template>
                <!-- /{{ item.description ? item.description : "暂无描述" }} -->
                <el-row> 标绘类型：{{ geomTypes[item.type] }} </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-scrollbar>
        </div>
        <el-row justify="center" align="middle" class="button-group">
          <el-popover placement="left" :width="250" trigger="click" :visible="popVisible">
            <template #reference>
              <el-button size="small" @click="popVisible = true" class="btn-add"
                >添加标绘</el-button
              >
            </template>
            <el-row align="middle" style="height: 30px">
              <el-col :span="8" style="font-size: 14px">标绘类型：</el-col>
              <el-col :span="16">
                <el-select v-model="drawTypeAdd" class="m-2" size="small">
                  <el-option
                    v-for="item in drawTypeOptions"
                    :key="item.id"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-row align="middle" style="height: 30px">
              <el-col :span="8" style="font-size: 14px">标绘名称：</el-col>
              <el-col :span="16">
                <el-input v-model="drawNameAdd" placeholder="输入标绘名称" />
              </el-col>
            </el-row>
            <el-row align="middle">
              <el-col :span="8" style="font-size: 14px">描述：</el-col>
              <el-col :span="16">
                <el-input
                  v-model="descriptionAdd"
                  :rows="3"
                  type="textarea"
                  placeholder="输入描述信息"
                />
              </el-col>
            </el-row>
            <el-row justify="center" style="padding-top: 2vh">
              <el-button size="small" color="rgb(81, 103, 101)" @click="addDrawLayer()">
                确定
              </el-button>
              <el-button size="small" @click="popVisible = false"> 取消 </el-button>
            </el-row>
          </el-popover>
          <el-button size="small" class="btn-saveAll" @click="saveAll()"
            >全部保存</el-button
          >
        </el-row>
      </div>
      <el-row><span class="subtitle">&nbsp;&nbsp; 属性管理</span></el-row>
      <div class="property-manage box-area"><infoSetting :unitId="unitId" /></div>
    </el-main>
  </el-container>
  <el-container id="style-container" class="map-overlay-right" v-if="currentFeatureName">
    <el-main>
      <el-row justify="center">
        <span id="style-title">{{ currentFeatureName }} </span>
      </el-row>
      <!-- <el-row justify="center" align="middle"
        ><div class="draw-type">{{ geomTypes[currentGeomType] }}</div></el-row
      > -->
      <el-row justify="center" align="middle">
        <el-button class="btn-draw" @click="startDraw()">绘制 / 重新绘制</el-button>
      </el-row>
      <el-row><span class="subtitle">&nbsp;&nbsp; 样式设置</span></el-row>
      <div id="style-setting" class="box-area">
        <styleSetting
          :drawData="drawData"
          :map="map"
          :featureName="currentFeatureName"
          :key="currentFeatureName"
          @styleChangeEvent="changeStyle"
        />
        <!-- 通过key变化强制更新子组件 -->
      </div>
      <el-row><span class="text">描述信息：</span></el-row>
      <el-input
        v-model="currentFeature.description"
        :rows="3"
        type="textarea"
        placeholder="输入描述信息"
        style="margin: 1vh 0"
      />
      <el-row justify="center" align="middle">
        <el-button class="btn-delete" @click="deleteDrawLayer()">删除标绘</el-button>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import {
  defineComponent,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  inject,
} from "vue";
import axios from "axios";
import * as turf from "@turf/helpers";
import bbox from "@turf/bbox";
import styleSetting from "@/components/styleSetting.vue";
import infoSetting from "@/components/infoSetting.vue";
//import { useStore } from "@/stores/index.js";

export default defineComponent({
  name: "mapDraw",
  components: {
    styleSetting,
    infoSetting,
  },
  computed: {},
});
</script>

<script setup>
//const drawTypeCollection = { 0: "点标绘", 1: "线标绘", 2: "面标绘" };

const drawTypeOptions = [
  { id: 0, label: "点标绘", value: 0 },
  { id: 1, label: "线标绘", value: 1 },
  { id: 2, label: "面标绘", value: 2 },
];

const props = defineProps(["unitId", "unitName", "map", "draw"]);
const map = props.map;
const draw = props.draw;

const drawData = ref([]);
const currentFeature = ref(null);
const currentFeatureName = ref("");
const currentGeomType = ref(0);
const geomTypes = { 0: "点标绘", 1: "线标绘", 2: "面标绘" };
//const currentFeature = ref(null);
const drawTypeAdd = ref(0);
const drawNameAdd = ref("");
const descriptionAdd = ref("");

const popVisible = ref(false);

const styleConfig = inject("styleConfig");

axios
  .get(`http://localhost:8181/getFeaturesByUnitId2/${props.unitId}`, {
    responseType: "json",
  })
  .then((res) => {
    drawData.value = res.data.data;
    locate();
    createDrawLayers(); //文保单位对应的要素集合进入编辑状态
    hideVectorLayers(); //对应矢量切片隐藏
  });

watch(currentFeatureName, (newVal, oldVal) => {
  if (oldVal) {
    uneditFeature(oldVal);
  }
  if (newVal) {
    currentFeature.value = drawData.value.find((item) => item.name === newVal);
    currentGeomType.value = currentFeature.value.type;
    editFeature(newVal);
  }
});

onUnmounted(() => {
  saveAll(); // 可检测是否进行过图形操作
  removeDrawLayers();
  showVectorLayers();
});

// TODO: 通过自动计算bound实现定位？
function locate() {
  // if (drawData.value.length == 0) return;
  // var item = drawData.value[0];
  // var geom = JSON.parse(item.geometry);
  // if (item.type == 0) {
  //   var locatePoint = geom;
  // } else if (item.type == 1) {
  //   var line = turf.lineString(geom);
  //   var locatePoint = center(line).geometry.coordinates;
  // } else {
  //   var polygon = turf.polygon(geom);
  //   var locatePoint = center(polygon).geometry.coordinates;
  // }

  let collection = [];
  for (var item of drawData.value) {
    let geom = JSON.parse(item.geometry);
    switch (item.type) {
      case 0: {
        var feature = turf.point(geom);
        break;
      }
      case 1: {
        var feature = turf.lineString(geom);
        break;
      }
      case 2: {
        var feature = turf.polygon(geom);
        break;
      }
      default:
        break;
    }
    collection.push(feature);
  }
  let geojson = turf.featureCollection(collection);
  let bound = bbox(geojson);
  let zoom = map.cameraForBounds([
    [bound[0], bound[1]],
    [bound[2], bound[3]],
  ]).zoom;
  let center = map.cameraForBounds([
    [bound[0], bound[1]],
    [bound[2], bound[3]],
  ]).center;

  map.easeTo({
    zoom: zoom - 1.3,
    center: center,
    pitch: 0,
    bearing: 0,
  });
}

//根据style值生成mapbox paint对象
function generatePaint(styleType, style1, style2, style3) {
  var style = {};
  style[styleConfig[styleType].style1.name] =
    styleConfig[styleType].style1.options[style1].value;
  style[styleConfig[styleType].style2.name] =
    styleConfig[styleType].style2.options[style2].value;
  if (styleType != "polygonStyle") {
    style[styleConfig[styleType].style3.name] =
      styleConfig[styleType].style3.options[style3].value;
  }
  if (styleType == "pointStyle") {
    style["circle-stroke-color"] = "#FEFEFE";
  }
  return style;
}

function removeDrawLayers() {
  for (var item of drawData.value) {
    map.removeLayer(item.name + "-layer");
    map.removeSource(item.name + "-source");
  }
}

function createDrawLayers() {
  for (var item of drawData.value) {
    var sourceName = item.name + "-source";
    var layerName = item.name + "-layer";
    var geom = JSON.parse(item.geometry);
    var style = {};
    //补全空样式值
    var style1 =
      item.style1 == null ? styleConfig.pointStyle.style1.default : item.style1;
    var style2 =
      item.style2 == null ? styleConfig.pointStyle.style2.default : item.style2;
    if (item.type != 2) {
      var style3 =
        item.style3 == null ? styleConfig.pointStyle.style3.default : item.style3;
    }
    switch (item.type) {
      case 0: {
        style = generatePaint("pointStyle", style1, style2, style3);
        var point = {
          type: "Feature",
          properties: {
            name: item.name,
          },
          geometry: {
            type: "Point",
            coordinates: geom,
          },
        };
        map.addSource(sourceName, {
          type: "geojson",
          data: point,
        });
        map.addLayer(
          {
            id: layerName,
            type: "circle",
            source: sourceName,
            paint: style,
          },
          "pointLocation"
        );
        break;
      }
      case 1: {
        style = generatePaint("lineStyle", style1, style2, style3);
        var linestring = {
          type: "Feature",
          properties: {
            name: item.name,
          },
          geometry: {
            type: "LineString",
            coordinates: geom,
          },
        };
        map.addSource(sourceName, {
          type: "geojson",
          data: linestring,
        });
        map.addLayer(
          {
            id: layerName,
            type: "line",
            source: sourceName,
            paint: style,
          },
          "lineLocation"
        );
        break;
      }
      case 2: {
        style = generatePaint("polygonStyle", style1, style2);
        var polygon = {
          type: "Feature",
          properties: {
            name: item.name,
          },
          geometry: {
            type: "Polygon",
            coordinates: geom,
          },
        };
        map.addSource(sourceName, {
          type: "geojson",
          data: polygon,
        });
        map.addLayer(
          {
            id: layerName,
            type: "fill",
            source: sourceName,
            paint: style,
          },
          "fillLocation"
        );
        break;
      }
      default:
        break;
    }
  }
}

function addDrawLayer() {
  if (drawData.value.find((item) => item.name === drawNameAdd.value)) {
    //TODO: 提示重复
  } else if (drawNameAdd.value == "") {
    //TODO: 提示不能为空
  } else {
    const geomTypeKeys = ["pointStyle", "lineStyle", "polygonStyle"];
    var style1 = styleConfig[geomTypeKeys[drawTypeAdd.value]].style1.default;
    var style2 = styleConfig[geomTypeKeys[drawTypeAdd.value]].style2.default;
    if (drawTypeAdd.value != 2) {
      var style3 = styleConfig[geomTypeKeys[drawTypeAdd.value]].style3.default;
    } else {
      var style3 = null;
    }
    drawData.value.push({
      unit_id: props.unitId,
      name: drawNameAdd.value,
      type: drawTypeAdd.value,
      geometry: "[]",
      description: descriptionAdd.value,
      style1: style1,
      style2: style2,
      style3: style3,
    });
    const mapboxLayerType = { 0: "circle", 1: "line", 2: "fill" };
    const locationLayer = { 0: "pointLocation", 1: "lineLocation", 2: "fillLocation" };
    map.addSource(drawNameAdd.value + "-source", {
      type: "geojson",
      // data: null,  //// data设为null会导致图层残留!!!
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map.addLayer(
      {
        id: drawNameAdd.value + "-layer",
        type: mapboxLayerType[drawTypeAdd.value],
        source: drawNameAdd.value + "-source",
        paint: generatePaint(geomTypeKeys[drawTypeAdd.value], style1, style2, style3),
      },
      locationLayer[drawTypeAdd.value]
    );
    currentFeatureName.value = drawNameAdd.value;

    popVisible.value = false;
  }
}

//删除标绘图层
function deleteDrawLayer() {
  ElMessageBox.confirm("确认删除该标绘？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      uneditFeature(currentFeatureName.value);
      map.removeLayer(currentFeatureName.value + "-layer");
      map.removeSource(currentFeatureName.value + "-source");
      drawData.value = drawData.value.filter(
        (item) => item.name !== currentFeatureName.value
      );
      currentFeatureName.value = "";
    })
    .catch(() => {});
}

//隐藏编辑部分瓦片图层
function hideVectorLayers() {
  map.setFilter("point-vector", ["!=", ["get", "unit_id"], props.unitId]);
  map.setFilter("line-vector", ["!=", ["get", "unit_id"], props.unitId]);
  map.setFilter("polygon-vector", ["!=", ["get", "unit_id"], props.unitId]);

  map.setPaintProperty("point-vector", "circle-opacity", 0.2);
  map.setPaintProperty("line-vector", "line-opacity", 0.2);
  map.setPaintProperty("polygon-vector", "fill-opacity", 0.2);
}

//显示全部瓦片图层
function showVectorLayers() {
  map.setFilter("point-vector", null);
  map.setFilter("line-vector", null);
  map.setFilter("polygon-vector", null);
  map.setPaintProperty("point-vector", "circle-opacity", 1);
  map.setPaintProperty("line-vector", "line-opacity", 1);

  var matchStatement = ["match", ["get", "opacity"]];
  var styleObj = styleConfig.polygonStyle.style2;
  styleObj.options.forEach((item, index) => {
    matchStatement.push(index.toString());
    matchStatement.push(item.value);
  });
  // 添加默认值
  matchStatement.push(styleObj.options[styleObj.default].value);

  map.setPaintProperty("polygon-vector", "fill-opacity", matchStatement);
}

function updateVectorLayers() {
  axios.get("http://localhost:8181/mapVersion", { responseType: "json" }).then((res) => {
    var mapVersion = res.data.data;
    map
      .getSource("vector-source")
      .setTiles([
        "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/jswbservice%3Awb_features@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf?version=" +
          mapVersion,
      ]);
  });
}

function editFeature(featureName) {
  const currentFeature = drawData.value.find((item) => item.name === featureName);
  var feature = map.getSource(featureName + "-source")._data;

  if (feature) {
    //const featureId = currentFeature.name + "-draw";
    //feature.id = featureId;
    const featureId = draw.add(feature)[0];
    map.setLayoutProperty(featureName + "-layer", "visibility", "none");
    draw.changeMode("simple_select", { featureIds: [featureId] });
  }
}

function uneditFeature(featureName) {
  //const featureId = featureName + "-draw";
  //map.getSource(featureName + "-source").setData(draw.get(featureId));
  if (draw.getAll().features.length == 0) return;
  //更新绘制信息到drawData
  var drawFeature = draw.getAll().features[0];
  var currentFeature = drawData.value.find((item) => item.name === featureName);
  currentFeature.geometry = JSON.stringify(drawFeature.geometry.coordinates);
  map.getSource(featureName + "-source").setData(drawFeature);
  //draw.delete(featureId);
  draw.deleteAll();
  map.setLayoutProperty(featureName + "-layer", "visibility", "visible");

  draw.changeMode("simple_select");
}

function startDraw() {
  draw.deleteAll();
  const currentFeature = drawData.value.find(
    (item) => item.name === currentFeatureName.value
  );
  const geomType = currentFeature.type;
  const drawModes = { 0: "draw_point", 1: "draw_line_string", 2: "draw_polygon" };
  draw.changeMode(drawModes[geomType]);
}

function saveAll() {
  uneditFeature(currentFeatureName.value);
  currentFeatureName.value = "";
  axios
    .post("http://localhost:8181/updateFeatures2", drawData.value)
    .then((res) => {
      updateVectorLayers();
    })
    .catch((error) => {
      console.error("API Error:", error.response.data);
    });
}

function changeStyle(newData) {
  drawData.value = newData;
}
</script>

<style lang="scss" scoped>
.subtitle {
  margin: 1vh 0;
  font-family: 思源黑体Bold;
  font-size: calc(0.75vw + 0.75vh);
  color: #414141;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 5px;
    height: 2vh;
    background-color: #92c3b8;
    content: "";
    transform: translateY(-50%);
  }
}

.el-main {
  padding: 1vh 1vw;
}

.box-area {
  border-radius: 5px;
  border: 1px solid #cacaca;
}

#layer-container {
  position: absolute;
  top: 0%;
  right: 0;
  height: 100%;
  width: 15vw;

  #title {
    padding: 1.5vh 0;
    font-family: 思源黑体Bold;
    font-size: calc(0.8vw + 0.8vh);
    color: #414141;
  }

  .draw-manage {
    position: relative;
    height: 34vh;

    #draw-layers {
      position: relative;
      height: 75%;
      background: #fff;
      border-radius: 2px;
      border-left: 1px solid #cacaca;
      box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.2);
      margin: 1vh;
      padding: 1vh 0.3vw;

      .collapse {
        --el-collapse-border-color: #bdbdbd;
        border-top: 0;
      }
      :deep(.el-collapse-item__header) {
        position: relative;
        height: 5vh;
      }
      :deep(.el-collapse-item__content) {
        text-align: left;
        padding-bottom: 0;
      }
    }

    .button-group {
      height: 6vh;
      margin: 0.5vh;

      .btn-add {
        width: 4vw;
        height: 3.5vh;
        font-size: calc(0.55vw + 0.55vh);
        font-family: 思源黑体N;
        // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .btn-saveAll {
        width: 4vw;
        height: 3.5vh;
        font-size: calc(0.55vw + 0.55vh);
        background-color: rgb(197, 224, 180);
        // color: rgb(89, 89, 89);
        font-family: 思源黑体N;
        // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .property-manage {
    position: relative;
    height: 32vh;
    padding: 1.5vh 1vw;
  }
}

#style-container {
  position: absolute;
  top: 0%;
  right: 15vw;
  height: 100%;
  width: 13vw;

  #style-title {
    padding: 1.5vh 0;
    font-family: 思源黑体Bold;
    font-size: calc(0.8vw + 0.8vh);
    color: #414141;
  }

  .draw-type {
    text-align: center;
    background-color: #92c3b8;
    color: white;
    font-family: 思源黑体N;
    font-size: calc(0.65vw + 0.65vh);
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    width: 50%;
    margin-top: 1vh;
    margin-bottom: 2vh;
  }

  #style-setting {
    // box-shadow: 2px 2px 7px rgba(0, 0, 0, 0.2);
    padding: 1vh 1vw;
    height: 40%;
  }

  .text {
    font-family: 思源黑体R;
    font-size: calc(0.65vw + 0.65vh);
    margin-top: 3vh;
  }

  .btn-draw {
    font-size: calc(0.6vw + 0.6vh);
    font-family: 思源黑体N;
    margin: 1vh 0;
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .btn-delete {
    margin: 3vh 0;
    padding: 2vh 1vw;
    font-size: calc(0.65vw + 0.65vh);
    background-color: #ee5841;
    font-family: 思源黑体N;
    color: #fff;
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
