<template>
  <div id="map"></div>
  <leftBar
    v-if="data != null"
    :listData="data"
    :map="map"
    @openManagement="manageDlgOn = true"
    @refreshData="refreshData"
    @changeCurrentUnit="changeCurrentUnit"
    @clearCurrentUnit="clearCurrentUnit"
  />
  <!-- <infoBox /> -->
  <mapDraw
    :unitId="currentUnitId"
    :unitName="currentUnitName"
    v-if="currentUnitId != ''"
    :map="map"
    :draw="draw"
    :key="currentUnitId"
  />
  <dataManagement v-if="manageDlgOn" @closeManagement="manageDlgOn = false" />
  <div>
    <el-button class="map-btn" id="btn-fullExtent" @click="fullExtent" size="small"
      ><el-icon class="icon" :size="12"><FullScreen /></el-icon>全图</el-button
    >
  </div>
  <!-- <el-popover placement="right" :width="400" trigger="click">
    <template #reference>
      <el-button class="map-btn" id="btn-basemap" size="small">底图切换</el-button>
    </template>
    <el-table :data="gridData">
      <el-table-column width="150" property="date" label="date" />
      <el-table-column width="100" property="name" label="name" />
      <el-table-column width="300" property="address" label="address" />
    </el-table>
  </el-popover> -->
  <el-radio-group
    v-model="basemap"
    class="basemap-selector"
    size="small"
    fill="rgb(81, 103, 101)"
    @change="changeBasemap"
  >
    <el-radio-button class="radio-btn" label="矢量底图" />
    <el-radio-button class="radio-btn" label="影像底图" />
  </el-radio-group>
</template>

<script>
import mapboxgl from "mapbox-gl";

import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import leftBar from "@/components/leftBar.vue";
// import infoBox from "@/components/infoBox.vue";
import mapDraw from "@/components/mapDraw.vue";
import dataManagement from "@/components/dataManagement.vue";
import { defineComponent, onMounted, ref, computed, provide } from "vue";
import { FullScreen } from "@element-plus/icons-vue";
//import { useStore } from "@/stores/index.js";

export default defineComponent({
  name: "mapView",
  components: {
    leftBar,
    //infoBox,
    mapDraw,
    dataManagement,
  },
});
</script>

<script setup>
//const store = useStore();
var map = null;
var draw = null;

const viewState = {
  latitude: 28.740177,
  longitude: 118.611821,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

// 定义style组织结构，各项style值以options中的索引存储, default表示style值为空时的默认值
const styleConfig = {
  pointStyle: {
    style1: {
      name: "circle-radius",
      label: "大小",
      default: 1,
      options: [
        { value: 5, label: "小" },
        { value: 8, label: "中" },
        { value: 12, label: "大" },
      ],
    },
    style2: {
      name: "circle-color",
      label: "颜色",
      default: 0,
      options: [
        { value: "#636363", label: "灰色" },
        { value: "#F50000", label: "红色" },
        { value: "#0008B6", label: "蓝色" },
        { value: "#108013", label: "绿色" },
      ],
    },
    style3: {
      name: "circle-stroke-width",
      label: "轮廓",
      default: 1,
      options: [
        { value: 0, label: "无" },
        { value: 3, label: "有" },
      ],
    },
  },
  lineStyle: {
    style1: {
      name: "line-width",
      label: "线宽",
      default: 1,
      options: [
        { value: 2, label: "细" },
        { value: 3, label: "中" },
        { value: 5, label: "粗" },
      ],
    },
    style2: {
      name: "line-color",
      label: "颜色",
      default: 0,
      options: [
        { value: "#636363", label: "灰色" },
        { value: "#F50000", label: "红色" },
        { value: "#0008B6", label: "蓝色" },
        { value: "#108013", label: "绿色" },
      ],
    },
    style3: {
      name: "line-dasharray",
      label: "线型",
      default: 0,
      options: [
        { value: [1, 0], label: "实线" },
        { value: [5, 3], label: "虚线" },
      ],
    },
  },
  polygonStyle: {
    style1: {
      name: "fill-color",
      label: "填充颜色",
      default: 0,
      options: [
        { value: "#636363", label: "灰色" },
        { value: "#F50000", label: "红色" },
        { value: "#0008B6", label: "蓝色" },
        { value: "#108013", label: "绿色" },
      ],
    },
    style2: {
      name: "fill-opacity",
      label: "透明度",
      default: 2,
      options: [
        { value: 0.2, label: 0.2 },
        { value: 0.4, label: 0.4 },
        { value: 0.6, label: 0.6 },
        { value: 0.8, label: 0.8 },
        { value: 1, label: 1 },
      ],
    },
  },
};

provide("styleConfig", styleConfig);

const data = ref(null);
const manageDlgOn = ref(false);

const basemap = ref("矢量底图"); //底图

const mapList = [
  { name: "矢量底图", layerId: "tian-vector", anoLayerId: "tian-vector-ano" },
  { name: "影像底图", layerId: "tian-raster", anoLayerId: "tian-raster-ano" },
];

var currentUnitId = ref("");

const currentUnitName = computed(function () {
  return data.value.find((item) => item.id === currentUnitId.value).name;
});

function changeCurrentUnit(id) {
  currentUnitId.value = id;
}

function clearCurrentUnit() {
  currentUnitId.value = "";
}

function refreshData() {
  axios.get("http://localhost:8181/api/units/info", { responseType: "json" }).then((res) => {
    data.value = res.data.data;
  });
}

//切换底图
function changeBasemap(layerName) {
  mapList.forEach((item, index) => {
    const showStatus = item.name === layerName ? "visible" : "none";
    map.setLayoutProperty(item.layerId, "visibility", showStatus);
    map.setLayoutProperty(item.anoLayerId, "visibility", showStatus);
  });
}

function fullExtent() {
  map.easeTo({
    zoom: viewState.zoom,
    center: [viewState.longitude, viewState.latitude],
    pitch: viewState.pitch,
    bearing: viewState.bearing,
    // duration: 2000,
  });
}

// 生成match语句
function generateMatchStatement(styleType, style, fieldName) {
  const matchStatement = ["match", ["get", fieldName]];
  var styleObj = styleConfig[styleType][style];
  styleObj.options.forEach((item, index) => {
    ////
    //// match字段必须用字符串!!!
    ////
    matchStatement.push(index.toString());
    matchStatement.push(item.value);
  });
  // 添加默认值
  matchStatement.push(styleObj.options[styleObj.default].value);
  return matchStatement;
}

onMounted(async () => {
  map = new mapboxgl.Map({
    accessToken:
      "pk.eyJ1IjoiZmxpY2tlcjA1NiIsImEiOiJjbGVwZTdoZ3EwNDZyM3NwN21zeXltYmQ0In0.X2048MURPAfoPoDx0OkGQQ",
    container: "map",
    // style: "mapbox://styles/flicker056/clj55nzbs001e01pi37nzetjw",
    //interactive: false,
    style: {
      version: 8,
      sources: {
        //天地图底图分成底图和注记两部分，需设置两个数据源
        "tian-vector": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=87f6202bcdca16c21efc427b97b7d643",
          ],
          tileSize: 256,
        },
        "tian-vector-ano": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=87f6202bcdca16c21efc427b97b7d643",
          ],
          tileSize: 256,
        },
        //影像底图
        "tian-raster": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=87f6202bcdca16c21efc427b97b7d643",
            // "http://t0.tianditu.gov.cn/img_w/wmts?tk=87f6202bcdca16c21efc427b97b7d643&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
          ],
          tileSize: 256,
        },
        "tian-raster-ano": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=87f6202bcdca16c21efc427b97b7d643",
            // "http://t0.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=87f6202bcdca16c21efc427b97b7d643",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          //根据数据源，添加两个图层
          id: "tian-vector",
          type: "raster",
          source: "tian-vector",
          // minzoom: 0,
          // maxzoom: 18,
        },
        {
          id: "tian-vector-ano",
          type: "raster",
          source: "tian-vector-ano",
          // minzoom: 0,
          // maxzoom: 18,
        },
        {
          id: "tian-raster",
          type: "raster",
          source: "tian-raster",
          layout: {
            visibility: "none",
          },
          // minzoom: 0,
          // maxzoom: 18,
        },
        {
          id: "tian-raster-ano",
          type: "raster",
          source: "tian-raster-ano",
          layout: {
            visibility: "none",
          },
          // minzoom: 0,
          // maxzoom: 18,
        },
      ],
    },
    zoom: viewState.zoom,
    center: [viewState.longitude, viewState.latitude],
    pitch: viewState.pitch,
    bearing: viewState.bearing,
  });

  map.addControl(new mapboxgl.NavigationControl(), "top-left");
  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: "metric",
    }),
    "bottom-left"
  );

  //map.addControl(new mapboxgl.FullscreenControl(), "top-left");

  map.on("load", async function () {
    await axios
      .get("http://localhost:8181/api/units/info", { responseType: "json" })
      .then((res) => {
        data.value = res.data.data;
        createVectorLayers();
        // 创建定位图层，确定图层顺序
        createLocateLayers();

        draw = new MapboxDraw({
          displayControlsDefault: false,
          //boxSelect: true,
          // Select which mapbox-gl-draw control buttons to add to the map.
          controls: {},
          //defaultMode: "draw_line_string",
        });
        map.addControl(draw); //添加标绘图层须在创建定位图层之后，从而保证标绘图层在最上方
      });
  });

  async function createVectorLayers() {
    var mapVersion;
    await axios
      .get("http://localhost:8181/api/map/version", { responseType: "json" })
      .then((res) => {
        mapVersion = res.data.data;
        console.log(mapVersion);
      });

    map.addSource("vector-source", {
      type: "vector",
      scheme: "tms",
      tiles: [
        "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/jswbservice%3Awb_features@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf?version=" +
          mapVersion,
      ],
    });

    map.addLayer({
      id: "polygon-vector",
      type: "fill",
      // source-layer 是 Geoserver 图层的名称即 上面 URL 的 title
      source: "vector-source",
      "source-layer": "polygon",
      paint: {
        "fill-color": generateMatchStatement("polygonStyle", "style1", "color"),
        "fill-opacity": generateMatchStatement("polygonStyle", "style2", "opacity"),
      },
    });

    map.addLayer({
      id: "line-vector",
      type: "line",
      // source-layer 是 Geoserver 图层的名称即 上面 URL 的 title
      source: "vector-source",
      "source-layer": "line",
      paint: {
        "line-color": generateMatchStatement("lineStyle", "style2", "color"),
        "line-width": generateMatchStatement("lineStyle", "style1", "width"),
        "line-dasharray": generateMatchStatement("lineStyle", "style3", "line_type"),
      },
    });

    map.addLayer({
      id: "point-vector",
      type: "circle",
      // source-layer 是 Geoserver 图层的名称即 上面 URL 的 title
      source: "vector-source",
      "source-layer": "point",
      paint: {
        //"line-color": "#888",
        // "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 15, 13],
        "circle-radius": generateMatchStatement("pointStyle", "style1", "radius"),
        "circle-color": generateMatchStatement("pointStyle", "style2", "color"),
        "circle-stroke-width": generateMatchStatement(
          "pointStyle",
          "style3",
          "stroke_width"
        ),
        "circle-stroke-color": "#FEFEFE",
      },
    });
  }

  /////
  ////  创建点、线、面的空图层，实现图层定位，使后续添加的所有图层显示顺序为面——线——点
  /////
  function createLocateLayers() {
    map.addLayer({
      id: "fillLocation",
      type: "fill",
      source: {
        type: "geojson",
        data: null,
      },
      paint: {},
      layout: {
        visibility: "visible",
      },
    });

    map.addLayer({
      id: "lineLocation",
      type: "line",
      source: {
        type: "geojson",
        data: null,
      },
      paint: {},
      layout: {
        visibility: "visible",
      },
    });

    map.addLayer({
      id: "pointLocation",
      type: "circle",
      source: {
        type: "geojson",
        data: null,
      },
      paint: {},
      layout: {
        visibility: "visible",
      },
    });
  }

  // TODO: 编辑模式下无法点击其他文物
  map.on("click", function (event) {
    const states = map.queryRenderedFeatures(event.point, {
      layers: ["point-vector", "line-vector", "polygon-vector"],
    });
    if (states.length) {
      try {
        currentUnitId.value = states[0].properties.unit_id;
      } catch (error) {
        console.error("Error choosing unit", error);
      }
    }
  });

  map.on("mouseenter", "point-vector", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseenter", "line-vector", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseenter", "polygon-vector", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "point-vector", () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseleave", "line-vector", () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseleave", "polygon-vector", () => {
    map.getCanvas().style.cursor = "";
  });
});
</script>

<style lang="scss" scoped>
#map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  :deep(.mapboxgl-ctrl-top-left) {
    left: 19vw;
    top: 0;
  }

  // :deep(.mapboxgl-ctrl-bottom-left) {
  //   left: 21vw;
  //   bottom: 0;
  // }
}

#btn-fullExtent {
  position: absolute;
  left: 19vw;
  top: 110px;
}

#btn-basemap {
  position: absolute;
  left: 19vw;
  top: 140px;
}

.map-btn {
  font-size: calc(0.55vh + 0.55vw);
  width: 4vw;
}

.basemap-selector {
  position: absolute;
  left: 19vw;
  bottom: 2vh;
}
</style>
