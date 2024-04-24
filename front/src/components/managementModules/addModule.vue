<template>
  <div class="content">
    <el-form
      :model="newdata"
      :rules="rules"
      label-width="6vw"
      class="form"
      ref="formRef"
      status-icon
    >
      <el-scrollbar>
        <el-form-item label="文物名称" prop="name">
          <el-input v-model="newdata.name" />
        </el-form-item>
        <el-form-item label="编号" prop="id">
          <el-input v-model="newdata.survey3_id" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="newdata.type" />
        </el-form-item>
        <el-form-item label="年代" prop="age">
          <el-input v-model="newdata.age" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="newdata.address" />
        </el-form-item>
        <!-- <el-form-item label="负责人姓名" prop="person">
          <el-input v-model="newdata.person" />
        </el-form-item>
        <el-form-item label="联系电话" prop="tel">
          <el-input v-model="newdata.tel" />
        </el-form-item> -->
      </el-scrollbar>
    </el-form>
  </div>
  <el-row class="btn-row" justify="end" align="middle">
    <el-button class="btn-add" @click="addARecord">添加</el-button>
  </el-row>
</template>

<script>
import { defineComponent, onMounted, ref, getCurrentInstance } from "vue";

export default defineComponent({
  name: "addModule",
  components: {},
});
</script>

<script setup>
const { proxy } = getCurrentInstance();

const formRef = ref();

const newdata = ref({
  survey3_id: "",
  name: "",
  type: "",
  age: "",
  address: "",
  // person: "",
  // tel: "",
});

const rules = ref({
  survey3_id: [{ required: true, message: "文物编号不能为空！", trigger: "blur" }],
  name: [{ required: true, message: "文物名称不能为空！", trigger: "blur" }],
});

async function addARecord() {
  if (!formRef) return;
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      proxy.$axios
        .post("/units/info", newdata.value)
        .then((res) => {
          console.log(res.data);
          console.log("submit!");

          ElNotification({
            title: "成功",
            message: "已成功添加一条记录",
            position: "bottom-right",
            type: "success",
          });
        })
        .catch((error) => {
          console.error("API Error:", error.response.data);
          ElNotification({
            title: "失败",
            message: "添加失败",
            position: "bottom-right",
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
.content {
  height: 40vh;
  padding: 1vh 0;

  .form {
    height: 40vh;
  }

  .text {
    font-size: calc(0.65vw + 0.65vh);
  }
}

.btn-row {
  position: relative;
  bottom: 0;
  height: 5vh;

  .btn-add {
    width: 5vw;
    height: 4vh;
    font-size: calc(0.6vw + 0.6vh);
    background-color: #758a99;
    color: white;
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
}
</style>
