<!--套餐办结-->
<template>
  <content>
    <!--放置操作按钮-->
    <div>
      <el-button type="primary" size="small"
                 @click="doClerk('showDialog')">办结
      </el-button>
    </div>
    <div>
      <!--办结弹框-->
      <el-dialog title="办结" :visible.sync="clerkDialog" append-to-body>
        <el-form :model="clerkMsgInfo" ref="forbiddenClerkInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写办结的意见！',trigger:'blur'}]">
            <el-input type="textarea" v-model="clerkMsgInfo.reason"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="doClerk('cancel')">取 消</el-button>
          <el-button type="primary" @click="doClerk('confirm')">提 交</el-button>
        </div>
      </el-dialog>
    </div>
  </content>

</template>

<script>
  import * as URL from "../../../../api"
  import * as utils from '../../../../common/utils'

  export default {
    props: ['getDataFromComponent', 'getFunctionFromProcess', 'currentProcess', 'processBaseinfo'],
    data() {
      return {
        //办结意见
        clerkMsgInfo: {
          reason: '同意!',
        },
        //办结弹框
        clerkDialog: false,
      };
    },
    methods: {
      //完成办结
      doClerk(type) {
        switch (type) {
          case 'showDialog':
            this.clerkDialog = true;//显示弹框
            break;
          case 'cancel':
            this.clerkDialog = false;//隐藏弹框
            this.clerkMsgInfo.reason = '同意！';
            break;
          case 'confirm':
            //从其他组件获取数据
            var processFormInfo = this.getDataFromComponent('processFormInfo');
            var matterChildInfo = this.getDataFromComponent('matterChildInfo');
            var paperUploadList = this.getDataFromComponent('newPaperUploadList');
            var taskId = this.getDataFromComponent('taskId');
            //从其他组件获取方法
            var changeProcessPageState = this.getFunctionFromProcess('changeProcessPageState');
            var setStatusInfo = this.getFunctionFromProcess('setStatusInfo');

            var that = this;
            //构建提交的对象
            processFormInfo.name = matterChildInfo.name;
            processFormInfo.suitId = matterChildInfo.id;
            processFormInfo.processId = this.processBaseinfo.id;
            processFormInfo.paperUploadList = paperUploadList;
            processFormInfo.taskId = taskId;
            processFormInfo.message = this.clerkMsgInfo.reason;
            processFormInfo.status = "flowConditionKey:1";
            processFormInfo.isMessage = '';
            processFormInfo.user = [];
            that.$http.post(URL.SUIT_PROCESS_UPDATE, processFormInfo).then((rs) => {
              utils.consoleLog({message: '办结操作的结果信息', content: rs});
              var result = rs.data;
              if (result.success) {
                that.$message({
                  type: 'success',
                  message: '办结成功!'
                });
                //根据流程判断流程流转或者关闭页面
                changeProcessPageState(this.processBaseinfo.id);
                //改变状态信息
                setStatusInfo({
                  applyWay: '窗口登记',
                  state: '已办结',
                  timing: '计时结束'
                });
              } else {
                that.$message.error('办结操作失败！');
              }
            }).catch((error) => {
              that.$message.error('办结操作失败！');
              utils.consoleLog({message: '办结操作失败的错误信息', content: error});
            });
            break;
        }
      }
    },
  }
</script>

<style scoped>
</style>
