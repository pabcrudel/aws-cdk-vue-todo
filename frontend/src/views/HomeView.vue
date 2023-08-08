<template>
  <div class="home">
    <h1>My ToDos</h1>

    <template v-if="toDos.length > 0" v-for="toDo in toDos" :key="toDo.name">
      <li v-html="toDo.name"/>
    </template>
    
    <div v-else v-html="'ToDo table is empty'"/>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import {useToDoApiStore} from '../stores/todo-api';

const toDoApi = useToDoApiStore();

const { toDos } = toRefs(toDoApi);

toDoApi.getAllToDos();
</script>
