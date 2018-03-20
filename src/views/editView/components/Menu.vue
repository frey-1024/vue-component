<template>
  <ul class="menu-list" :style="menuStyle">
    <li v-for="item in menus">
      <a @click="selectItem(item)" @mousedown.stop="fn" href="javascript:;" :class="{'active': item.active}">
        <i class="icon icon-checked"></i>
        <span v-text="item.name"></span>
      </a>
    </li>
  </ul>
</template>
<script>
  export default {
    props: {
      menuStyle: {
        type: Object,
        required: true,
      },
      menuList: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        menus: this.menuList,
      };
    },
    computed: {
    },
    methods: {
      fn() {},
      selectItem(item) {
        this.menus.forEach((menu) => {
          menu.active = false;
        });
        item.active = true;
        this.$emit('update:menu-list', this.menus);
        this.$emit('update', item);
      },
    }
  };
</script>
<style lang="scss">
  .menu-list{
    position: absolute;
    overflow: auto;
    border: 1px solid #ccc;
    & > li{
      & > a{
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 4px 8px;
        color: inherit;
        &:hover, &.active{
          background-color: #00bcd4;
          color: #FFF;
        }
        &.active{
          .icon-checked{
            visibility: visible;
          }
        }
      }
      .icon-checked{
        margin-right: 5px;
        visibility: hidden;
      }
    }
  }
</style>
