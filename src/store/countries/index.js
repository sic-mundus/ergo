export default {
  namespaced: true,

  state: {
    countries: [{
        name: "Italy",
        code: "IT",
        languageCode: "it",
        position: [47.41322, -1.219482]
      },
      {
        name: "Spain",
        code: "ES",
        languageCode: "es",
        position: [48.41322, 1.219482]
      }
    ]
  },

  getters: {
    all(state) {
      return state.countries;
    }
  }
};