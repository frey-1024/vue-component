<template>
  <div class="toast-wrapper" v-if="open" :class="{'toast-top':position === 'top','toast-center':position === 'center','toast-bottom':position === 'bottom'}">
    <div class="content">{{tip}}</div>
  </div>
</template>
<style lang="scss" scoped>
  *{
    box-sizing: border-box;
  }
  .toast-wrapper{
    position: fixed;
    left:0;
    width: 100%;
    z-index: 99999;
    text-align: center;
    .content{
      background-color: rgba(0, 0, 0, .6);
      max-width: 80%;
      display: inline-block;
      color: #FFF;
      padding: 6px 15px;
      border-radius: 4px;
    }
  }
  .toast-top{
    top: 15%;
  }
  .toast-center{
    top: 45%;
  }
  .toast-bottom{
    bottom: 15%;
  }
</style>
<script>
  let timer = null;

  export default{
    data() {
      return {
        open: false,
        tip: '',
        position: 'bottom',
        expires: 0,
      };
    },
    methods: {
      close() {
        this.open = false;
      },
      openModel(data) {
        this.open = true;
        this.tip = data.tip;
        this.position = data.position || 'bottom';
        this.expires = data.expires || 2500;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          this.open = false;
          this.tip = null;
        }, this.expires);
      },
    }
  };
</script>
