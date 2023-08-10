<template>
  <header>
    <Navbar/>
  </header>

  <RouterView :key="$route.fullPath"/>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>
