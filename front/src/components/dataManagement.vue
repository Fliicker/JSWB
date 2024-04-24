<template>
  <el-container class="container map-overlay">
    <el-main>
      <el-row>
        <el-col :span="23"><span id="title">&nbsp;&nbsp; 信息管理</span></el-col>
        <el-col :span="1"
          ><el-icon
            :size="20"
            style="color: #757575; cursor: pointer"
            @click="emit('closeManagement')"
            ><Close /></el-icon
        ></el-col>
      </el-row>
      <el-tabs v-model="activeModule" class="tabs" style="margin: 1vh">
        <el-tab-pane label="添加记录" name="add"><addModule /></el-tab-pane>
        <el-tab-pane label="导入数据" name="import"><importModule /></el-tab-pane>
        <el-tab-pane label="导出数据" name="export"><exportModule /></el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import importModule from "@/components/managementModules/importModule.vue";
import exportModule from "@/components/managementModules/exportModule.vue";
import addModule from "@/components/managementModules/addModule.vue";

export default defineComponent({
  name: "dataManagement",
  components: {
    importModule,
    exportModule,
    addModule,
  },
});
</script>

<script setup>
import { Close } from "@element-plus/icons-vue";
const emit = defineEmits(["closeManagement"]);

const activeModule = ref("add");
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  left: 30vw;
  width: 40vw;
  height: 70vh;
  top: 6vh;

  #title {
    padding: 2vh 0;
    font-family: 思源黑体Bold;
    // font-size: calc(1vw + 1vh);
    font-size: calc(0.8vw + 0.8vh);
    color: #414141;

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 5px;
      height: 2vh;
      background-color: #92c3b8;
      content: "";
      transform: translateY(-50%);
    }
  }

  .tabs {
    font-size: calc(0.65vw + 0.65vh);
    line-height: 5vh;
    color: #414141;

    :deep(.el-tabs__item) {
      font-size: calc(0.65vw + 0.65vh);
    }

    :deep(.el-tabs__item.is-active) {
      color: #b26400;
    }

    /* 鼠标悬浮时样式 */
    :deep(.el-tabs__item:hover) {
      color: #b26400;
      cursor: pointer;
    }

    :deep(.el-tabs__active-bar) {
      background-color: #b26400;
    }
  }
}
</style>
