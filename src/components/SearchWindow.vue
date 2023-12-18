<script setup>
  import SearchBar from '@/components/SearchBar.vue'
  import QueryResult from '@/components/QueryResult.vue'
  import {ref, watch, computed, onMounted} from 'vue'
  import { addDoc, collection, serverTimestamp, setDoc, doc, onSnapshot } from 'firebase/firestore';
  import { db } from '@/firebase.js';

  const currentSessionRef = ref(null);

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
 
  const progress = computed(() => completedSearchTerms.value.size / (searchQueries.length * searchQueries[0].length));
  const completedSearchTerms = ref(new Set());
  const completedSearchTermsCount = computed(() => completedSearchTerms.value.size);
  const isCurrentSearchTermCompleted = computed(() => completedSearchTerms.value.has(currentSearchTerm.value));

  const showPopup = ref(true);
  const userName = ref('');

  const startSurvey = async () => {
    try {
      // Erstelle ein neues Dokument in der 'sessions'-Sammlung mit dem Namen des Nutzers und dem aktuellen Zeitstempel
      const sessionDocRef = await addDoc(collection(db, 'sessions'), {
        userName: userName.value,
        createdAt: serverTimestamp()
      });
      
      // Speichere die erstellte Session-ID in der reaktiven Referenz
      currentSessionRef.value = sessionDocRef.id;
    } catch (error) {
      console.error('Fehler beim Starten einer neuen Umfragesitzung in Firestore:', error);
    }
  };

  const handlePreference = (direction) => {
    // Hier fügst du die gedrückte Richtung für die aktuelle Query und das aktuelle Set zum Array hinzu
    console.log("handlePreference:", direction)
    console.log ("isEmbeddingFirst:", isEmbeddingFirst.value)
    if ((isEmbeddingFirst.value && direction === "left") || (!isEmbeddingFirst.value && direction === "right")) {
      currentPreferency.value = "embedding";
    } else {
      currentPreferency.value = "ontology";
    }

    console.log("currentPreferency:", currentPreferency.value)
    writeSurveyDataToFirestore(currentSearchTerm.value, currentPreferency.value);

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
    // Ermitteln, ob es einen nächsten Suchbegriff gibt
    const hasNextSearch = currentSearchIndex.value < searchQueries[0].length - 1 || currentSearchSetIndex.value < searchQueries.length - 1;

    if (hasNextSearch) {
      // Zum nächsten Set wechseln (vertikales Scrollen)
      currentSearchSetIndex.value = (currentSearchSetIndex.value + 1) % searchQueries.length;

      // Wenn alle Sets für den aktuellen Suchindex durchlaufen wurden, zum nächsten Suchindex wechseln
      if (currentSearchSetIndex.value === 0) {
        currentSearchIndex.value = (currentSearchIndex.value + 1) % searchQueries[0].length;
      }

      // Aktuelles Suchwort aktualisieren
      currentSearchTerm.value = searchQueries[currentSearchSetIndex.value][currentSearchIndex.value];
    } else {
      // Wenn hasNextSearch false ist, sind wir am Ende und müssen eventuell einen speziellen Fall handhaben.
      // Dieses else könnte entfernt werden, wenn es nichts zu tun gibt, sobald alle Suchbegriffe durchlaufen wurden.
    }
  };

  const previousSearch = () => {
    // Ermitteln, ob es einen vorherigen Suchbegriff gibt
    const hasPreviousSearch = currentSearchSetIndex.value > 0 || currentSearchIndex.value > 0;

    if (hasPreviousSearch) {
      // Dekrementieren des Set-Index, um das vorherige Element vertikal zu erreichen
      currentSearchSetIndex.value = (currentSearchSetIndex.value - 1 + searchQueries.length) % searchQueries.length;

      // Wenn das erste Set im aktuellen Suchindex erreicht wurde, den Suchindex dekrementieren
      if (currentSearchSetIndex.value === searchQueries.length - 1) {
        currentSearchIndex.value = (currentSearchIndex.value - 1 + searchQueries[0].length) % searchQueries[0].length;
      }

      // Aktuelles Suchwort aktualisieren
      currentSearchTerm.value = searchQueries[currentSearchSetIndex.value][currentSearchIndex.value];
    }
  };

  const writeSurveyDataToFirestore = async (searchTerm, preferency) => {
    if (!currentSessionRef.value) {
      console.error('Es gibt keine aktive Umfragesitzung.');
      return;
    }

    try {
      const sessionDocRef = doc(db, 'sessions', currentSessionRef.value);

      // Daten, die in Firestore geschrieben werden sollen
      const data = {
        [searchTerm]: preferency
      };

      // Aktualisiere die User-Präferenzen im entsprechenden Sitzungsdokument
      await setDoc(sessionDocRef, {
        userPreferences: data
      }, { merge: true });

      //Update Progress
      completedSearchTerms.value.add(searchTerm);

      console.log('Daten erfolgreich zu Firestore hinzugefügt oder aktualisiert', searchTerm, preferency);
    } catch (error) {
      console.error('Fehler beim Schreiben von Umfragedaten in Firestore:', error);
    }
  };

  const saveUserName = () => {
    // Das Popup-Fenster ausblenden
    console.log("saveUserName:", userName.value)
    showPopup.value = false;
    fetchEmbeddingData(currentSearchTerm.value);
    fetchOntologyData(currentSearchTerm.value);
    startSurvey();
  };

  const onEnter = () => {
    // Führe die gewünschte Logik nur aus, wenn der Benutzername gültig ist
    if (userName.value.trim().length > 0) {
      saveUserName();
    }
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
  <div class="page">

    <!-- Popup-Fenster -->
    <div v-if="showPopup" class="popup-container">
      <p>Willkommen auf unserer Seite! Bitte gib deinen Namen ein:</p>
      <input v-model.trim="userName" placeholder="Dein Name" class="popup-input" @keyup.enter="onEnter"/>
      <button @click="saveUserName" class="popup-button" :disabled="userName.trim().length === 0">Speichern</button>
    </div>

    <!-- Header of the Page -->
    <div v-if="!showPopup" class="header-container">
      <button @click="previousSearch" class="search-button">Previous</button>
      <input v-model="currentSearchTerm" type="text" class="search-input" />
      <button @click="nextSearch" class="search-button" :disabled="!isCurrentSearchTermCompleted">Next</button>
    </div>

    <!-- Fortschrittsbalken-Container -->
    <div v-if="!showPopup" class="progress-container">
      <!-- Fortschrittsbalken 
      <div class="progress-bar" :style="{ width: progressBarWidth }"></div>-->
      <div class="progress-bar" :style="{ width: `${progress * 100}%` }" placeholder=""></div>
      <p>{{ completedSearchTermsCount }} von {{ searchQueries.length * searchQueries[0].length }} Bewertungen abgeschlossen</p>
    </div>

    <!-- Preferency-Buttons -->
    <div v-if="!showPopup" class="button-container">
      <button class="left-button" v-on:click="handlePreference('left')">The left one is better.</button>
      <button class="right-button" v-on:click="handlePreference('right')">The right one is better.</button>
    </div>
  </div>

  <!-- Query Space -->
  <div v-if="!showPopup" class="query-container">
    <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsOntology : processedQueryResultsEmbedding"/>
    <div class="separator"></div>
    <QueryResult class="results" :results="isEmbeddingFirst ? processedQueryResultsEmbedding : processedQueryResultsOntology"/>
  </div>

</template>

<style scoped>
  /* Page */
  .page {
    display: flex;
    
    justify-content: center; 
    align-items: stretch; 
    /* flex-flow: column nowrap; */ 
    flex-direction: column; 
    flex-wrap: nowrap; 
    align-content: stretch;
  }

  /* Popup-Fenster */
  .popup-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #282828;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .popup-content {
    background: #282828;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    color: #ffffff;
  }

  .popup-input {
    margin: 10px 0;
    height: 36px;
    border-radius: 5px; /* Kleinere Rundung, um dem Design des Buttons zu entsprechen */
    border: 2px solid #282828;
    width: 10%; /* Volle Breite des Elternelements */
    padding: 0 10px;
    box-sizing: border-box; /* Berücksichtigt die Padding- und Border-Werte in der Gesamtbreite */
    color: #000000;
    text-align: center;
  }

  /* .popup-button {
    height: 36px;
    border-radius: 48px;
    border: 0.5px solid lightgrey;
    padding: 0 15px;
    cursor: pointer;
  } */

  .popup-button {
    height: 36px;
    border-radius: 5px;
    border: 2px solid #282828;
    padding: 10px 20px;
    font-size: 16px;
    text-align: center;
    text-decoration: none;
    color: #ffffff;
    background-color: #282828;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  /* HEADER */
  .header-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 10px;
    background-color: lightgray; /* Hintergrundfarbe für den Kopfbereich */
  }

  .search-input {
    text-align: center;
    margin: 0;
    height: 46px;
    border-radius: 48px;
    border: 2px solid #3498db;
    width: 40%;
    padding-right: 40px;
    padding-left: 10px;
  }

  .search-button {
    height: 46px;
    border-radius: 48px;
    border: 2px solid #3498db;
    padding: 0 15px;
    cursor: pointer;
  }

  /* Progress Bar */
    .progress-container {
    width: 100%;
    background-color: #282828;
  }

  .progress-bar {
    height: 20px;
    background-color: #3498db;
  }

  /* Preferency-Buttons */

  .button-container {
    display: flex;
    justify-content: space-around; ;
    align-items: center; /* Ändere space-around zu space-between oder space-evenly, je nachdem, welchen Abstand du bevorzugst */
  }

  .left-button, .right-button {
    padding: 10px 20px;
    font-size: 16px;
    text-align: center;
    text-decoration: none;
    border: 2px solid #3498db; /* Farbe des Rahmens */
    border-radius: 5px;
    color: #ffffff; /* Textfarbe */
    background-color: #282828; /* Hintergrundfarbe */
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

  /* Result Container */
    .separator {
    width: 5px;
    background-color: lightgrey; /* Ändern Sie dies in die gewünschte Farbe */
  }

  .query-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around; 
    background-color: #282828;
  }
</style>