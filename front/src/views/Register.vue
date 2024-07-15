<template>
  <div class="register">
    <div class="title">江山市文物保护单位信息管理平台</div>
    <el-form
      :model="registerUser"
      :rules="rules"
      class="registerForm"
      ref="registerForm"
      size="large"
    >
    <h3 class="registerTitle">用户注册</h3>
      <el-form-item prop="username">
        <el-input v-model="registerUser.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerUser.password"
          placeholder="请输入密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password2">
        <el-input
          v-model="registerUser.password2"
          placeholder="请确认密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" @click="register()">注 册</el-button>
      </el-form-item>
      <div style="display: flex; justify-content: space-between">
        <RouterLink to="/"><p style="color: #474b4d">返回首页</p></RouterLink>
        <RouterLink to="/login"><p style="color: #474b4d">登录</p></RouterLink>
      </div>
    </el-form>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/index.js";
import { useRouter } from "vue-router";
import { ref, getCurrentInstance } from "vue";

export default {
  name: "register",
};
</script>

<script setup>
const { proxy } = getCurrentInstance();

const userStore = useUserStore();
const router = useRouter();
const registerForm = ref();
const registerUser = ref({ username: "", password: "", password2: "" });

var validatePass = (rule, value, callback) => {
  if (value !== registerUser.value.password) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

const rules = ref({
  username: [
    { required: true, message: "用户名不能为空", trigger: "change" },
    { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 6, max: 30, message: "长度在 6 到 30 个字符", trigger: "blur" },
  ],
  password2: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { min: 6, max: 30, message: "长度在 6 到 30 个字符", trigger: "blur" },
    { validator: validatePass, trigger: "blur" },
  ],
});

async function register() {
  await registerForm.value.validate((valid, fields) => {
    if (valid) {
      proxy.$axios
        .post("/api/user/register", registerUser.value)
        .then((res) => {
          ElMessage({
            message: "注册成功!",
            type: "success",
          });
          router.push("/login");
        })
        .catch((error) => {
          console.error("API Error:", error.response.data);
          ElMessage({
            message: "注册失败",
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
.register {
  position: absolute;
  background: url(../assets/background.jpg) no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;

  .title {
    position: absolute;
    top: 10%;
    color: #474b4d;
    font-weight: bolder;
    font-size: calc(1.9vh + 1.9vw);
    letter-spacing: 4px;
  }

  .registerForm {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 4vh 2vw;
    height: 53%;
    background: white;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }

  .registerTitle {
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
