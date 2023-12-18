<template>
    <div class="card">
      <img :src="image" :alt="name" class="card-img-top"/>
      <div class="card-body">
        <h2 class="card-title">{{ name }}</h2>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    name: String,
    image: String
  });
  </script>

<style scoped>

  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    margin: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* Bildstil innerhalb der Karte */
  .card img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Bildunterschriftsstil innerhalb der Karte */
  .card-title {
    padding: 15px;
    text-align: center;
    background-color: #282822;
    font-size: medium ;
    text-align: center;
  }
</style>