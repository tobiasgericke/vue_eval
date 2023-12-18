<template>
  <div class="query-result-container">
    <Card
      v-for="product in results"
      :key="product.name"
      :name="product.name"
      :image="product.image"
    />
  </div>

</template>

<script setup>
import { defineProps } from 'vue';
import Card from './Card.vue'; // Stellen Sie sicher, den richtigen Pfad anzugeben

const props = defineProps({
  results: Array
});
</script>

<style scoped>

  /* .query-result-container {
    display: flex;
    justify-content: space-around; 
    width: 100%;
    align-items: top;
    flex: 1 1 0;
    flex-wrap: wrap;
  } */

  .query-result-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Mindestbreite 200px, maximale Breite 1fr */
    grid-auto-rows: 400px;
    gap: 15px; /* Abstand zwischen den Karten */
  }
</style>