import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "leaflet/dist/leaflet.css";
import ergo from "./ergo";

// API
import apiOneLook from './plugins/api-one-look'
import apiIbm from './plugins/api-ibm'

Vue.config.productionTip = false;

// Leaflet missing icions
require("./plugins/leaflet");

// Ergo utils
Vue.prototype.$ergo = ergo;

ergo.$store = store;
ergo.$oneLook = apiOneLook;
ergo.$ibm = apiIbm;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");