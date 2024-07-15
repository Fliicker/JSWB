<template>
  <div class="box-area">
      <el-row><span class="subtitle">&nbsp;&nbsp; 文物信息</span></el-row>
      <el-row class="row">
        <el-col :span="5"><span class="key">名称：</span></el-col>
        <el-col :span="19"
          ><span>{{ info.name }}</span></el-col
        >
      </el-row>
      <el-row class="row">
        <el-col :span="5"><span class="key">编号：</span></el-col>
        <el-col :span="19"
          ><span>{{ info.survey3_id }}</span></el-col
        >
      </el-row>
      <el-row class="row">
        <el-col :span="5"><span class="key">类型：</span></el-col>
        <el-col :span="19"><span></span>{{ info.type }}</el-col>
      </el-row>
      <el-row class="row">
        <el-col :span="5"><span class="key">年代：</span></el-col>
        <el-col :span="19"
          ><span>{{ info.age }}</span></el-col
        >
      </el-row>
      <el-row class="row">
        <el-col :span="5"><span class="key">地址：</span></el-col>
        <el-col :span="19"
          ><span>{{ info.address }}</span></el-col
        >
      </el-row>
  </div>
</template>

<script>
import { ref, defineComponent, defineProps, getCurrentInstance } from "vue";
import axios from "axios";

defineComponent({
  name: "mapPopup",
  component: {},
});
</script>

<script setup>
const { proxy } = getCurrentInstance();
const props = defineProps(["unitId"]);
const info = ref({
  name: "暂无",
  survey3_id: "暂无",
  type: "暂无",
  age: "暂无",
  address: "暂无",
});

const baseURL = import.meta.env.VITE_APP_SERVER_URL;
axios
  .get(`${baseURL}/api/units/info/${props.unitId}`, { responseType: "json" })
  .then((res) => {
    let obj = res.data.data;
    for (let key in obj) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
        obj[key] = "暂无";
      }
    }
    info.value = obj;
  });
</script>

<style lang="scss" scoped>
.box-area {
  border-radius: 5px;
  // border: 1px solid #cacaca;
  padding: 0.5vh 0.5vw;
  width: 15vw;
  height: 33vh;

  .subtitle {
    margin: 2vh 0;
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

  .row {
    height: 4vh;
    font-size: calc(0.6vh + 0.6vw);

    .key {
      font-weight: bold;
    }
  }
}
</style>
