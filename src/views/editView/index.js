import EditView from './components/EditView.vue';
import './style.scss';

new Vue({
  el: '#app',
  data() {
    return {
      utils: [
        { name: 'bold' },
        { name: 'italic' },
        { name: 'underline' },
        { name: 'strikethrough', active: false },
        { name: 'removeformat', active: false, separator: false, }
      ]
    };
  },
  methods: {
  },
  components: {
    EditView
  },
});
