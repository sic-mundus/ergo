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
      let countries = this.$store.getters["countries/all"];

      // I can't say that I know how this thing works, but it sure does...
      let result = countries.reduce((accumulatorPromise, nextCountry) => {

        return accumulatorPromise.then((d) => {

          // Add to the pool of translated words
          if (d) {
            translations.push({
              country: d.country,
              translation: d.translation
            });
          }

          // Keep iterating
          return funcs.tr(word, nextCountry);
        })

      }, Promise.resolve());

      // When all the promises have been fullfilled..
      result.then(() => {
        resolve(translations);
      });
    });
  },

  tr(word, country) {
    return new Promise((resolve, reject) => {
      let languageCode = country.languageCode;

      this.$store.commit("data/setProgressIteration", languageCode);
      console.debug('translating + [' + word + '] in ' + languageCode)

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
        reject(err)
      });
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

            let distance = levenshtein(mk1.translation, mk2.translation);
            console.log('The distance between ' + mk1.translation + ' and ' + mk2.translation + ' is', distance);

            let perc = distance / 3.0 * 100;
            let color = funcs.getColorForPercentage(perc);
            console.log('percentage: + ' + perc + ' leads to ' + color);

            connections.push({
              latlngs: [mk1.country.position, mk2.country.position],
              color: color,
              score: distance
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
  },
  getColorForPercentage(pct) {

    let percentColors = [
      { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }
    ];

    for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
        break;
      }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
  }
};

export default funcs;