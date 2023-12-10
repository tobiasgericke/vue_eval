<script setup>
import SearchBar from '@/components/SearchBar.vue'
import QueryResult from '@/components/QueryResult.vue'
import {ref, watch, computed} from 'vue'

//const currentSearchTerm = ref("");
const queryResultsEmbedding = ref([]);
const queryResultsOntology = ref([]);
const currentPreferency = ref([]);
const isEmbeddingFirst = ref(true);

const searchQueries = [
  /* Häufigste Querys */["neumann_bundles", "eris-2nd-gen", "kawai digital pianos", "shure-wireless", "e25-elektron", "teenage engineering", "akai", "fender", "komplete-14" , "behringer"],
  /* Zero-Result Querys */["chompi", "harley benton", "gehörschutz", "audeze", "nebel", "dsm", "gutschein", "micscreen", "xone k2" , "behringer swing"],
  /* Randomized Querys */["ableton", "black lion audio", "sennheiser", "music box", "trumpet", "launchpad", "shure", "guitar stand", "tuner" , "amplifier"],
];
const currentSearchIndex = ref(0);
const currentSearchSetIndex = ref(0);
const currentSearchTerm = ref(searchQueries[currentSearchSetIndex.value][currentSearchIndex.value]);

const showPopup = ref(true);
const userName = ref('');

//Update Data from Emits
// const updateCurrentSearchTerm = (newSearchTerm) => {
//     currentSearchTerm.value = newSearchTerm;
//     console.log(currentSearchTerm.value)
// }
const updateCurrentPreferency = (newPreferency) => {
    currentPreferency.value = newPreferency;
    console.log(currentPreferency.value)
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
      `&offset=0&catalogId=13705&ignoreMappings=true` +
      `&sessionId=3c079d5d-10da-db67-7f40-606258fc2ccf&kvtable=false` +
      `&complexFilterFormat=true&query=${searchTerm}`
    );

    queryResultsOntology.value = await responseOntology.json();
    console.log(`Debug: queryResultsOntology.value`, queryResultsOntology.value)
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  //Embedding Ramdomize
  updateEmbeddingFirst();
  console.log(isEmbeddingFirst.value)
};

// Konvertierung des Proxy-Objekts zu einem brauchbaren Array mit 'name' und 'image'.
const processedQueryResultsEmbedding = computed(() => {
    const data = queryResultsEmbedding.value.searchResults?.[0]?.results.map(group => group.map(product => ({
    name: product.name,
    image: product.image
  })))
  .flat()
  .filter(product => product.name && product.image)
  .filter((product, index, array) => {
      // Filter für Produkte mit gleichem Namen UND gleichem Bild
      return !array.slice(0, index).some(
        prevProduct => prevProduct.name === product.name && prevProduct.image === product.image
      );
  })
  .slice(0, 20) || [];

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
  .slice(0, 20) || [];

  console.log(data);

  return data;
});

const updateEmbeddingFirst = () => {
  // Hier wird zufällig entschieden, welcher Typ zuerst angezeigt wird
  isEmbeddingFirst.value = Math.random() < 0.5;
};

const nextSearch = () => {
  // Durchscrollen zum nächsten Suchwort
  currentSearchIndex.value = (currentSearchIndex.value + 1) % searchQueries[currentSearchSetIndex.value].length;

  // Wenn alle Suchwörter im aktuellen Set durchlaufen wurden, zum nächsten Set wechseln
  if (currentSearchIndex.value === 0) {
    currentSearchSetIndex.value = (currentSearchSetIndex.value + 1) % searchQueries.length;
  }

  currentSearchTerm.value = searchQueries[currentSearchSetIndex.value][currentSearchIndex.value];
};

const writeSurveyDataToFirestore = async () => {
  try {
    const data = {
      // Hier kommen die Daten, die du in Firestore speichern möchtest
      field1: currentSearchTerm,
      field2: currentPreferency,

      // ...
    };

    // Schreibe Daten in Firestore
    await addDoc(collection(db, 'deineFirestoreCollection'), data);

    console.log('Daten erfolgreich in Firestore geschrieben!', data);
  } catch (error) {
    console.error('Fehler beim Schreiben in Firestore:', error);
  }
};

const saveUserName = () => {
  // Hier kannst du den eingegebenen Namen in der Session Storage speichern
  userName.value 

  // Das Popup-Fenster ausblenden
  showPopup.value = false;
};

// Überwache currentSearchTerm um immer neue Daten zu fetchen
watch(currentSearchTerm, (newValue) => {
  fetchData(newValue);
  console.log("currentSearchTerm updated!")
});

// Überwache currentPreferency um neue Ergebnisse in DB zu schreiben
watch(currentPreferency, () => {
  writeSurveyDataToFirestore
  console.log("currentSearchTerm updated!")
});

</script>

<template>
    <!-- Popup-Fenster -->
    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <p>Willkommen auf unserer Seite! Bitte gib deinen Namen ein:</p>
        <input v-model="userName" placeholder="Dein Name" />
        <button @click="saveUserName">Speichern</button>
      </div>
    </div>
    <input class="search" v-model="currentSearchTerm" type="text" placeholder="Start the survey, by pressing the button!">
    <button @click="nextSearch">Nächstes Suchwort</button>
    <p>Aktuelle Suche: {{ currentSearchTerm }}</p>
    <div class="results-container">
      <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsOntology : processedQueryResultsEmbedding"/>
      <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsEmbedding : processedQueryResultsOntology"/>
    </div>
    <button v-if="results && results.length > 0" class="left-button" v-on:click="updateCurrentPreferency">The left one is better.</button>
    <button v-if="results && results.length > 0" class="right-button" v-on:click="updateCurrentPreferency">The right one is better.</button>
</template>

<style scoped>

.search {
  margin-top: 1%;
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

/* Preferency-Buttons */
.left-button .right-button {
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