/**
 * Created by administrato on 2017/10/23.
 */
import Load from './components/Load.vue';
import './style.scss';

new Vue({
  el: '#app',
  data() {
    return {
      isRefresh: true,
      isLoad: true,
      loadDeviation: 0,
      refreshDeviation: 75,
      refreshStage: 'WILL',
      loadStage: 'WILL',
      loadCompleted: false,
      height: '100%',
      // 数据
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      count: 1,
    };
  },
  mounted() {
  },
  methods: {
    refreshData() {
      this.count += 1;
      this.values = [this.count, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      this.refreshStage = 'DOING';
      setTimeout(() => {
        this.refreshStage = 'DID';
        if (this.values.length > 20) {
          this.loadCompleted = true;
        } else {
          this.loadCompleted = false;
        }
      }, 1000);
    },
    loadMore() {
      if (this.values.length > 20) {
        this.loadCompleted = true;
        return;
      }
      this.loadStage = 'DOING';
      setTimeout(() => {
        this.loadStage = 'DID';
        this.values = this.values.concat([31, 32, 33, 34, 35, 36, 37]);
        if (this.values.length > 20) {
          this.loadCompleted = true;
        }
      }, 1000);
    },
  },
  components: {
    Load,
  },
});
