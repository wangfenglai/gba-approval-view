<template>
  <content>
    <!--展现业务信息-->
    <div>
      <span class="matter-child-info">事项名称：{{packageName&&packageName+' >> '}}{{showMatterChildInfo.name}}</span>
      <span class="matter-child-info">事项编码：{{showMatterChildInfo.logicNo}}</span>
      <span class="matter-child-info" v-if="false">事项类型：{{showMatterChildInfo.type}}</span>
      <span class="matter-child-info" v-if="false">所属部门：{{showMatterChildInfo.dept}}</span>
      <span class="matter-child-info" v-if="false">是否收费：{{showMatterChildInfo.isPay}}</span>
      <span class="matter-child-info" v-if="false">审批结果：{{showMatterChildInfo.examineApprove}}</span>
      <span class="matter-child-info">承诺期限：{{showMatterChildInfo.limitByPromise+' 工作日'}}</span>
      <span class="matter-child-info">受理条件：{{showMatterChildInfo.processCondition}}</span>
      <div v-if="packageName">
        <br/>
        <hr/>
        <span class="matter-child-info">套餐名称：{{packageName}}</span>
        <span class="matter-child-info">承诺期限：{{limitByPromise?limitByPromise+'工作日':'未设置'}}</span>
      </div>
    </div>

  </content>
</template>

<script>
export default {
  props: ['matterChildInfo', 'packageName', 'limitByPromise'],
  data() {
    return {
      //事项信息
      temp: {
        id: null,
        name: '卫生许可证申请', //事项名称
        logicNo: '111111111111112222', //事项编码
        type: '承诺件', //事项类型
        dept: '市安监局', //所属部门
        isPay: '否', //是否收费
        examineApprove: '证照', //审批结果
        limitByPromise: '5', //承诺期限
        processCondition: '卫生许可证申请', //受理条件
        matterPaperList: [] //材料列表
      }
    }
  },
  computed: {
    showMatterChildInfo() {
      return this.matterChildInfo ? this.matterChildInfo : this.temp
    }
  }
}
</script>

<style scoped>
.matter-child-info {
  box-sizing: border-box;
  padding-left: 20px;
  display: inline-block;
  width: 30%;
  margin: 10px 0 5px 3%;
}
</style>
