<template>

  <aside class="main-sidebar animated showSlide expandSide" :class="{out: !isCollapse,in: isCollapse}"
         :style="{background: skin}">

    <div id="aside-top" :class="{isOut: !isCollapse,isIn: isCollapse}" :style="{background: skin}">
      <i class="fa fa-outdent" v-if="!isCollapse" @click="toggle"></i>
      <i class="fa fa-indent" v-else @click="toggle"></i>
      <transition enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
        <el-input placeholder="输入菜单..." v-model.trim="searchKey" @input="search($event)"
                  size="mini" suffix-icon="el-icon-search" style="width: 165px;" v-show="!isCollapse">
        </el-input>
        <!--   <el-select v-model="searchKey" filterable placeholder="输入菜单..." size="mini" v-show="!isCollapse" style="width: 130px;"
                      @keyup.enter="search($event)">
             <el-option
               v-for="item in lists"
               :key="item.href"
               :label="item.name"
               :value="item.href">
             </el-option>

           </el-select>-->

      </transition>
    </div>
    <el-scrollbar tag="div" wrapClass="vue-scrollbar" :style="{background: skin}">
      <div class="sidebar">
        <el-menu
          :default-active="onRoutes"
          :default-openeds="onRouteKeys"
          :collapse="isCollapse"
          class="el-menu-style"
          @open="handleOpen"
          @close="handleClose"
          unique-opened
          :background-color="skin"
          :text-color="textSkin"
          router
          :active-text-color="activeSkin">
          <template v-for="item in currentMenuList">
            <el-submenu :index="item.href" v-if="item.children && item.children.length>0">
              <template slot="title"><i :class="item.icon"></i><span>{{item.name}}</span></template>
              <template v-for="child in item.children">
                <sub-menu v-if="child.children && child.children.length>0" :param="child"></sub-menu>
                <el-menu-item :index="child.href" v-else><i :class="child.icon"></i><span>{{child.name}}</span>
                </el-menu-item>
              </template>
            </el-submenu>
            <el-menu-item :index="item.href" v-else><i :class="item.icon"></i><span>{{item.name}}</span></el-menu-item>
          </template>
        </el-menu>
      </div>
    </el-scrollbar>
  </aside>
</template>

<script>
  import * as api from "../../api"
  import * as sysApi from '../../services/sys'
  import subMenu from "./subMenu.vue"
  import {mapGetters, mapActions, mapMutations} from 'vuex'
  import types from '../../store/mutation-types'
  import treeter from "../../components/treeter"

  export default {
    name: 'diyAside',
    mixins: [treeter],
    props: {
      show: Boolean,

    },
    data() {
      return {
        isCollapse: false,
        searchKey: "",
        backTheme: ["#fff", "#222222", "#522b76", "#31271e", "#981b1b", "#00a651", "#e8b51b", "#003471"],
        textColor: ["#000", "#909399", "#909399", "#909399", "#999", "#fff", "#fff", "#999"],
        activeColor: ["#409EFF", "#fff", "#fff", "#fff", "#fff", "#000", "#000", "#fff"],
        skin: "#fff",
        textSkin: "#000",
        activeSkin: "#409EFF",
        lists: [],
        tempMenuList: []//临时保存查询的菜单列表
      }
    }, components: {
      subMenu,
    }, computed: {
      //当前菜单列表,包含所有的菜单或者查询到的菜单
      currentMenuList() {
        return this.tempMenuList.length > 0 ? this.tempMenuList : this.menuList;
      },
      onRoutes() {
        return this.tempMenuList.length > 0 || this.$route.path ? this.$route.path : this.$route.path;
      },
      onRouteKeys() {
        const getParentArray = (path, ms, kas = []) => {
          if (ms && ms.length > 0) {
            for (var k = 0, length = ms.length; k < length; k++) {
              if (path == ms[k].href) {
                kas.push(ms[k].href);
                break;
              }
              var i = kas.length;
              if (ms[k].children && ms[k].children.length > 0) {
                getParentArray(path, ms[k].children, kas);
              }
              if (i < kas.length) {
                kas.push(ms[k].href);
              }
            }
          }

          return kas.reverse();
        }

        //菜单筛选后的默认展开
        let filterArray = [];
        this.tempMenuList.forEach((value) => {
          if ((null != value.children && value.children.length > 0) || !!value['selected']) {
            filterArray.push(value.href);
          }
        });

        return this.tempMenuList.length == 0 ? getParentArray(this.$route.path, this.menuList) : filterArray;
      },
      // 使用对象展开运算符将 getters 混入 computed 对象中
      ...mapGetters([
        'menuList',
        'indexskin'
      ])
    }, created: function () {
      this.load();
    }, methods: {
      ...mapMutations({
        setCollapse: types.SET_COLLAPSE
      }),
      //遍历所有菜单，记录匹配的菜单项
      getQueryIds(array, menus) {
        array.forEach((value) => {
          if ("" !== this.searchKey && value.name.indexOf(this.searchKey) != -1) {
            menus.push(value);
          }
          if (null != value.children && value.children.length > 0) {
            this.getQueryIds(value.children, menus);
          }
        });
      },
      //用于递归复制所有菜单
      copyMenu(array, obj) {
        array.forEach((value) => {
          let temp = {};//用于复制对象
          for (var o in value) {
            if (o == 'children' || o == 'childrens') {
              continue;
            }
            temp[o] = value[o];
          }
          temp.children = null;
          obj[value.id] = temp;

          if (null != value.children && value.children.length > 0) {
            this.copyMenu(value.children, obj);
          }
        });
      },
      search(target) {
        if (this.searchKey == '') {
          this.tempMenuList = [];
          return;
        }

        //记录
        var menus = [];//记录符合条件的菜单
        //在本身菜单中查找跟输入值匹配的菜单
        this.getQueryIds(this.menuList.slice(0), menus);
        //记录当前所有的菜单项
        var obj = {};
        this.copyMenu(this.menuList.slice(0), obj);
        //记录数组的菜单项
        menus.forEach((value) => {
          if (null != value.parentId) {
            var parent = obj[value.parentId];
            if (null == parent.children) {
              parent.children = [];
            }
            //判断父节点中是否存在当前节点
            let isNotAdd = parent.children.some((child) => {
              if (child.id == value.id) {
                return true;
              }
            })

            if (!isNotAdd) {
              parent.children.push(value);
            }
          } else {
            //因为这是一个父节点，不能单独作为菜单，必须加上子菜单
            obj[value.id]['selected'] = true;
            this.menuList.forEach((menu) => {
              if (menu.id == value.id) {
                obj[value.id].children = menu.children;
              }
            });
          }
        });
        //查询到的菜单列表
        var menuList = [];
        for (var o in obj) {
          let value = obj[o];
          if ((value.children != null && value.children.length > 0) || (null == value.parentId && !!value['selected'])) {
            menuList.push(value);
          }
        }
        this.tempMenuList = menuList;
      },
      toggle() {
        this.isCollapse = !this.isCollapse;
        this.setCollapse(this.isCollapse);
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      ...mapActions({
        load: 'loadMenuList' // 映射 this.load() 为 this.$store.dispatch('loadMenuList')
      })
    },
    mounted() {

      sysApi.menuLists()
        .then(res => {
          if (res && res.length > 0) {
            let list = [];
            this.setMenuLists(res, list);
            this.lists = list;
          }
        })
      let id = this.indexskin;
      let theme = this.backTheme;
      let textTheme = this.textColor;
      let activeTheme = this.activeColor;
      this.skin = theme[id];
      this.textSkin = textTheme[id];
      this.activeSkin = activeTheme[id];

    },
    watch: {
      'indexskin': function (index) {
        let id = this.indexskin;
        let theme = this.backTheme;
        let textTheme = this.textColor;
        let activeTheme = this.activeColor;
        this.skin = theme[id];
        this.textSkin = textTheme[id];
        this.activeSkin = activeTheme[id];
      },
      '$route': function (from, to) {
        console.log("from", from);
        console.log("to", to);
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .showSlide {
    animation-duration: .2s;
    animation-name: slideInLeft;
  }

  .el-menu {
    border-right: none;
  }

  .hideSlide {
    animation-duration: .2s;
    animation-name: slideOutLeft;
  }

  .main-sidebar {
    background-color: #ffffff;
    position: fixed;
    top: 50px;
    left: 0;
    bottom: 0;
    height: calc(100vh - 50px);
    z-index: 810;
    -webkit-transition: -webkit-transform 0.3s ease-in-out, width 0.3s ease-in-out;
    -moz-transition: -moz-transform 0.3s ease-in-out, width 0.3s ease-in-out;
    -o-transition: -o-transform 0.3s ease-in-out, width 0.3s ease-in-out;
    transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
  }

  .out {
    width: 230px;
  }

  .in {
    width: 44px;
  }

  .el-menu-style,
  .el-menu-style .el-menu {
    background-color: #ffffff;
  }

  .el-menu-style .el-menu-item:hover,
  .el-menu-style .el-submenu__title:hover {

  }

  .el-menu-style .el-submenu .el-menu-item {
    height: 45px;
    line-height: 45px;
  }

  .el-menu-style .el-menu-item,
  .el-menu-style .el-submenu__title {
    height: 45px;
    line-height: 45px;
  }

  .main-sidebar .el-menu--collapse {
    width: 44px;
  }

  .main-sidebar .el-menu--collapse > .el-menu-item,
  .main-sidebar .el-menu--collapse > .el-submenu > .el-submenu__title {
    padding-left: 13px !important;
  }

  .vue-scrollbar {
    height: calc(100vh - 50px)
  }

  .main-sidebar .el-scrollbar__bar.is-vertical {
    display: none;
  }

  .sidebar {
    min-height: 450px;
  }

  .el-menu .fa {
    margin-right: 10px;
  }

  #aside-top {
    width: 100%;
    color: rgb(0, 0, 0);
    background-color: rgb(255, 255, 255);
    height: 45px;
    line-height: 45px;
    font-size: 14px;
    cursor: pointer;
    -webkit-transition: border-color .3s, background-color .3s, color .3s;
    transition: border-color .3s, background-color .3s, color .3s;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: relative;
    white-space: nowrap;
    list-style: none;
  }

  .isOut {
    padding: 0 20px;
  }

  .isIn {
    padding: 0 13px;
  }

  #aside-top i {
    margin-right: 10px;
    color: #909399;
  }

  .el-submenu__title i {
    color: #909399;
  }
</style>
