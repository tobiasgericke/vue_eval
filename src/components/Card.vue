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
      width: 300px;
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
    .card .caption {
      padding: 15px;
      text-align: center;
      background-color: #f5f5f5;
    }

/* .card {
    width:310px;
    overflow: hidden;  
    border: 2%;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 35px;
    margin-right: 20px;
}
.card img {
    width: 100%;
    height: 190px;
    margin: 0;
}
.card text {
    padding: 0 5px;
}
.card .card-text h2 {
    font-weight: bold;
} */

</style>