<template>
  <div class="home">
    <div class="header map-overlay">
      <el-row id="title">江山市文物保护单位信息管理平台</el-row>
    </div>
    <div class="map-container">
      <mapView />
    </div>
  </div>
</template>

<script>
import mapView from "@/components/mapView.vue";
import background from "@/components/background.vue";

export default {
  name: "HomeView",
  components: {
    background,
    mapView,
  },
};
</script>

<script setup></script>

<style lang="scss" scoped>
.home {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 8vh;
    width: 100%;
    // border-radius: 2px;

    #title {
      margin: 2vh 1vw;
      font-family: 思源黑体Bold;
      font-size: calc(0.9vh + 0.9vw);
      color: #474b4d;
    }
  }

  .map-container {
    position: absolute;
    top: 8vh;
    height: 92vh;
    width: 100vw;
    // overflow: auto;
    /* box-shadow: 0px 0px 10px 10px rgba(0, 0, 0, 0.3); */
  }
}
</style>
