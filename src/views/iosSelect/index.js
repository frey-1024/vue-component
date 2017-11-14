/**
 * Created by administrato on 2017/10/23.
 */
import SelectColumn from './components/SelectColumn.vue';
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
    getSelectValue(value) {
      this.selected = value;
    }
  },
  components: {
    SelectColumn,
  },
});
