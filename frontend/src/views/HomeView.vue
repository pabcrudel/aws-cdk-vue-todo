<template>
  <div class="home">
    <h1>My ToDos</h1>
    {{ toDoApi.toDos }}
  </div>
</template>

<script setup lang="ts">
import {useToDoApiStore} from '../stores/todo-api';

const toDoApi = useToDoApiStore();
toDoApi.getAllToDos();

</script>
