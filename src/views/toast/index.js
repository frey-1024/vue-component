/**
 * Created by administrato on 2017/10/23.
 */
import Toast from './components/Toast.vue';
import './style.scss';

new Vue({
  el: '#app',
  data() {
    return {
      selected: ''
    };
  },
  mounted() {
  },
  methods: {
    openToast(position) {
      this.$refs.toast.openModel({
        tip: `弹出位置：${position}`,
        position, // 默认是bottom
        expires: 3000 // 默认是 2500 毫秒
      });
    }
  },
  components: {
    Toast,
  },
});
