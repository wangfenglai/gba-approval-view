<!--首页-->
<template>
  <imp-panel>
    <!--首页的基本信息-->
    <el-row :gutter="12">
      <!--事项办理情况统计-->
      <el-col v-for="item in maters" :key="item.name" :span="6">
        <div class="tile-stats" :style="'background-color:'+item.color" @click="$router.push('/desk/'+item.key)">
          <div class="icon"><i :class="'fa '+item.icon"></i></div>
          <div class="num">{{item.value}}</div>
          <h3>{{item.name}}</h3>
          <p></p>
        </div>
      </el-col>

      <!--待办事项列表-->
      <el-col :span="8">
        <div class="panel">
          <div class="panel-heading">
            <div class="panel-title">待办事项</div>
            <div class="panel-options">
              <i class="fa fa-chevron-down" style="display: none;" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-chevron-up" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-remove" @click="panelOperate($event,'remove')"></i>
            </div>
          </div>
          <div class="panel-body">
            <table style="width:100%;">
              <tbody>
              <tr v-if="index<6" v-for="(item,index) in toDoTableData" :key="index">
                <td @click="handleCurrentLineChange(item)">
                  <span class="cursor-pointer"><span style="color:red;">[{{'待'+item.link}}]</span>{{item.name}}</span>
                </td>
              </tr>
              <tr v-else>
                <td class="view-more"><span @click="$router.push('/desk/todo')">查看更多</span></td>
              </tr>
              <tr v-show="toDoTableData.length==0">
                <td style="text-align: center;">无数据</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-col>

      <!--热门事项列表-->
      <el-col :span="8">
        <div class="panel">
          <div class="panel-heading">
            <div class="panel-title">热门事项</div>
            <div class="panel-options">
              <i class="fa fa-chevron-down" style="display: none;" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-chevron-up" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-remove" @click="panelOperate($event,'remove')"></i>
            </div>
          </div>
          <div class="panel-body">
            <table style="width:100%;">
              <tbody>
              <tr v-if="index<6" v-for="(item,index) in hotMatters" :key="index">
                <td style="text-align: left;padding-left:10px;border-bottom: 1px solid #ebebeb;width:100%;">
                  {{item.name}}
                </td>
              </tr>
              <tr v-show="hotMatters.length==0">
                <td style="text-align: center;">无数据</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </el-col>

      <!--已办事项统计图-->
      <el-col :span="8">
        <div class="panel">
          <div class="panel-heading">
            <div class="panel-title">已办事项统计</div>
            <div class="panel-options">
              <i class="fa fa-chevron-down" style="display: none;" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-chevron-up" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-remove" @click="panelOperate($event,'remove')"></i>
            </div>
          </div>
          <div class="panel-body">
            <div id="allReadyChart" style="width: 100%;height: 240px;"></div>
          </div>
        </div>
      </el-col>

      <!--公告信息-->
      <el-col :span="8">
        <div class="panel">
          <div class="panel-heading">
            <div class="panel-title">公告信息</div>
            <div class="panel-options">
              <i class="fa fa-chevron-down" style="display: none;" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-chevron-up" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-remove" @click="panelOperate($event,'remove')"></i>
            </div>
            <div class="panel-options">
              <ul class="nav-tabs">
                <li class="active"><a href="#advice" @click.prevent="panelOperate($event,'tab')">通知公告</a></li>
                <li><a href="#email" @click.prevent="panelOperate($event,'tab')">内部邮件</a></li>
              </ul>
            </div>
          </div>
          <div class="panel-body">
            <div class="tab-content">
              <div class="tab-panel active" id="advice">
                这里是通知列表
              </div>
              <div class="tab-panel" id="email">
                这里是内部邮件
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!--待办事项统计-->
      <el-col :span="16">
        <div class="panel">
          <div class="panel-heading">
            <div class="panel-title">待办事项统计</div>
            <div class="panel-options">
              <i class="fa fa-chevron-down" style="display: none;" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-chevron-up" @click="panelOperate($event,'toggle')"></i>
              <i class="fa fa-remove" @click="panelOperate($event,'remove')"></i>
            </div>
          </div>
          <div class="panel-body">
            <div id="forReadyChart" style="width: 100%;height: 250px;"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </imp-panel>
</template>

<script>
  import * as echarts from 'echarts';
  import * as utils from '../../common/utils'
  import * as URL from '../../api'
  import process from "./process"

  export default {
    name: "home",
    data() {
      return {
        toDoTableData: [],//记录待办事项列表
        maters: [],//记录事项处理情况列表
        overtimeCount: 0,//超期量统计
        hotMatters: [],//热门事项
      }
    },
    components: {process},
    methods: {
      //panel面板的操作
      panelOperate(event, type) {
        var $target = $(event.target);
        switch (type) {
          case 'toggle':
            $target.parents('.panel').find('.panel-body').slideToggle("slow");
            $target.parents('.panel').find('.fa-chevron-down').toggle();
            $target.parents('.panel').find('.fa-chevron-up').toggle();
            break;
          case 'remove':
            $target.parents('.panel').remove();
            break;
          case 'tab':
            var tabIndex = $target.attr('href');
            $target.parent().addClass('active').siblings().removeClass('active')
            $target.parents('.panel').find(tabIndex).addClass('active').siblings().removeClass('active');
            break;
        }
      },
      //更新事项处理情况
      updateMaterDealInfo(data) {
        var keys = ['connector', 'accept', 'supplement', 'audit', 'waitfinish', 'suspend', 'finish', 'abnormal'];
        var names = ['待接件', '待受理', '待补办', '待审批', '待办结', '已暂停', '已办结', '异常办结'];
        var colors = ['#F56954', '#00A65A', '#00C0EF', '#0073B7', '#879AA3', '#3B7474', '#68AE7C', '#D9B036'];
        var icons = ['fa-chrome', 'fa-briefcase', 'fa-superpowers', 'fa-magic', 'fa-coffee', 'fa-stop-circle', 'fa-th-list', 'fa-exclamation-circle'];

        if (!data) {
          data = [];
          keys.forEach((value) => {
            data.push({
              name: value,
              value: 0,
            })
          });
        }
        this.maters = [];
        //取出数据
        data.forEach((value) => {
          var index = keys.indexOf(value.name.toLowerCase());
          if (index != -1) {
            this.maters.push({
              key: value.name.toLowerCase(),
              name: names[index],
              value: value.value,
              color: colors[index],
              icon: icons[index]
            })
          }
        });
        //更新图标
        this.allReadyChart();
        this.forReadyChart();
      },
      //已办结统计图
      allReadyChart() {
        // 基于准备好的dom，初始化echarts实例
        var chart1 = document.getElementById('allReadyChart');
        var myChart = echarts.init(chart1);
        var names = ['已办结', '异常办结'];

        // 指定图表的配置项和数据
        var option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            left: 'center',
            top: '15px',
            data: names
          },
          series: [
            {
              name: '已办事项',
              type: 'pie',
              radius: '60%',
              center: ['50%', '50%'],
              data: this.maters.filter((value) => {
                if (names.indexOf(value.name) != -1) {
                  return true;
                }
              }),
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //待办结统计图
      forReadyChart() {
        // 基于准备好的dom，初始化echarts实例
        var chart1 = document.getElementById('forReadyChart');
        var myChart = echarts.init(chart1);
        var names = ['待接件', '待受理', '待补办', '待审批', '待办结', '已暂停'];
        // 指定图表的配置项和数据
        var option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            right: '50px',
            y: '30px',
            data: names.concat('超期')
          },
          series: [
            {
              name: '超期',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '30%'],
              label: {
                normal: {
                  position: 'inner'
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: [
                {value: this.overtimeCount, name: '超期\n\n' + this.overtimeCount + '\n\n\n\n\n'}
              ]
            },
            {
              name: '',
              type: 'pie',
              radius: ['40%', '70%'],
              data: this.maters.filter((value) => {
                if (names.indexOf(value.name) != -1) {
                  return true;
                }
              })

            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //加载列表数量数据
      loadingCountData() {
        this.$http.get(URL.gettoal).then((rs) => {
          utils.consoleLog({message: '载列表数量数据请求结果', content: rs});
          if (rs.data.success && !!rs.data.content) {
            var result = rs.data.content;
            this.updateMaterDealInfo(result);
          } else {
            this.updateMaterDealInfo(null);
          }
        }).catch((error) => {
          utils.consoleLog({message: '载列表数量数据请求结果的错误信息', content: error});
          this.updateMaterDealInfo(null);
        });
      },
      //加载超期量
      loadingOverTimeCount() {
        this.$http.get(URL.OVER_TIME_COUNT).then((rs) => {
          if (rs.data.success) {
            this.overtimeCount = rs.data.content;
          }
        }).catch((error) => {
          utils.consoleLog({message: '打印获取超期量出错', content: error});
        });
      },
      //加载热门事项
      loadingHotMatter() {
        this.$http.get(URL.MATTER_CHILD_HOT).then((rs) => {
          if (rs.data.success) {
            this.hotMatters = rs.data.content;
          }
        }).catch((error) => {
          utils.consoleLog({message: '打印获取热门事项出错', content: error});
        });
      },
      //加载待办事项列表
      loadingToDoMaters() {
        this.$http.post(URL.gettaskstay, {
          size: 7,
          page: 0,
        }).then((rs) => {
          utils.consoleLog({message: '打印获取获取到的待办事项列表信息', content: rs});
          if (rs.data.success && !!rs.data.content) {
            var data = rs.data.content.content;
            this.toDoTableData = data;
          } else {
            this.toDoTableData = [];
          }
        }).catch((error) => {
          this.toDoTableData = [];
          utils.consoleLog({message: '打印获取获取到的待办事项列表错误信息', content: error});
        });
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
        });
      },
      //当待办事项中的标题被点击
      handleCurrentLineChange: function (row) {
        //记录操作的名称
        var state = this.activeName;
        //未接入工作流的流程
        let array = ['connector', 'finish', 'abnormal'];
        //id
        let id = row.suitId ? row.suitId : row.id;
        //url
        let url = row.suitId ? 'packageProcess' : 'process';
        //如果当前流程未接入工作流
        if (array.indexOf(state) == -1) {
          //获取环节key
          this.$http.get(URL.getNextUrl + '?taskId=' + row.taskId).then(rs => {
            if (rs.data.success) {
              let content = rs.data.content;
              state = content.url.toLowerCase();
              url = 'process';
              //判断是否为套餐环境
              if (['SUIT_PRETRIAL', 'SUIT_SUPPLEMENT', 'SUIT_ACCEPT', 'SUIT_CURRENCY','SUIT_WAITFINISH'].indexOf(content.url) != -1) {
                state = content.url.split('SUIT_')[1].toLowerCase();
                url = 'packageprocess';
              }
              this.toProcessPage(url, state, id, row.matterChildId, row.taskId, row.isSuspend, row.id);
            }
          });
        } else {
          this.toProcessPage(url, state, id, row.matterChildId, row.taskId, row.isSuspend, row.id);
        }
      },
      //初始页面包含该页面所有的请求
      initPage() {
        this.loadingCountData();
        this.loadingHotMatter();
        this.loadingOverTimeCount();
        this.loadingToDoMaters();
      }
    },
    mounted() {
      this.initPage();
    }
    ,
  }
</script>

<style scoped>
  .tile-stats {
    position: relative;
    display: block;
    background: #303641;
    padding: 20px;
    margin-bottom: 15px;
    overflow: hidden;
    -webkit-border-radius: 5px;
    -webkit-background-clip: padding-box;
    -moz-border-radius: 5px;
    -moz-background-clip: padding;
    border-radius: 5px;
    background-clip: padding-box;
    -moz-transition: all 300ms ease-in-out;
    -o-transition: all 300ms ease-in-out;
    -webkit-transition: all 300ms ease-in-out;
    transition: all 300ms ease-in-out;
  }

  .tile-stats {
    background: #f56954;
  }

  .tile-stats:hover {
    background: gray !important;
  }

  .tile-stats .icon {
    color: rgba(0, 0, 0, 0.1);
    position: absolute;
    right: 15px;
    bottom: 55px;
    z-index: 1;
  }

  .tile-stats .icon i {
    font-size: 100px;
    line-height: 0;
    margin: 0;
    padding: 0;
    vertical-align: bottom;
  }

  .tile-stats .num,
  .tile-stats h3,
  .tile-stats p {
    color: #ffffff;
  }

  .tile-stats .num {
    font-size: 38px;
    font-weight: bold;
  }

  .panel {
    margin-bottom: 15px;
    background-color: #ffffff;
    border: 1px solid #ebebeb;
    -webkit-border-radius: 3px;
    -webkit-background-clip: padding-box;
    -moz-border-radius: 3px;
    -moz-background-clip: padding;
    border-radius: 3px;
    background-clip: padding-box;
  }

  .panel-heading {
    color: #373e4a;
    height: 45px;
    background-color: #ffffff;
    border-color: #ebebeb;
    border-bottom: 1px solid #ebebeb;
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
    padding: 2px 3px;
  }

  .panel-title {
    display: inline-block;
    font-size: 16px;
    color: black;
    margin: 8px 0px 0px 12px;
    margin-bottom: 0;
  }

  .panel-options {
    float: right;
    padding: 10px 5px;
    font-size: 12px;
    color: #a6a7aa;
  }

  .panel-options i {
    margin-right: 8px;
  }

  .nav-tabs {
    position: relative;
    top: 1px;
    border-bottom: 1px solid #ebebeb;
    padding-top: 7px;
    list-style: none;
  }

  .nav-tabs li {
    background-color: transparent;
    margin-right: 4px;
    display: inline-block;
    position: relative;
    padding-bottom: 5px;
  }

  .nav-tabs > li.active > a {
    border: 1px solid #ebebeb;
    border-bottom: 1px solid #ffffff;
    background-color: #ffffff;
    color: #373e4a;
  }

  .nav-tabs > li > a {
    background-color: #ebebeb;
    padding: 8px 10px;
    color: rgba(55, 62, 74, 0.5);
    font-size: 12px;
    -webkit-border-radius: 3px 3px 0 0;
    -webkit-background-clip: padding-box;
    -moz-border-radius: 3px 3px 0 0;
    -moz-background-clip: padding;
    border-radius: 3px 3px 0 0;
    background-clip: padding-box;
    -moz-transition: all 300ms ease-in-out;
    -o-transition: all 300ms ease-in-out;
    -webkit-transition: all 300ms ease-in-out;
    transition: all 300ms ease-in-out;
    margin-right: 4px;
    line-height: 1.42857143;
    text-decoration: none;
    text-decoration-line: none;
  }

  .nav-tabs > li > a:hover {
    cursor: pointer;
  }

  .nav-tabs > li.active > a:hover {
    cursor: default;
  }

  .tab-content {
    padding-top: 10px;
  }

  .tab-content .tab-panel {
    display: none;
  }

  .tab-content .active {
    display: block;
    padding: 5px 10px;
    width: 100%;
  }

  .panel-options i:hover {
    cursor: pointer;
  }

  .panel-body {
    position: relative;
    color: #a6a7aa;
    padding: 0;
    border: 0;
    font-size: 12px;
    width: 100%;
    height: 240px;
    padding: 10px;
  }

  .panel-body td {
    padding: 6px;
    text-align: left;
    border-bottom: 1px solid #ebebeb;
    width: 100%;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .view-more {
    text-align: right !important;
    cursor: pointer;
    color: #373e4a;
  }

  .view-more:hover {
    color: #818da2;
  }
</style>
