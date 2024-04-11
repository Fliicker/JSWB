<template>
  <el-container class="container">
    <el-aside
      class="aside_main map-overlay-left"
      :class="{ aside_main_show: !asideStatus }"
    >
      <el-scrollbar>
        <el-main>
          <el-scrollbar>
            <el-row><span id="title">&nbsp;&nbsp; 文保单位</span></el-row>
            <el-input
              style="height: 5vh; width: 95%"
              v-model="inputContent"
              class="searchinput"
              placeholder="请输入文物信息（如名称、类型、年代）"
            >
              <template #suffix>
                <el-icon @click="clear" style="cursor: pointer"><Close /></el-icon>
              </template>
              <template #append>
                <el-button :icon="Search" @click="search" style="height: 5vh" />
              </template>
            </el-input>
            <el-row style="height: 5vh; margin: 1vh" align="bottom">
              <el-col :span="14" class="text1">搜索结果：</el-col>
              <el-col :span="8"
                ><button class="btn-manage" @click="emit('openManagement')">
                  信息管理
                </button></el-col
              >
              <el-col :span="2"
                ><el-icon class="btn-refresh" size="12" @click="emit('refreshData')"
                  ><Refresh /></el-icon
              ></el-col>
            </el-row>
            <el-divider />
            <div class="info-list">
              <div class="info-cards">
                <!-- <div class="info-card" v-for="(item, index) in dataTest" :name="key"></div> -->
                <el-scrollbar>
                  <div
                    class="info-card"
                    v-for="(item, i) in resultData.slice(
                      (currentPage - 1) * pagesize,
                      currentPage * pagesize
                    )"
                    @click="handleClick(item.id)"
                    :key="item.id"
                  >
                    <el-row align="middle">
                      <el-col :span="22">
                        <el-row class="unit-name" align="middle">
                          {{ item.name }}
                        </el-row>
                        <el-row style="height: 0.5vh"></el-row>
                        <el-row class="unit-info" align="middle">
                          <el-col :span="12">
                            {{ item.type }}
                            <span v-show="!item.type">未知类型</span>
                          </el-col>
                          <el-col :span="12">
                            {{ item.age }}
                            <span v-show="!item.age">未知年代</span>
                          </el-col>
                        </el-row>
                      </el-col>
                      <!-- <el-col :span="3"
                        ><el-icon :size="14" color="#EE8508" @click=""
                          ><LocationFilled
                        /></el-icon>
                      </el-col> -->
                      <el-col :span="2"
                        ><el-icon
                          :size="14"
                          color="#8A8A8A"
                          @click.stop="deleteById(item.id)"
                          ><Minus /></el-icon
                      ></el-col>
                    </el-row>
                  </div>
                </el-scrollbar>
              </div>
              <el-row justify="center">
                <el-pagination
                  small
                  background
                  layout="prev, pager, next"
                  :total="resultData.length"
                  :pagesize="pagesize"
                  :pager-count="4"
                  class="page mt-4"
                  @current-change="handleCurrentChange"
                />
              </el-row>
            </div>
          </el-scrollbar>
        </el-main>
      </el-scrollbar>
    </el-aside>
    <!-- aside侧边栏按钮 -->
    <!-- <div
      class="aside_btn map-overlay-left"
      @click="asidechange"
      :class="{ aside_btn_show: !asideStatus }"
    >
      <i class="el-icon-arrow-left" v-if="aside_open_close"></i>
      <i class="el-icon-arrow-right" v-else></i>
    </div> -->
  </el-container>
</template>

<script>
import {
  defineComponent,
  defineProps,
  defineEmits,
  onMounted,
  ref,
  computed,
  getCurrentInstance,
} from "vue";
import { Search, Close, LocationFilled, Minus, Refresh } from "@element-plus/icons-vue";

export default defineComponent({
  name: "leftBar",
  components: {},
});
</script>

<script setup>
const { proxy } = getCurrentInstance();

const props = defineProps(["listData", "map"]);
const map = props.map;

const emit = defineEmits([
  "openManagement",
  "refreshData",
  "changeCurrentUnit",
  "clearCurrentUnit",
]);

//const listData = ref(props.listData);

const asideStatus = ref(true);
const aside_open_close = ref(true);

const currentPage = ref(1); //初始页
const pagesize = 10;

const currentUnitId = ref("");

function handleCurrentChange(val) {
  currentPage.value = val;
}

const inputContent = ref("");
const searchContent = ref("");

const resultData = computed(function () {
  let data = props.listData;
  const search = searchContent.value;
  //当将input框清空时，使列表自动展示搜索前的完整数据，并返回至首页，防止叠加搜索
  if (inputContent.value == "") {
    searchContent.value = "";
  } else if (search !== "") {
    let t = data.filter((dataNews) => {
      return Object.keys(dataNews).some((key) => {
        return String(dataNews[key]).toLowerCase().indexOf(search) > -1;
      });
    });
    data = t;
  }

  return data.sort(function (a, b) {
    var x = a.id;
    var y = b.id;
    return x < y ? -1 : x > y ? 1 : 0;
  });
});

function clear() {
  inputContent.value = "";
}
function search() {
  searchContent.value = inputContent.value;
}

function deleteById(unitid) {
  ElMessageBox.confirm("确认永久删除该记录？", "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 若删除的文物对应面板打开，则先关闭面板
      if (unitid == currentUnitId.value) {
        emit("clearCurrentUnit", unitid); // 删除在前插入在后，会导致违反外键约束，如何控制先后关系？
        currentUnitId.value = "";
      }

      proxy.$axios
        .delete(`/api/units/info/${unitid}`)
        .then((res) => {
          console.log(res.data);
          emit("refreshData");
          ElNotification({
            title: "成功",
            message: `文物 ${unitid} 成功删除`,
            position: "bottom-right",
            type: "success",
          });
          updateVectorLayers();
        })
        .catch((error) => {
          console.error("API Error:", error.response.data);
          ElNotification({
            title: "失败",
            message: "删除失败",
            position: "bottom-right",
            type: "error",
          });
        });
    })
    .catch(() => {});
}

// 侧边栏收缩与展开
function asidechange() {
  asideStatus.value = !asideStatus.value;
  if (asideStatus.value) {
    setTimeout(() => {
      aside_open_close.value = true;
    }, 500);
  } else {
    setTimeout(() => {
      aside_open_close.value = false;
    }, 500);
  }
}

function handleClick(id) {
  if (id == currentUnitId.value) {
    emit("clearCurrentUnit", id);
    currentUnitId.value = "";
  } else {
    emit("changeCurrentUnit", id);
    currentUnitId.value = id;
  }
}

function updateVectorLayers() {
  proxy.$axios.get("/api/map/version", { responseType: "json" }).then((res) => {
    var mapVersion = res.data.data;
    map
      .getSource("vector-source")
      // .setTiles([
      //   "http://localhost:8080/geoserver/gwc/service/tms/1.0.0/jswbservice%3Awb_features@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf?version=" +
      //     mapVersion,
      // ]);
      .setTiles([
        import.meta.env.VITE_APP_SERVER_URL +
          "/api/map/getMvt/{z}/{x}/{y}?version=" +
          mapVersion,
      ]);
  });
}

onMounted(() => {});
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  // top: 4vh;
  height: 100%;

  // .el-row {
  //   align-items: center;
  // }

  .el-main {
    padding: 1vh 1vw;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  --el-color-primary: rgb(81, 103, 101);

  /* 侧边栏样式 */
  .aside_main {
    position: relative;
    width: 22vw;
    left: 0vw !important;
    transition: left 0.5s;

    #title {
      padding: 2vh 0;
      font-family: 思源黑体Bold;
      font-size: calc(0.8vw + 0.8vh);
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

    .el-divider {
      border-color: #bababa;
      margin: 0 0;
    }

    .text1 {
      font-size: calc(0.6vw + 0.6vh);
      font-family: 思源黑体N;
    }

    .btn-manage {
      font-size: calc(0.6vw + 0.6vh);
      font-family: 思源黑体N;
      background-color: rgb(81, 103, 101);
      border-radius: 5px;
      border: none;
      color: white;
      // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      height: 3vh;
      width: 4.5vw;
      cursor: pointer;

      &:hover {
        background-color: rgb(91, 113, 111);
      }

      &:active {
        position: relative;
        top: 1px;
      }
    }

    .btn-refresh {
      font-family: 思源黑体N;
      background-color: #e9e9e9;
      border-radius: 5px;

      color: #5c5c5c;
      // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      height: 3vh;
      width: 1.5vw;
      cursor: pointer;

      &:active {
        position: relative;
        top: 1px;
      }
    }

    .info-list {
      position: relative;
      margin: 1vh 0;

      .info-cards {
        height: 59vh;
        overflow-y: auto;

        .info-card {
          margin: 2vh 0.1vw;
          padding: 1.7vh 0.7vw;

          height: 5vh;
          background-color: white;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          cursor: pointer;

          .unit-name {
            font-family: 思源黑体M;
            font-size: calc(0.55vw + 0.55vh);
          }

          .unit-info {
            font-family: 思源黑体N;
            font-size: calc(0.5vw + 0.5vh);
            color: #5e5e5e;
          }
        }
      }

      .page {
        margin: 2vh 0;
      }
    }
  }

  .aside_main_show {
    left: -18vw !important;
  }

  /* 侧边栏按钮样式 */
  .aside_btn {
    position: relative;
    left: 0 !important;
    top: 34vh;
    width: 1.5vw;
    height: 10vh;
    line-height: 10vh;
    color: black;
    border-radius: 0 6px 6px 0;
    font-size: calc(0.7vw + 0.7vh);
    cursor: pointer;
    transition: left 0.5s;

    &:hover {
      background-color: #ff8e2b;
      color: #fff;
    }
  }

  .aside_btn_show {
    left: -20vw !important;
  }
}
</style>
