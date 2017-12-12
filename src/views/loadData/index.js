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
      loadDeviation: 30,
      refreshDeviation: 70,
      loadStage: 'WILL',
      loadCompleted: false,
      scrollHeight: '80%',
      // 数据
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      count: 1,
    };
  },
  mounted() {
  },
  methods: {
    refreshData() {
      console.log('aaa');
      this.count += 1;
      this.values = [this.count, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      this.loadStage = 'DOING';
      setTimeout(() => {
        this.loadStage = 'DID';
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
