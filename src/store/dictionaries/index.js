export default {
  namespaced: true,

  state: {
    dictionaries: {

    }
  },

  getters: {
    full(state) {
      return lang => {
        return state.dictionaries[lang];
      }
    },
    find(state) {
      return (lang, word) => {
        return state.dictionaries[lang].some(x => x == word.toLowerCase())
      }
    }
  }
};