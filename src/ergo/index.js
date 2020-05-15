import _ from "lodash";
import {
  setCORS
} from "google-translate-api-browser";
// setting up cors-anywhere server address
const translate = setCORS("http://cors-anywhere.herokuapp.com/");
const levenshtein = require('js-levenshtein');

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
      console.debug("#checking", word);
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

  _compute(word) {
    console.debug('computing')
    return new Promise((resolve) => {
      this.$store.commit("data/setProgressDescription", "Translating...");

      let translations = [];
      let countries = this.$store.getters["countries/all"];

      let tasks = [];

      // Parse countries
      countries.forEach(country => {

        tasks.push(funcs.tr(word, country));

      });

      // Execute promises one at a time
      tasks.reduce((promiseChain, currentTask) => {
        return promiseChain.then(chainResults =>
          currentTask.then(currentResult =>
            [...chainResults, currentResult]
          )
        );
      }, Promise.resolve([])).then(arrayOfResults => {
        // Do something with all results
        console.log('ALL RESULTS:', arrayOfResults);

        // Create translations array
        arrayOfResults.forEach(data => {
          translations.push({
            country: data.country,
            translation: data.translation
          });
        });

        // Resolve
        resolve(translations)

      });
    });
  },

  compute(word) {
    console.debug('computing', word)
    return new Promise((resolve) => {
      this.$store.commit("data/setProgressDescription", "Translating...");

      let translations = [];
      let countries = this.$store.getters["countries/enabled"];

      // I can't say that I know how this thing works, but it sure does...
      let result = countries.reduce((accumulatorPromise, nextCountry) => {

        return accumulatorPromise.then((d) => {

          // If it yeld some results..
          // add it to the pool of translated words
          if (d) {
            translations.push({
              country: d.country,
              translation: d.translation
            });
          }

          // Keep iterating
          return funcs.tr(word, nextCountry, translations);
        })

      }, Promise.resolve());

      // When all the promises have been fullfilled..
      result.then(() => {
        resolve(translations);
      });
    });
  },

  tr(word, country, alreadyTranslated) {
    return new Promise((resolve) => {
      let languageCode = country.languageCode;

      this.$store.commit("data/setProgressIteration", languageCode);
      console.debug('translating + [' + word + '] in ' + languageCode)

      // Check if it is already cached
      if (alreadyTranslated.some(x => x.country.languageCode == country.languageCode)) {

        console.debug('found within cache!!');
        let entry = alreadyTranslated.find(x => x.country.languageCode == country.languageCode);

        resolve({
          country: country,
          translation: entry.translation
        });

      } else {

        translate(word, {
          from: 'en',
          to: languageCode
        }).then(res => {

          // Traduzione completata per questa lingua
          console.debug(' => tradotto', res);
          resolve({
            country: country,
            translation: res.text
          });

        }).catch(err => {

          // Errore singola traduzione
          console.debug(' => errore', err);
          resolve()
        });

      }
    });
  },

  connect(translations) {
    return new Promise(resolve => {
      this.$store.commit(
        "data/setProgressDescription",
        "Computing connections..."
      );

      let connections = [];
      let processedPairs = [];

      translations.forEach(mk1 => {
        translations.forEach(mk2 => {
          if (mk1.country.idx === mk2.country.idx) {
            // self
          } else if (processedPairs.some(x =>
            (x.from == mk1.country.idx && x.to == mk2.country.idx) ||
            (x.from == mk2.country.idx && x.to == mk1.country.idx))
          ) {
            // already processed
          } else {

            let distance = levenshtein(mk1.translation, mk2.translation);
            console.log('The distance between ' + mk1.translation + ' and ' + mk2.translation + ' is', distance);

            let maxStepsAllowed = 3;
            if (distance <= maxStepsAllowed) {

              // Pretty close
              let perc = 100 - distance / (maxStepsAllowed * 1.0) * 100;
              let color = funcs.perc2color(perc);
              console.log('percentage ' + perc + ' leads to ' + color);

              if (perc >= 0 && perc <= 100) {

                connections.push({
                  latlngs: [mk1.country.position, mk2.country.position],
                  color: color,
                  score: distance
                });
              }

              processedPairs.push({
                from: mk1.country.idx,
                to: mk2.country.idx
              });
            }
          }
        });
      });

      let result = {
        translations: translations,
        connections: connections
      };

      resolve(result);
    });
  },

  perc2color(perc) {
    var r, g, b = 0;
    if (perc < 50) {
      r = 255;
      g = Math.round(5.1 * perc);
    }
    else {
      g = 255;
      r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
  }
};

export default funcs;