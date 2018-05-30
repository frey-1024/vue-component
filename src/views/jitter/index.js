/**
 * Created by administrato on 2017/10/23.
 */
import Jitter from './components/Jitter.vue';
import './style.scss';

new Vue({
  el: '#app',
  data() {
    return {
      beginX: false,
      beginY: false,
      beginZ: false,
      beginXY: false,
    };
  },
  mounted() {
  },
  methods: {
    jitterX() {
      this.beginX = true;
    },
    jitterY() {
      this.beginY = true;
    },
    jitterZ() {
      this.beginZ = true;
    },
    jitterXY() {
      this.beginXY = true;
    }
  },
  components: {
    Jitter,
  },
});
