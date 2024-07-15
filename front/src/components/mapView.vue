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
    @showBuilding="showBuilding"
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
    fill="#758a99"
    @change="changeBasemap"
  >
    <el-radio-button class="radio-btn" label="矢量底图" />
    <el-radio-button class="radio-btn" label="影像底图" />
  </el-radio-group>
  <div id="legend">
    <!-- TODO:v-if图层加载 -->
    <el-row><span style="font-weight: bold; margin: 1vh">图层</span></el-row>
    <el-row
      :style="{
        opacity: layerState.units.show ? 1 : 0.5,
        margin: '0.5vh',
      }"
      align="middle"
    >
      <el-col :span="6" class="legend-icon"
        ><img src="@/assets/circle.svg" alt="SVG Logo" width="10" height="10"
      /></el-col>
      <el-col :span="14"><span>三普文物</span></el-col>
      <el-col
        :span="4"
        class="legend-icon"
        style="cursor: pointer"
        @click="updateLayerState('units')"
        ><el-icon color="#838383" size="15"><Hide /></el-icon
      ></el-col>
    </el-row>
    <el-row
      :style="{
        opacity: layerState.buildings.show ? 1 : 0.5,
        margin: '0.5vh',
      }"
    >
      <el-col :span="6" class="legend-icon"
        ><img src="/building.png" width="15" height="15"
      /></el-col>
      <el-col :span="14"><span>测绘数据</span></el-col>
      <el-col
        :span="4"
        class="legend-icon"
        style="cursor: pointer"
        @click="updateLayerState('buildings')"
        ><el-icon color="#838383" size="15"><Hide /></el-icon
      ></el-col>
    </el-row>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import leftBar from "@/components/leftBar.vue";
// import infoBox from "@/components/infoBox.vue";
import mapDraw from "@/components/mapDraw.vue";
import dataManagement from "@/components/dataManagement.vue";
import mapPopup from "@/components/mapPopup.vue";
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  provide,
  getCurrentInstance,
  createApp,
} from "vue";
import { FullScreen, Hide } from "@element-plus/icons-vue";
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
const { proxy } = getCurrentInstance();

var map = null;
var draw = null;
var popup = null; //唯一弹框实例

// 图层状态
const layerState = ref({
  units: {
    show: true,
    layers: [
      "point-vector",
      "line-vector",
      "polygon-vector",
      "point-label",
      "line-label",
      "polygon-label",
    ],
  },
  buildings: {
    show: true,
    layers: ["building-line-vector", "building-point", "building-label"],
  },
});

const viewState = {
  latitude: 28.540177,
  longitude: 118.611821,
  zoom: 9,
  pitch: 0,
  bearing: 0,
};

// 定义style组织结构，各项style值以options中的索引存储, default表示style值为空时的默认值
const styleConfig = {
  pointStyle: {
    style1: {
      name: "circle-radius",
      label: "大小",
      default: 0,
      options: [
        { value: 4, label: "小" },
        { value: 8, label: "中" },
        { value: 12, label: "大" },
      ],
    },
    style2: {
      name: "circle-color",
      label: "颜色",
      default: 2,
      options: [
        { value: "#636363", label: "灰色" },
        { value: "#F50000", label: "红色" },
        { value: "#86B7C2", label: "蓝色" },
        { value: "#108013", label: "绿色" },
      ],
    },
    style3: {
      name: "circle-stroke-width",
      label: "轮廓",
      default: 1,
      options: [
        { value: 0, label: "无" },
        { value: 1, label: "有" },
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

// 管理图层状态
function updateLayerState(layerName) {
  layerState.value[layerName].show = !layerState.value[layerName].show;
  for (let key in layerState.value) {
    for (let layer of layerState.value[key].layers) {
      map.setLayoutProperty(
        layer,
        "visibility",
        layerState.value[key].show ? "visible" : "none"
      );
    }
  }
}

function showPopup(id, lnglat) {
  popup = new mapboxgl.Popup({
    className: "popup",
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    focusAfterOpen: false,
    maxWidth: "100%",
    offset: 5,
  });

  const container = document.createElement("div");
  createApp(mapPopup, {
    unitId: id,
  }).mount(container);

  popup.setLngLat(lnglat).setDOMContent(container).addTo(map);
  return popup;
}

function changeCurrentUnit(id) {
  currentUnitId.value = id;

  // proxy.$axios
  //   .get(`/api/units/features/center/${id}`, { responseType: "json" })
  //   .then((res) => {
  //     let center = res.data.data;
  //     addComponentPopup(mapPopup, id, center);
  //   });
}

function clearCurrentUnit() {
  currentUnitId.value = "";
}

function showBuilding(id) {
  proxy.$axios.get(`/api/buildings/${id}`, { responseType: "json" }).then((res) => {
    let { center_x, center_y } = res.data.data;
    map.easeTo({
      zoom: 16,
      center: [center_x, center_y],
      pitch: 0,
      bearing: 0,
    });
  });
}

function refreshData() {
  proxy.$axios.get("/api/units/info", { responseType: "json" }).then((res) => {
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
    //matchStatement.push(index.toString());
    matchStatement.push(index);
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
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf", //不采用默认底图的情况下无法生成标注
      sources: {
        //天地图底图分成底图和注记两部分，需设置两个数据源
        "tian-vector": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=eeebdd438672a3da17f056e0e90ea330",
          ],
          tileSize: 256,
        },
        "tian-vector-ano": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=eeebdd438672a3da17f056e0e90ea330",
          ],
          tileSize: 256,
        },
        //影像底图
        "tian-raster": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=eeebdd438672a3da17f056e0e90ea330",
            // "http://t0.tianditu.gov.cn/img_w/wmts?tk=87f6202bcdca16c21efc427b97b7d643&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles",
          ],
          tileSize: 256,
        },
        "tian-raster-ano": {
          type: "raster",
          tiles: [
            "https://t0.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=eeebdd438672a3da17f056e0e90ea330",
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
    await proxy.$axios.get("/api/units/info", { responseType: "json" }).then((res) => {
      data.value = res.data.data;
      createLocateLayers(); // 创建定位图层，确定图层顺序
      createUnitVectorLayers();
      createBuildingLayers();

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

  async function createUnitVectorLayers() {
    // var mapVersion;
    // await proxy.$axios.get("/api/map/version", { responseType: "json" }).then((res) => {
    //   mapVersion = res.data.data;
    //   console.log(mapVersion);
    // });

    map.addSource("vector-source", {
      type: "vector",
      // scheme: "tms",
      // tiles: [
      //   "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/jswbservice%3Awb_features@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf?version=" +
      //     mapVersion,
      // ],
      scheme: "xyz",
      tiles: [import.meta.env.VITE_APP_SERVER_URL + "/api/map/mvt/units/{z}/{x}/{y}"],
    });

    map.addLayer({
      id: "polygon-vector",
      type: "fill",
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
        // "circle-opacity": ["match", ["get", "confirmed"], 1, 1, 0, 0.1, 0.1],
        // "circle-stroke-opacity": ["match", ["get", "confirmed"], 1, 1, 0, 0.1, 0.1],
      },
    });

    // 添加标注图层
    map.addLayer({
      id: "polygon-label",
      type: "symbol",
      source: "vector-source",
      "source-layer": "polygon",
      layout: {
        "text-field": ["get", "label"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 0, 5, 5, 15, 10, 22, 25],
        "text-offset": [0, 1.5],
        "text-letter-spacing": 0.1,
        "text-max-width": 10,
        "symbol-sort-key": 999,
      },
      paint: {
        "text-color": "#630080",
        "text-halo-color": "#fff",
        "text-opacity": ["step", ["zoom"], 0, 10, 1],
        "text-halo-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          0,
          5,
          0.2,
          9,
          0.1,
          10,
          0.5,
          22,
          1,
        ],
      },
      filter: ["==", ["get", "use_label"], true],
    });

    map.addLayer({
      id: "line-label",
      type: "symbol",
      source: "vector-source",
      "source-layer": "line",
      layout: {
        "text-field": ["get", "label"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 0, 5, 5, 10, 10, 22, 20],
        "text-offset": [0, 1.5],
        "text-letter-spacing": 0.1,
        "text-max-width": 10,
        "symbol-placement": "line-center", //标注位置
        "symbol-sort-key": 999,
      },
      paint: {
        "text-color": "#22227E",
        "text-halo-color": "#fff",
        "text-opacity": ["step", ["zoom"], 0, 10, 1],
        "text-halo-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          0,
          5,
          0.2,
          9,
          0.1,
          10,
          0.5,
          22,
          1,
        ],
      },
      filter: ["==", ["get", "use_label"], true],
    });

    map.addLayer({
      id: "point-label",
      type: "symbol",
      source: "vector-source",
      "source-layer": "point",
      layout: {
        "text-field": ["get", "label"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 0, 5, 4, 10, 7, 22, 16],
        "text-offset": [0, 1.5],
        "text-letter-spacing": 0.1,
        "text-max-width": 10,
        "symbol-sort-key": 999,
      },
      paint: {
        "text-color": "#7CAAB0",
        "text-halo-color": "#fff",
        // "text-opacity": ["step", ["zoom"], 0, 11, ["match", ["get", "confirmed"], 1, 1, 0, 0.5, 0.5]],
        "text-halo-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          0,
          5,
          0.2,
          9,
          0.1,
          10,
          0.5,
          22,
          1,
        ],
      },
      filter: ["==", ["get", "use_label"], true],
    });
  }

  async function createBuildingLayers() {
    map.addSource("building-vector-source", {
      type: "vector",
      scheme: "xyz",
      tiles: [import.meta.env.VITE_APP_SERVER_URL + "/api/map/mvt/buildings/{z}/{x}/{y}"],
    });

    map.addLayer(
      {
        id: "building-line-vector",
        type: "line",
        source: "building-vector-source",
        "source-layer": "building_line",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["step", ["zoom"], 0, 13, 1],
          "line-opacity": ["match", ["get", "highlight"], 0, 0.2, 1, 1, 0.2],
        },
      },
      "buildingLocation"
    );

    proxy.$axios
      .get("/api/buildings/geojson/centers", { responseType: "json" })
      .then((res) => {
        let centers = res.data;
        map.addSource("building-centers", {
          type: "geojson",
          data: centers,
        });

        map.loadImage("/building.png", (error, image) => {
          map.addImage("icon-building", image);
          map.addLayer({
            id: "building-point",
            //type: "circle",
            type: "symbol",
            //icon: "./assets/building.svg",
            source: "building-centers",
            layout: {
              // "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 15, 8],
              // "circle-color": "#B2240E",
              // "circle-stroke-width": 2,
              // "circle-stroke-color": "#FEFEFE",
              "icon-image": "icon-building",
              "icon-padding": 0,
              //'icon-allow-overlap': true,
              "icon-size": 0.8,
            },
            paint: {
              "icon-color": "#E5B374",
            },
          });
        });

        map.addLayer({
          id: "building-label",
          type: "symbol",
          source: "building-centers",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 2, 0, 5, 4, 10, 8, 22, 18],
            "text-offset": [0, 2],
            "text-letter-spacing": 0.1,
            "text-max-width": 15,
            "symbol-sort-key": 999,
          },
          paint: {
            "text-color": "#DB6316",
            "text-halo-color": "#fff",
            "text-opacity": ["step", ["zoom"], 0, 10, 1],
            "text-halo-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              1,
              0,
              5,
              0.2,
              9,
              0.1,
              10,
              0.5,
              22,
              1,
            ],
          },
        });
      });
  }

  /////
  ////  创建点、线、面的空图层，实现图层定位，使后续添加的所有图层显示顺序为面——线——点
  /////
  function createLocateLayers() {
    map.addLayer({
      id: "buildingLocation",
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
        changeCurrentUnit(states[0].properties.unit_id);
        //currentUnitId.value = states[0].properties.unit_id;
      } catch (error) {
        console.error("Error choosing unit", error);
      }
    }
  });

  map.on("mouseenter", "point-vector", (e) => {
    map.getCanvas().style.cursor = "pointer";
    showPopup(e.features[0].properties.unit_id, e.lngLat);
  });
  map.on("mouseenter", "line-vector", (e) => {
    map.getCanvas().style.cursor = "pointer";
    // showPopup(e.features[0].properties.unit_id, e.lngLat)
  });
  map.on("mouseenter", "polygon-vector", (e) => {
    map.getCanvas().style.cursor = "pointer";
    // showPopup(e.features[0].properties.unit_id, e.lngLat)
  });
  map.on("mouseleave", "point-vector", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
  map.on("mouseleave", "line-vector", () => {
    map.getCanvas().style.cursor = "";
    // popup.remove();
  });
  map.on("mouseleave", "polygon-vector", () => {
    map.getCanvas().style.cursor = "";
    // popup.remove();
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
    left: 23vw;
    top: 0;
  }

  // :deep(.mapboxgl-ctrl-bottom-left) {
  //   left: 21vw;
  //   bottom: 0;
  // }
}

#btn-fullExtent {
  position: absolute;
  left: 23vw;
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
  left: 24vw;
  bottom: 2vh;
}

#legend {
  position: absolute;
  left: 24vw;
  bottom: 9vh;
  width: 9vw;
  height: 12vh;
  padding: 1vh 0.5vw;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: calc(0.6vh + 0.6vw);

  .legend-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

:deep(.popup) {
  .mapboxgl-popup-content {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
