/**
 * Created by administrato on 2017/10/23.
 */
// import './style.scss';

const MyComponent = Vue.extend({
  template: '<div>Hello!</div>'
});
// 创建并挂载到 #app (会替换 #app)
new MyComponent().$mount('#app');
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
  },
  components: {},
});
