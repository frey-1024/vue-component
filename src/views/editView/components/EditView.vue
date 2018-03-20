<template>
  <div class="e-edit">
    <ul class="e-edit-utils">
      <li v-for="item in utils">
        <a :class="{ 'active': item.active }" @click.stop="selectUtil(item)" @mousedown.stop="fn" href="javascript:;">
          <span v-if="item.activeMenu" v-text="item.activeMenu.name"></span> <i :class="`icon icon-${item.name}`"></i>
        </a>
        <span class="e-edit-utils-separator" v-if="item.separator">|</span>
        <menu-list v-if="item.menus && item.menus.length" v-show="item.show" :menu-list.sync="item.menus" :menu-style="item.style" @update="updateMenu($event, item)"></menu-list>
      </li>
    </ul>
    <div class="e-edit-content" contenteditable ref="contenteditable" @mousedown="mouseDown" @mouseup="mouseUp" @keyup="testContent">
      <div>&#8203;<br></div>
    </div>
  </div>
</template>
<script>
  // 工具栏原始数据
  import iconsData from '../utils/icons';
  import { removeAllRanges, getStatusByRange } from '../utils/selection';

  export default {
    props: {
      // 工具栏显示内容
      utilList: {
        type: Array,
        default: [],
      },
    },
    data() {
      return {
        utils: [],
        showMenu: false,
      };
    },
    computed: {
    },
    created() {
      this.initUtils();
    },
    mounted() {
      this.watchListens();
    },
    methods: {
      fn() {},
      watchListens() {
        window.addEventListener('mousedown', this.mouseDown, false);
      },
      mouseDown(ev) {
        console.log(ev);
        // 阻止冒泡
        ev.stopPropagation();
        // 将所有的区域都从选区中移除。
        removeAllRanges();
      },
      mouseUp(ev) {
        // 阻止冒泡
        ev.stopPropagation();
        this.resetUtilsStatus();
        getStatusByRange(this.utils);
      },
      /**
       * 重置工具栏状态
       */
      resetUtilsStatus() {
        this.utils.forEach((util) => {
          if (!util.inactive) {
            util.active = false;
          }
        });
      },
      /**
       * 初始化工具栏数据
       */
      initUtils() {
        let utils;
        // 使用原始数据
        if (!this.utilList || !this.utilList.length) {
          utils = iconsData;
        } else {
          // 当用户选择性显示某些工具时，覆盖原始数据
          utils = this.utilList.map(item => Object.assign({}, iconsData.find(data => item.name === data.name), item));
        }
        // 重新组装工具栏带有menus属性的下拉数据
        this.utils = utils.map((item) => {
          if (item.menus && item.menus.length) {
            // 默认选中的menu对象
            item.activeMenu = item.menus.find(menu => menu.active);
            item.show = false;
          }
          return item;
        });
      },
      /**
       * 选择工具栏选项，并让选择的高亮/回复正常
       * @param item
       */
      selectUtil(item) {
        if (item.menus && item.menus.length) {
          item.show = !item.show;
          return;
        }
        console.log(document.getSelection());
        // 当是活跃的工具（可选中）的元素时，才设置状态
        if (!item.inactive) {
          item.active = !item.active;
        }
        if (item.name === 'lineheight') {
          document.execCommand('insertHTML', false, `<span class="own-class">${document.getSelection()}</span>`);
        } else {
          document.execCommand(item.name, false, null);
        }
      },
      testContent(ev) {
        if (!ev.target.innerHTML) {
          ev.target.innerHTML = '<div>&#8203;<br></div>';
        }
      },
      updateMenu(activeMenu, util) {
        util.show = false;
        util.activeMenu = activeMenu;
//        if (util.name === 'lineheight') {
        const el = this.$refs.contenteditable;
        const selection = document.getSelection();
        Array.from(el.childNodes, (child) => {
          // 判断选择的节点是否在选择区域内，如果在，就设置该节点的样式
          if (selection.containsNode(child, true)) {
            child.style.lineHeight = activeMenu.val;
          }
          return child;
        });
//          const range = selection.getRangeAt(0);
//          console.log(range.commonAncestorContainer, 'range.commonAncestorContainer');
//          console.log(range.collapsed, 'bb');
//          console.log(range.startContainer, 'range.startContainer');
//          console.log(range.endContainer, 'range.endContainer');
//          console.log(range.cloneContents(), 'bb');
//          console.log(selection.anchorNode, 'selection');
//          const col = range.cloneContents();
//          console.log(col.children, 'children');
//          console.log(col.childNodes, 'childNodes');
//          if (range.endContainer) {
//            col.childNodes[col.childNodes.length - 1]
//          }
//          Array.from(col.childNodes, (child, i) => {
//            console.log(i, 'i');
//            if (!child.firstChild) {
//           console.log(child.parentNode.style.lineHeight = 1.5, 'parentNode');
//              const oSpan = document.createElement('span');
//              oSpan.style.lineHeight = activeMenu.val;
//              oSpan.appendChild(child);
//              console.log(oSpan);
//              console.log(col.childNodes[i], 'col.childNodes[i + 1]');
//              col.insertBefore(oSpan, col.childNodes[i]);
//            node.childNodes[i].parentNode.removeChild(node.childNodes[i]);
//            col.removeChild(child);
//              return child;
//            }
//            if (range.endContainer) {
//
//            }
//            const firstChild = child.firstChild.cloneNode(true);
//            child.removeChild(child.firstChild);
//            const oSpan = document.createElement('span');
//            oSpan.style.lineHeight = activeMenu.val;
//            oSpan.appendChild(firstChild);
//            child.appendChild(oSpan);
//            return child;
//          });
//          console.log(col.length);
//          const oSpan = document.createElement('span');
//          oSpan.style.lineHeight = activeMenu.val;
//          oSpan.appendChild(col);
//          range.deleteContents();
//          range.insertNode(col);
//          const aa = document.execCommand('insertHTML', false, col);
//          console.log(aa);
//        }
      }
    },
    components: {
      MenuList: () => import('./Menu.vue'),
    },
    watch: {
      utils: (newVal) => {
        console.log(newVal);
      }
    }
  };
</script>
<style lang="scss">
  @import "../../../static/styles/basic";
  @import "../../../static/styles/borderBox";
  @import "../icons";
  .e-edit{
    &-utils{
      background-color: #F0F0EE;
      border-bottom: 1px solid #CCC;
      padding: 4px 10px;
      font-size: 0;
      display: flex;
      justify-content: left;
      align-items: center;
      flex-wrap: wrap;
      & > li{
        position: relative;
        display: flex;
        justify-content: left;
        align-items: center;
        margin-right: 4px;
        & > a{
          padding: 1px;
          &.active, &:hover{
            border: 1px solid #5690D2;
            background-color: #E9EFF6;
            padding: 0;
          }
        }
      }
      // 功能分隔线
      &-separator{
        font-size: 0;
        display: inline-block;
        height: 16px;
        width: 0;
        border-left: 1px solid #A0A0A0;
        border-right: 1px solid #FFFFFF;
        margin-left: 4px;
      }
    }
    &-content{
      word-wrap:break-word;
      word-break:break-all;
      overflow: auto;
      resize: vertical;
      height: 300px;
      border: 1px solid #CCC;
      width: 100%;
      padding: 10px;
    }
  }
  .own-class{
    background-color: red;
  }
</style>
