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
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    margin: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* Bildstil innerhalb der Karte */
  .card img {
    flex: 0.5;
    width: 100%;
    object-fit: cover;
    /* height: auto; */
    /* display: block; */
  }

  /* Bildunterschriftsstil innerhalb der Karte */
  .card-title {
    flex: 0.5;
    padding: 10px;
    text-align: center;
    background-color: #282822;
    font-size: 1rem ;
    color: #fff;
  }
</style>