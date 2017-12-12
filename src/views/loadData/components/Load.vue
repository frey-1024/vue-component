<template>
  <div class="scroller-wrapper" :style="getScrollerWrapperStyle" style="border: 1px solid #CCC;">
    <div :style="getScrollerStyle" ref="scroll">
      <!--<slot name="fixed" :style="getFixedStyle"></slot>-->
      <div class="refreshing" :style="getRefreshStyle">
        <div class="refreshing-loader" :class="getRefreshLoadStyle">loading</div>
      </div>
      <slot name="content"></slot>
      <div class="loading">
        <div v-if="!loadCompleted"><i class="data-loader">loading</i> 加载中</div>
        <div v-if="loadCompleted">加载完成</div>
      </div>
    </div>
  </div>
</template>
<script>
  // 是否终止上一次滑动，true 是终止（如何上次还再滑动中，将会停止）
  let isStopLastSlip = true;
  const a = 0.009;

  export default {
    props: {
      // 是否监听刷新 默认是 false
      isRefresh: {
        type: Boolean,
        default: false,
      },
      // 是否监听加载更多 默认是 true
      isLoad: {
        type: Boolean,
        default: true,
      },
      refreshDeviation: {
        type: Number,
        default: 20,
      },
      loadDeviation: {
        type: Number,
        default: 20,
      },
      loadStage: {
        type: String,
        default: 'WILL', // will 默认值，将要开始，Doing 开始加载数据，Did 加载完成并成功，Error 加载失败
      },
      loadCompleted: {
        type: Boolean,
        default: false,
      },
      scrollHeight: {
        type: String,
        default: '100%',
      },
    },
    data() {
      return {
        copyLoadStage: 'WILL',
        finger: {
          startY: 0,
          endY: 0,
          startTime: 0, // 开始滑动时间（单位：毫秒）
          entTime: 0, // 结束滑动时间（单位：毫秒）
          // 移动方向的距离
          moveUpY: 0, // 向上 加载更多
          moveDownY: 0, // 向下，刷新
          cacheMove: 0, // 缓存上次移动的距离
          currentMove: 0,
        }
      };
    },
    computed: {
//      getFixedStyle() {
//        return {
//          transform: `translate3d(0, ${this.finger.moveDownY}px, 0)`,
//        };
//      },
      getScrollerWrapperStyle() {
        return {
          height: this.scrollHeight,
        };
      },
      getScrollerStyle() {
        let transition = '';
        if (!isStopLastSlip) {
          transition = 'transform 300ms cubic-bezier(0.19, 1, 0.22, 1)';
        }
        return {
          transform: `translate3d(0, ${this.finger.moveUpY}px, 0)`,
          transition,
        };
      },
      getRefreshLoadStyle() {
        const loadStage = this.copyLoadStage;
        return {
          will: loadStage === 'WILL',
          doing: loadStage === 'DOING',
          did: loadStage === 'DID',
          error: loadStage === 'ERROR',
        };
      },
      getRefreshStyle() {
        let transition = '';
        if (this.finger.moveDownY <= 0) {
          transition = 'transform 700ms cubic-bezier(0.19, 1, 0.22, 1)';
        }
        return {
          transform: `translate3d(0, ${this.finger.moveDownY}px, 0)`,
          transition,
        };
      },
    },
    mounted() {
      const element = this.$el;
      element.addEventListener('touchstart', this.listenerTouchStart, false);
      element.addEventListener('touchmove', this.listenerTouchMove, false);
      element.addEventListener('touchend', this.listenerTouchEnd, false);
    },
    methods: {
      listenerTouchStart(ev) {
        ev.stopPropagation();
        // 这个如果不加 移动端不会连续执行move,不会执行touchend
        ev.preventDefault();
        if (this.copyLoadStage === 'DOING') {
          return;
        }
        // 终止上次滑动
        isStopLastSlip = true;
        this.finger.startY = ev.targetTouches[0].pageY;
        this.finger.cacheMove = this.finger.currentMove;
        // 记录开始滑动时间戳
        this.finger.startTime = Date.now();
      },
      listenerTouchMove(ev) {
        ev.stopPropagation();
        if (this.copyLoadStage === 'DOING') {
          return;
        }
        let move = (ev.targetTouches[0].pageY - this.finger.startY) + this.finger.cacheMove;
        // 向下，刷新数据。
        if (this.isRefresh && move > 0 && this.finger.cacheMove >= 0) {
          move = move > 120 ? 120 : move;
          // 把 refresh loading 拉下来
          this.finger.moveDownY = move;
          this.finger.moveUpY = 0;
        } else if (this.isLoad && move < 0 && this.finger.cacheMove <= 0) { // 向上, 加载更多。
          if (Math.abs(move) > (this.$refs.scroll.offsetHeight - this.$el.clientHeight) + this.loadDeviation) {
            move = -((this.$refs.scroll.offsetHeight - this.$el.clientHeight) + this.loadDeviation);
          }
          this.finger.moveUpY = move;
          this.finger.moveDownY = 0;
        }
        this.finger.currentMove = move;
      },
      assertHandleType(move) {
        // 向下，刷新数据。
        if (this.isRefresh && move > 0 && this.finger.cacheMove >= 0) {
          return 'refresh';
        }
        if (this.isLoad && move < 0 && this.finger.cacheMove <= 0) { // 向上, 加载更多。
          return 'load';
        }
      },
      /**
       * 重置move down （向下滑动） 的值
       */
      resetMoveDownY() {
        this.finger.moveDownY = 0;
        this.finger.currentMove = 0;
        this.copyLoadStage = 'WILL';
      },
      listenerTouchEnd(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (this.copyLoadStage === 'DOING') {
          return;
        }
        // 向下移动 执行刷新
        if (this.finger.currentMove > 0) {
          if (this.finger.moveDownY > this.refreshDeviation) {
            this.$emit('refresh');
          } else {
            this.resetMoveDownY();
          }
          return;
        }
        if (this.finger.currentMove < 0) {
          this.finger.endY = ev.changedTouches[0].pageY;
          this.finger.endTime = Date.now();
          this.getInertiaDistance();
        }
      },
      /**
       * 求移动速度（v = s / t），判断用户操作快慢，从而得到惯性的滑动距离
       */
      getInertiaDistance() {
        console.log(this.finger.currentMove, 'aaaa');
        // 移动距离
        const s = this.finger.endY - this.finger.startY;
        // 移动时间
        const t = this.finger.endTime - this.finger.startTime;
        // 移动速度
        const v = s / t;
        const absV = Math.abs(v);
        const position = Math.floor(absV / v);
        // 这段时间走的位移 S = vt + 1/2at^2;
        let move = ((position * 0.5 * v * v) / a) + this.finger.currentMove;
        if (move > 0) {
          move = 0;
          this.finger.currentMove = move;
          this.finger.moveUpY = move;
          return;
        }
        console.log(move, 'in');
        // 向上移动，执行加载更多
        if ((Math.abs(move) + this.$el.clientHeight) + this.loadDeviation > this.$refs.scroll.offsetHeight) {
          if (!this.loadCompleted) {
            this.$emit('load-more');
          }
          if (Math.abs(move) + this.$el.clientHeight > this.$refs.scroll.offsetHeight) {
            move = -(this.$refs.scroll.offsetHeight - this.$el.clientHeight);
          }
        } else {
          isStopLastSlip = false;
        }
        this.finger.moveUpY = move;
        this.finger.currentMove = move;
      },
    },
    watch: {
      loadStage(newValue) {
        this.copyLoadStage = newValue;
        if (newValue === 'DID') {
          setTimeout(() => {
            this.resetMoveDownY();
          }, 200);
        }
      }
    },
    beforeDestory() {
      const element = this.$el;
      element.removeEventListener('touchstart', this.listenerTouchStart, false);
      element.removeEventListener('touchmove', this.listenerTouchMove, false);
      element.removeEventListener('touchend', this.listenerTouchEnd, false);
    },
  };

</script>

<style lang="scss">
  @import "../../../static/styles/basic";
  @import "../../../static/styles/borderBox";
  .scroller-wrapper{
    position: relative;
    overflow: hidden;
  }
  @keyframes refreshing-loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .refreshing{
    width: 50px;
    height: 50px;
    background-color: $c-bg-white;
    margin: -50px auto 0;
    border: 1px solid $c-light-border;
    box-shadow: 0 0 13px 3px $c-light-border;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading{
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    .data-loader{
      margin-right: 4px;
    }
  }
  .data-loader, .refreshing-loader{
    animation: refreshing-loader 1000ms infinite linear;
    border-radius: 2.4em;
    border: 0.3em solid #9ac;
    border-left-color: transparent;
    color: transparent;
    display: inline-block;
    font-size: 10px;
    line-height: 1.2;
    width: 2em;
    height: 2em;
    text-indent: 100%;
  }
  .refreshing-loader {
    border: 0.4em solid #9ac;
    width: 3em;
    height: 3em;
    &:after {
      display: block;
      border: 0.5em solid transparent;
      border-top-color: #9ac;
      border-left-color: #9ac;
      content: '';
      width: 0;
      height: 0;
      overflow: hidden;
      margin-left: -0.2em;
      margin-top: 0.39em;
    }
    &.will{
      border-color: $c-light-border;
      border-left-color: transparent;
      &:after{
        border-top-color: $c-light-border;
        border-left-color: $c-light-border;
      }
    }
    &.doing{
      border-color: $c-gray;
      border-left-color: transparent;
      &:after{
        border-top-color: $c-gray;
        border-left-color: $c-gray;
      }
    }
    &.did{
      border-color: $c-light-blue;
      border-left-color: transparent;
      &:after{
        border-top-color: $c-light-blue;
        border-left-color: $c-light-blue;
      }
    }
    &.error{
      border-color: $c-red;
      border-left-color: transparent;
      &:after{
        border-top-color: $c-red;
        border-left-color: $c-red;
      }
    }
  }
</style>
