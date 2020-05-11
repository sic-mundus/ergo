<template>
  <div style="height: 100%; width:100%">
    <div style="height: 100%; width:100%">
      <l-map
        :zoom="zoom"
        :center="center"
        :bounds="bounds"
        :options="{zoomControl: false}"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        @update:bounds="boundsUpdated"
        style="z-index:0"
      >
        <l-tile-layer :url="url"></l-tile-layer>

        <l-control-zoom position="bottomright"></l-control-zoom>

        <!--Search bar-->
        <l-control position="topleft">
          <word-finder
            :is-loading="loading"
            @value-changed="val => (word = val)"
          ></word-finder>
        </l-control>

        <!--Makers-->
        <l-marker
          v-for="(mk, idx) in translations"
          :key="idx"
          :lat-lng="mk.position"
        >
          <l-tooltip :options="{ permanent: true, interactive: true }">
            {{ mk.translation }}
          </l-tooltip>
        </l-marker>

        <!--connections-->
        <l-polyline
          v-for="(line, idx) in connections"
          :key="`${idx}-${line.latlngs.lat}`"
          :lat-lngs="line.latlngs"
          :color="line.color"
        ></l-polyline>
      </l-map>
    </div>

    <v-dialog
      style="z-index:9999;"
      v-model="dialog"
      max-width="290"
      persistent
    >
      <v-card>
        <v-card-title class="headline">Thinking</v-card-title>
        <v-card-text class="d-flex flex-column align-center justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
            class="ma-4"
          ></v-progress-circular>

          {{ progress.desc }}
        </v-card-text>
      </v-card>
    </v-dialog>

    <!--Snack-->
    <v-snackbar
      v-model="snackbar.show"
      :color="'error'"
    >
      {{ snackbar.text }}
      <v-btn
        text
        @click="snackbar.show = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LControl,
  LMarker,
  LTooltip,
  LPolyline,
  LControlZoom
} from "vue2-leaflet";
import { latLngBounds } from "leaflet";
import WordFinder from "../components/WordFinder";
import { mapGetters } from "vuex";
export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LControl,
    LMarker,
    WordFinder,
    LTooltip,
    LPolyline,
    LControlZoom
  },
  data() {
    return {
      cane: true,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 3,
      center: [44.41322, 10.219482],
      bounds: null,

      translations: [],
      connections: [],

      word: "",
      loading: false,

      snackbar: {
        show: false,
        text: ""
      }
    };
  },
  computed: {
    ...mapGetters({
      progress: "data/progress"
    }),

    dialog: {
      get() {
        return this.loading && this.progress.desc;
      },
      set(v) {
        return v;
      }
    }
  },
  watch: {
    word(val) {
      this.load(val);
    }
  },
  methods: {
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },
    clear() {
      this.translations = [];
      this.connections = [];

      this.$store.commit("data/resetProgress");

      this.snackbar.show = false;
    },
    load(w) {
      // Cler current state
      this.clear();

      this.loading = true;
      this.$ergo
        .debounce()
        .then(() => this.$ergo.checkWord(w))
        .then(() => this.$ergo.isKnown(w))
        .then(k => (k ? this.$ergo.fetchDb(w) : this.$ergo.translate(w)))
        .then(trs => this.$ergo.connect(trs))
        .then(r => {
          this.translations = r.translations;
          this.connections = r.connections;

          // fit
          this.fit();
        })
        .catch(err => {
          this.snackbar.show = true;
          this.snackbar.text = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fit() {
      console.log("fitting..");
      let positions = this.translations.map(x => x.position);

      const bounds = latLngBounds(positions);
      this.bounds = bounds;
    }
  }
};
</script>

<style lang="scss" scoped></style>
