export default {
  namespaced: true,

  state: {
    translations: [],
    connections: [],

    progress: {
      desc: "",
      iter: ""
    }
  },

  getters: {
    translations(state) {
      return state.translations;
    },

    connections(state) {
      return state.connections;
    },

    progress(state) {
      return state.progress;
    }
  },

  mutations: {
    setProgressDescription(state, payload) {
      state.progress.desc = payload;
    },

    resetProgress(state) {
      state.progress = {
        desc: "",
        iter: ""
      };
    },

    setTranslations(state, payload) {
      state.translations = payload;
    }
  }
};
