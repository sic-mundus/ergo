import Vue from "vue";
import Vuex from "vuex";

// Modules
import countries from "./countries";
import data from "./data";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    countries,
    data
  }
});