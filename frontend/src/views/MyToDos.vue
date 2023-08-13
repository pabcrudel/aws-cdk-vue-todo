<template>
    <div class="myToDos">
      <h1>My ToDos</h1>
      <EditToDo :send-request="toDoApi.createToDo" :initial-text="'Add a new ToDo'" />
  
      <template v-if="toDos.length > 0" v-for="toDo in toDos" :key="toDo.name">
        <EditToDo v-if="showDialog[toDo.name]" 
          :send-request="toDoApi.updateToDo" 
          :initial-text="toDo.name" 
          :id="toDo.id"
          :date="toDo.date"
        />
        <li v-else v-html="toDo.name" />
        <button v-html="'Delete'" @click="toDoApi.deleteToDo(toDo)" />
        <button v-html="'Update'" @click="showDialog[toDo.name] = !showDialog[toDo.name]" />
      </template>
  
      <div v-else v-html="'You don\'t have any todo'" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { toRefs, ref } from 'vue';
  import { useToDoApiStore } from '../stores/todo-api';
  import EditToDo from '@/components/EditToDo.vue';
  
  const toDoApi = useToDoApiStore();
  const { toDos } = toRefs(toDoApi);
  toDoApi.getAllToDos();
  
  const showDialog = ref({} as {[key: string]: boolean;});
  </script>
  