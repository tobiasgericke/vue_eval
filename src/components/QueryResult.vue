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

.query-result-container{

    
  justify-content: space-between; 
  align-items: stretch; 
  /* flex-flow: row wrap; */ 
  flex-direction: row; 
  flex-wrap: wrap; 
  flex-grow: 1;
  align-content: stretch;
}
</style>