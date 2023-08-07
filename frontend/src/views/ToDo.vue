<template>
    <button @click="fetchData">Obtener datos</button>

    <template v-if="response.length > 0">
        <div v-for="res in response">{{ res }}</div>
    </template>
</template>
  
<script setup>
import { ref } from 'vue';
import apiClient from '../../services/axios';

const response = ref([]);

async function fetchData() {
    try {
        const apiResponse = await apiClient.get();
        response.value = apiResponse.data.items;
    } 
    catch (error) {
        console.error('Error al obtener datos:', error);
    }
}
</script>
  