<!--套餐受理-->
<template>
  <content>
    <!--放置操作按钮-->
    <span>
      <el-button type="primary" size="small"
                 @click="forbiddenClerk('showDialog')">不予受理</el-button>
      <el-button type="primary" size="small"
                 @click="doClerk('showDialog')">受理</el-button>
    </span>

    <div>
      <!--不予受理弹框-->
      <el-dialog title="不予受理" :visible.sync="forbiddenClerkDialog" append-to-body>
        <el-form :model="forbiddenClerkInfo" ref="forbiddenClerkInfoForm">
          <el-form-item label="原因" prop="reason" :rules="[{required:true,message:'请填写不予受理的原因！',trigger:'blur'}]">
            <el-input type="textarea" v-model="forbiddenClerkInfo.reason"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="forbiddenClerk('cancel')">取 消</el-button>
          <el-button type="primary" @click="forbiddenClerk('confirm')">反 馈</el-button>
        </div>
      </el-dialog>
      <!--受理弹框-->
      <el-dialog title="受理" :visible.sync="clerkDialog" append-to-body>
        <el-form :model="clerkMsgInfo" ref="forbiddenClerkInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写受理的意见！',trigger:'blur'}]">
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
    props: ['getDataFromComponent', 'getFunctionFromProcess', 'currentProcess','processBaseinfo'],
    data() {
      return {
        //不受理对象
        forbiddenClerkInfo: {
          reason: null,
        },
        //不予受理弹框
        forbiddenClerkDialog: false,
        //受理意见
        clerkMsgInfo: {
          reason: '同意!',
        },
        //受理弹框
        clerkDialog: false,
      };
    },
    methods: {
      //不予受理
      forbiddenClerk(type) {
        //从其他组件获取数据
        var taskId = this.getDataFromComponent('taskId');
        //从其他组件获取方法
        var that = this;
        switch (type) {
          case 'showDialog':
            this.forbiddenClerkDialog = true;//显示弹框
            break;
          case 'cancel':
            this.forbiddenClerkDialog = false;//隐藏弹框
            break;
          case 'confirm':
            var tempValid = null;
            //验证数据合法性
            this.$refs['forbiddenClerkInfoForm'].validate((valid) => {
              tempValid = valid;
            });

            if (!tempValid) {
              return;
            }

            this.$confirm('确认需要提交吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info'
            }).then(() => {
              var obj = {
                taskId: taskId,
                message: that.forbiddenClerkInfo.reason, //办理意见
                status: 'flowConditionKey:2'//分支状态
              }
              that.$http.post(URL.SUIT_PROCESS_DO_TASK, obj).then((rs) => {
                if (rs.data.success) {
                  that.$message({
                    type: 'success',
                    message: '办件已标记为“不予受理”！'
                  });
                  history.back();
                } else {
                  that.$message.error('不予受理操作失败！');
                }
              }).catch((error) => {
                utils.consoleLog({message: '不予受理操作失败的错误信息', content: error});
              });
            })
            this.forbiddenClerkDialog = false;//隐藏弹框
            break;
        }
      },
      //完成受理
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
              utils.consoleLog({message: '受理操作的结果信息', content: rs});
              var result = rs.data;
              if (result.success) {
                that.$message({
                  type: 'success',
                  message: '受理成功!'
                });
                //根据流程判断流程流转或者关闭页面
                changeProcessPageState(this.processBaseinfo.id);
                //改变状态信息
                setStatusInfo({
                  applyWay: '窗口登记',
                  state: '已受理',
                  timing: '计时中'
                });
              } else {
                that.$message.error('受理操作失败！');
              }
            }).catch((error) => {
              that.$message.error('受理操作失败！');
              utils.consoleLog({message: '受理操作失败的错误信息', content: error});
            });
            break;
        }
      }
    }
  }
</script>

<style scoped>
  .float-right {
    float: right;
  }
</style>
