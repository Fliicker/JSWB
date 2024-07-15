<template>
  <el-container class="user">
    <el-header>
      <el-row align="middle" class="header">
        <el-col :span="17" style="display: flex; align-items: center"
          ><img src="@/assets/logo.png" width="22" height="22" />&nbsp;&nbsp;
          <span id="title">江山市文物保护单位信息管理平台</span>
        </el-col>
        <el-col :span="4"
          ><span
            v-if="userStore.isLoggedIn"
            class="header-text"
            style="display: flex; justify-content: flex-end"
            >您好，{{ userStore.username }}</span
          ></el-col
        >
        <el-col :span="1"></el-col>
        <el-col :span="2" style="display: flex; align-items: center"
          >&nbsp;
          <RouterLink to="/"><span class="header-text">返回首页</span></RouterLink>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="main">
      <div class="user-action">
        <el-row align="middle">
          <el-col :span="16" class="subtitle">操作日志</el-col>
          <el-col :span="8" style="display: flex; align-items: center">
            <span class="text">查看范围:&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <el-radio-group v-model="actionFrom" @change="changeTable">
              <el-radio label="me" size="large">自己</el-radio>
              <el-radio label="all" size="large" :disabled="userStore.role == 0"
                >所有人</el-radio
              >
            </el-radio-group>
          </el-col>
        </el-row>
        <el-table
          v-if="tableData != null"
          :data="tableData.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
          empty-text="无操作记录"
          border
          style="width: 100%; height: 82%"
        >
          <el-table-column type="index" width="50" :index="tableIndex" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="person" label="操作人" width="140" />
          <el-table-column prop="action" label="具体操作" />
        </el-table>
        <el-row style="margin: 3vh 0" justify="center">
          <el-pagination
            v-if="tableData != null"
            v-model:current-page="currentPage"
            v-model:page-size="pagesize"
            small="small"
            layout="prev, pager, next, jumper"
            :total="tableData.length"
          />
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { useUserStore } from "@/stores/index.js";
import { useRouter } from "vue-router";
import { ref, computed, getCurrentInstance } from "vue";
import { Document, Menu as IconMenu, Location, Setting } from "@element-plus/icons-vue";
export default {
  name: "user",
};
</script>

<script setup>
const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const actionData = ref(null);
const actionFrom = ref("me");
const tableData = ref(null);
const currentPage = ref(1);
const pagesize = 10;

const tableIndex = (index) => {
  return index + pagesize * (currentPage.value - 1) + 1;
};

const changeTable = (e) => {
  if (e == "me") {
    proxy.$axios
      .get(`/user/actions/${userStore.id}`)
      .then((res) => {
        changeData(res.data.data);
      })
      .catch((error) => {});
  } else {
    proxy.$axios
      .get(`/user/actions`)
      .then((res) => {
        changeData(res.data.data);
      })
      .catch((error) => {});
  }
};

const changeData = (data) => {
  actionData.value = data;
  tableData.value = actionData.value.map((item) => {
    let action = `${item.action}了文物 ${item.name} `;
    if (item.action == "更新") action += `的${item.info_type}`;
    return {
      time: item.time,
      person: item.username,
      role: item.role_id,
      action: action,
    };
  });
};

proxy.$axios
  .get(`/user/actions/${userStore.id}`)
  .then((res) => {
    changeData(res.data.data);
  })
  .catch((error) => {});
</script>

<style lang="scss" scoped>
.user {
  position: absolute;
  background: url(../assets/background.jpg) no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 8vh;
    width: 100%;
    padding: 0 1.5vw;
    // border-radius: 2px;

    #title {
      // padding: 2vh 1vw;
      font-family: 思源黑体Bold;
      font-size: calc(0.9vh + 0.9vw);
      color: #474b4d;
    }

    .header-text {
      font-weight: bold;
      font-size: calc(0.75vh + 0.75vw);
      color: #474b4d;
    }
  }

  .main {
    display: flex;
    justify-content: center;
    // align-items: center;

    .user-action {
      border-radius: 15px;
      background-clip: padding-box;
      margin-top: 0;
      padding: 4vh 2vw;
      width: 80%;
      height: 85%;
      background: white;
      border: 1px solid #eaeaea;
      box-shadow: 0 0 25px #cac6c6;

      .subtitle {
        font-weight: bold;
        font-size: calc(1vh + 1vw);
        margin-bottom: 3vh;
        color: #474b4d;
      }

      .text {
        font-size: 15px;
        color: #474b4d;
      }
    }
  }
}
</style>
