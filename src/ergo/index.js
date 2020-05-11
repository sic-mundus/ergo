import _ from "lodash";

const funcs = {
  bounced: _.debounce(
    f => {
      return f();
    },
    500, {
      leading: false,
      trailing: true
    }
  ),

  debounce() {
    return new Promise(resolve => {
      funcs.bounced(() => {
        resolve();
      });
    });
  },

  checkWord(word) {
    return new Promise((resolve, reject) => {
      this.$store.commit(
        "data/setProgressDescription",
        "Checking if your query makes sense..."
      );

      if (word) {
        this.$oneLook
          .get("/words", {
            params: {
              v: "ol_gte3",
              ml: word,
              qe: "ml",
              md: "dp",
              max: 1,
              k: "olthes_r4"
            }
          })
          .then(r => {

            if (r.data.length) {
              let item = r.data[0]
              if (item.word.toLowerCase() === word.toLowerCase() && item.defs) {
                resolve(item.defs)
              } else {
                reject('Word not found!')
              }
            } else {
              reject('Not a word!')
            }

          })
          .catch(r => {
            reject(r)
          });
      } else {
        reject('The word is empty!');
      }
    });
  },

  isKnown(word) {
    return new Promise(resolve => {
      console.debug("checking", word);
      this.$store.commit(
        "data/setProgressDescription",
        "Checking if this has already been translated..."
      );

      // Check if the word is already been translated
      resolve(false);
    });
  },

  fetchDb(word) {
    return new Promise((resolve, reject) => {
      this.$store.commit(
        "data/setProgressDescription",
        "Fetching translations from database..."
      );

      // TODO: Retrieve transaltions from stored data
      console.log(word + resolve + reject);
      let transaltions = [];
      resolve(transaltions);
    });
  },

  translate(word) {
    return new Promise(resolve => {
      this.$store.commit("data/setProgressDescription", "Translating...");
      console.debug("transalting", word);

      // API
      setTimeout(() => {
        let translations = [];

        let countries = this.$store.getters["countries/all"];

        countries.forEach(country => {
          translations.push({
            country: country,
            translation: "gato",
            position: {
              lat: 44.41322 + Math.random(1) * 20,
              lng: 10.219482 + Math.random(1) * 20
            }
          });
        });

        // Resolve
        resolve(translations);
      }, 5000);
    });
  },

  connect(translations) {
    return new Promise(resolve => {
      this.$store.commit(
        "data/setProgressDescription",
        "Computing connections..."
      );

      let connections = [];
      let added = [];

      translations.forEach(mk1 => {
        translations.forEach(mk2 => {
          if (mk1.country.code === mk2.country.code) {
            // self
          } else if (
            added.some(
              x =>
              (x.from == mk1.country.code && x.to == mk2.country.code) ||
              (x.from == mk2.country.code && x.to == mk1.country.code)
            )
          ) {
            // already added
          } else {
            connections.push({
              latlngs: [mk1.position, mk2.position],
              color: "#706fd3"
            });

            added.push({
              from: mk1.country.code,
              to: mk2.country.code
            });
          }
        });
      });

      let result = {
        translations: translations,
        connections: connections
      };

      resolve(result);
    });
  }
};

export default funcs;