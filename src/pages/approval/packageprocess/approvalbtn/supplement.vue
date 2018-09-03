<!--套餐补正-->
<template>
  <content>
    <!--放置操作按钮-->
    <span>
      <el-button type="primary" size="small"
                 @click="doSupplementAndCorrect">确认补正</el-button>
    </span>
  </content>
</template>

<script>
  import * as URL from "../../../../api"
  import * as utils from '../../../../common/utils'

  export default {
    props: ['getDataFromComponent', 'getFunctionFromProcess','processBaseinfo'],
    data() {
      return {};
    },
    methods: {
      //完成确认补正
      doSupplementAndCorrect() {
        this.$confirm('确认补正吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          //从其他组件获取数据
          var processFormInfo = this.getDataFromComponent('processFormInfo');
          var matterChildInfo = this.getDataFromComponent('matterChildInfo');
          var paperUploadList = this.getDataFromComponent('newPaperUploadList');
          var matterChildIds = this.getDataFromComponent('matterChildIds');
          var taskId = this.getDataFromComponent('taskId');
          //从其他组件获取方法
          var changeProcessPageState = this.getFunctionFromProcess('changeProcessPageState');
          var setStatusInfo = this.getFunctionFromProcess('setStatusInfo');

          var that = this;
          //构建提交的对象
          processFormInfo.name = matterChildInfo.name;
          processFormInfo.suitId = matterChildInfo.id;
          processFormInfo.processId = this.processBaseinfo.id;
          processFormInfo.matterChildId = matterChildIds;
          processFormInfo.paperUploadList = paperUploadList;
          processFormInfo.taskId = taskId;
          utils.consoleLog({message: '打印确认补正提交的对象信息', content: processFormInfo});
          that.$http.post(URL.SUIT_PROCESS_UPDATE, processFormInfo).then((rs) => {
            utils.consoleLog({message: '打印确认补正提交操作结果信息', content: rs});
            var result = rs.data;
            if (result.success) {
              that.$message({
                type: 'success',
                message: '确认补正成功!'
              });
              //改变状态信息
              setStatusInfo({
                applyWay: '窗口登记',
                state: '待受理',
                timing: '未开始计时'
              });
              //根据流程判断流程流转或者关闭页面
              changeProcessPageState(this.processBaseinfo.id);
            } else {
              that.$message.error('确认补正失败！');
            }
          }).catch((error) => {
            that.$message.error('确认补正失败！');
            utils.consoleLog({message: '确认补正操作失败的错误信息', content: error});
          });
        });
      },
    },
  }
</script>

<style scoped>
  .float-right {
    float: right;
  }
</style>
