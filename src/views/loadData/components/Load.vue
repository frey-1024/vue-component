<template>
  <div class="scroll-wrapper" :style="getScrollWrapperStyle" style="border: 1px solid #CCC;">
    <div class="refreshing" :style="getRefreshStyle">
      <div class="refreshing-loader" :class="getRefreshLoadStyle">loading</div>
    </div>
    <div class="scroll" :style="getScrollStyle" ref="scroll">
      <slot name="content"></slot>
      <div class="loading">
        <div v-if="!loadCompleted"><i class="data-loader">loading</i> 加载中</div>
        <div v-if="loadCompleted">加载完成</div>
      </div>
    </div>
  </div>
</template>
<script>
  import Animate from '../../../utils/animate';
  // 是否终止上一次滑动，true 是终止（如何上次还再滑动中，将会停止）
  let isStopLastMove = true;
  // 滑动加速度
  const a = 0.003;
  // 最大滑动距离
  const maxSlip = 400;

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
      // 刷新误差，在误差内，是不执行刷新的
      refreshDeviation: {
        type: Number,
        default: 75,
      },
      // 刷新图标最大下拉值
      refreshIconMaxDis: {
        type: Number,
        default: 120,
      },
      // 加载误差，在误差内，是不执行加载的，默认是0，也就是滑到底部才加载，如果有值，而且是正数，就是距离到底部还有xx距离就开始加载数据了
      loadDeviation: {
        type: Number,
        default: 0,
      },
      // 加载最大上拉值
      loadMaxDis: {
        type: Number,
        default: 50,
      },
      loadStage: {
        type: String,
        default: 'WILL', // will 默认值，将要开始，Doing 开始加载数据，Did 加载完成并成功，Error 加载失败
      },
      refreshStage: {
        type: String,
        default: 'WILL', // will 默认值，将要开始，Doing 开始加载数据，Did 加载完成并成功，Error 加载失败
      },
      loadCompleted: {
        type: Boolean,
        default: false,
      },
      height: {
        type: String,
        default: '100%',
      },
    },
    data() {
      return {
        copyLoadStage: 'WILL',
        copyRefreshStage: 'WILL',
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
          // 是否允许refresh， 在运行时的一种状态，
          allowRefresh: true,
        }
      };
    },
    computed: {
      getScrollWrapperStyle() {
        return {
          height: this.height,
        };
      },
      getScrollStyle() {
        let transition = '';
        if (!isStopLastMove) {
          transition = 'transform 700ms cubic-bezier(0.19, 1, 0.22, 1)';
        }
        return {
          transform: `translate3d(0, ${this.finger.moveUpY}px, 0)`,
          transition,
        };
      },
      getRefreshLoadStyle() {
        const refreshStage = this.copyRefreshStage;
        return {
          will: refreshStage === 'WILL',
          doing: refreshStage === 'DOING',
          did: refreshStage === 'DID',
          error: refreshStage === 'ERROR',
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
      animate() {
        return new Animate();
      }
    },
    mounted() {
      const element = this.$el;
      element.addEventListener('touchstart', this.listenerTouchStart, { passive: true });
      element.addEventListener('touchmove', this.listenerTouchMove, { passive: true });
      element.addEventListener('touchend', this.listenerTouchEnd, { passive: true });
    },
    methods: {
      /**
       *  当正在加载时，禁止移动（包括 加载 和 刷新）
      */
      isForbidMove() {
        return this.copyLoadStage === 'DOING' || this.copyRefreshStage === 'DOING';
      },
      /**
       *  获取元素滚动到底部的值
      */
      getScrollToBottomValue() {
        // scrollHeight - scrollTop = clientHeight：当这两个条件成立时，也就代表垂直滚动条走到底了
        // 应该用this.$refs.scroll.clientHeight 而不是this.$el.clientHeight，但是因为scroll元素没有设置滚动，而用父级的代替了
        return this.$refs.scroll.offsetHeight - this.$el.clientHeight;
      },
      moveElement(move) {
        // 开启
        if (!isStopLastMove) {
          return;
        }
        // 向下，刷新数据。
        if (this.isRefresh && move > 0) {
          if (this.finger.allowRefresh) {
            move = move > this.refreshIconMaxDis ? this.refreshIconMaxDis : move;
            // 把 refresh loading 拉下来
            this.finger.moveDownY = move;
          } else {
            move = 0;
          }
          this.finger.moveUpY = 0;
        } else if (this.isLoad && move < 0) { // 向上, 加载更多。
          // 触底后再加上最大空白值(目的：让用户看到loading效果和已经滑到最底部了)
          const scrollTop = this.getScrollToBottomValue() + this.loadMaxDis;
          // 判断已经到最底部了，阻止在移动（不能超出加上误差的值）
          move = Math.abs(move) > scrollTop ? -scrollTop : move;
          this.finger.moveUpY = move;
          this.finger.moveDownY = 0;
        }
        this.finger.currentMove = move;
      },
      /**
       * 求移动速度（v = s / t），判断用户操作快慢，从而得到惯性的滑动距离
       */
      getInertiaDistance() {
        // 移动距离
        const s = this.finger.endY - this.finger.startY;
        // 移动时间
        const t = this.finger.endTime - this.finger.startTime;
        // 移动速度
        const v = s / t;
        // 此时没有滑动距离
        if (v === 0) {
          return;
        }
        const absV = Math.abs(v);
        const position = Math.floor(absV / v);
        let distance = (position * 0.5 * v * v) / a;
        if (Math.abs(distance) > maxSlip) {
          distance = position * maxSlip;
        }
        // 这段时间走的位移 S = vt + 1/2at^2;
        let move = distance + this.finger.currentMove;
        // 已经滑动到最上面了
        if (move > 0) {
          move = 0;
          this.finger.currentMove = move;
          this.finger.moveUpY = move;
          return;
        }
        // 向上移动，执行加载更多
        const scrollTop = this.getScrollToBottomValue();
        if (Math.abs(move) + this.loadDeviation > scrollTop) {
          if (!this.loadCompleted) {
            this.$emit('load-more');
          }
          move = Math.abs(move) > scrollTop ? -scrollTop : move;
        }
        this.finger.moveUpY = move;
        this.finger.currentMove = move;
      },
      /**
       *  touch start 事件
       */
      listenerTouchStart(ev) {
        ev.stopPropagation();
        // 这个如果不加 移动端不会连续执行move,不会执行touchend
//        ev.preventDefault();
        // 正在加载时，禁止执行
        if (this.isForbidMove()) {
          return;
        }
        // 终止上次滑动， 关闭滑动模式
        isStopLastMove = true;
        this.finger.startY = ev.targetTouches[0].pageY;
        this.finger.cacheMove = this.finger.currentMove;
        // 得到上次滑动位置，判断是否可以刷新
        this.finger.allowRefresh = this.finger.cacheMove >= 0;
        // 记录开始滑动时间戳
        this.finger.startTime = Date.now();
      },
      /**
       *  touch move 事件
       */
      listenerTouchMove(ev) {
        ev.stopPropagation();
        // 正在加载时，禁止执行
        if (this.isForbidMove()) {
          return;
        }
        // 计算滑动的值
        const move = (ev.targetTouches[0].pageY - this.finger.startY) + this.finger.cacheMove;
        // 执行animate,防卡顿
        this.animate.start(this.moveElement.bind(this, move));
      },
      /**
       *  touch end 事件
       */
      listenerTouchEnd(ev) {
        ev.stopPropagation();
//        ev.preventDefault();
        if (this.isForbidMove()) {
          return;
        }
        // 开启滑动模式
        isStopLastMove = false;
        // 向下移动 执行刷新
        if (this.finger.currentMove > 0) {
          if (this.finger.moveDownY > this.refreshDeviation) {
            this.$emit('refresh');
          } else {
            this.resetRefresh();
          }
          return;
        }
        if (this.finger.currentMove < 0) {
          this.finger.endY = ev.changedTouches[0].pageY;
          this.finger.endTime = Date.now();
          this.animate.start(this.getInertiaDistance);
        }
      },
      /**
       * 重置refresh（向下滑动） 参数
       */
      resetRefresh() {
        this.finger.moveDownY = 0;
        this.finger.currentMove = 0;
        this.copyRefreshStage = 'WILL';
      },
    },
    watch: {
      loadStage(newValue) {
        this.copyLoadStage = newValue;
      },
      refreshStage(newValue) {
        this.copyRefreshStage = newValue;
        // 如果已经加载结束，重置refresh样式
        if (newValue === 'DID' || newValue === 'ERROR') {
          setTimeout(() => {
            this.resetRefresh();
          }, 200);
        }
      },
    },
    beforeDestory() {
      const element = this.$el;
      element.removeEventListener('touchstart', this.listenerTouchStart, { passive: true });
      element.removeEventListener('touchmove', this.listenerTouchMove, { passive: true });
      element.removeEventListener('touchend', this.listenerTouchEnd, { passive: true });
    },
  };

</script>

<style lang="scss">
  @import "../../../static/styles/basic";
  @import "../../../static/styles/borderBox";
  .scroll-wrapper{
    position: relative;
    overflow: hidden;
    touch-action: none;
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
    position: relative;
    z-index: 9;
    width: 50px;
    height: 50px;
    background-color: $c-bg-white;
    margin: -62px auto 0;
    border: 1px solid $c-light-border;
    box-shadow: 0 0 13px 3px $c-light-border;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .scroll{
    position: relative;
    top: 12px;
    z-index: 3;
    touch-action: none;
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
