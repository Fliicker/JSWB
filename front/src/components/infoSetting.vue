<template>
  <div v-if="propertyData != null">
    <el-row align="middle">
      <el-col :span="7" class="text">名称：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.name" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">编号：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.survey3_id" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">类型：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.type" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">年代：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.age" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">地址：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.address" placeholder="暂无" />
      </el-col>
    </el-row>
    <!-- <el-row align="middle">
      <el-col :span="10" class="text">负责人：</el-col>
      <el-col :span="14">
        <el-input v-model="propertyData.person" placeholder="暂无" />
      </el-col>
    </el-row> -->
    <el-row justify="center" align="middle" class="button-group">
      <el-button size="small" class="btn-reset" @click="reset()">重置</el-button>
      <el-button size="small" class="btn-saveAll" @click="save()">保存</el-button>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, defineProps, onMounted, ref, getCurrentInstance } from "vue";

export default defineComponent({
  name: "infoSetting",
  components: {},
  computed: {},
});
</script>

<script setup>
const props = defineProps(["unitId"]);
const unitId = props.unitId;
const propertyData = ref(null);

const { proxy } = getCurrentInstance();

// axios
//   .get(`/getInfoByUnitId/${unitId}`, {
//     responseType: "json",
//   })
//   .then((res) => {
//     propertyData.value = res.data.data;
//     tempData = res.data.data;
//     console.log(propertyData.value);
//   });
reset();

function reset() {
  proxy.$axios
    .get(`/api/units/info/${unitId}`, {
      responseType: "json",
    })
    .then((res) => {
      propertyData.value = res.data.data;
    })
    .catch((error) => {
      console.error("API Error:", error.response.data);
    });
}

function save() {
  proxy.$axios
    .put(`/api/units/info/${unitId}`, propertyData.value)
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.error("API Error:", error.response.data);
    });
}
</script>

<style lang="scss" scoped>
.el-row {
  height: 5vh;
  align-items: center;
}

.text {
  font-family: 思源黑体R;
  font-size: calc(0.6vw + 0.6vh);
}

.button-group {
  position: absolute;
  bottom: 0;
  margin: 1.5vh;

  .btn-reset {
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
</style>
