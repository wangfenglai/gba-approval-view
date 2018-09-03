<!--
事项登记页
-->
<template>
  <imp-panel>
    <el-col :span="24">
      <div style="float: right;">
        <el-form :inline="true" label-width="100px" ref="departmentQueryForm">
          <el-form-item label="事项名称:">
            <el-input v-model="matterChildName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="search" type="primary" @click="getMatterChilds">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="tableData"
        height="360"
        ref="singleTable"
        highlight-current-row
        :row-style="tableRowStyle"
        :default-sort="{prop: 'order', order: 'descending'}"
        style="width: 100%">
        <el-table-column
          type="index"
          label="序"
          header-align="center"
          align="center"
          width="70">
        </el-table-column>
        <el-table-column
          prop="name"
          label="事项名称"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <a href="javascript:void(0);"
               style="text-decoration:none;" @click="handleCurrentChange(scope.row)">{{
              scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="事项类型"
          width="95" header-align="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="code"
          label="事项编码"
          width="180" header-align="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="limitByPromise"
          label="承诺时限" width="95" header-align="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="isPay"
          label="是否收费" width="95" header-align="center"
          align="center">
        </el-table-column>
        <el-table-column
          prop="order" sortable
          label="排序值" width="100" header-align="center"
          align="center">
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentPagenationChange"
        :current-page="pagenation.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagenation.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagenation.total">
      </el-pagination>
    </el-col>
  </imp-panel>
</template>

<script>
  import * as url from "../../api"
  import * as utils from '../../common/utils'

  export default {
    data() {
      return {
        //用来保存分页相关的东西
        pagenation: {
          currentPage: 1,
          size: 10,
          total: 10,
        },
        matterChildName: null,//用于查询条件输入的事项名称
        processDialog: true,//用于控制是否显示流程处理弹出框
        tableData: [],
        currentRow: null,//保存被选中的一行
      };
    },
    methods: {
       //更改table行的颜色
      tableRowStyle({row, rowIndex}) {
        if ((rowIndex+1)%2==0) {
          return {background:'#F5F7FA'};
        }
        return '';
      },
      //处理显示每页的大小，并触发重新加载页面table数据
      handleSizeChange(size) {
        this.pagenation.size = size;
        this.pagenation.currentPage = 1;
        this.getMatterChilds();
      },
      //table当前行改变
      handleCurrentChange(row) {
        var matterChildId = row.id;
        utils.consoleLog({message: '打印选择业务的id：id= ' + matterChildId});
        this.$router.push({
          path: '/process', query: {
            state: 'connector',
            matter_child_id: matterChildId
          }
        })
      },
      //当前页改变
      handleCurrentPagenationChange(currentPage) {
        this.pagenation.currentPage = currentPage;
        this.getMatterChilds();
      },
      //分页查询所有业务
      getMatterChilds() {
        var that = this;
        this.$http.post(url.getmatterchilds, {
          size: this.pagenation.size,
          page: this.pagenation.currentPage - 1
        }).then((rs) => {
          //判断是否结果是否正常
          if (rs.data.success) {
            utils.consoleLog({message: '打印事项登记页面table数据列表', content: rs});
            var page = rs.data.content;
            that.pagenation.total = page.totalElements;//改变总页数
            if (!!page.content) {
              var array = [];
              page.content.forEach((value) => {
                array.push({
                  id: value.id,
                  name: value.name,
                  type: value.type,
                  code: value.logicNo,
                  limitByPromise: value.limitByPromise,
                  isPay: value.isPay ? "是" : "否",
                  order: Math.round(Math.random() * 100),
                })
              });
              that.tableData = array;
            }
          }

        }).catch((error) => {
          utils.consoleLog({message: '打印分页查询所有业务的错误信息', content: error});
          if ([401, 403, 500].indexOf(error.response.status) == -1) {
            this.$message('获取数据失败！');
          }
        });
      },
    },
    created() {
      this.getMatterChilds();
    }
  }
</script>

<style scoped>
</style>
