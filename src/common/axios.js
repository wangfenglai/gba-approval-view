import axios from "axios";
import qs from "qs";
import router from "../router/index"
import {MessageBox, Loading} from 'element-ui'
import vue from 'vue'
import * as utils from './utils'
// axios 配置
axios.defaults.timeout = 20000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest';
let options = {
  lock: true,
  text: '正在加载...',
  background: 'rgba(0, 0, 0, 0.5)',
}
let loadinstanse = {};
let requestURL = [];//用于记录请求的列表
let requestCount = 0;//请求数量
let errorMsg = new Set();//错误信息
let isShowError = true;
//y用于关闭loading
let closeLoadinStance = (url) => {
  vue.prototype.$nextTick(() => {
    requestURL.forEach((value, index, array) => {
      if (url && -1 != url.indexOf(value)) {
        array.splice(index, 1);
      }
    });
    setTimeout(() => {
      if (requestURL.length == 0 || requestCount == 0) {
        loadinstanse.close();
      }
    }, 200);
  });
};
//显示错误信息
let showErrorMsg = () => {
  if (errorMsg.size == 0) {
    return
  }
  let msg = '出现如下错误信息：\n <ul>';
  errorMsg.forEach((value) => {
    msg += '<li style="list-style-type: none;">'+value+'</li> ';
  })
  msg+='</ul>';

  setTimeout(() => {
    if (requestCount == 0) {
      isShowError && MessageBox({type: "error", message: msg, title: "温馨提示",dangerouslyUseHTMLString:true});
      errorMsg = new Set();//清空错误信息
      isShowError = true;
    }
  }, 300);

};
//POST传参序列化
axios.interceptors.request.use((config) => {
  config.data = utils.parseJsonToFormData(config.data);
  config.data = qs.stringify(config.data);
  requestURL.push(config.url);
  requestCount += 1;
  loadinstanse = Loading.service(options);
  return config;
}, (error) => {
  return Promise.reject(error);
});

//返回状态判断
axios.interceptors.response.use(
  response => {
    requestCount -= 1;
    requestCount == 0 && showErrorMsg();
    //关闭loading
    closeLoadinStance(response.request.responseURL);
    return response;
  },
  error => {
    requestCount -= 1;
    //关闭loading
    try {
      closeLoadinStance(error.response.request.responseURL);
    } catch (e) {
      setTimeout(() => {
        requestCount == 0 && loadinstanse.close()
      }, 300);
    }
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 这里写清除token的代码
          isShowError = false;
          loadinstanse.close();
          router.push('/login');
          break;
        case 500:
          errorMsg.add('系统网络故障，请稍后再试，或与管理员联系');
          requestCount == 0 && showErrorMsg();
          break;
        case 403:
          errorMsg.add('登录但无权访问，提示无权访问');
          requestCount == 0 && showErrorMsg();
          break;
      }
    } else {
      errorMsg.add('系统网络故障，请稍后再试，或与管理员联系');
      requestCount == 0 && showErrorMsg();
    }
    try {
      console.log(error.response.data);
    } catch (error) {
      console.log(error);
    }
    return Promise.reject(error)
  });


export default axios
