<template>
  <div v-if="propertyData != null">
    <el-row align="middle">
      <el-col :span="7" class="text">名称：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.name" :disabled="locked" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">编号：</el-col>
      <el-col :span="17">
        <el-input
          v-model="propertyData.survey3_id"
          :disabled="locked"
          placeholder="暂无"
        />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">类型：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.type" placeholder="暂无" :disabled="locked" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">年代：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.age" :disabled="locked" placeholder="暂无" />
      </el-col>
    </el-row>
    <el-row align="middle">
      <el-col :span="7" class="text">地址：</el-col>
      <el-col :span="17">
        <el-input v-model="propertyData.address" :disabled="locked" placeholder="暂无" />
      </el-col>
    </el-row>
    <!-- <el-row align="middle">
      <el-col :span="10" class="text">负责人：</el-col>
      <el-col :span="14">
        <el-input v-model="propertyData.person" placeholder="暂无" />
      </el-col>
    </el-row> -->
    <el-row justify="center" align="middle" class="button-group">
      <div v-if="!locked">
        <el-button size="small" class="btn-reset" @click="reset()">重置</el-button>
        <el-button size="small" class="btn-saveAll" @click="save()">保存</el-button>
      </div>
      <div v-if="locked">
        <el-button size="small" @click="unlock()">进入编辑</el-button>
      </div>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, defineProps, onMounted, ref, getCurrentInstance } from "vue";
import { useUserStore } from "@/stores/index.js";

export default defineComponent({
  name: "infoSetting",
  components: {},
  computed: {},
});
</script>

<script setup>
const userStore = useUserStore();
const props = defineProps(["unitId"]);
const unitId = props.unitId;
const propertyData = ref(null);
const locked = ref(true);

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
    .put(`/units/info/${unitId}`, propertyData.value)
    .then((res) => {})
    .catch((error) => {
      console.error("API Error:", error.response.data);
    });
}

function unlock() {
  if (userStore.isLoggedIn) {
    locked.value = false;
  } else {
    ElMessageBox.alert("您暂无编辑权限，请在登录后操作。", "提示", {
      confirmButtonText: "确定",
    });
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  height: 5vh;
  align-items: center;
}

.el-col {
  display: flex;
  align-items: center;
}

.el-input {
  height: 4vh;
  font-size: calc(0.6vw + 0.6vh);
}

.text {
  font-size: calc(0.6vw + 0.6vh);
}

.button-group {
  // position: absolute;
  height: 6vh;
  bottom: 0;
  margin: 1.5vh;

  .btn-reset {
    width: 4vw;
    height: 3.5vh;
    font-size: calc(0.55vw + 0.55vh);
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .btn-saveAll {
    width: 4vw;
    height: 3.5vh;
    font-size: calc(0.55vw + 0.55vh);
    background-color: #758a99;
    color: #fff;
    // color: rgb(89, 89, 89);
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
