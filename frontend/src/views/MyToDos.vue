<template>
    <div class="myToDos">
        <h1>My ToDos</h1>
        <EditToDo/>

        <template v-if="toDos.length > 0" v-for="toDo in toDos" :key="toDo.name">
            <EditToDo v-if="showDialog[toDo.name]" 
                :primary-key="{id: toDo.id, date: toDo.date}"
                :attributes="{name: toDo.name}"
            />
            <li v-else v-html="toDo.name" />
            <button v-html="'Delete'" @click="toDoApi.deleteToDo(toDo)" />
            <button v-html="showDialog[toDo.name] ? 'Close' : 'Update'" @click="showDialog[toDo.name] = !showDialog[toDo.name]" />
        </template>

        <template v-else>
            <div v-html="'You don\'t have any todo'" />
        </template>
    </div>
</template>
  
<script setup lang="ts">
import { toRefs, ref } from 'vue';
import { useToDoApiStore } from '../stores/todo-api';
import EditToDo from '@/components/EditToDo.vue';

const toDoApi = useToDoApiStore();
const { toDos } = toRefs(toDoApi);
toDoApi.getAllToDos();

const showDialog = ref({} as { [key: string]: boolean; });
</script>
  