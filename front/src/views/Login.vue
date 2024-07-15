<template>
  <div class="login">
    <div class="title">江山市文物保护单位信息管理平台</div>
    <el-form
      :model="loginUser"
      :rules="rules"
      ref="loginForm"
      class="loginForm"
      size="large"
    >
      <h3 class="loginTitle">用户登录</h3>
      <el-form-item prop="username">
        <el-input v-model="loginUser.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginUser.password"
          placeholder="请输入密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 100%" type="primary" @click="login()" class="submit_btn"
          >登 录</el-button
        >
      </el-form-item>
      <div style="display: flex; justify-content: space-between">
        <RouterLink to="/"><p style="color: #474b4d">返回首页</p></RouterLink>
        <RouterLink to="/register"><p style="color: #474b4d">注册账号</p></RouterLink>
      </div>
    </el-form>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/index.js";
import { useRouter } from "vue-router";
import { ref, getCurrentInstance } from "vue";

export default {
  name: "login",
};
</script>

<script setup>
const { proxy } = getCurrentInstance();

const userStore = useUserStore();
const router = useRouter();
const loginForm = ref();
const loginUser = ref({ username: "", password: "" });

const rules = ref({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 6, max: 30, message: "长度在 6 到 30 个字符", trigger: "blur" },
  ],
});

async function login() {
  await loginForm.value.validate((valid, fields) => {
    if (valid) {
      proxy.$axios
        .post("/api/user/login", loginUser.value)
        .then((res) => {
          const { id, username, role_id } = res.data.data;
          const token = res.data.token;
          userStore.login(id, username, role_id, token);
          ElMessage({
            message: "登录成功!",
            type: "success",
          });
          router.push("/");
        })
        .catch((error) => {
          console.error("API Error:", error.response.data);
          ElMessage({
            message: "登录失败",
            type: "error",
          });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
}
</script>

<style lang="scss" scoped>
.login {
  position: absolute;
  background: url(../assets/background.jpg) no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  .title {
    position: absolute;
    top: 15%;
    color: #474b4d;
    font-weight: bolder;
    font-size: calc(1.9vh + 1.9vw);
    letter-spacing: 4px;
  }

  .loginForm {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 4vh 2vw;
    height: 45%;
    background: white;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

  .loginTitle {
    margin-bottom: 4vh;
    text-align: center;
    font-weight: bold;
    letter-spacing: 3px;
    color: #474b4d;
    //height: 10vh;
    font-size: calc(1vh + 1vw);
  }
}
</style>
