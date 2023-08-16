<template>
    <div class="myToDos">
        <h1>My ToDos</h1>

        <template v-if="toDos.length > 0">
            <EditToDo v-if="isCreating" @formSubmitted="switchCreating" />
            <button @click="switchCreating" v-html="isCreating ? 'Close' : 'Create a new ToDo'" />

            <template v-for="toDo in toDos" :key="toDo.name">
                <EditToDo v-if="isEditing(toDo.primaryKey.id)" :primary-key="toDo.primaryKey" :attributes="toDo.attributes"
                    @formSubmitted="switchEditing(toDo.primaryKey.id)" />
                <li v-else v-html="toDo.attributes.name" />

                <button @click="toDoApi.deleteToDo(toDo)" v-html="'Delete'" />
                <button @click="switchEditing(toDo.primaryKey.id)"
                    v-html="isEditing(toDo.primaryKey.id) ? 'Close' : 'Update'" />
            </template>
        </template>

        <template v-else>
            <div v-html="'You don\'t have any todo'" />
            <EditToDo v-if="isCreating" @formSubmitted="switchCreating" />
            <button @click="switchCreating" v-html="isCreating ? 'Close' : 'Try adding a new one'" />
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

function isEditing(id: string): boolean { return toDos.value.some(toDo => toDo.primaryKey.id === id && toDo.show) };
const isCreating = ref(false);

function switchCreating() {
    isCreating.value = !isCreating.value;

    toDos.value.forEach(toDo => toDo.show = false);
};
function switchEditing(id: string) {
    isCreating.value = false;

    toDos.value.forEach(toDo => toDo.show = toDo.primaryKey.id === id ? !toDo.show : false);
};
</script>
  