<script setup>
  import SearchBar from '@/components/SearchBar.vue'
  import QueryResult from '@/components/QueryResult.vue'
  import {ref, watch, computed} from 'vue'
  import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
  import { db } from '@/firebase.js';

  const queryResultsEmbedding = ref([]);
  const queryResultsOntology = ref([]);
  const isEmbeddingFirst = ref(true);
  const currentPreferency  = ref('');

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

  const handlePreference = (direction) => {
    // Hier fügst du die gedrückte Richtung für die aktuelle Query und das aktuelle Set zum Array hinzu
    console.log("handlePreference:", direction)
    console.log ("isEmbeddingFirst:", isEmbeddingFirst.value)
    if (isEmbeddingFirst.value === true && direction === "left") {
      currentPreferency.value = "embedding"
    } 
    if (isEmbeddingFirst.value === true && direction === "right") {
      currentPreferency.value = "ontology"
    }
    if (isEmbeddingFirst.value === false && direction === "left") {
      currentPreferency.value = "ontology"
    }
    if (isEmbeddingFirst.value === false && direction === "right") {
      currentPreferency.value = "embedding"
    }
    else {
      console.log("Na toll")
    }

    console.log("currentPreferency:", currentPreferency.value)
    writeSurveyDataToFirestore();
  };

  //API Calls Speichern in jeweilige Variable
  const fetchEmbeddingData = async (searchTerm) => {
  try {
    // OLD LOCAL FETCH
    // const response = await fetch(
    //   `http://localhost:4444/search-vector?projectId=13364` +
    //   `&site=13364&limit=30&filterOptions=true` +
    //   `&offset=0&complexFilterFormat=true&query=${searchTerm}`
    // );

    const response = await fetch(
      `https://dev-api-v3.semknox.com/search-vector?projectId=32979&internal=true&log=false&query=${searchTerm}`
    );

    if (!response.ok) {
      console.error('Embedding Fetch fehlgeschlagen');
      return null;
    }

    console.log("Embedding Fetch erfolgreich")
    //Trigger for processing
    queryResultsEmbedding.value = await response.json();

  } catch (error) {
    console.error('Fehler beim Abrufen der Embedding-Daten:', error);
    return null;
  }
};

// Funktion für Ontology Fetch
const fetchOntologyData = async (searchTerm) => {
  try {
    const response = await fetch(
      `https://ecom.sitesearch360.com/search?projectId=28` +
      `&site=28&includeContent=true&limit=30&highlightQueryTerms=true` +
      `&includeContentGroups=%5B%22Produkte%22%5D&log=true&filterOptions=true` +
      `&offset=0&catalogId=13705&ignoreMappings=true` +
      `&sessionId=3c079d5d-10da-db67-7f40-606258fc2ccf&kvtable=false` +
      `&complexFilterFormat=true&query=${searchTerm}`
    );

    if (!response.ok) {
      console.error('Ontology Fetch fehlgeschlagen');
      return null;
    }

    console.log("Ontology Fetch erfolgreich")
    //Trigger for processing
    queryResultsOntology.value = await response.json();

  } catch (error) {
    console.error('Fehler beim Abrufen der Ontology-Daten:', error);
    return null;
  }
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

    console.log("processedQueryResultsEmbedding:", data);

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

    console.log("processedQueryResultsOntology:", data);

    return data;
  });

  const updateEmbeddingFirst = () => {
    // Hier wird zufällig entschieden, welcher Typ zuerst angezeigt wird
    isEmbeddingFirst.value = Math.random() < 0.5;
    console.log("isEmbeddingFirst:", isEmbeddingFirst.value)
  };

  const nextSearch = () => {
    // Durchscrollen zum nächsten Suchwort
    const hasNextSearch = currentSearchSetIndex.value < searchQueries.length - 1 || currentSearchIndex.value < searchQueries[currentSearchSetIndex.value].length - 1;

    if (hasNextSearch) {
      currentSearchIndex.value = (currentSearchIndex.value + 1) % searchQueries[currentSearchSetIndex.value].length;

      // Wenn alle Suchwörter im aktuellen Set durchlaufen wurden, zum nächsten Set wechseln
      if (currentSearchIndex.value === 0) {
        currentSearchSetIndex.value = (currentSearchSetIndex.value + 1) % searchQueries.length;
      }

      currentSearchTerm.value = searchQueries[currentSearchSetIndex.value][currentSearchIndex.value];
    }
  };

  const previousSearch = () => {
    // Rückwärts scrollen zum vorherigen Suchwort
    const hasPreviousSearch = currentSearchSetIndex.value > 0 || currentSearchIndex.value > 0;

    if (hasPreviousSearch) {
      currentSearchIndex.value = (currentSearchIndex.value - 1 + searchQueries[currentSearchSetIndex.value].length) % searchQueries[currentSearchSetIndex.value].length;

      // Wenn alle Suchwörter im aktuellen Set rückwärts durchlaufen wurden, zum vorherigen Set wechseln
      if (currentSearchIndex.value === searchQueries[currentSearchSetIndex.value].length - 1) {
        currentSearchSetIndex.value = (currentSearchSetIndex.value - 1 + searchQueries.length) % searchQueries.length;
      }

      currentSearchTerm.value = searchQueries[currentSearchSetIndex.value][currentSearchIndex.value];
    }
  };

  const writeSurveyDataToFirestore = async () => {
    try {
      // Erstelle eine Referenz zur 'sessions'-Sammlung
      const sessionRef = collection(db, 'default');

      // Füge ein neues Dokument mit automatisch generierter ID hinzu
      const sessionDocRef = await addDoc(sessionRef, {
        creator: userName.value,
        createdAt: serverTimestamp(),
      });

      // Erstelle eine Referenz zur Nutzer-Subkollektion innerhalb des Session-Dokuments
      const userRef = collection(sessionDocRef, userName);
      console.log(currentSearchTerm.value)
      // Daten, die in Firestore geschrieben werden sollen
      const data = {
        userPreferences: {
          [currentSearchTerm.value]: currentPreferency.value,
        },
      };

      // Schreibe Daten in Firestore
      await addDoc(userRef, data);

      // // Schreibe Daten in Firestore
      // await addDoc(collection(db, 'default'), data);

      console.log('Daten erfolgreich in Firestore geschrieben!', data);
    } catch (error) {
      console.error('Fehler beim Schreiben in Firestore:', error);
    }
  };

  const saveUserName = () => {
    // Das Popup-Fenster ausblenden
    console.log("saveUserName:", userName.value)
    showPopup.value = false;
    fetchEmbeddingData(currentSearchTerm.value);
    fetchOntologyData(currentSearchTerm.value);
  };

  // Überwache currentSearchTerm um immer neue Daten zu fetchen
  watch(currentSearchTerm, (newValue) => {
    fetchEmbeddingData(newValue);
    fetchOntologyData(newValue);
    updateEmbeddingFirst();
    console.log("currentSearchTerm updated:", currentSearchTerm.value)
  });

  //Überwache currentPreferency um neue Ergebnisse in DB zu schreiben
  watch(currentPreferency, () => {
    console.log("currentPreferency updated:", currentPreferency.value)
  });
</script>

<template>
  <!-- Popup-Fenster -->
  <div v-if="showPopup" class="popup">
    <div class="popup-content">
      <p>Willkommen auf unserer Seite! Bitte gib deinen Namen ein:</p>
      <input v-model.trim="userName" placeholder="Dein Name" class="popup-input" />
      <button @click="saveUserName" class="popup-button" :disabled="userName.trim().length === 0">Speichern</button>
    </div>
  </div>

  <!-- Header of the Page -->
  <div v-if="!showPopup" class="header-container">
    <div>
      <button @click="previousSearch" class="search-button">Previous</button>
      <input v-model="currentSearchTerm" type="text" class="search-input" />
      <button @click="nextSearch" class="search-button">Next</button>
    </div>
  </div>

  <!-- Query Space -->
  <div v-if="!showPopup" class="results-container">
    <div class="button-container">
      <button  class="left-button" v-on:click="handlePreference('left')">The left one is better.</button>
      <button  class="right-button" v-on:click="handlePreference('right')">The right one is better.</button>
    </div>
    <div class="query-container">
      <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsOntology : processedQueryResultsEmbedding"/>
      <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsEmbedding : processedQueryResultsOntology"/>
    </div>
  </div>
</template>

<style scoped>
  /* Popup-Fenster */
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .popup-content {
    background: rgb(31, 31, 31);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }

  .popup-input {
    margin: 10px 0;
    height: 36px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    width: 60%;
    padding: 0 10px;
  }

  .popup-button {
    height: 36px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    padding: 0 15px;
    cursor: pointer;
  }

  /* HEADER */
  .header-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0; /* Hintergrundfarbe für den Kopfbereich */
  }

  .search-input {
    margin: 0;
    height: 46px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    width: 40%;
    padding-right: 40px;
    padding-left: 10px;
  }

  .search-button {
    height: 46px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    padding: 0 15px;
    cursor: pointer;
  }

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


  /* Result Container */
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
  .left-button, .right-button {
    flex: 1;
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
  .left-button:hover, .right-button:hover {
    background-color: #3498db; /* Hintergrundfarbe bei Hover */
    color: #fff; /* Textfarbe bei Hover */
    border-color: #3498db; /* Rahmenfarbe bei Hover */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Schatten bei Hover */
  }

  .queries-container {
  display: flex;
  
  width: 50%; /* Ändere dies entsprechend deiner Anforderungen */
}
</style>