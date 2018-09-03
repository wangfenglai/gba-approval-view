<template>
  <content>
    <!--展现办件信息-->
    <div>
      <div class="form-title">基础表单信息</div>
      <el-form :inline="true" :rules="processFormInfoRules" :model="processFormInfo" label-width="300px" ref="processFormInfoForm">
        <el-form-item label="申请人类型:">
          <el-radio :disabled="isReadOnly" size="small" class="radio" v-model="processFormInfo.applicantType" :label="'PERSONAL'">
            个人
          </el-radio>
          <el-radio :disabled="isReadOnly" size="small" class="radio" v-model="processFormInfo.applicantType" :label="'COMPANY'">企业
          </el-radio>
        </el-form-item>
        <el-form-item label="证照类型:" label-width="368px" prop="paperType">
          <el-select :disabled="isReadOnly" size="small" v-model="processFormInfo.paperType" style="width:190px;">
            <el-option v-for="item in paperType" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="申请人证照编号:" prop="paperNo">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.paperNo" @input="paperNoChange"></el-input>
        </el-form-item>
        <el-form-item label="申请人:" prop="applicant">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.applicant"></el-input>
        </el-form-item>
        <el-form-item label="地址:" prop="address">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.address" style="width:692px;"></el-input>
        </el-form-item>
        <el-form-item label="法人代表:" class="frdb" v-if="frdbShow" prop="legalPerson">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.legalPerson" style="width:692px;"></el-input>
        </el-form-item>
        <el-form-item label="联系人身份证:" prop="contactPersonNo">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.contactPersonNo"></el-input>
        </el-form-item>
        <el-form-item label="联系人:" prop="contactPerson">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.contactPerson"></el-input>
        </el-form-item>
        <el-form-item label="联系电话:" prop="phone">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.phone"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="telephone">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.telephone"></el-input>
        </el-form-item>
        <el-form-item label="邮编:" prop="postcode">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.postcode"></el-input>
        </el-form-item>
        <el-form-item label="传真:" prop="fax">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.fax"></el-input>
        </el-form-item>
        <el-form-item label="电子邮件:" prop="email">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="是否使用物流:" prop="isPost" v-if="!packageName">
          <el-radio :disabled="isReadOnly" size="small" class="radio" v-model="processFormInfo.isPost" :label=true :value="true">是
          </el-radio>
          <el-radio :disabled="isReadOnly" size="small" class="radio" v-model="processFormInfo.isPost" :label=false :value="false">否
          </el-radio>
        </el-form-item>
        <el-form-item label="收件人:" prop="postCustomer" v-if="!packageName && showPost">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo['postCustomer']"></el-input>
        </el-form-item>
        <el-form-item label="收件电话:" prop="postPhone" v-if="!packageName && showPost">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo['postPhone']"></el-input>
        </el-form-item>
        <el-form-item label="收件邮编:" prop="postPostcode" v-if="!packageName && showPost">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo['postPostcode']"></el-input>
        </el-form-item>
        <el-form-item label="收件地址:" prop="postAddress" v-if="!packageName && showPost">
          <el-input :disabled="isReadOnly" size="small" v-model="processFormInfo['postAddress']" style="width:692px;"></el-input>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input :disabled="isReadOnly" size="small" type="textarea" v-model="processFormInfo.remark" style="width:692px;"></el-input>
        </el-form-item>
      </el-form>
      <!--自定义表单-->
      <div v-for="form in customFormList" :key="form.id">
        <div class="form-title">{{form.name}}</div>
        <el-form v-if="form.tags.length>0" :inline="true" :rules="processFormInfoRules" :model="processFormInfo" label-width="300px" :ref="form.id+''" :key="form.id">
          <el-form-item v-for="item in form.tags" :label="item.propertyChineseName" :key="item.propertyName" :prop="item.propertyName">
            <!--输入框-->
            <el-input :disabled="isOutput?form.name.indexOf('输入')!=-1:isReadOnly" size="small" v-if="item.type=='text'" v-model="processFormInfo[item.propertyName]" :key="item.propertyName"></el-input>
            <!--下拉框-->
            <el-select :disabled="isOutput?form.name.indexOf('输入')!=-1:isReadOnly" size="small" v-if="item.type=='select'" v-model="processFormInfo[item.propertyName]" :key="item.propertyName" style="width:190px;">
              <el-option v-for="option in item.options" :key="option" :label="option" :value="option">
              </el-option>
            </el-select>
            <!--银行网点-->
            <el-cascader :disabled="isOutput?form.name.indexOf('输入')!=-1:isReadOnly" :options="getBankInfo" v-model="processFormInfo[item.propertyName]" :key="item.propertyName" size="small" style="width:692px;" v-if="item.type=='datetime'" filterable clearable placeholder="请选择(支持搜索)"></el-cascader>
            <!--多选-->
            <el-checkbox-group :disabled="isOutput?form.name.indexOf('输入')!=-1:isReadOnly" v-model="processFormInfo[item.propertyName]" :key="item.propertyName" size="small" style="width:692px;" v-if="item.type=='checkbox'">
              <el-checkbox v-for="option in item.options" :key="option" :label="option"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <div v-else class="form-msg">无数据</div>
      </div>
    </div>
  </content>
</template>

<script>
import * as URL from '../../../api'
import * as utils from '../../../common/utils'
import banks from '../../../../static/res/banks'

export default {
  props: ['getDataFromComponent', 'state', 'elementVals', 'matterChildInfo','packageName'],
  data() {
    return {
      showPost: false, //控制邮寄表单时候显示
      frdbShow: false, //用于控制法人代表不显示
      paperNoTimeOut: null, //用于保存申请人证件编号自动填充的定时任务
      applicantTimeOut: null, //用于保存申请人自动填充的定时任务
      paperType1: [{ value: 'CERTIFICAT', label: '身份证' }], //申请类型为个人时的证照类型
      paperType2: [
        { value: 'ORGANIZATION', label: '组织机构代码' },
        { value: 'SEXUAL', label: '统一社会信用代码' }
      ], //申请类型为企业时的证照类型
      paperType: [{ value: 'CERTIFICAT', label: '身份证' }], //用于页面上证照类型展示
      // 办件信息
      processFormInfo: {
        id: null,
        state: 'receive',
        applicantType: 'PERSONAL', //申请人类型：
        paperType: 'CERTIFICAT', //证照类型
        paperNo: null, //申请人证照编号
        applicant: null, //申请人
        address: null, //地址
        legalPerson: null, //法人代表
        contactPersonNo: null, //联系人身份证
        contactPerson: null, //联系人
        phone: null, //联系电话
        telephone: null, //手机
        postcode: null, //邮编
        fax: null, //传真
        email: null, //电子邮件
        remark: null, //备注
        isPost: false, //是否使用物流
        postAddress: null, //收件地址
        postPostcode: null, //收件邮编
        postCustomer: null, //收件人
        postPhone: null //收件电话
      },
      //办件信息表单验证规则
      processFormInfoRules: {
        paperType: [
          { required: true, message: '请选择证件类型', trigger: 'change' }
        ],
        paperNo: [
          {
            required: true,
            message: '请输入申请人证照编号',
            trigger: 'change'
          },
          {
            max: 30,
            message: '不超过30字符',
            trigger: 'change'
          }
        ],
        applicant: [
          { required: true, message: '请输入申请人', trigger: 'change' },
          {
            max: 50,
            message: '不超过50字符',
            trigger: 'change'
          }
        ],
        address: [{ max: 100, message: '不超过100字符', trigger: 'change' }],
        legalPerson: [{ max: 50, message: '不超过50字符', trigger: 'change' }],
        contactPersonNo: [
          { max: 50, message: '不超过50字符', trigger: 'change' }
        ],
        contactPerson: [
          { max: 50, message: '不超过50字符', trigger: 'change' }
        ],
        phone: [{ max: 50, message: '不超过50字符', trigger: 'change' }],
        telephone: [{ max: 11, message: '不超过11字符', trigger: 'change' }],
        postcode: [{ max: 6, message: '不超过6字符', trigger: 'change' }],
        fax: [{ max: 50, message: '不超过50字符', trigger: 'change' }],
        email: [
          { type: 'email', message: '无效的邮件地址', trigger: 'change' },
          {
            max: 50,
            message: '不超过50字符',
            trigger: 'change'
          }
        ],
        remark: [{ max: 1000, message: '不超过1000字符', trigger: 'change' }],
        postAddress: [{ required: true, message: '请输入收件地址', trigger: 'change' }], //收件地址
        postPostcode: [{ required: true, message: '请输入收件邮编', trigger: 'change' }], //收件邮编
        postCustomer: [{ required: true, message: '请输入收件人姓名', trigger: 'change' }], //收件人
        postPhone: [{ required: true, message: '请输入收件电话', trigger: 'change' }] //收件电话
      },
      formRefs: ['processFormInfoForm'], //保存表单的id，用于数据验证是用,
      customProperties: [], //自定义表单的属性属性名称
      tempBanks: banks //银行信息
    }
  },
  computed: {
    //获取银行网点信息
    getBankInfo() {
      let array = []
      for (let pro in this.tempBanks) {
        let children = []
        banks[pro].forEach(value => {
          children.push({
            label: value,
            value: value
          })
        })
        array.push({
          label: pro,
          value: pro,
          children: children.length == 0 ? null : children
        })
      }

      return array
    },
    //判断自定义表单类型是否为输出表单
    isOutput() {
      return ['OUTPUT'].indexOf(this.state) != -1
    },
    //判断是否只读状态
    isReadOnly() {
      return (
        ['CONNECTOR', 'ACCEPT', 'SUPPLEMENT', 'PRETRIAL'].indexOf(this.state) ==
        -1
      )
    },
    //获取自定义表单
    customFormList() {
      if (!this.matterChildInfo) {
        return []
      }
      //根据状态确定显示输入材料还是输出材料
      let name =
        this.isOutput || this.state == 'FINISH'
          ? ['matterPaperFormList', 'outPutMatterPaperFormList']
          : ['matterPaperFormList']
      let formArray = [] //记录表单信息
      let propertys = {} //记录表单参数名称
      let rules = {} //记录规则
      name.forEach(valueName => {
        this.matterChildInfo[valueName].forEach(value => {
          let formObj = {
            name:
              (valueName == 'matterPaperFormList' ? '【输入】' : '【输出】') +
              value.name, //表单名称
            id: value.id //表单id
          }
          let formTabArray = [] //记录表单标签信息
          let paperFormList = value.paperFormList
          if (
            typeof paperFormList == 'object' &&
            paperFormList &&
            paperFormList.constructor == Array
          ) {
            paperFormList.forEach(value => {
              //记录标签信息
              formTabArray.push({
                propertyName: value.code, //标签参数名
                propertyChineseName: value.name, //中文名称
                type: value.type.toLowerCase(), //类型
                options: value.rule ? value.rule.split(',') : [] //下拉框的选项
              })

              let type = null //记录数据类型

              switch (value.type.toLowerCase()) {
                case 'input':
                case 'select':
                  type = null
                  break
                case 'datetime':
                case 'checkbox':
                  type = []
                  break
              }
              //记录属性名,并初始化类型
              propertys[value.code] = type
              this.customProperties.push(value.code + '#' + value.elementId)
              //记录规则
              if (value.required == 'YES') {
                rules[value.code] = [
                  {
                    required: true,
                    message: '请输入' + value.name,
                    trigger: 'change'
                  }
                ]
              }
            })
          }

          formObj.tags = formTabArray
          formArray.push(formObj)
          this.formRefs.push(formObj.id) //记录表单id
        })
      })

      //更新表单对象的结构
      this.processFormInfo = Object.assign({}, this.processFormInfo, propertys)
      //更新验证规则
      this.processFormInfoRules = Object.assign(
        {},
        this.processFormInfoRules,
        rules
      )

      return formArray
    },
    //获取表单对象
    formObj() {
      let elementVals = [] //自定义
      let formObj = {} //基础
      for (var property in this.processFormInfo) {
        let customPropertyName = null
        let data = Array.isArray(this.processFormInfo[property])
          ? this.processFormInfo[property].join('@@@@')
          : this.processFormInfo[property]
        this.customProperties.forEach(value => {
          if (value.split('#')[0] == property) {
            customPropertyName = value
          }
        })
        if (customPropertyName) {
          if (Array.isArray(data)) {
            data.length > 0 && elementVals.push(customPropertyName + ':' + data)
          } else {
            data && elementVals.push(customPropertyName + ':' + data)
          }
        } else {
          formObj[property] = data
        }
      }

      formObj.elementVals = elementVals
      return formObj
    }
  },
  methods: {
    //证照编号改变
    paperNoChange() {
      var obj = {
        paperNo: this.processFormInfo.paperNo,
        applicantType: this.processFormInfo.applicantType
      }
      this.$http
        .post(URL.getevidence, obj)
        .then(rs => {
          utils.consoleLog({ message: '打印获取的证照库信息', content: rs })
          if (rs.data.success) {
            var content = rs.data.content
            if (!!content) {
              var processFormInfo = this.processFormInfo
              for (var property in content) {
                if (
                  ['applicantType', 'paperType', 'paperNo', 'id'].indexOf(
                    property
                  ) == -1
                ) {
                  processFormInfo[property] = content[property]
                }
              }
            }
          } else {
          }
        })
        .catch(() => {
          var processFormInfo = this.processFormInfo
          for (var property in processFormInfo) {
            if (
              ['applicantType', 'paperType', 'paperNo'].indexOf(property) == -1
            ) {
              processFormInfo[property] = null
            }
          }
        })
    },
    //清空表单中的数据
    clearData() {
      var formInfo = this.processFormInfo
      for (var v in formInfo) {
        if (['applicantType', 'paperType', 'isPost'].indexOf(v) != -1) {
          formInfo['applicantType'] = 'PERSONAL'
          formInfo['paperType'] = 'CERTIFICAT'
          formInfo['isPost'] = false
        } else {
          formInfo[v] = null
        }
      }
      this.$refs.processFormInfoForm.clearValidate() //清空验证信息
    },
    //验证申请人证照编号和申请人信息是已填写
    validateBaseInfo() {
      var isContinue = true
      //
      this.formRefs.forEach(value => {
        let formObj =
          this.$refs[value].constructor == Array
            ? this.$refs[value][0]
            : this.$refs[value]
        console.log('formName', value, formObj)
        formObj.validate(rs => {
          if (!rs && isContinue) {
            this.$confirm('请正确填写表单信息！', '提示', {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'warning'
            })
            isContinue = rs
          }
        })
      })
      return isContinue
    },
    //用于申请人自动填充列表
    applicantQuerySearchAsync(queryString, cb) {
      var that = this
      var tempArray = []
      if (queryString && queryString.trim() != '') {
        queryString = queryString.trim()
        that.$http
          .post(URL.getapplicant, {
            applicant: queryString,
            applicantType: that.processFormInfo.applicantType
          })
          .then(rs => {
            var tempArray = []
            utils.consoleLog({
              message: '打印获取申请人证照库信息列表',
              content: rs
            })
            tempArray = rs.data.content
            clearTimeout(this.applicantTimeOut)
            this.applicantTimeOut = setTimeout(() => {
              cb(tempArray)
            }, 2000 * Math.random())
          })
          .catch(error => {
            var tempArray = []
            clearTimeout(this.applicantTimeOut)
            this.applicantTimeOut = setTimeout(() => {
              cb(tempArray)
            }, 2000 * Math.random())
          })
      }
    },
    //用于申请人证照编号自动填充列表
    paperNoQuerySearchAsync(queryString, cb) {
      var that = this

      that.$http
        .post(URL.getpaperno, {
          paperNo: queryString,
          applicantType: that.processFormInfo.applicantType
        })
        .then(rs => {
          var tempArray = []
          utils.consoleLog({
            message: '打印获取申请人证照编号证照库信息列表',
            content: rs
          })
          tempArray = rs.data.content
          clearTimeout(this.paperNoTimeOut)
          this.paperNoTimeOut = setTimeout(() => {
            cb(tempArray)
          }, 2000 * Math.random())
        })
        .catch(error => {
          var tempArray = []
          clearTimeout(this.paperNoTimeOut)
          this.paperNoTimeOut = setTimeout(() => {
            cb(tempArray)
          }, 2000 * Math.random())
        })
    },
    //当自动填充列表被选中执行的方法
    paperNoSelect1(item) {
      var that = this
      that.$http
        .post(URL.getevidence, {
          paperNo: item.value,
          applicantType: that.processFormInfo.applicantType
        })
        .then(rs => {
          utils.consoleLog({
            message: '打印从证照库获取的详细信息',
            content: rs
          })
          if (rs.data.success) {
            var content = rs.data.content
            if (!!content) {
              var processFormInfo = this.processFormInfo
              for (var property in content) {
                if (['applicationType', 'paperType'].indexOf(property) == -1) {
                  processFormInfo[property] = content[property]
                }
              }
            }
          }
        })
    },
    //当自动填充列表被选中执行的方法
    paperNoSelect2(item) {
      var that = this
      that.$http
        .post(URL.getevidence, {
          applicant: item.value,
          applicantType: that.processFormInfo.applicantType
        })
        .then(rs => {
          utils.consoleLog({
            message: '打印从证照库获取的详细信息',
            content: rs
          })
          if (rs.data.success) {
            var content = rs.data.content
            if (!!content) {
              var processFormInfo = this.processFormInfo
              for (var property in content) {
                if (['applicationType', 'paperType'].indexOf(property) == -1) {
                  processFormInfo[property] = content[property]
                }
              }
            }
          }
        })
    }
  },
  watch: {
    //监听是否邮递
    'processFormInfo.isPost': function(val) {
      if (val) {
        //显示邮寄输入框
        this.showPost = true
      } else {
        //隐藏邮寄输入框
        this.showPost = false
        this.processFormInfo.postAddress = null //收件地址
        this.processFormInfo.postPostcode = null //收件邮编
        this.processFormInfo.postCustomer = null //收件人
        this.processFormInfo.postPhone = null //收件电话
      }
    },
    //监听事项个人申请类型
    'processFormInfo.applicantType': function(val) {
      if ('PERSONAL' == val) {
        this.processFormInfo.paperType = 'CERTIFICAT'
        this.paperType = this.paperType1
        this.processFormInfo.frdb = null
        this.frdbShow = false //隐藏法人代表输入框
      } else {
        this.processFormInfo.paperType = 'ORGANIZATION'
        this.paperType = this.paperType2
        this.frdbShow = true //显示法人代表输入框
      }
    },
    //监听自定义表单的生成
    customFormList() {
      this.elementVals.forEach(value => {
        this.processFormInfo[value.elementCode] = Array.isArray(
          this.processFormInfo[value.elementCode]
        )
          ? value.val.split('@@@@')
          : value.val
      })
    },
    //监听父级传入的自定义表单数据
    elementVals() {
      console.log('elemntvals update')
      this.elementVals.forEach(value => {
        this.processFormInfo[value.elementCode] = Array.isArray(
          this.processFormInfo[value.elementCode]
        )
          ? value.val.split('@@@@')
          : value.val
      })
    }
  }
}
</script>

<style scoped>
.form-title {
  padding: 0 10px 0 10px;
  font-size: 12px;
  border-bottom: 1px solid #c1c1c1;
  margin-bottom: 10px;
}

.form-msg {
  text-align: center;
  font-size: 12px;
  color: #c1c1c1;
}
</style>
