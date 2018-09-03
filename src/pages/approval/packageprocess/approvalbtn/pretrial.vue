<!--套餐预审-->
<template>
  <content>
    <!--放置操作按钮-->
    <span>
       <el-button type="primary" size="small"
                  @click="supplementAndCorrect">补正</el-button>
      <el-button type="primary" size="small"
                 @click="doClerk('showDialog')">同意</el-button>
    </span>

    <div>
      <!--受理弹框-->
      <el-dialog title="预审通过" :visible.sync="clerkDialog">
        <el-form :model="clerkMsgInfo" ref="forbiddenClerkInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写预审的意见！',trigger:'blur'}]">
            <el-input type="textarea" v-model="clerkMsgInfo.reason"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button-group class="float-right">
              <el-button @click="doClerk('cancel')">取 消</el-button>
              <el-button type="primary" @click="doClerk('confirm')">提 交</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>

  </content>
</template>

<script>
  import * as URL from "../../../../api"
  import * as utils from '../../../../common/utils'

  export default {
    props: ['getDataFromComponent', 'getFunctionFromProcess', 'processId', 'processBaseinfo'],
    data() {
      return {
        //预审意见
        clerkMsgInfo: {
          reason: '同意!',
        },
        //预审弹框
        clerkDialog: false,
      };
    },
    methods: {
      //完成补正
      supplementAndCorrect() {
        //从其他组件获取数据
        var taskId = this.getDataFromComponent('taskId');
        var that = this;

        this.$confirm('确认需要补正吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var obj = {
            taskId: taskId, //业务id
            status: 'flowConditionKey:3'//分支状态
          }
          that.$http.post(URL.SUIT_PROCESS_DO_TASK, obj).then((rs) => {
            if (rs.data.success) {
              that.$message({
                type: 'success',
                message: '办件已标记为“待补办”！'
              });
              history.back();
            } else {
              that.$message.error('补正操作失败！');
            }
          }).catch((error) => {
            utils.consoleLog({message: '打印补正操作失败的错误信息', content: error});
          });
        })
      },
      //完成同意
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
            var matterChildIds = this.getDataFromComponent('matterChildIds');
            var taskId = this.getDataFromComponent('taskId');
            //从其他组件获取方法
            var changeProcessPageState = this.getFunctionFromProcess('changeProcessPageState');
            var setStatusInfo = this.getFunctionFromProcess('setStatusInfo');

            var that = this;
            //构建提交的对象
            processFormInfo.name = matterChildInfo.name;
            processFormInfo.matterChildId = matterChildIds;
            processFormInfo.suitId = matterChildInfo.id;
            processFormInfo.processId = this.processBaseinfo.id;
            processFormInfo.paperUploadList = paperUploadList;
            processFormInfo.taskId = taskId;
            processFormInfo.message = this.clerkMsgInfo.reason;
            processFormInfo.status = "flowConditionKey:1";
            processFormInfo.isMessage = '';
            processFormInfo.user = [];
            that.$http.post(URL.SUIT_PROCESS_UPDATE, processFormInfo).then((rs) => {
              utils.consoleLog({message: '预审操作的结果信息', content: rs});
              var result = rs.data;
              if (result.success) {
                that.$message({
                  type: 'success',
                  message: '预审成功!'
                });
                //根据流程判断流程流转或者关闭页面
                changeProcessPageState(this.processBaseinfo.id);
                //改变状态信息
                setStatusInfo({
                  applyWay: '窗口登记',
                  state: '已预审',
                  timing: '计时中'
                });
              } else {
                that.$message.error('预审操作失败！');
              }
            }).catch((error) => {
              that.$message.error('预审操作失败！');
              utils.consoleLog({message: '预审操作失败的错误信息', content: error});
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
