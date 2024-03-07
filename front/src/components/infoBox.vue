<template>
  <el-container class="info-box map-overlay">
  </el-container>
  <el-container class="img-box map-overlay">
  </el-container>
</template>

<script>
export default {
  name: "infoBox",
};
</script>

<style scoped>
.info-box {
  position: absolute;
  top: 10vh;
  width: 21vw;
  right: 2vw;
  height: 39vh;
}

.img-box {
  position: absolute;
  top: 52vh;
  width: 21vw;
  right: 2vw;
  height: 27vh;
}
</style>
