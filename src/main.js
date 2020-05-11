import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "leaflet/dist/leaflet.css";
import ergo from "./ergo";
import apiOneLook from './plugins/api-one-look'

Vue.config.productionTip = false;

// Leaflet missing icions
require("./plugins/leaflet");

// Ergo utils
Vue.prototype.$ergo = ergo;

ergo.$store = store;
ergo.$oneLook = apiOneLook



new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");