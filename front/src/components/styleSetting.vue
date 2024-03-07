<template>
  <div id="point-settings" v-if="geomType == 0">
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.pointStyle.style1.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style1" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.pointStyle.style1.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.pointStyle.style2.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style2" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.pointStyle.style2.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.pointStyle.style3.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style3" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.pointStyle.style3.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
  <div id="line-settings" v-if="geomType == 1">
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.lineStyle.style1.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style1" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.lineStyle.style1.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.lineStyle.style2.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style2" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.lineStyle.style2.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.lineStyle.style3.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style3" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.lineStyle.style3.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
  <div id="polygon-settings" v-if="geomType == 2">
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.polygonStyle.style1.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style1" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.polygonStyle.style1.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="text">
        {{ styleConfig.polygonStyle.style2.label }}：
      </el-col>
      <el-col :span="12">
        <el-select v-model="style2" class="m-2" size="small">
          <el-option
            v-for="(item, index) in styleConfig.polygonStyle.style2.options"
            :value="index"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  defineComponent,
  defineProps,
  defineEmits,
  watch,
  onMounted,
  ref,
  inject,
} from "vue";
import axios from "axios";
import * as turf from "@turf/helpers";

export default defineComponent({
  name: "styleSetting",
  components: {},
  computed: {},
});
</script>

<script setup>
const props = defineProps(["drawData", "map", "featureName"]);
const map = props.map;
const drawData = props.drawData;
const styleConfig = inject("styleConfig");

const geomTypeKeys = ["pointStyle", "lineStyle", "polygonStyle"];

const emit = defineEmits(["styleChangeEvent"]); // 触发样式修改事件

var currentFeature = drawData.find((item) => item.name === props.featureName);
var geomType = currentFeature.type;

//每种标注类型包含2-3个样式，用style1-3表示
var style1 = ref(currentFeature.style1 == null ? 0 : currentFeature.style1);
var style2 = ref(currentFeature.style2 == null ? 0 : currentFeature.style2);
var style3 = ref(currentFeature.style3 == null ? 0 : currentFeature.style3);

initDrawStyle();

watch(
  () => style1.value,
  (newVal, oldVal) => {
    var styleKey = styleConfig[geomTypeKeys[geomType]].style1.name;
    var styleValue = styleConfig[geomTypeKeys[geomType]].style1.options[newVal].value;
    currentFeature.style1 = newVal;
    emit("styleChangeEvent", drawData);
    map.setPaintProperty(props.featureName + "-layer", styleKey, styleValue);
    changeDrawStyle(geomType, styleKey, styleValue);
  }
);

watch(
  () => style2.value,
  (newVal, oldVal) => {
    var styleKey = styleConfig[geomTypeKeys[geomType]].style2.name;
    var styleValue = styleConfig[geomTypeKeys[geomType]].style2.options[newVal].value;
    currentFeature.style2 = newVal;
    emit("styleChangeEvent", drawData);
    map.setPaintProperty(props.featureName + "-layer", styleKey, styleValue);
    changeDrawStyle(geomType, styleKey, styleValue);
  }
);

watch(
  () => style3.value,
  (newVal, oldVal) => {
    var styleKey = styleConfig[geomTypeKeys[geomType]].style3.name;
    var styleValue = styleConfig[geomTypeKeys[geomType]].style3.options[newVal].value;
    currentFeature.style3 = newVal;
    emit("styleChangeEvent", drawData);
    map.setPaintProperty(props.featureName + "-layer", styleKey, styleValue);
    changeDrawStyle(geomType, styleKey, styleValue);
  }
);

//初始化编辑状态下绘制要素样式
function initDrawStyle() {
  changeDrawStyle(
    geomType,
    styleConfig[geomTypeKeys[geomType]].style1.name,
    styleConfig[geomTypeKeys[geomType]].style1.options[style1.value].value
  );
  changeDrawStyle(
    geomType,
    styleConfig[geomTypeKeys[geomType]].style2.name,
    styleConfig[geomTypeKeys[geomType]].style2.options[style2.value].value
  );
  if (geomType != 2) {
    changeDrawStyle(
      geomType,
      styleConfig[geomTypeKeys[geomType]].style3.name,
      styleConfig[geomTypeKeys[geomType]].style3.options[style3.value].value
    );
  }

  // 修改轮廓样式
  if (geomType == 0) {
    map.setPaintProperty("gl-draw-point-active.hot", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-active.cold", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-inactive.hot", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-inactive.cold", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-static.hot", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-static.cold", "circle-stroke-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-stroke-active.hot", "circle-color", "#FAF200");
    map.setPaintProperty("gl-draw-point-stroke-active.cold", "circle-color", "#FAF200");
  } else {
    //还原默认点样式
    map.setPaintProperty("gl-draw-point-active.hot", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-active.cold", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-inactive.hot", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-inactive.cold", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-static.hot", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-static.cold", "circle-stroke-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-stroke-active.hot", "circle-color", "#FFFFFF");
    map.setPaintProperty("gl-draw-point-stroke-active.cold", "circle-color", "#FFFFFF");

    map.setPaintProperty("gl-draw-point-active.hot", "circle-radius", 5); //hot：移动状态样式
    map.setPaintProperty("gl-draw-point-active.hot", "circle-color", "#fbb03b");
    map.setPaintProperty("gl-draw-point-active.hot", "circle-stroke-width", 2);
    map.setPaintProperty("gl-draw-point-active.cold", "circle-radius", 5); //cold：静止状态样式
    map.setPaintProperty("gl-draw-point-active.cold", "circle-color", "#fbb03b");
    map.setPaintProperty("gl-draw-point-active.cold", "circle-stroke-width", 2);
  }

  // 面模式下保持默认线样式
  if (geomType == 2) {
    changeDrawStyle(1, "line-color", "#fbb03b");
    changeDrawStyle(1, "line-width", 2);
    changeDrawStyle(1, "line-dasharray", [0.2, 2]);
  }
}

function changeDrawStyle(geomType, key, value) {
  switch (geomType) {
    case 0:
      {
        map.setPaintProperty("gl-draw-point-active.hot", key, value);
        map.setPaintProperty("gl-draw-point-active.cold", key, value);
        map.setPaintProperty("gl-draw-point-inactive.hot", key, value);
        map.setPaintProperty("gl-draw-point-inactive.cold", key, value);
        map.setPaintProperty("gl-draw-point-static.hot", key, value);
        map.setPaintProperty("gl-draw-point-static.cold", key, value);
      }
      break;
    case 1:
      {
        map.setPaintProperty("gl-draw-line-active.hot", key, value);
        map.setPaintProperty("gl-draw-line-active.cold", key, value);
        map.setPaintProperty("gl-draw-line-inactive.hot", key, value);
        map.setPaintProperty("gl-draw-line-inactive.cold", key, value);
        map.setPaintProperty("gl-draw-line-static.hot", key, value);
        map.setPaintProperty("gl-draw-line-static.cold", key, value);
      }
      break;
    case 2:
      {
        map.setPaintProperty("gl-draw-polygon-fill-active.hot", key, value);
        map.setPaintProperty("gl-draw-polygon-fill-active.cold", key, value);
        map.setPaintProperty("gl-draw-polygon-fill-inactive.hot", key, value);
        map.setPaintProperty("gl-draw-polygon-fill-inactive.cold", key, value);
        map.setPaintProperty("gl-draw-polygon-fill-static.hot", key, value);
        map.setPaintProperty("gl-draw-polygon-fill-static.cold", key, value);
      }
      break;
    default:
      return;
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  height: 6vh;
  align-items: center;
}

.text {
  font-family: 思源黑体R;
  font-size: calc(0.6vw + 0.6vh);
}
</style>
