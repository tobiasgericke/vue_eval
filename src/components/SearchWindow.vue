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
    `http://localhost:4444/search-vector?projectId=13364`+
    `&site=13364&limit=30&filterOptions=true`+
    `&offset=0&complexFilterFormat=true&query=${searchTerm}`
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
  })))
  .flat()
  //.filter(product => product.image)
  .slice(0, 10) || [];

  console.log(data);

  return data;
});

const processedQueryResultsOntology = computed(() => {
  const data = queryResultsOntology.value.searchResults?.[0]?.results.map(group => group.map(product => ({
    name: product.name,
    image: product.image
  })))
  .flat()
  //.filter(product => product.image)
  .slice(0, 10) || [];

  console.log(data);

  return data;
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
      <QueryResult class="results" :results="processedQueryResultsEmbedding" />
      <div class="divider"></div> <!-- Füge einen Trennstrich zwischen den QueryResult-Komponenten hinzu -->
      <QueryResult class="results" :results="processedQueryResultsOntology" />
    </div>
</template>

<style scoped>

/* Macht das SearchWindow zu einem Flex Container, spaced evenly */
.results-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around; /* Ändere space-around zu space-between oder space-evenly, je nachdem, welchen Abstand du bevorzugst */
}

.results {
  flex: 1 1 300px; /* Ändere die Breite der Karten nach Bedarf */
  margin: 10px; /* Ändere den Abstand zwischen den Karten nach Bedarf */
  margin-top: 3%;
}

</style>