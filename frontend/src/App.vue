<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink> |
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <div>
    <button @click="fetchData">Obtener datos</button>
  </div>

  <RouterView />
</template>

<script setup>
import apiClient from '../services/axios';

async function fetchData() {
  try {
    const response = await apiClient.get('/');
    console.log(response.data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
  }
};
</script>
