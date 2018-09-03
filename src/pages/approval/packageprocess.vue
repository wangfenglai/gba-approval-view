<!--套餐流程处理组件-->
<template>
  <imp-panel>
    <el-row>
      <div class="fixed-top">
        <div class="top-title-div">
          <span>套餐信息</span>
          <i class="el-icon-close" @click="clearData" style="cursor: pointer;"></i>
        </div>
        <div class="fui-toolbar">
          <!--放置操作按钮-->
          <div class="buttons">
            <el-button-group>
              <!--接件-->
              <receiveBtn v-if="['CONNECTOR'].indexOf(currentProcess.state)!=-1"
                          :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                          :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--预审,补正-->
              <pretrialBtn v-if="['PRETRIAL'].indexOf(currentProcess.state)!=-1"
                           :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                           :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--确认补正-->
              <supplementBtn v-if="['SUPPLEMENT'].indexOf(currentProcess.state)!=-1"
                             :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                             :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--受理-->
              <clerkBtn v-else-if="['ACCEPT'].indexOf(currentProcess.state)!=-1"
                        :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                        :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--审批-->
              <auditBtn v-else-if="['AUDIT'].indexOf(currentProcess.state)!=-1"
                        :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                        :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--通用-->
              <currency-btn v-if="['CURRENCY'].indexOf(currentProcess.state)!=-1"
                            :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                            :getFunctionFromProcess="getFunctionFromProcess"/>
              <!--办结-->
              <finishBtn v-else-if="['WAITFINISH'].indexOf(currentProcess.state)!=-1"
                         :getDataFromComponent="getDataFromComponent" :processBaseinfo="processBaseinfo"
                         :getFunctionFromProcess="getFunctionFromProcess"/>
            </el-button-group>
          </div>
          <!--放置状态信息-->
          <div class="status">
            <p>申报方式：{{statusInfo.applyWay}}&nbsp;&nbsp;状态：{{statusInfo.state}}&nbsp;&nbsp;计时：{{statusInfo.timing}}</p>
            <p>文书打印:
              <el-dropdown @command="changeData" size="mini" split-button>
                文件列表
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="item in documentList"
                    :key="item.id" :command="item.id">{{item.fileName}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </p>
          </div>
        </div>
      </div>
      <el-col :span="24">
        <div style="width:100%;height:420px;overflow-y: auto;overflow-x: hidden;">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="01 套餐信息" name="1">
              <!--引入业务信息组件-->
              <PackageInfo ref="matterChildInfoComponent" :packageInfo="packageInfo"></PackageInfo>
            </el-collapse-item>
            <el-collapse-item
              :title="'02 办件信息  '+(processBaseinfo.serialNo==null?'':'('+'办件编号：'+processBaseinfo.serialNo+')')"
              name="2">
              <!--引入办件信息组件-->
              <Processbaseinfo ref="processFormInfoComponent"
                               :getDataFromComponent="getDataFromComponent" :packageInfo="packageInfo"
                               :state="currentProcess.state"
                               :elementVals="elementVals"></Processbaseinfo>
            </el-collapse-item>
            <el-collapse-item title="03 申报材料" name="3">
              <!--引入材料列表组件-->
              <Paperlist ref="paperListComponent"
                         :getDataFromComponent="getDataFromComponent" :state="currentProcess.state"
                         :packageInfo="packageInfo"></Paperlist>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>
    </el-row>

    <!--各种弹框-->
    <el-row>
      <el-dialog title="编辑数据" :visible.sync="pictureVisible" width="837px">
        <div class="dataprint">
          <form id="form1" onsubmit="return false" action="#" method="post">
            <div class="img-out">

            </div>
            <div>
              <input type="hidden" name="processId" v-model="processBaseinfo.id">
              <input type="hidden" name="adviceBookId" v-model="dataVal">
            </div>
          </form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="pictureVisible = false">取 消</el-button>
          <el-button type="info" @click="infoChange">打印预览</el-button>
        </div>
      </el-dialog>
      <el-dialog title="打印" :visible.sync="dialogFormVisible" width="837px">
        <div id="print">
          <div class="img-out">
            <img style="width: 797px;height: 1128px;" :src="pathSrc1">

          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="printInfo">打 印</el-button>
        </div>
      </el-dialog>
    </el-row>
  </imp-panel>
</template>

<script>
  import * as URL from "../../api"
  /*引入按钮*/
  import currencyBtn from './packageprocess/approvalbtn/currency'
  import receiveBtn from './packageprocess/approvalbtn/receive'
  import pretrialBtn from './packageprocess/approvalbtn/pretrial'
  import supplementBtn from './packageprocess/approvalbtn/supplement'
  import clerkBtn from './packageprocess/approvalbtn/clerk'
  import auditBtn from './packageprocess/approvalbtn/audit'
  import finishBtn from './packageprocess/approvalbtn/finish'
  import PackageInfo from "./packageprocess/packageinfo";
  import Processbaseinfo from "./packageprocess/processforminfo";
  import Paperlist from "./packageprocess/paperlist";
  import * as utils from '../../common/utils';
  import treeter from "../../components/treeter"

  export default {
    mixins: [treeter],
    components: {
      Paperlist,
      PackageInfo,
      receiveBtn, Processbaseinfo, currencyBtn, clerkBtn, auditBtn, finishBtn, pretrialBtn, supplementBtn
    },
    data() {
      return {
        dialogFormVisible: false,
        dataVal: "",
        //记录流程状态信息
        statusInfo: {
          applyWay: '窗口登记',
          state: '初始化',
          timing: '未开始计时'
        },
        taskId: null,//用于保存流程实例id
        pictureVisible: false,
        pathSrc: "",
        pathSrc1: "",
        value: "--文书列表--",
        matterChildId: null,//用于保存业务的id
        matterChildIds: null,//用于保存业务的id
        //记录当前流程的状态
        currentProcess: {
          state: 'CONNECTOR',
          name: null,
        },
        activeNames: ['1', '2', '3'],//用于控制默认显示的折叠面板
        // 办件信息
        processBaseinfo: {
          id: null,//业务id
          serialNo: null,//流水号
          matterChildId: null,//小项业务ID
          createDate: null,//创建时间
          finishDate: null,//完成时间
          acceptDate: null,//受理时间
          applyWay: null,//申请方式
          dueDate: null,//到期时间
          bit: null,//是否暂停
          stopDate: null,//暂停时间
          processBaseinfo: null,//办件信息
          paperUploadList: null,//附件材料
          activityList: null,//环节信息
          name: null,//事项名字
        },
        //文书打印 文书列表
        documentList: [],
        textid: "",
        elementVals: [],//保存自定义表单的数据
        packageInfo: null,//套餐对象信息
      };
    },
    computed() {
      //
    },
    methods: {
      /*打印编辑*/
      infoChange() {
        let that = this;
        $.ajax({
          //几个参数需要注意一下
          type: "POST",//方法类型
          dataType: "json",//预期服务器返回的数据类型
          url: URL.SYS_ADVICE_PRINT,//url
          data: $('#form1').serialize(),
          success: function (result) {
            that.pathSrc1 = "data:image/png;base64," + result.content.content;
            that.dialogFormVisible = true;
          },
          error: function () {
            that.$message('操作失败');
          }
        });
      },
      //设置状态信息
      setStatusInfo(obj) {
        this.statusInfo = obj;
      },
      //该方法用于将process的组件的方法集成分布到子组件
      getFunctionFromProcess(type) {
        var that = this;
        switch (type) {
          case 'setStatusInfo':
            return that.setStatusInfo;
            break;
          case 'validateBaseInfo':
            return that.validateBaseInfo;
          case 'changeProcessPageState':
            return that.changeProcessPageState;
            break;
          case 'changeCurrentProcessState':
            return that.changeCurrentProcessState;
            break;
        }
      },
      //控制页面流程流转或根据流程关闭页面
      changeProcessPageState(processId) {
        var that = this;
        that.$http.get(URL.gettask + processId).then((rs) => {
          utils.consoleLog({message: '打印获取流程实例信息', content: rs});
          if (rs.data.success) {
            if (!!rs.data.content && rs.data.content.length > 0) {
              that.taskId = rs.data.content[0].taskId;
              that.changeCurrentProcessState(rs.data.content[0].definitionKey == 'FINISH' ? 'WAITFINISH' : rs.data.content[0].definitionKey);
              utils.consoleLog({message: 'taskId=' + that.taskId, constent: null});
              that.getHandleInfo(that.taskId, 'taskId');
            } else {
              history.back();
            }
          }
        });
      },
      //清空数据
      clearData() {
        history.back();
      },
      //改变流程状态
      changeCurrentProcessState(state) {
        this.loadData(state);
        this.currentProcess.state = state;
      },
      changeData(value) {
        this.dataVal = value;
        this.pictureVisible = true;
        this.$http.post(URL.SYS_ADVICE_HTML, {processId: this.processBaseinfo.id, link: value})
          .then(res => {
            if (res.data.success) {
              let html = res.data.content.html;
              let dataList = res.data.content.value;
              let opt = $(".dataprint .img-out");
              opt.empty().append(html);
              console.log(dataList.length);
              for (let i = 0; i < dataList.length; i++) {
                let dataname = dataList[i].name;
                let datavalue = dataList[i].value;
                opt.find("input[name=" + dataname + "]").val(datavalue);
                if (dataname == 'paperName') {
                  opt.find("input[name='paperName']").after("<textarea name='paperName' cols='100' rows='5'>" + datavalue + "</textarea>");
                  opt.find("input[name='paperName']").remove();
                }
              }
            } else {
              this.$message({message: res.data.message, type: 'error'});
              this.pictureVisible = false;
            }
          }).catch(e => {
          this.$message('操作失败');
          this.pictureVisible = false;
        })
      },
      //该方法用于调控获取其他组件的信息
      getDataFromComponent(type) {
        switch (type) {
          //事项列表id
          case 'matterChildIds':
            return this.matterChildIds;
          //获取已所有的已上传文件列表
          case 'paperUploadList':
            return this.$refs.paperListComponent.newPaperUploadList;
            break;
          //获取办件表单信息
          case 'processFormInfo':
            return this.$refs.processFormInfoComponent.formObj;
            break;
          //获取业务基础信息
          case 'matterChildInfo':
            return this.packageInfo;
            break;
          //获取大的办结信息
          case 'processBaseInfo':
            return this.processBaseinfo;
            break;
          //获取新增的上传文件列表
          case 'newPaperUploadList':
            return this.$refs.paperListComponent.newPaperUploadList;
            break;
          //获取流程实例id
          case 'taskId':
            return this.taskId;
            break;
          //获取当前流程状态
          case 'currentProcess':
            return this.currentProcess;
            break;
        }
      },
      //验证申请人证照编号和申请人信息是已填写，包括材料是否上传
      validateBaseInfo(type) {
        if (type) {
          return this.$refs.processFormInfoComponent.validateBaseInfo(type) && this.$refs.paperListComponent.validateBaseInfo();
        }
        return this.$refs.processFormInfoComponent.validateBaseInfo(type);
      },
      /*打印*/
      printInfo() {
        $("#print").jqprint();
        this.dialogFormVisible = false;
      },
      loadData(id) {
        id = id.toString().toLowerCase();
        id = id=='currency'?'charge':id;
        utils.consoleLog({message: '打印当前环境的key', content: id});
        var map = new Map();
        var documentList = ['接件通知书','收费通知书','缴费凭证'];
        var linkList = ['CONNECTOR', 'CHARGE','MONEY'];

        map.set('accept', [0, 1, 2]);//待受理
        map.set('audit', [0, 1, 2]);//待审批
        map.set('waitfinish', [0, 1, 2]);//待办结
        map.set('finish', [0, 1, 2]);//已办结
        map.set('charge', [0,1, 2]);//通用
        if (map.has(id)) {
          var list = [];
          map.get(id).forEach((value) => {
            list.push({id: linkList[value], fileName: documentList[value]});
          });
          this.documentList = list;
        }
      },
      //更新状态信息
      updateStateInfo(state, isSuspend) {
        var statusInfo = {
          applyWay: '窗口登记',
          state: '初始化',
          timing: '未开始计时'
        };
        switch (state) {
          case 'finish':
            statusInfo.state = '已完结';
            statusInfo.timing = '计时结束';
            break;
          case 'abnormal':
            statusInfo.state = '已完结';
            statusInfo.timing = '计时结束';
            break;
          case 'waitfinish':
            statusInfo.state = '已受理';
            statusInfo.timing = '计时中';
            break;
          case 'suspend'://暂停
            statusInfo.state = '已暂停';
            statusInfo.timing = '已暂停计时';
            break;
          case'audit'://审批
            statusInfo.state = '已受理';
            statusInfo.timing = '计时中';
            if (isSuspend || isSuspend == 'true') {
              state = 'suspend';
              statusInfo.state = '已暂停';
              statusInfo.timing = '已暂停计时';
            }
            break;
          case'supplement'://补正
            statusInfo.state = '待补正';
            break;
          case 'accept'://受理
            statusInfo.state = '已接件';
          case 'pretrial'://预审
            statusInfo.state = '待预审';
            break;
          case 'connector'://接件
            state = 'connector';
            break;
        }
        this.setStatusInfo(statusInfo);
        this.changeCurrentProcessState(state.toUpperCase());
      },
      // 根据套餐id,和事项id列表加载套餐信息
      getPackageInfo(id, matterChildIds) {
        this.matterChildIds = matterChildIds;
        this.$http.get(URL.SUIT_MATTER_INFO + "?id=" + id + '&matterChildIds=' + this.matterChildIds).then((rs) => {
          this.packageInfo = rs.data.content;
        })
      },
      //加载办事信息
      getHandleInfo(id, type) {
        var url = null;
        switch (type) {
          case 'taskId':
            url = URL.getreceive;
            this.taskId = id;
            break;
          case 'processId':
            url = URL.gettemp;
            break;
        }
        this.$http.get(url + '' + id).then(
          (rs) => {
            if (rs.data.success) {
              var result = rs.data.content;
              this.processBaseinfo = result;
              //记录自定义表单的数据
              this.elementVals = this.processBaseinfo.elementVals;
            }
          });
      },
      //初始化页面
      initPage() {
        //获取当前路由
        let query = this.$route.query;
        //获取流程state
        let state = query.state;
        //获取is_suspend
        let isSuspend = query.is_suspend;
        //获取套餐id
        let suitId = query.id;
        //获取事项id
        let matterChildIds = query.matter_child_id;
        //获取processId
        let processId = query.process_id;
        //获取taskId
        let taskId = query.task_id;
        //更新状态信息
        this.updateStateInfo(state, isSuspend);
        //加载套餐信息包括材料信息
        matterChildIds && this.getPackageInfo(suitId, matterChildIds);
        //加载办事信息
        taskId ? this.getHandleInfo(taskId, 'taskId') :(processId && this.getHandleInfo(processId, 'processId'));
      }
    },
    mounted() {
      //修改手风琴标题样式
      $('.el-collapse-item__header').css({color: '#f96e40', borderBottom: '1px solid #f96e40'});
    },
    watch: {
      //监听办件信息
      'processBaseinfo': function () {
        var that = this;
        //更新表单信息
        that.$refs.processFormInfoComponent.processFormInfo = that.processBaseinfo.processBaseinfo;
        //更新已上传文件信息
        that.$refs.paperListComponent.paperUploadList = that.processBaseinfo.paperUploadList;
        //清空新增已上传列表
        that.$refs.paperListComponent.newPaperUploadList = [];
      }
    },
    created() {
      this.initPage();//初始化页面
      //初始化格式时间方法
      utils.initFunction();
      $('html').css('background-color', 'white');
    }
  }
</script>

<style scoped>
  .fixed-top {
    display: table;
    content: " ";
    width: 100%;
  }

  /*标题栏*/
  .top-title-div {
    width: 100%;
    background-color: black;
    height: 40px;
    color: white;
    padding-top: 8px;
    padding-left: 10px;
    font-size: larger;
  }

  /*操作栏*/
  .fui-toolbar {
    height: 80px;
    padding: 5px 14px;
    background-color: #F5F3F2;
  }

  .fui-toolbar > .buttons {
    float: left;
  }

  .fui-toolbar > .status {
    float: right;
    margin-top: 10px;
  }

  /*关闭按钮*/
  .el-icon-close {
    float: right;
    margin-top: 4px;
    margin-right: 10px;
    font-size: large;
  }

  .el-icon-close:hover {
    color: red;
    transform: scale(1.5);
  }

  /*修改用户tab的大小*/
  .user-tab {
    padding: 10px 5px;
    width: 100%;
    height: 230px;
    /* border: 1px solid lightgray;*/
    overflow-y: auto;
  }

  .select-user-operate {
    margin-right: 10px;
    float: right;
    color: darkgray;
  }

  .select-user-operate:hover {
    color: #f96e40;
  }

  .img-out {
    width: 797px;
    height: 1128px;
  }

  .img {
    width: 100%;
    height: 100%;
  }

  #print {
    position: relative;
    overflow: hidden;
    width: 797px;
    height: 1128px;
  }

  .dataprint {
    position: relative;
    overflow: hidden;
    width: 797px;
    height: 1128px;
  }
</style>
