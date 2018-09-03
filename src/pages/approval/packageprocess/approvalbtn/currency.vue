<!--通用按钮-->
<template>
  <content>
    <!--放置操作按钮-->
    <div>
      <el-button type="primary" size="small"
                 @click="doPass('showDialog')">通过
      </el-button>
    </div>

    <div>
      <!--通过弹框-->
      <el-dialog title="确认通过" :visible.sync="passDialog" append-to-body>
        <el-form :model="passInfo" ref="passInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写不通过的原因！',trigger:'blur'}]">
            <el-input type="textarea" v-model="passInfo.reason"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="doPass('cancel')">取 消</el-button>
          <el-button type="primary" @click="doPass('confirm')">确 认</el-button>
        </div>
      </el-dialog>
    </div>
  </content>
</template>

<script>
  import * as URL from "../../../../api"
  import * as utils from '../../../../common/utils'

  export default {
    props: ['getDataFromComponent', 'getFunctionFromProcess','processBaseinfo'],
    data() {
      return {
        //通过对象
        passInfo: {
          reason: '同意！',
        },
        //通过弹框
        passDialog: false,
      }
    },
    methods: {
      //完成通过
      doPass(type) {
        switch (type) {
          case 'showDialog':
            this.passDialog = true;//显示弹框
            break;
          case 'cancel':
            this.passDialog = false;//隐藏弹框
            this.passInfo.reason = '同意！';
            break;
          case 'confirm':
            //从其他组件获取数据
            var taskId = this.getDataFromComponent('taskId');
            //从其他组件获取方法
            var changeProcessPageState = this.getFunctionFromProcess('changeProcessPageState');
            var setStatusInfo = this.getFunctionFromProcess('setStatusInfo');
            var that = this;

            this.$confirm('确认通过吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info'
            }).then(() => {
              that.$http.post(URL.SUIT_PROCESS_DO_TASK, {
                taskId: taskId,//业务id
                message: this.passInfo.reason,//办理意见
                user: [],//下一步处理人
                isMessage: '',//是否发送短信
              }).then((rs) => {
                if (rs.data.success) {
                  that.$message({
                    type: 'success',
                    message: '办件已标记为“通过”！'
                  });
                  //根据流程判断流程流转或者关闭页面
                  changeProcessPageState(this.processBaseinfo.id);
                  //改变状态信息
                  setStatusInfo({
                    applyWay: '窗口登记',
                    state: '已完结',
                    timing: '计时结束'
                  });
                } else {
                  that.$message.error('通过操作失败！');
                }
              }).catch((error) => {
                that.$message.error('通过操作失败！');
                utils.consoleLog({message: '打印通过的错误信息', content: error});
              });
            });
            break;
        }
      }
    }
  }
</script>

<style scoped>
</style>
