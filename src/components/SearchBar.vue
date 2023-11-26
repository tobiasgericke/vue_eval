<script setup>
import {ref} from 'vue'

const searchTerm = ref('')

</script>

<template>
  <div>
    <h2>Type your search here</h2>
    <input v-model="searchTerm">
  </div>
</template>

<style scoped>

</style>
