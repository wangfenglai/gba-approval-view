<!--办理工作台页面-->
<template>
  <imp-panel>
    <el-tabs v-model="activeName" @tab-click="tabSwitch">
      <el-tab-pane label="待办事宜" name="toDo">

        <el-col :span="24" v-if="!showTabs">
          <el-form :inline="true" label-width="120px" ref="departmentQueryForm">
            <el-form-item label="时间">
              <el-col :span="11">
                <el-date-picker type="date" placeholder="开始日期" v-model="queryObj.startDate" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
              </el-col>
              <el-col class="line" :span="2">&nbsp;到</el-col>
              <el-col :span="11">
                <el-date-picker type="date" placeholder="结束日期" v-model="queryObj.endDate" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
              </el-col>
            </el-form-item>
            <el-form-item label="标题:" label-width="100px">
              <el-input v-model="queryObj.title"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button icon="search" type="primary" @click="loadingListData(null)">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="tableData" :row-style="tableRowStyle" height="360" ref="singleTable" highlight-current-row style="width: 100%">
            <el-table-column type="index" label="序" header-align="center" width="130" align="center">
            </el-table-column>
            <el-table-column prop="status" label="状态" header-align="center" width="180" align="center" :key="'state'">
              <template slot-scope="scope">
                <i v-if="scope.row['daoqiTime'] && scope.row['daoqiTime']<Date.now()" class="fa fa-exclamation-circle fa-lg" style="color:red;cursor:pointer;" title="超期"></i>
                <span>{{getLastTime(scope.row)}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="processType" label="事项类型" header-align="center" width="130" align="center" :key="'type'">
            </el-table-column>
            <el-table-column prop="name" label="标题" header-align="center" align="center">
              <template slot-scope="scope">
                <a href="javascript:void(0);" @click="handleCurrentLineChange(scope.row)" style="text-decoration:none;">{{ scope.row.name }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="link" label="步骤名称" header-align="center" width="150" align="center">
            </el-table-column>
            <el-table-column prop="applicant" label="提交人" header-align="center" width="150" align="center">
            </el-table-column>
            <el-table-column prop="createDate" label="创建时间" header-align="center" width="160" align="center">
            </el-table-column>
          </el-table>

          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenation.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagenation.size" layout="total, sizes, prev, pager, next, jumper" :total="pagenation.total">
          </el-pagination>
        </el-col>
      </el-tab-pane>
      <el-tab-pane :label="'待接件('+countData.connector+')'" name="connector"></el-tab-pane>
      <el-tab-pane :label="'待预审('+countData.pretrial+')'" name="pretrial"></el-tab-pane>
      <el-tab-pane :label="'待受理('+countData.accept+')'" name="accept"></el-tab-pane>
      <el-tab-pane :label="'待补办('+countData.supplement+')'" name="supplement"></el-tab-pane>
      <el-tab-pane :label="'待审批('+countData.audit+')'" name="audit"></el-tab-pane>
      <el-tab-pane :label="'待办结('+countData.waitfinish+')'" name="waitfinish"></el-tab-pane>
      <el-tab-pane :label="'已暂停('+countData.suspend+')'" name="suspend"></el-tab-pane>
      <el-tab-pane :label="'已办结('+countData.finish+')'" name="finish"></el-tab-pane>
      <el-tab-pane :label="'异常办结('+countData.abnormal+')'" name="abnormal"></el-tab-pane>
    </el-tabs>

    <el-col :span="24" v-if="showTabs">
      <el-form :inline="true" label-width="700px" ref="departmentQueryForm">
        <el-form-item label="申请人:">
          <el-input v-model="queryObj.applicant"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="search" type="primary" @click="loadingListData()">查询</el-button>
        </el-form-item>
      </el-form>
      <div style="width:100%;height: 360px;">
        <el-table :data="tableData" :row-style="tableRowStyle" height="360" ref="singleTable" highlight-current-row style="width: 100%">
          <el-table-column type="index" label="序" header-align="center" width="130" align="center">
          </el-table-column>
          <el-table-column prop="status" label="状态" header-align="center" width="180" align="center" v-if="columShow.status" :key="'status'">
            <template slot-scope="scope">
              <i v-if="scope.row['daoqiTime'] && scope.row['daoqiTime']<Date.now()" class="fa fa-exclamation-circle fa-lg" style="color:red;cursor:pointer;" title="超期"></i>
              <span>{{getLastTime(scope.row)}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="processType" label="事项类型" header-align="center" width="130" align="center" :key="'type'">
          </el-table-column>
          <el-table-column prop="name" label="办件名称" header-align="center" align="center" v-if="columShow.name" :key="'name'">
            <template slot-scope="scope">
              <a href="javascript:void(0);" @click="handleCurrentLineChange(scope.row)" style="text-decoration:none;">{{ scope.row.name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="applicant" label="申请人" width="120" header-align="center" align="center" v-if="columShow.applicant" :key="'applicant'">
          </el-table-column>
          <el-table-column prop="createDate" label="申请时间" width="180" header-align="center" align="center" v-if="columShow.createDate" :key="'createDate'">
          </el-table-column>
          <el-table-column prop="connectorAt" label="接件时间" width="180" header-align="center" align="center" v-if="columShow.connectorAt" :key="'connectorAt'">
          </el-table-column>
          <el-table-column prop="supplementAt" label="通知补正时间" width="180" header-align="center" align="center" v-if="columShow.supplementAt" :key="'supplementAt'">
          </el-table-column>
          <el-table-column prop="finishDate" label="办结时间" width="180" header-align="center" align="center" v-if="columShow.finishDate" :key="'finishDate'">
          </el-table-column>
          <el-table-column prop="acceptDate" label="受理时间" width="180" header-align="center" align="center" v-if="columShow.acceptDate" :key="'acceptDate'">
          </el-table-column>
          <el-table-column prop="linkDate" label="受理时间" width="180" header-align="center" align="center" v-if="columShow.linkDate" :key="'linkDate'">
          </el-table-column>
          <el-table-column prop="dueDate" label="承诺办结日期" width="180" header-align="center" align="center" v-if="columShow.dueDate" :key="'dueDate'">
          </el-table-column>
          <el-table-column prop="submitAt" label="提交时间" width="180" header-align="center" align="center" v-if="columShow.submitAt" :key="'submitAt'">
          </el-table-column>
          <el-table-column prop="processName" label="步骤名称" header-align="center" align="center" v-if="columShow.processName" :key="'processName'">
          </el-table-column>
          <el-table-column prop="dealPerson" label="办理人" header-align="center" align="center" v-if="columShow.dealPerson" :key="'dealPerson'">
          </el-table-column>
          <el-table-column prop="submitPerson" label="提交人" header-align="center" align="center" v-if="columShow.submitPerson" :key="'submitPerson'">
          </el-table-column>
          <el-table-column prop="sendTime" label="发送时间" header-align="center" align="center" v-if="columShow.sendTime" :key="'sendTime'">
          </el-table-column>
        </el-table>
      </div>

      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenation.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagenation.size" layout="total, sizes, prev, pager, next, jumper" :total="pagenation.total">
      </el-pagination>
    </el-col>
  </imp-panel>
</template>

<script>
import * as URL from '../../api'
import * as utils from '../../common/utils'

export default {
  data() {
    return {
      inputWidth: '300px', //用于控制输入框的文本长度
      inputTabWidth: '900px', //用于控制输入框的文本长度
      //用来统计各个业务的统计量
      countData: {
        connector: 0, //待接件
        accept: 0, //待受理
        supplement: 0, //待补办
        audit: 0, //待审批
        waitfinish: 0, //待办结
        suspend: 0, //已暂停
        finish: 0, //已办结
        abnormal: 0, //异常办结
        pretrial: 0 //待预审
      },
      //用以保存查询条件
      queryObj: {
        startDate: null, //开始日期
        endDate: null, //结束日期
        title: null, //标题
        applicant: null //申请人
      },
      showTabs: false, //展示多的tab的table
      //用来保存分页相关的东西
      pagenation: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      //该对象用来控制table显示的列
      columShow: {
        id: null, //业务id
        status: null, //状态
        serialNo: null, //流水号
        matterChildId: null, //事项id
        name: true, //事项名字
        applicant: true, //申请人名字
        finishDate: false, //完成时间
        linkDate: false, //
        createDate: true, //申请时间
        connectorAt: false, //接件时间
        supplementAt: false, //通知补正时间
        acceptDate: false, //受理时间
        dueDate: false, //承诺办结日期
        submitAt: false //提交时间
      },
      activeName: 'toDo', //记录当前的tab
      tableData: [],
      currentRow: null //保存被选中的一行
    }
  },
  methods: {
    //返回剩余的时间，超期返回超期的天数
    getLastTime(row) {
      let now = Date.now()
      let tempTime = 0
      let lastTime = ''
      let computeType = 1 //记录计算规则
      let prefix = '剩余'

      if (!row['daoqiTime']) {
        return '未受理'
      } else if (row['daoqiTime'] < now) {
        tempTime = now - row['daoqiTime']
        prefix = '超期'
      } else {
        row['daoqiTime'] && (tempTime = row['daoqiTime'] - now)
      }

      //判断应该以天、小时、分钟计算
      if (tempTime >= 1000 * 24 * 60 * 60) {
        //天
        lastTime += Math.floor(tempTime / (1000 * 24 * 60 * 60)) + '天'
      }

      if (tempTime > 1000 * 60 * 60) {
        //小时
        lastTime += Math.floor(tempTime / (1000 * 60 * 60)) % 24 + '小时'
      }

      lastTime +=
        Math.floor(tempTime / (1000 * 60)) % 60 == 0
          ? ''
          : Math.floor(tempTime / (1000 * 60)) % 60 + '分钟'

      return prefix + lastTime
    },
    //更改table行的颜色
    tableRowStyle({ row, rowIndex }) {
      if ((rowIndex + 1) % 2 == 0) {
        return { background: '#F5F7FA' }
      }
      return ''
    },
    //跳转至流程页面
    toProcessPage(url, state, id, matterChilId, taskId, isSuspend, processId) {
      this.$router.push({
        path: url,
        query: {
          state: state,
          id: id,
          matter_child_id: matterChilId,
          task_id: taskId,
          is_suspend: isSuspend,
          process_id: processId
        }
      })
    },
    //用于格式化时间
    formatTime(time) {
      return new Date(time).format('yyyy-MM-dd hh:mm:ss')
    },
    //当业务名称被点击
    handleCurrentLineChange: function(row) {
      //记录操作的名称
      var state = this.activeName
      //未接入工作流的流程
      let array = ['connector', 'finish', 'abnormal']
      //id
      let id = row.suitId ? row.suitId : row.id
      //url
      let url = row.suitId ? '/packageProcess' : '/process'
      //如果当前流程未接入工作流
      if (array.indexOf(state) == -1) {
        //获取环节key
        this.$http.get(URL.getNextUrl + '?taskId=' + row.taskId).then(rs => {
          if (rs.data.success) {
            let content = rs.data.content
            state = content.url.toLowerCase()
            url = '/process'
            //判断是否为套餐环境
            if (
              [
                'SUIT_PRETRIAL',
                'SUIT_SUPPLEMENT',
                'SUIT_ACCEPT',
                'SUIT_CURRENCY',
                'SUIT_WAITFINISH'
              ].indexOf(content.url) != -1
            ) {
              state = content.url.split('SUIT_')[1].toLowerCase()
              url = '/packageprocess'
            }
            this.toProcessPage(
              url,
              state,
              id,
              row.matterChildId,
              row.taskId,
              row.isSuspend,
              row.id
            )
          }
        })
      } else {
        this.toProcessPage(
          url,
          state,
          id,
          row.matterChildId,
          row.taskId,
          row.isSuspend,
          row.id
        )
      }
    },
    //处理显示每页的大小
    handleSizeChange(size) {
      var that = this
      that.pagenation.size = size
      that.pagenation.currentPage = 1
      //重新加载数据
      that.loadingCountData()
      that.loadingListData()
    },
    //当前页改变
    handleCurrentChange(currentPage) {
      var that = this
      that.pagenation.currentPage = currentPage
      //重新加载数据
      that.loadingCountData()
      that.loadingListData()
    },
    //该方法用于将columShow对属性都置为false
    formatColumShow(showArray) {
      var columShow = this.columShow
      for (var o in columShow) {
        if (showArray.indexOf(o) != -1) {
          columShow[o] = true
        } else {
          columShow[o] = false
        }
      }
    },
    //当tab切换
    tabSwitch(tab, event, type) {
      if (!type) {
        console.log('this is tab switch ' + tab.name)
        this.$router.replace({ path: '/desk/' + tab.name })
      }
      var that = this
      that.showTabs = true //隐藏
      this.pagenation.currentPage = 1
      this.pagenation.total = 0
      switch (tab.name) {
        case 'connector': //待接件
          that.formatColumShow(['name', 'applicant', 'createDate'])
          break
        case 'pretrial': //待预审
          that.formatColumShow(['name', 'applicant', 'createDate'])
          break
        case 'accept': //待受理
          that.formatColumShow(['name', 'applicant', 'connectorAt'])
          break
        case 'supplement': //待补办
          that.formatColumShow(['name', 'applicant', 'supplementAt'])
          break
        case 'audit': //待审批
          that.formatColumShow(['status', 'name', 'applicant', 'acceptDate'])
          break
        case 'waitfinish': //待办结
          that.formatColumShow(['status', 'name', 'applicant', 'dueDate'])
          break
        case 'suspend': //已暂停
          that.formatColumShow([
            'status',
            'name',
            'applicant',
            'acceptDate',
            'dueDate'
          ])
          break
        case 'finish': //已办结
          that.formatColumShow(['name', 'applicant', 'finishDate'])
          break
        case 'abnormal': //异常办结
          that.formatColumShow(['name', 'applicant', 'finishDate'])
          break
        case 'toDo': //待办
          that.showTabs = false //隐藏
          break
      }
      //重新加载数据
      that.loadingCountData()
      that.loadingListData()
    },
    //加载列表数据
    loadingListData() {
      var that = this
      var url = URL.gettaskstay
      var getStayArray = ['connector', 'finish', 'abnormal']
      var getTaskStayArray = [
        'toDo',
        'accept',
        'suspend',
        'supplement',
        'audit',
        'waitfinish',
        'pretrial'
      ]
      var defKey = null

      if (getStayArray.indexOf(that.activeName) != -1) {
        url = URL.getstay
        defKey = that.activeName.toUpperCase()
      } else if (getTaskStayArray.indexOf(that.activeName) != -1) {
        url = URL.gettaskstay
        if (that.activeName != 'toDo') {
          defKey = that.activeName.toUpperCase()
        }
      }
      that.$http
        .post(url, {
          defKey: defKey,
          size: that.pagenation.size,
          page: that.pagenation.currentPage - 1,
          applicant: that.queryObj.applicant,
          startDate: that.queryObj.startDate,
          endDate: that.queryObj.endDate,
          matterName: that.queryObj.title
        })
        .then(rs => {
          utils.consoleLog({
            message:
              '打印获取点击tab【' + that.activeName + '】获取到的列表信息',
            content: rs
          })
          if (rs.data.success && !!rs.data.content) {
            var data = rs.data.content.content
            that.pagenation.total = rs.data.content.totalElements
            $.each(data, (index, value) => {
              value['processType'] = value.suitId ? '套餐' : '单事项'
              value['connectorAt'] = value.createDate
              value['supplementAt'] = value.createDate
              value['jiejianTime'] = value.acceptDate //接件时间
              value['daoqiTime'] = value.dueDate //到期时间
              //格式化时间
              for (var o in value) {
                if (
                  (o.indexOf('At') != -1 || o.indexOf('Date') != -1) &&
                  value[o] != null
                ) {
                  value[o] = this.formatTime(value[o])
                }
                if (o == 'dueDate' && value[0]) {
                  //对承诺办结时间进行处理
                  value['dueDate'] = value['dueDate'].split(' ')[0]
                }
              }
            })

            that.tableData = data
          } else {
            that.tableData = []
          }
        })
        .catch(error => {
          utils.consoleLog({
            message: '打印获取点击tab获取到的错误信息',
            content: error
          })
        })
    },
    //加载列表数量数据
    loadingCountData() {
      var that = this
      that.$http
        .get(URL.gettoal)
        .then(rs => {
          utils.consoleLog({ message: '载列表数量数据请求结果', content: rs })

          if (rs.data.success && !!rs.data.content) {
            var result = rs.data.content
            result.forEach((value, index) => {
              that.countData[value.name.toLowerCase()] = value.value
            })
          }
        })
        .catch(error => {
          utils.consoleLog({
            message: '载列表数量数据请求结果的错误信息',
            content: error
          })
        })
    },
    //获取activename
    getActiveName() {
      var activeName = this.$route.params.activename
      var activeNames = [
        'connector',
        'suspend',
        'finish',
        'abnormal',
        'toDo',
        'accept',
        'supplement',
        'audit',
        'waitfinish',
        'pretrial'
      ]
      var index = -1
      activeName &&
        (index = activeNames
          .map(value => {
            return value.toLowerCase()
          })
          .indexOf(activeName))
      if (index != -1) {
        this.activeName = activeNames[index]
        this.activeName != 'toDo' &&
          (this.showTabs = true) &&
          this.tabSwitch({ name: this.activeName }, null, true) //使tab切换至待办事项,使待办事项的列表显示
      }
    },
    //创建临时数据
    makeTempData() {
      let data = []
      for (let i = 0; i < 10; i++) {
        data.push({
          name: '事项名称' + i, //事项名字
          applicant: '申请人' + i, //申请人名字
          dueDate: i % 2 == 0 ? '1528955707387' : null,
          acceptDate: '1528954707387'
        })
      }

      this.tableData = data
    }
  },
  created() {
    this.getActiveName()
  },
  mounted() {
    utils.initFunction() //初始化一些原型
    this.loadingCountData()
    this.loadingListData()
    // this.makeTempData()
  }
}
</script>

<style scoped>
</style>
