<template>
  <content>
    <!--放置操作按钮-->
    <div>
      <el-button type="primary" size="small" @click="finish">办结</el-button>
    </div>
  </content>

</template>

<script>
  import * as URL from "../../../../api"
  import * as utils from '../../../../common/utils'

  export default {
    props: ['getDataFromComponent', 'getFunctionFromProcess'],
    data() {
      return {};
    },
    methods: {
      //通过的具体实现
      finish() {
        //从其他组件获取数据
        var taskId = this.getDataFromComponent('taskId');
        //从其他组件获取方法
        var that = this;

        this.$confirm('确认办结吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          that.$http.post(URL.dotask, {
            taskId: taskId,//业务id
          }).then((rs) => {
            if (rs.data.success) {
              that.$message({
                type: 'success',
                message: '办件已标记为“办结”！'
              });
              history.back();
            } else {
              that.$message.error('办结操作失败！');
            }
          }).catch((error) => {
            utils.consoleLog({message: '打印办结操作失败的错误信息', content: error});
          });
        });
      },
    },
  }
</script>

<style scoped>
</style>
