<template>
  <div class="home">
    <h1>My ToDos</h1>
    <div>
        <input type="text" placeholder="Add a new ToDo" v-model="toDoName"/>
        <button @click="createToDo(toDoName)" v-html="'Send'"/>
    </div>

    <template v-if="toDos.length > 0" v-for="toDo in toDos" :key="toDo.name">
      <li v-html="toDo.name"/>
      <button v-html="'Delete'" @click="toDoApi.deleteToDo(toDo)"/>
    </template>

    <div v-else v-html="'ToDo table is empty'"/>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue';
import {useToDoApiStore} from '../stores/todo-api';
import EditToDo from '@/components/EditToDo.vue';
import type { ToDo } from '@/todo-types';

const toDoApi = useToDoApiStore();

const { toDos } = toRefs(toDoApi);

toDoApi.getAllToDos();

const createToDo = (name: string) => {
  if (name.length > 0) {
    toDoApi.createToDo(name);
    toDoName.value = '';
  };
};

const toDoName = ref('');
</script>
