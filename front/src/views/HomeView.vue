<template>
  <div class="home">
    <!-- <div class="header map-overlay"> -->
    <el-row align="middle" class="header">
      <el-col :span="15" style="display: flex; align-items: center"
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
      <el-col
        :span="5"
        style="display: flex; justify-content: center; align-items: center"
      >
        <el-icon color="#474b4d"><UserFilled /></el-icon>&nbsp;
        <div v-if="userStore.isLoggedIn">
          <RouterLink to="/user"><span class="header-text">操作日志</span></RouterLink>
          &nbsp;|&nbsp;
          <span class="header-text" @click="logout()" style="cursor: pointer"
            >退出登录</span
          >
        </div>
        <div v-if="!userStore.isLoggedIn">
          <RouterLink to="/login" style="display: flex; justify-content: flex-end"
            ><span class="header-text">登录</span></RouterLink
          >
        </div>
      </el-col>
    </el-row>
    <!-- </div> -->
    <div class="map-container">
      <mapView />
    </div>
  </div>
</template>

<script>
import mapView from "@/components/mapView.vue";
//import background from "@/components/background.vue";
import { UserFilled } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/index.js";

export default {
  name: "HomeView",
  components: {
    //background,
    mapView,
  },
};
</script>

<script setup>
const userStore = useUserStore();

const logout = () => {
  ElMessageBox.confirm("是否退出登录？", "提示", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "info",
  })
    .then(() => {
      userStore.logout();
    })
    .catch((error) => {});
};
</script>

<style lang="scss" scoped>
.home {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  background: url(../assets/background.jpg) no-repeat center center;
  background-size: cover;

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

  .map-container {
    position: absolute;
    top: 8vh;
    height: 88vh;
    width: 96vw;
    // overflow: auto;
    box-shadow: 0px 0px 7px 7px rgba(0, 0, 0, 0.3);
  }
}
</style>
