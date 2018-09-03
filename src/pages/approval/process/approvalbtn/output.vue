<template>
  <content>
    <!--放置操作按钮-->
    <span>
      <el-button type="primary" size="small" @click="pass('showDialog')">通过</el-button>
      <el-button type="primary" size="small" @click="notPass('showDialog')">不通过</el-button>
    </span>

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
      <el-dialog title="通过" :visible.sync="clerkDialog">
        <el-form :model="clerkMsgInfo" ref="forbiddenClerkInfoForm">
          <el-form-item label="签署意见" prop="reason" :rules="[{required:true,message:'请填写通过的意见！',trigger:'blur'}]">
            <el-input type="textarea" v-model="clerkMsgInfo.reason"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button-group class="float-right">
              <el-button @click="pass('cancel')">取 消</el-button>
              <el-button type="primary" @click="pass('confirm')">提 交</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>

  </content>
</template>

<script>
import * as URL from '../../../../api'
import * as utils from '../../../../common/utils'

export default {
  props: ['getDataFromComponent', 'getFunctionFromProcess', 'processBaseinfo'],
  data() {
    return {
      //通过意见
      clerkMsgInfo: {
        reason: '同意!'
      },
      //通过弹框
      clerkDialog: false,
      //不通过对象
      notPassInfo: {
        reason: '不同意！'
      },
      //不通过弹框
      notPassDialog: false
    }
  },
  methods: {
    //不通过
    notPass(type) {
      //从其他组件获取数据
      var taskId = this.getDataFromComponent('taskId')
      //从其他组件获取方法
      var that = this
      switch (type) {
        case 'showDialog':
          this.notPassDialog = true //显示弹框
          break
        case 'cancel':
          this.notPassDialog = false //隐藏弹框
          break
        case 'confirm':
          var tempValid = null
          //验证数据合法性
          this.$refs['notPassInfoForm'].validate(valid => {
            tempValid = valid
          })

          if (!tempValid) {
            return
          }

          this.$confirm('确认需要提交吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            var obj = {
              taskId: taskId,
              message: that.notPassInfo.reason, //办理意见
              status: 'flowConditionKey:2' //分支状态
            }
            that.$http
              .post(URL.dotask, obj)
              .then(rs => {
                if (rs.data.success) {
                  that.$message({
                    type: 'success',
                    message: '办件已标记为“不通过”！'
                  })
                  history.back()
                } else {
                  that.$message.error('不通过操作失败！')
                }
              })
              .catch(error => {
                utils.consoleLog({
                  message: '打印不通过的错误信息',
                  content: error
                })
              })
          })
          this.notPassDialog = false //隐藏弹框
          break
      }
    },
    //完成通过
    pass(type) {
      switch (type) {
        case 'showDialog':
          this.clerkDialog = true //显示弹框
          break
        case 'cancel':
          this.clerkDialog = false //隐藏弹框
          this.clerkMsgInfo.reason = '同意！'
          break
        case 'confirm':
          //从其他组件获取数据
          var processFormInfo = this.getDataFromComponent('processFormInfo')
          var matterChildInfo = this.getDataFromComponent('matterChildInfo')
          var paperUploadList = this.getDataFromComponent('newPaperUploadList')
          var processBaseInfo = this.getDataFromComponent('processBaseInfo')
          var taskId = this.getDataFromComponent('taskId')
          //从其他组件获取方法
          var changeProcessPageState = this.getFunctionFromProcess(
            'changeProcessPageState'
          )
          var setStatusInfo = this.getFunctionFromProcess('setStatusInfo')

          var that = this
          //构建提交的对象
          processFormInfo.paperUploadList = paperUploadList
          processFormInfo.taskId = taskId
          processFormInfo.message = this.clerkMsgInfo.reason
          processFormInfo.status = 'flowConditionKey:1'
          that.$http
            .post(URL.PROCESS_OUTPUT, processFormInfo)
            .then(rs => {
              utils.consoleLog({ message: '通过操作的结果信息', content: rs })
              var result = rs.data
              if (result.success) {
                that.$message({
                  type: 'success',
                  message: '通过成功!'
                })
                //根据流程判断流程流转或者关闭页面
                changeProcessPageState(processBaseInfo.id)
                //改变状态信息
                setStatusInfo({
                  applyWay: '窗口登记',
                  state: '已通过',
                  timing: '计时中'
                })
              } else {
                that.$message.error('通过操作失败！')
              }
            })
            .catch(error => {
              that.$message.error('通过操作失败！')
              utils.consoleLog({
                message: '通过操作失败的错误信息',
                content: error
              })
            })
          break
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
