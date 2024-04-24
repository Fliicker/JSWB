<template>
  <div class="home">
    <!-- <div class="header map-overlay"> -->
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
        ><el-icon color="#474b4d"><UserFilled /></el-icon>&nbsp;
        <RouterLink to="/login" v-if="!userStore.isLoggedIn"
          ><span class="header-text">登录</span></RouterLink
        >
        <!-- <RouterLink to="/register" v-if="!userStore.isLoggedIn"
          ><span>注册</span></RouterLink
        > -->
        <!-- <span v-if="userStore.isLoggedIn" class="header-text" @click="userStore.logout">退出</span> -->
        <RouterLink to="/user" v-if="userStore.isLoggedIn"
          ><span class="header-text">操作日志</span></RouterLink
        >
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
