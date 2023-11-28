<script setup>
import SearchBar from '@/components/SearchBar.vue'
import QueryResult from '@/components/QueryResult.vue'
import {ref, watch, computed} from 'vue'

const currentSearchTerm = ref("");
const queryResultsEmbedding = ref([]);
const queryResultsOntology = ref([]);

//Suchterm holen
const updateCurrentSearchTerm = (newSearchTerm) => {
    currentSearchTerm.value = newSearchTerm;
    console.log(currentSearchTerm.value)
}

//API Calls Speichern in jeweilige Variable
const fetchData = async (searchTerm) => {
  try {
    const responseEmbedding = await fetch(
    `http://localhost:4444/search?projectId=17478&site=28`+
    `&includeContent=true&limit=30&filterOptions=true&offset=0`+
    `&sessionId=3c079d5d-10da-db67-7f40-606258fc2ccf&kvtable=false`+
    `&complexFilterFormat=true&query=${searchTerm}`
    );
    queryResultsEmbedding.value = await responseEmbedding.json();
    console.log(`Debug: queryResultsEmbedding.value`, queryResultsEmbedding.value)

    const responseOntology = await fetch(
        `https://ecom.sitesearch360.com/search?projectId=28` +
        `&site=28&includeContent=true&limit=30&highlightQueryTerms=true` +
        `&includeContentGroups=%5B%22Produkte%22%5D&log=true&filterOptions=true` +
        `&offset=0&catalogId=13705` +
        `&sessionId=3c079d5d-10da-db67-7f40-606258fc2ccf&kvtable=false` +
        `&complexFilterFormat=true&query=${searchTerm}`);

    queryResultsOntology.value = await responseOntology.json();
    console.log(`Debug: queryResultsOntology.value`, queryResultsOntology.value)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Konvertierung des Proxy-Objekts zu einem brauchbaren Array mit 'name' und 'image'.
const processedQueryResultsEmbedding = computed(() => {
    const data = queryResultsEmbedding.value.searchResults?.[0]?.results.map(group => group.map(product => ({
    name: product.name,
    image: product.image
  }))).flat() || [];
  console.log(data);

  return data;
//   queryResultsEmbedding.value.searchResults?.[0]?.results.map(group => group.map(product => ({
//     name: product.name,
//     image: product.image
//   }))).flat() || [];
});

const processedQueryResultsOntology = computed(() => {
  return queryResultsOntology.value.searchResults?.[0]?.results.map(group => group.map(product => ({
    name: product.name,
    image: product.image
  }))).flat() || [];
});

// Überwache currentSearchTerm um immer neue Daten zu fetchen
watch(currentSearchTerm, (newValue) => {
  fetchData(newValue);
  console.log("currentSearchTerm updated!")
});

//console.log(`Debug: processedQueryResultsOntology.value`, processedQueryResultsOntology.value)

</script>

<template>
    <SearchBar @searchTermUpdated="updateCurrentSearchTerm"/>
    <div class="results-container">
      <QueryResult class="result" :results="processedQueryResultsEmbedding" />
      <QueryResult class="result" :results="processedQueryResultsOntology" />
    </div>
</template>

<style scoped>
.results-container {
  display: flex;
  justify-content: space-around;
}

/* Hier den Stil jeder QueryResult-Komponente anpassen */
.result {
  flex: 1; /* Sorgt dafür, dass jede Komponente gleichen Platz einnimmt */
  margin: 0 10px; /* Fügt einen Außenabstand zwischen den Komponenten hinzu */
}
</style>