<!--套餐登记页-->
<template>
  <imp-panel>
    <el-col :span="24">
      <div style="float: right;">
        <el-form :inline="true" label-width="100px" ref="departmentQueryForm">
          <el-form-item label="套餐名称:">
            <el-input v-model="matterChildName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="search" type="primary" @click="getPackageList">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="tableData"
        height="360"
        ref="singleTable"
        :row-style="tableRowStyle"
        highlight-current-row
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
          label="套餐名称"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <a href="javascript:void(0);"
               style="text-decoration:none;" @click="getMatterByPackageId(scope.row.id)">{{
              scope.row.name }}</a>
          </template>
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

    <!--弹出框-->
    <el-dialog title="选择待办事项" :visible.sync="dialogFormVisible">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0;"></div>
      <el-checkbox-group v-model="checkedMatter" @change="handleCheckedMatterChange">
        <div style="margin-bottom:10px;" v-for="matter in matters" :key="matter.name">
          <el-checkbox :label="matter" :key="matter.id">{{matter.name}}</el-checkbox>
        </div>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectMatters">确 定</el-button>
      </div>
    </el-dialog>
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
        matterChildName: null,//用于查询条件输入的套餐名称
        processDialog: true,//用于控制是否显示流程处理弹出框
        tableData: [],
        currentRow: null,//保存被选中的一行
        checkAll: false,//是否全选
        checkedMatter: [],//已选择
        matters: [],//待选列表
        isIndeterminate: true,//是否是不确定状态
        dialogFormVisible: false,//是否显示弹出框
        suitId: null//记录被点击的套餐id
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
      // 确认事项选择
      selectMatters() {
        if (this.checkedMatter.length == 0) {
          this.$message({type: 'warn', message: '请至少选择一个事项进行登记！'});
          return;
        }

        this.$router.push({
          path: '/packageprocess',
          query: {
            state: 'connector',
            id: this.suitId,
            matter_child_id: this.checkedMatter.reduce((array, value) => {
              array.push(value.id);
              return array;
            }, []).join(",")
          }
        })
      },
      // 确定当前多选的状态
      handleCheckAllChange(val) {
        this.checkedMatter = val ? this.matters : [];
        this.isIndeterminate = false;
      },
      // 改变当前多选的状态
      handleCheckedMatterChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.matters.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.matters.length;
      },
      //处理显示每页的大小，并触发重新加载页面table数据
      handleSizeChange(size) {
        this.pagenation.size = size;
        this.pagenation.currentPage = 1;
        this.getPackageList();
      },
      //table当前行改变
      handleCurrentChange(row) {
        var matterChildId = row.id;
        this.$router.push({
          path: '/process', query: {
            matter_child_id: matterChildId
          }
        })
      },
      //当前页改变
      handleCurrentPagenationChange(currentPage) {
        this.pagenation.currentPage = currentPage;
        this.getPackageList();
      },
      //分页查询所有套餐
      getPackageList() {
        var that = this;
        this.$http.post(url.SUIT_MATTER_LIST, {
          size: this.pagenation.size,
          page: this.pagenation.currentPage - 1
        }).then((rs) => {
          //判断是否结果是否正常
          if (rs.data.success) {
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
      // 根据套餐id查询关联事项
      getMatterByPackageId(id) {
        this.suitId = id;
        this.checkAll = true;
        this.dialogFormVisible = true;
        this.$http.get(url.SUIT_MATTER_CHILD + '?id=' + id).then((rs) => {
          if (rs.data.success) {
            this.matters = rs.data.content.slice(0);
            this.checkedMatter = this.matters;
            this.isIndeterminate = false;
          }
        });
      }
    },
    created() {
      this.getPackageList();
    }
  }
</script>

<style scoped>

</style>
