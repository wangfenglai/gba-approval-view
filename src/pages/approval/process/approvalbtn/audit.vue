<template>
  <content>
    <!--放置操作按钮-->
    <div>
      <el-button v-if="['AUDIT'].indexOf(currentProcessState)!=-1" type="primary" size="small"
                 @click="doPass('showDialog')">通过
      </el-button>
      <el-button v-if="['AUDIT'].indexOf(currentProcessState)!=-1" type="primary" size="small"
                 @click="notPass('showDialog')">不通过
      </el-button>
      <el-button v-if="['AUDIT'].indexOf(currentProcessState)!=-1" type="primary" size="small"
                 @click="doSuspendAndRecover('suspend')">暂停
      </el-button>
      <el-button v-if="['SUSPEND'].indexOf(currentProcessState)!=-1" type="primary" size="small"
                 @click="doSuspendAndRecover('recover')">恢复
      </el-button>
    </div>

    <div>
      <!--不予通过弹框-->
      <el-dialog title="不通过" :visible.sync="notPassDialog">
        <el-form :model="notPassInfo" ref="notPassInfoForm">
          <el-form-item label="原因" prop="reason" :rules="[{required:true,message:'请填写不通过的原因！',trigger:'blur'}]">
            <el-input type="textarea" v-model="notPassInfo.reason"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button-group class="float-right">
              <el-button @click="notPass('cancel')">取 消</el-button>
              <el-button type="primary" @click="notPass('confirm')">反 馈</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!--通过弹框-->
      <el-dialog title="通过" :visible.sync="passDialog">
        <el-form :model="passInfo" ref="passInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写不通过的原因！',trigger:'blur'}]">
            <el-input type="textarea" v-model="passInfo.reason"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button-group class="float-right">
              <el-button @click="doPass('cancel')">取 消</el-button>
              <el-button type="primary" @click="doPass('confirm')">反 馈</el-button>
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
    props: ['getDataFromComponent', 'getFunctionFromProcess', 'currentProcess'],
    data() {
      return {
        //不通过对象
        notPassInfo: {
          reason: null,
        },
        //不通过弹框
        notPassDialog: false,
        //不通过对象
        passInfo: {
          reason: '同意！',
        },
        //不通过弹框
        passDialog: false,
      };
    },
    computed: {
      //从父组件获取流程状态
      currentProcessState() {
        return this.getDataFromComponent('currentProcess').state;
      },
    },
    methods: {
      //暂停与恢复操作
      doSuspendAndRecover(type) {
        var message = type == 'suspend' ? '暂停' : '恢复';
        var url = type == 'suspend' ? URL.dosuspend : URL.dorecovery;
        //从其他组件获取数据
        var taskId = this.getDataFromComponent('taskId');
        var changeCurrentProcessState = this.getFunctionFromProcess('changeCurrentProcessState');
        var setStatusInfo = this.getFunctionFromProcess('setStatusInfo');

        this.$confirm('确认需要提交吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.$http.get(url + '?taskId=' + taskId).then((rs) => {
            utils.consoleLog({message: '打印' + message + '后的结果', content: rs});
            if (rs.data.success) {
              this.$message({
                message: message + '操作成功！',
                type: 'success'
              })
              changeCurrentProcessState(type == 'suspend' ? 'SUSPEND' : 'AUDIT');//更新暂停与恢复
              setStatusInfo({
                applyWay: '窗口登记',
                state: type == 'suspend' ? '已暂停' : '已受理',
                timing: type == 'suspend' ? '已暂停计时' : '计时中'
              })
            } else {
              this.$message.error(message + '操作失败！');
            }
          });
        });

      },
      //不通过
      notPass(type) {
        //从其他组件获取数据
        var taskId = this.getDataFromComponent('taskId');
        //从其他组件获取方法
        var that = this;
        switch (type) {
          case 'showDialog':
            this.notPassDialog = true;//显示弹框
            break;
          case 'cancel':
            this.notPassDialog = false;//隐藏弹框
            break;
          case 'confirm':
            var tempValid = null;
            //验证数据合法性
            this.$refs['notPassInfoForm'].validate((valid) => {
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
                message: that.notPassInfo.reason,//办理意见
                status: 'flowConditionKey:2',//分支状态
              }
              that.$http.post(URL.dotask, obj).then((rs) => {
                if (rs.data.success) {
                  that.$message({
                    type: 'success',
                    message: '办件已标记为“不通过”！'
                  });
                  history.back();
                } else {
                  that.$message.error('不通过操作失败！');
                }
              }).catch((error) => {
                utils.consoleLog({message: '打印不通过的错误信息', content: error});
              });
            })
            this.notPassDialog = false;//隐藏弹框
            break;
        }
      },
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
            var processBaseInfo = this.getDataFromComponent('processBaseInfo');
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
              that.$http.post(URL.dotask, {
                taskId: taskId,//业务id
                message: this.passInfo.reason,//办理意见
                user: [],//下一步处理人
                isMessage: '',//是否发送短信
                status: 'flowConditionKey:1'
              }).then((rs) => {
                if (rs.data.success) {
                  that.$message({
                    type: 'success',
                    message: '办件已标记为“通过”！'
                  });
                  //根据流程判断流程流转或者关闭页面
                  changeProcessPageState(processBaseInfo.id);
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
      },
    },
  }
</script>

<style scoped>
  .float-right {
    float: right;
  }
</style>
