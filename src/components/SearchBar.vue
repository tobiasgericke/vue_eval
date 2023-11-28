<script setup>
import {ref, watch, defineEmits} from 'vue'

const searchTerm = ref("")

const emit = defineEmits(["searchTermUpdated"])

const emitSearchTermUpdated = () => {
  emit("searchTermUpdated", searchTerm.value)
  console.log("Emitted SearchTerm!")
}

watch(searchTerm, () => {
  console.log(searchTerm.value)
})
</script>

<template>
  <div>
    <h2>Type your search here</h2>
    <input v-on:keyup.enter="emitSearchTermUpdated" v-model="searchTerm" type="text" placeholder="Search...">
  </div>
</template>

<style scoped>

/*CARD*/


</style>
