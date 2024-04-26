<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <router-view />
  </el-config-provider>
</template>

<script>
import { defineComponent, getCurrentInstance } from "vue";
import { ElConfigProvider } from "element-plus";

export default defineComponent({
  components: {
    ElConfigProvider,
  },
  setup() {
    return {
      zIndex: 3000,
      size: "small",
    };
  },
});
</script>

<script setup>
import { useUserStore } from "@/stores/index.js";
const { proxy } = getCurrentInstance();

const userStore = useUserStore();

// 启动时根据token自动登录
if (window.sessionStorage.getItem("token")) {
  proxy.$axios
    .get(`/user/verification`, {
      responseType: "json",
    })
    .then((res) => {
      const { id, username, role_id } = res.data.data;
      userStore.id = id;
      userStore.username = username;
      userStore.role = role_id;
      userStore.isLoggedIn = true;
    })
    .catch((error) => {});
}
</script>

<style>
@import "assets/style/common.css"; /*注册全局样式*/

.el-dialog__body {
  padding: 0 !important;
}
</style>
