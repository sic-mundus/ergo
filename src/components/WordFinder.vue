<template>
  <v-text-field
    placeholder="Search for any word"
    clearable=""
    v-model="model"
    :loading="isLoading"
    autofocus
    solo
    prepend-inner-icon="mdi-magnify"
  >
  </v-text-field>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: () => ({
    model: null
  }),
  watch: {
    model(val) {
      this.$emit("value-changed", val);
    }
  }
};
</script>

<style lang="scss" scoped></style>
