export default {
  namespaced: true,

  state: {
    countries: [{
      name: "Italy",
      code: "IT",
      languageCode: "it",
      position: [41.2036522, 8.2248046]
    },
    {
      name: "Spain",
      code: "ES",
      languageCode: "es",
      position: [40.2085, -3.713]
    }, {
      name: "Germany",
      code: "DE",
      languageCode: "de",
      position: [51.0899232, 5.968358]
    }, {
      name: 'France',
      code: 'FR',
      languageCode: 'fr',
      position: [46.1314536, -2.4339722]
    }, {
      name: 'Russia',
      code: 'RU',
      languageCode: 'ru',
      position: [33.4979426, 40.6080862]
    }, {
      name: 'CZech Republic',
      code: 'CZ',
      languageCode: 'cs',
      position: [40, 12]
    }]
  },

  getters: {
    all(state) {
      return state.countries;
    }
  }
};