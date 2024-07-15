<template>
  <div class="content">
    <el-scrollbar>
      <el-row class="bold-text">导入文保单位信息：</el-row>
      <el-row>
        <el-col :span="6">请选择导入格式：</el-col>
        <el-col :span="18">
          <el-radio-group v-model="typeRadio">
            <el-radio label="type1">Excel</el-radio>
            <el-radio label="type2">文本数据格式（.txt/.csv）</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row>
        <el-upload
          ref="upload"
          :action="uploadURL"
          :headers="headers" 
          :limit="1"
          :on-exceed="handleExceed"
          :show-file-list="false"
          :on-success="httpRequest"
          :accept="typeRadio === 'type1' ? '.xlsx,.xls' : '.txt,.csv'"
        >
          <el-button class="btn-upload"> 上传文件 </el-button>
        </el-upload>
      </el-row>
      <div class="box-area" v-if="uploadData">
        <el-row class="bold-text">字段匹配：</el-row>
        <el-row align="middle">
          <el-col :span="5">文物名称字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.name"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
          <el-col :span="2" />
          <el-col :span="5">文物编号字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.survey3_id"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row align="middle">
          <el-col :span="5">类型字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.type"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
          <el-col :span="2" />
          <el-col :span="5">年代字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.age"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row align="middle">
          <el-col :span="5">地址字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.address"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
          <!-- <el-col :span="2" />
          <el-col :span="5">负责人姓名字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.person"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col> -->
        </el-row>
        <!-- <el-row align="middle">
          <el-col :span="5">联系电话字段</el-col>
          <el-col :span="5">
            <el-select
              v-model="fieldMatch.tel"
              class="m-2"
              size="small"
              placeholder="选择字段"
            >
              <el-option v-for="field in uploadFields" :value="field"> </el-option>
            </el-select>
          </el-col>
          <el-col :span="2" />
        </el-row> -->
        <el-row style="height: 1vh"></el-row>
        <el-row>
          <el-col :span="5" class="bold-text">导入选项：</el-col>
          <el-col :span="19">
            <el-radio-group v-model="importOptionRadio">
              <el-radio label="opt1">追加到原数据</el-radio>
              <el-radio label="opt2">覆盖原数据</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
      </div>
    </el-scrollbar>
  </div>
  <el-row class="btn-row" justify="end" align="middle">
    <el-button class="btn-add" @click="importData" :disabled="!uploadData"
      >导入</el-button
    >
  </el-row>
</template>

<script>
import { defineComponent, onMounted, ref, getCurrentInstance } from "vue";
import Papa from "papaparse";
import Xlsx from "xlsx";
import { genFileId } from "element-plus";

export default defineComponent({
  name: "importModule",
  components: {},
});
</script>

<script setup>
const { proxy } = getCurrentInstance();

const uploadURL = import.meta.env.VITE_APP_SERVER_URL + "/units/info/upload/excel";
const headers = {
  Authorization: window.sessionStorage.getItem('token'),
};

const typeRadio = ref("type1"); //上传格式
const importOptionRadio = ref("opt1"); //导入方式

const fileName = ref("");

const upload = ref();

const uploadData = ref(null); // 上传数据
var uploadFields = null; // 上传数据字段

// 字段匹配
const fieldMatch = ref({
  survey3_id: "",
  name: "",
  type: "",
  age: "",
  address: "",
  // person: "",
  // tel: "",
});

var reconstructedData = null; //字段匹配后的最终数据

const handleExceed = (files) => {
  upload.value.clearFiles(); // Assuming `upload` is defined elsewhere
  const file = files[0];
  file.uid = genFileId();
  upload.value.handleStart(file);
  submitUpload();
};

const submitUpload = () => {
  upload.value.submit();
};

function httpRequest(data) {
  const { file } = data;
  console.log(data);
  if (typeRadio.value == "type1") {
    //定义reader，存放文件读取方法
    let reader = new FileReader();
    //启动函数
    reader.readAsBinaryString(file);
    //onload在文件被读取时自动触发
    reader.onload = (e) => {
      try {
        //workbook存放excel的所有基本信息
        const workbook = Xlsx.read(e.target.result, {
          type: "binary",
          cellDates: true,
        });
        //定义sheetList中存放excel表格的sheet表，就是最下方的tab
        let sheet = workbook.SheetNames[0]; // 工作表名称(选第一个sheet)
        let worksheet = workbook.Sheets[sheet]; // 只能通过工作表名称来获取指定工作表
        let results = Xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0 }); // Xlsx解析工作表信息 header: 1 含表头  range: 0 从第一行开始读取不设置从有实际内容开始读取
        // 由行数组重构为对象数组
        const arr = [];

        results.forEach((row, index) => {
          const userInfo = {};
          if (index > 0) {
            results[0].forEach((field, i) => {
              userInfo[field] = row[i] || "";
            });
            arr.push(userInfo);
          }
        });
        uploadData.value = arr;
        if (uploadData.value.length > 0) {
          uploadFields = Object.keys(uploadData.value[0]);
        }

        ElNotification({
          title: "成功",
          message: `文件 ${file.name} 上传成功！`,
          position: "bottom-right",
          type: "success",
        });
      } catch (error) {
        ElNotification({
          title: "失败",
          message: `文件${file.name}上传失败`,
          position: "bottom-right",
          type: "error",
        });
      }
    };
  } else if (typeRadio.value == "type2") {
    Papa.parse(file, {
      header: true,
      encoding: "gb2312", //防止中文乱码
      complete: (res) => {
        let results = res.data;
        //去除最后的空行
        results.pop();
        uploadData.value = results;
        if (uploadData.value.length > 0) {
          uploadFields = Object.keys(uploadData.value[0]);
        }
        ElNotification({
          title: "成功",
          message: `文件 ${file.name} 上传成功！`,
          position: "bottom-right",
          type: "success",
        });
      },
      error: (error) => {
        ElNotification({
          title: "失败",
          message: `文件 ${file.name} 上传失败`,
          position: "bottom-right",
          type: "error",
        });
      },
    });
  }
}

function importData() {
  // 重构后的对象数组
  reconstructedData = uploadData.value.map((item) => {
    const newItem = {};
    for (const key in fieldMatch.value) {
      if (Object.prototype.hasOwnProperty.call(fieldMatch.value, key)) {
        // newItem[key] = item[fieldMatch.value[key]];
        newItem[key] = item[fieldMatch.value[key]] || ""; // 如果匹配关系对象中没有匹配，则将值设置为空字符串
      }
    }
    return newItem;
  });

  proxy.$axios
    .post("/units/info/batch", reconstructedData)
    .then((res) => {
      ElNotification({
        title: "成功",
        message: "数据导入成功！",
        position: "bottom-right",
        type: "success",
      });
    })
    .catch((error) => {
      console.error("API Error:", error.response.data);
      ElNotification({
        title: "失败",
        message: "数据导入失败",
        position: "bottom-right",
        type: "error",
      });
    });
}
</script>

<style lang="scss" scoped>
.content {
  height: 40vh;
  padding: 1vh 0;

  .bold-text {
    font-family: 思源黑体Bold;
  }

  /* 选中后圆圈的背景颜色 */
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: #414141 !important;
    border-color: #414141 !important;
  }

  // /* 选中后的字体颜色 */
  // :deep(.el-radio__input.is-checked + .el-radio__label) {
  //   color: #494949 !important;
  // }

  /* 选中后的字体颜色 */
  :deep(.el-radio__input + .el-radio__label) {
    color: #414141 !important;
  }

  .btn-upload {
    margin: 1.5vh 0;
    width: 5vw;
    height: 4vh;
    font-size: calc(0.6vw + 0.6vh);
    // background-color: rgb(197, 224, 180);
    // color: rgb(89, 89, 89);
    // box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .box-area {
    margin: 1vh 0;
    padding: 0.5vh 0.5vw;
    border-radius: 5px;
    border: 1px solid #cacaca;
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
