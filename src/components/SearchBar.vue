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
    <input class="search" v-on:keyup.enter="emitSearchTermUpdated" v-model="searchTerm" type="text" placeholder="Search...">
  </div>
</template>

<style scoped>


.search {
  height: 46px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    width: 40%;
    padding-right: 40px;
    padding-left: 10px;
    position: fixed;
    left: 50%;
    transform: translate(-50%);
  }

</style>
