export default {
  namespaced: true,

  state: {
    countries: [
      {
        name: "Italy",
        code: "it"
      },
      {
        name: "UK",
        code: "en"
      },
      {
        name: "Spain",
        code: "es"
      },
      {
        name: "German",
        code: "de"
      },
      {
        name: "Russia",
        code: "ru"
      }
    ]
  },

  getters: {
    all(state) {
      return state.countries;
    }
  }
};
