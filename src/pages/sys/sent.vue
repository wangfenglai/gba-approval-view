<template>
  <div class="sent">
    <div class="boxs-header">
      <p class="boxs-title">发送箱</p>
      <div class="boxs-search" style="text-align: right;width: 350px;">
        <el-switch
          v-model="value"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="所有人发送"
          inactive-text="单人发送">
        </el-switch>
        <el-button size="small" type="primary"  @click="send('ruleForm')">发送 <i class="fa fa-send"></i></el-button>
      </div>
    </div>
    <div>
    <el-form ref="ruleForm" :model="form" label-width="80px" :rules="rules" :inline-message="inlineMessage">
      <div class="sent-header">
        <el-form-item label="发送给" style="margin-bottom: 0px; border-bottom: 1px solid #ebebeb;" v-if="!value" prop="region">
          <el-select v-model="form.region" filterable size="small" placeholder="请选择收件人" style="width:98%;border:none;outline: none;">
            <el-option
              v-for="item in options"
              :key="item.account"
              :label="item.name"
              :value="item.account">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发送给" style="margin-bottom: 0px;border-bottom: 1px solid #ebebeb;" v-else>
          <el-input v-model="form.sender" size="small" style="width: 98%;border:none;outline: none;" disabled></el-input>
        </el-form-item>
        <el-form-item label="标题" style="margin-bottom: 0px;">
          <el-input v-model.trim="form.subject" size="small" style="width: 98%;border:none;outline: none;"></el-input>
        </el-form-item>
       </div>
        <el-form-item prop="textarea" label-width="0">
          <div class="sent-article">
          <el-input
            type="textarea"
            id="sent-textarea"
            placeholder="请输入内容"
            resize="none"
            v-model.trim="form.textarea">
          </el-input>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
  title="提示"
  :visible.sync="centerDialogVisible"
  width="30%"
  center>
  <p style="text-align:center;">消息发送成功！</p>
  <span slot="footer" class="dialog-footer">
    <el-button @click="goInbox">回收件箱</el-button>
    <el-button type="primary" @click="centerDialogVisible = false">继续发送</el-button>
  </span>
</el-dialog>
  </div>


</template>
<script>
import Stomp from "stompjs";
import panel from "../../components/panel.vue";
import treeter from "../../components/treeter";
import merge from "element-ui/lib/utils/merge";
import * as sysApi from "../../services/sys";
import qs from "qs";
import * as api from "../../api";
import * as utils from "../../common/utils";
import { mapGetters, mapActions, mapMutations } from "vuex";
import types from "../../store/mutation-types";
export default {
  mixins: [treeter],
  components: {},
  data() {
    return {
      inlineMessage:true,
      form: {
        subject: "",
        region: "",
        sender: "@所有人",
        textarea: ""
      },
      options: [],
      value: false,
      client: null,
      rules: {
        region:[{ required: true, message: ' ', trigger: "change" }],
        textarea: [
          { required: true, message: "请输入内容...", trigger: "blur" },
          { max: 1000, message: "内容超长，应少于1000字...", trigger: "change" }
        ]
      },
      centerDialogVisible: false
    };
  },
  computed: {
    ...mapGetters(["sentId", "websoket"])
  },
  methods: {
    ...mapMutations({
      setSenderId: types.SET_SENDERID
    }),
    send(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let agentData = this.form.textarea==null||this.form.textarea==''?'无内容':this.form.textarea;
          let title = this.form.subject==null||this.form.subject==''?'无主题':this.form.subject;
          let msg = title+'@@@@@@'+agentData;
          if (this.value) {
            this.client.send("/socket/spread", {}, msg);
            this.centerDialogVisible = true;
            this.form.textarea = "";
          } else {
            let acount = this.form.region;
            let obj = { account: acount, message: msg };
            this.client.send("/socket/single", {}, JSON.stringify(obj));
            this.centerDialogVisible = true;
            this.form.textarea = "";
          }
        } else {
          return false;
        }
      });
    },
    loadData() {
      this.$http
        .get(api.SYS_USER_PAGE_ALL)
        .then(res => {
          let dataList = res.data.content;
          this.options = dataList;
        })
        .catch(e => {
          this.$message("操作失败");
        });
    },
    goInbox() {
      this.$router.push({ path: "/sys/chatting/inbox" });
    }
  },
  created() {
    this.loadData();
    this.value = this.sentId;
    this.form.region = this.$route.query["account"];
  },
  mounted() {
    this.client = Stomp.over(this.websoket);
    console.log("sssssssssssssssssssssssssssssssssss", this.websoket);
  },
  watch: {
    value: function(index) {
      this.setSenderId(index);
    }
  }
};
</script>

<style>
.boxs-header {
  width: 100%;
  height: 70px;
  padding: 20px;
}
.sent-header {
  width: 100%;
  height: 101px;
  padding: 10px;
  border-top: 1px solid #ebebeb;
  border-bottom: 1px solid #ebebeb;
}
.boxs-title {
  font-size: 20px;
  float: left;
}
.boxs-search {
  float: right;
  width: 300px;
}
.sent-article {
  position: relative;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 20px;
}
#sent-textarea {
  width: 100%;
  height: 300px;
}
</style>
