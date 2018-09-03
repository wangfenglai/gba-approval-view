<template>
  <content>
    <!--展现材料列表信息-->
    <div>
      <div>
        <el-checkbox v-model="zzAllSelected" :disabled="isOutput?false:isReadOnly">纸质全选</el-checkbox>
        <span style="float:right;">已标记{{dataCount.all}}件材料，其中纸质{{dataCount.zz}}件，电子文档{{dataCount.dz}}件；容缺{{dataCount.rq}}件；不容缺{{dataCount.brq}}件。</span>
        <hr/>
      </div>
      <el-table :data="paperTableData" stripe highlight-current-row style="width: 100%">
        <el-table-column type="index" header-align="center" align="center" label="序" width="70">
        </el-table-column>
        <el-table-column prop="type" header-align="center" align="center" label="类型">
        </el-table-column>
        <el-table-column prop="clsq" label="材料收取" header-align="center" align="center" width="90">
          <template slot-scope="scope">
            <i class="fa fa-check" v-if="scope.row.clsq"></i>
            <i class="fa fa-exclamation-circle" style="color:#DE2A2A;" v-else-if="!scope.row.clsq && paperChecked"></i>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="材料名称" header-align="center" align="center" width="300">
          <template slot-scope="scope">
            <a href="javascript:void(0);" style="text-decoration:none;color:black;cursor: text;">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="dz" header-align="center" align="center" label="电子">
          <template slot-scope="scope">
            <i class="fa fa-save" @click="dzSelected(scope.row)" :data-id="scope.row.id" v-if="scope.row.dz" v-bind:class="[scope.row.dzUpload?active_icon:'',cursor_pointer]"></i>
          </template>
        </el-table-column>
        <el-table-column prop="zz" header-align="center" align="center" label="纸质">
          <template slot-scope="scope">
            <i class="fa fa-file-text" @click="zzSelected($event)" v-bind:data-id="scope.row.id" v-if="scope.row.zz" v-bind:class="[scope.row.zzUpload?active_icon:'',isOutput?cursor_pointer:(isReadOnly?diabled_icon:cursor_pointer)]"></i>
          </template>
        </el-table-column>
        <el-table-column prop="pz" header-align="center" align="center" label="拍照">
          <template slot-scope="scope">
            <i class="fa fa-camera"></i>
          </template>
        </el-table-column>
        <el-table-column prop="sfrq" header-align="center" align="center" label="是否容缺">
        </el-table-column>
        <el-table-column prop="bz" header-align="center" align="center" :show-overflow-tooltip=true width="200" label="备注">
        </el-table-column>
      </el-table>
    </div>

    <!--各种弹框-->
    <div>
      <el-dialog title="材料上传" size="small" :visible.sync="dzDialogShow" :before-close="updateDz">
        <el-button-group>

          <el-upload name="file" style="float: left" accept="file" :action="paperUploadUrl" :multiple=true :show-file-list=false :on-success="onSuccess" v-if="!isReadOnly">
            <el-button type="primary" size="small">
              <i class="fa fa-upload fa-lg"></i>&nbsp;选择文件上传</el-button>
          </el-upload>
          <el-button type="primary" size="small" v-if="fileTableData.length>0 && !isReadOnly" @click="deleteBtnClick()">
            <i class="fa fa-times-circle fa-lg"></i>&nbsp;删除选中
          </el-button>
          <el-button type="primary" size="small" @click="updateDz">
            <i class="fa fa-save fa-lg"></i>&nbsp;确认并关闭
          </el-button>
        </el-button-group>
        <el-table :data="fileTableData" stripe highlight-current-row @selection-change="selectionChange" style="width: 100%">
          <el-table-column type="selection" header-align="center" align="center" prop="selected" width="70">
          </el-table-column>
          <el-table-column prop="name" label="附件名称" header-align="center" align="center">
          </el-table-column>
          <el-table-column prop="time" label="添加时间" header-align="center" align="center">
          </el-table-column>
          <el-table-column prop="look" header-align="center" align="center" label="查看" width="100">
            <template slot-scope="scope">
              <i class="fa fa-eye" style="cursor: pointer;" :data-id="scope.row.uploadId" @click="paperDownload($event)"></i>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </content>
</template>

<script>
import * as URL from '../../../api'
import * as utils from '../../../common/utils'

export default {
  props: {
    getDataFromComponent: { type: Function, required: true },
    state: { type: String, required: true },
    packageInfo: { type: Object, default: null, required: true }
  },
  data() {
    return {
      fileSelectedData: [], //用于保存上传文件弹出框中被选中的行
      fileTableData: [], //用于保存上传文件弹出框中已上传文件列表信息
      dzDialogShow: false, //用于控制文件上传弹框显示
      paperChecked: false, //用于标识是否检验文件上传
      dzId: null, //记录被操作的电子的行的id
      dzPaperId: null, //记录点击行的paperId
      //该对象用于记录材料的相关统计信息
      dataCount: {
        all: 0,
        zz: 0,
        dz: 0,
        rq: 0,
        brq: 0
      },
      active_icon: 'active-icon', //用于标识材料中的图标样式
      diabled_icon: 'diabled-icon',
      cursor_pointer: 'cursor-pointer',
      zzAllSelected: null,
      //用以保存已上传材料的列表
      paperUploadList: [],
      newPaperUploadList: [], //用于保存新添加的所有上传文件列表
      inputIsReadOnly: false, //输入材料只读
      paperName: '' //记录选中材料的名称
    }
  },
  computed: {
    //判断材料的类型是否为输出材料
    isOutput() {
      return ['WAITFINISH', 'CURRENCY'].indexOf(this.state) != -1
    },
    //返回材料列表
    paperTableData() {
      if (!this.packageInfo) {
        return []
      }
      //根据状态确定显示输入材料还是输出材料
      let name =
        this.isOutput || this.state == 'FINISH'
          ? ['matterPaperList', 'outPutMatterPaperList']
          : ['matterPaperList']
      let matterPaperList = []
      name.forEach(nameValue => {
        let tempMatterPaperList = this.packageInfo[nameValue]
        if (tempMatterPaperList && tempMatterPaperList.constructor == Array) {
          tempMatterPaperList.forEach(value => {
            matterPaperList.push({
              id: value.id,
              paperId: value.paperId,
              clsq: null,
              name: value.name,
              dz:
                ['ELECTRONIC', 'ALL'].indexOf(value.originalType) != -1 ||
                ['PAPER', 'ALL'].indexOf(value.originalType) == -1
                  ? true
                  : false,
              dzUpload: false,
              zz:
                ['PAPER', 'ALL'].indexOf(value.originalType) != -1
                  ? true
                  : false,
              zzUpload: false,
              pz: null,
              sfrq: ['REQUIRED'].indexOf(value.uploadRule) ? '容缺' : '不容缺',
              bz: value.contentStandard,
              type: nameValue == 'matterPaperList' ? '输入材料' : '输出材料'
            })
          })
        }
      })
      return matterPaperList
    },
    //返回上传文件路径
    paperUploadUrl() {
      return URL.paperupload
    },
    //判断是否可以执行后台删除
    isNeedDelete() {
      var processFormInfo = this.getDataFromComponent('processFormInfo')
      return processFormInfo.id == null ? false : true
    },
    //判断是否只读状态
    isReadOnly() {
      return (
        ['CONNECTOR', 'ACCEPT', 'SUPPLEMENT', 'PRETRIAL'].indexOf(
          this.currentProcessState
        ) == -1
      )
    },
    //从父组件获取流程状态
    currentProcessState() {
      return this.getDataFromComponent('currentProcess').state
    }
  },
  methods: {
    //文件上传删除按钮被点击
    deleteBtnClick() {
      var indexs = [] //用来记录要删除的下标
      var ids = [] //用来记录要删除的id
      var uploadIds = [] //用来记录要删除的上传文件id
      var that = this
      var deleteSuccess = true //用来控制是否执行前端删除，若后端删除失败，则不执行前端删除

      if (this.fileSelectedData.length == 0) {
        this.$message({
          type: 'warning',
          message: '请选择需要删除的文件！'
        })
        return
      }

      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.fileSelectedData.forEach(value => {
            this.fileTableData.forEach(value1 => {
              if (value1 == value) {
                indexs.push(value)
                if (!!value.id) {
                  ids.push(value.id)
                }
                if (!!value.uploadId) {
                  uploadIds.push(value.uploadId)
                }
              }
            })
          })

          //如果已经接件，则还要实现后台删除
          if (!!this.isNeedDelete && ids.length > 0) {
            utils.consoleLog({ message: '打印要被删除的文件id', content: ids })
            that.$http
              .get(URL.deleteuploadflie + ids.join(','))
              .then(rs => {
                utils.consoleLog({ message: '打印后台删除结果', content: rs })
                if (rs.data.success) {
                  //从已上传的列表中移除已删除的文件
                  ids.forEach(id => {
                    this.paperUploadList.forEach((paperUpLoad, index, arr) => {
                      if (paperUpLoad.id == id) {
                        console.log('后台删除文件', arr[index])
                        arr.splice(index, 1)
                      }
                    })
                  })
                  that.$message({
                    type: 'success',
                    message: '删除成功!'
                  })
                } else {
                  that.$message.error('后台删除失败！')
                  deleteSuccess = false
                }
              })
              .catch(error => {
                utils.consoleLog({
                  message: '打印后台删除结果的错误信息',
                  content: error
                })
                that.$message.error('后台删除失败！')
                deleteSuccess = false
              })
          }

          //前端页面删除
          if (deleteSuccess) {
            //页面上删除
            indexs.forEach(value => {
              this.fileTableData.removeByValue(value)
            })
            //删除新增的列表
            uploadIds.forEach(uploadId => {
              this.newPaperUploadList.forEach((paperUpload, index, array) => {
                if (paperUpload.uploadId == uploadId) {
                  array.splice(index, 1)
                }
              })
            })
          }
        })
        .catch(error => {
          that.$message({
            type: 'error',
            message: '删除失败！'
          })
        })
    },
    //下载文件
    paperDownload(e) {
      var paperId = $(e.target).attr('data-id')
      location.href = URL.paperdownload + '?id=' + paperId
    },
    //多选框被选中
    selectionChange(selection) {
      this.fileSelectedData = selection
    },
    //文件上传成功
    onSuccess(response, file) {
      var that = this
      var paperId = this.dzId
      let realPaperId = this.dzPaperId
      let paperName = this.paperName
      if (response.code == '200' && response.success) {
        if (!!response.content && response.content.length > 0) {
          var tempInfo = response.content[0]
          //更新当前文件上传列表
          this.fileTableData.push({
            uploadId: tempInfo.id,
            selected: false,
            name: tempInfo.name,
            time: tempInfo.createdAt,
            look: true
          })
          //更新新增上传文件列表
          this.newPaperUploadList.push({
            matterPaperId: paperId, //材料id
            paperId: realPaperId,
            // name: null,//材料名称
            fileName: tempInfo.name, //文件名称
            uploadId: tempInfo.id, //文件id
            uploadDate: tempInfo.createdAt, //上传时间
            isUpload: true,
            originalType: 'ELECTRONIC',
            name: paperName //材料名称
          })
          that.$message({
            type: 'success',
            message: '文件【' + tempInfo.name + '】上传成功！'
          })
        }
      } else {
        that.$message({
          type: 'warning',
          message: '文件【' + file.name + '】上传失败！'
        })
      }
    },
    //清楚文件列表信息
    clearData() {
      this.newPaperUploadList = []
      this.paperTableData = []
      this.paperUploadList = []
      this.paperChecked = false
    },
    //更新图表的状态
    updateIconState() {
      var that = this
      $.each(that.paperTableData, (index, paperInfo) => {
        $.each(that.paperUploadList, (index2, paperUpload) => {
          if (
            paperInfo.id == paperUpload.matterPaperId &&
            paperUpload.originalType == 'ELECTRONIC'
          ) {
            paperInfo.dzUpload = true
            paperInfo.clsq = true
          } else if (
            paperInfo.id == paperUpload.matterPaperId &&
            paperUpload.originalType == 'PAPER'
          ) {
            paperInfo.zzUpload = true
            paperInfo.clsq = true
          }
        })
      })
    },
    //电子图标被点击，更新弹出框中已上传列表的显示
    dzSelected(row) {
      var id = row.id
      this.dzDialogShow = true //显示上传材料弹出框
      var tempArray = []
      //从已上传的所有列表中，找到当前选中的材料的上传文件列表
      this.paperUploadList.forEach(value => {
        if (value.matterPaperId == id) {
          tempArray.push({
            uploadId: value.uploadId,
            name: value.fileName,
            time: value.uploadDate,
            look: true,
            id: !!value.id ? value.id : null
          })
        }
      })
      //从新增的上传文件列表，找到当前选中的材料的上传文件列表
      this.newPaperUploadList.forEach(value => {
        if (value.matterPaperId == id && value.originalType == 'ELECTRONIC') {
          tempArray.push({
            uploadId: value.uploadId,
            name: value.fileName,
            time: value.uploadDate,
            look: true,
            id: !!value.id ? value.id : null
          })
        }
      })

      //改变展示的已上传文件
      this.fileTableData = tempArray
      utils.consoleLog({
        message: '打印弹出框中已上传文件列表',
        content: tempArray
      })
      this.inputIsReadOnly = row.type == '输入材料' && this.isOutput
      this.dzId = id
      this.dzPaperId = row.paperId
      this.paperName = row.name
    },
    //用于更新统计数据
    updateDataCount() {
      var dataCount = this.dataCount
      for (var o in dataCount) {
        dataCount[o] = 0
      }
      $.each(this.paperTableData, function(index, value) {
        if (value.clsq) {
          dataCount.all++
          if (value.zz) {
            dataCount.zz++
          }
          if (value.dz) {
            dataCount.dz++
          }
        }
        if (value.sfrq == '容缺') {
          dataCount.rq++
        } else {
          dataCount.brq++
        }
      })
    },
    //删除纸质图标高亮状态
    deleteZzState(paperId) {
      var processBaseInfo = this.getDataFromComponent('processBaseInfo')
      this.$http
        .get(
          URL.deleteall +
            '?processId=' +
            processBaseInfo.id +
            '&paperId=' +
            paperId
        )
        .then(rs => {
          utils.consoleLog({ message: '打印删除纸质图标状态结果', content: rs })
          if (rs.data.success) {
            var tempArray1 = [],
              tempArray2 = []
            this.paperUploadList.forEach((value, index) => {
              if (value.matterPaperId == paperId) {
                tempArray1.push(value)
              }
            })
            this.newPaperUploadList.forEach((value, index) => {
              if (value.matterPaperId == paperId) {
                tempArray2.push(value)
              }
            })

            tempArray1.forEach(value => {
              this.paperUploadList.removeByValue(value)
            })
            tempArray2.forEach(value => {
              this.paperUploadList.removeByValue(value)
            })
          }
        })
    },
    //纸质图标被选中
    zzSelected(row) {
      if (this.isReadOnly) {
        return
      }

      var $this = this
      var id = $(row.target).attr('data-id')
      var isAll = true //用于标识是否所有的材料都被选中
      $.each(this.paperTableData, function(index, value) {
        if (value.id == id) {
          if (value.zzUpload) {
            value.zzUpload = false
            value.clsq = false
            $this.deleteZzState(id) //后台删除状态
          } else {
            value.zzUpload = true
            value.clsq = true
            //向已上传文件列表添加这个材料的记录
            $this.newPaperUploadList.push({
              matterPaperId: id,
              isUpload: true,
              originalType: 'PAPER'
            })
          }
        }

        //判断当前纸质是否被选中
        if (value.zz && value.zzUpload == false) {
          isAll = false
        }
      })

      if (!isAll) {
        if (this.zzAllSelected != '') {
          this.zzAllSelected = null
        }
      } else {
        this.zzAllSelected = true
      }
      this.updateDataCount() //更新统计信息
    },
    //更新电子图标的状态
    updateDz() {
      this.dzDialogShow = false //隐藏操作栏
      let fileTableData = this.fileTableData.slice(0)
      var dzId = this.dzId
      var isChange = false //用于标识是否有更改

      //判断当前是否有上传文件没有
      $.each(this.paperTableData, function(index, value) {
        if (dzId == value.id) {
          if (fileTableData.length > 0 && !value.dzUpload) {
            value.dzUpload = true
            value.clsq = true
            isChange = true
          } else if (fileTableData.length == 0 && value.dzUpload) {
            value.dzUpload = false
            value.clsq = false
            isChange = true
          }
        }
      })

      if (isChange) {
        this.updateDataCount() //更新统计信息
      }
    },
    //验证材料是否上传
    validateBaseInfo() {
      var paperTableData = this.paperTableData
      var that = this
      var fileNotUploadCount = 0 //用于记录未提交材料的数量

      //判断材料是否上传
      this.paperChecked = true //用于显示材料未标记的警告
      $.each(paperTableData, function(index, value) {
        if (!value.clsq) {
          fileNotUploadCount++
        }
      })
      if (fileNotUploadCount > 0) {
        this.$confirm('有' + fileNotUploadCount + '份材料未提交！！', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        })
        return false
      }

      return true
    }
  },
  mounted() {},
  watch: {
    //监听纸质全选按钮对应的数据
    zzAllSelected: function(val) {
      if (val == null) {
        return
      }
      $.each(this.paperTableData, function(index, value) {
        if (value.zz && val == '') {
          value.zzUpload = false
          value.clsq = false
        } else if (value.zz && val != '') {
          value.zzUpload = true
          value.clsq = true
        }
      })
      this.updateDataCount() //更新统计信息
    },
    //监听已上传文件列表
    paperUploadList: function(val) {
      utils.consoleLog({ message: '监听已上传文件列表', content: val })
      this.updateIconState() //更新图标状态
    },
    paperTableData: function(val) {
      utils.consoleLog({ message: '监听展示文件列表', content: val })
      this.updateIconState() //更新图标状态
    }
  }
}
</script>

<style scoped>
.active-icon {
  color: #f96d41;
}

.cursor-pointer {
  cursor: pointer;
}

.diabled-icon {
  cursor: not-allowed;
}
</style>
