<template>
  <content>
    <!--展现业务信息-->
    <div>
      <span class="matter-child-info">套餐名称：{{showPackageInfo.name}}</span>
      <span class="matter-child-info">承诺期限：{{showPackageInfo.limitByPromise+'  工作日'}}</span>
      <div class="matter-child-info">办理事项列表：
        <el-card class="box-card">
          <div v-for="(o,index) in showPackageInfo.matterChildList" :key="o.name">
            {{(index+1)+'.'+o.name }}
          </div>
          <div v-if="showPackageInfo.matterChildList.length==0">无事项列表</div>
        </el-card>
      </div>
    </div>

    <div>

    </div>
  </content>
</template>

<script>

  export default {
    props: ['packageInfo'],
    data() {
      return {
        //事项信息
        temp: {
          id: null,
          name: '卫生许可证申请',//事项名称
          logicNo: '111111111111112222',//事项编码
          type: '承诺件',//事项类型
          dept: '市安监局',//所属部门
          isPay: '否',//是否收费
          examineApprove: '证照',//审批结果
          limitByPromise: '5',//承诺期限
          processCondition: '卫生许可证申请',//受理条件
          matterPaperList: [],//材料列表
          matterChildList:[],//事项列表
        }
      }
    }, computed: {
      showPackageInfo() {
        return this.packageInfo ? this.packageInfo : this.temp;
      }
    }
  }
</script>

<style scoped>
  .matter-child-info {
    float: left;
    width: 47%;
    padding-left: 110px;
    margin-bottom: 10px;
  }
</style>
