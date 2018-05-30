<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>
  export default {
    props: {
      // 抖动范围，单位是px, 例如：{x: 4, y: 2, z: 10}
      range: {
        type: Object,
        default: () => { return { z: 8 }; },
      },
      start: {
        type: Boolean,
        required: true,
      },
      shiftPercent: {
        type: Number,
        default: 0.1, // 移动range中初始值的百分比
      },
      perspectiveStyle: {
        type: Object,
        default: () => {
          return {
            perspective: '300px',
            perspectiveOrigin: 'center center'
          };
        }
      }
    },
    data() {
      return {
        timer: null,
        currentRange: null,
        move: null,
        position: null,
        shiftNumber: null,
        // 向顺时针方向摆动
        isClockwise: true,
      };
    },
    mounted() {
      // 如果要执行 z 轴动画需要设置父级，从而修改子级透视效果，否则 Z 轴没有效果
      if (this.range.z > 0) {
        const parentEl = this.$el.parentNode;
        Object.keys(this.perspectiveStyle).forEach((key) => {
          parentEl.style[key] = this.perspectiveStyle[key];
        });
      }
    },
    methods: {
      /**
       * 获取需要操作的的项 和 每次需要摆动的量
       */
      getPositionAndShiftNumber() {
        const result = {
          position: [],
          shiftNumber: {}
        };
        const range = this.currentRange;
        let val;
        for (const key in range) {
          val = range[key];
          if (val > 0) {
            result.position.push(key);
            result.shiftNumber[key] = this.shiftPercent * val;
          }
        }
        return result;
      },
      /**
       * 初始化抖动
       */
      initJitter() {
        // 把start变成false， 方便下次点击
        this.$emit('update:start', false);
        // 清除上次动画
        this.clearAnimate();
        // 设置currentRange, 填充this.range 中没有的项
        this.currentRange = Object.assign({}, { x: 0, y: 0, z: 0 }, this.range);
        // 获取需要操作的的项 和 每次需要摆动的量
        const { position, shiftNumber } = this.getPositionAndShiftNumber();
        this.position = position;
        this.shiftNumber = shiftNumber;
        // 初始 move 起始点是0
        this.move = { x: 0, y: 0, z: 0 };
        // 初始时 是顺时针
        this.isClockwise = true;
        // 执行动画
        this.timer = window.requestAnimationFrame(this.continueJitter);
      },
      /**
       * 更新元素摆动的位移
       */
      refreshMove(direction) {
        const shiftNumber = this.shiftNumber;
        this.position.forEach((item) => {
          this.move[item] += direction * shiftNumber[item];
        });
      },
      /**
       * 获取移动时的绝对值
       */
      getAbsMove() {
        const absMove = {};
        for (const m in this.move) {
          absMove[m] = Math.abs(this.move[m]);
        }
        return absMove;
      },
      // 持续抖动
      continueJitter() {
        this.refreshMove(this.isClockwise ? -1 : 1);
        // 绝对值
        const absMove = this.getAbsMove();
        const currentRange = this.currentRange;
        let changeDirection = false;
        for (let i = 0, l = this.position.length, p; i < l; i += 1) {
          p = this.position[i];
          // 判断是否到达临界值，到达后 应该反方向执行动画
          if (currentRange[p] <= absMove[p]) {
            // 等比例缩减
            this.currentRange[p] -= this.shiftNumber[p];
            // 判断如果已经无力再摆动，就让摆动停止, 只要有一个值达到了0，所有都会达到
            if (this.currentRange[p] <= 0) {
              // 停止在起始点上
              this.jitterView({ x: 0, y: 0, z: 0 });
              // 清除动画
              this.clearAnimate();
              return;
            }
            // 更新move为临界点
            this.move[p] = this.isClockwise ? -this.currentRange[p] : this.currentRange[p];
            // 改变摆动方向
            changeDirection = true;
          }
        }
        if (changeDirection) {
          // 摆动方向取反
          this.isClockwise = !this.isClockwise;
        }
        // 更新元素位置
        this.jitterView(this.move);
        // 继续执行动画
        this.timer = window.requestAnimationFrame(this.continueJitter);
      },
      /**
       * 修改元素位置
       * @param x
       * @param y
       * @param z
       */
      jitterView({ x = 0, y = 0, z = 0 }) {
        this.$el.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
      },
      /**
       * 清除动画
       */
      clearAnimate() {
        if (this.timer) {
          window.cancelAnimationFrame(this.timer);
        }
      }
    },
    destroyed() {
      this.clearAnimate();
    },
    watch: {
      start(newVal) {
        // 开始抖动
        if (newVal) {
          this.initJitter();
        }
      }
    }
  };
</script>
