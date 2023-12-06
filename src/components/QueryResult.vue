<template>
  <div class="query-result-container">
    <div class="query-results">
      <Card
        v-for="product in results"
        :key="product.name"
        :name="product.name"
        :image="product.image"
      />
    </div>
    <button v-if="results && results.length > 0" class="center-button">This one is better</button>
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
  display: flex;
  flex-direction: column;
  align-items: center; /* Zentriert horizontal */
}

.query-results{
  display: flex;
  flex-grow: 1; /* Beide Container wachsen im Verhältnis zueinander */
  flex-wrap: wrap; /* Erlaubt das Umfließen der Produkte auf mehrere Reihen */
  justify-content: center; /* Zentriert die Produkte horizontal */
}

.center-button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  border: 2px solid #3498db; /* Farbe des Rahmens */
  border-radius: 5px;
  color: #3498db; /* Textfarbe */
  background-color: #fff; /* Hintergrundfarbe */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
}

/* Hover-Effekte für den Button */
.center-button:hover {
  background-color: #3498db; /* Hintergrundfarbe bei Hover */
  color: #fff; /* Textfarbe bei Hover */
  border-color: #3498db; /* Rahmenfarbe bei Hover */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Schatten bei Hover */
}
</style>