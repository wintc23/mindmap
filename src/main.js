import Vue from 'vue'
import App from './App.vue'
import simpleTree from 'simple-vue-tree'
import iView from 'iview'
import 'simple-vue-tree/dist/lib/simple-tree.css'
import 'iview/dist/styles/iview.css'

Vue.use(iView)
Vue.use(simpleTree)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
