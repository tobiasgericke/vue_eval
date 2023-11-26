<script setup>
import SearchBar from '@/components/SearchBar.vue'
import QueryResult from '@/components/QueryResult.vue'
import {ref} from 'vue'

const currentSearchTerm = ref("");

//Suchterm holen

//API Calls Speichern in jeweilige Variable
const queryResultsEmbedding = []
const queryResultsOntology = []

//Listen an QueryResult-Element Übergeben


</script>

<template>
    <SearchBar />
    <QueryResult />
    <QueryResult />
</template>

<style scoped>

</style>