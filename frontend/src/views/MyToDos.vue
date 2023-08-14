<template>
    <div class="myToDos">
        <h1>My ToDos</h1>

        <template v-if="toDos.length > 0">
            <EditToDo v-if="isCreating" />
            <button @click="switchCreating" v-html="isCreating ? 'Close' : 'Create a new ToDo'" />

            <template v-for="toDo in toDos" :key="toDo.name">
                <EditToDo v-if="isEditing(toDo.id)" 
                    :primary-key="new ToDoPrimaryKey(toDo.id, toDo.date)"
                    :attributes="new ToDoAttributes(toDo.name)" />
                <li v-else v-html="toDo.name" />

                <button @click="toDoApi.deleteToDo(toDo)" v-html="'Delete'" />
                <button @click="switchEditing(toDo.id)" v-html="isEditing(toDo.id) ? 'Close' : 'Update'" />
            </template>
        </template>

        <template v-else>
            <div v-html="'You don\'t have any todo'" />
            <EditToDo v-if="isCreating" />
            <button @click="switchCreating" v-html="isCreating ? 'Close' : 'Try adding a new one'" />
        </template>
    </div>
</template>
  
<script setup lang="ts">
import { toRefs, ref, watch } from 'vue';
import { useToDoApiStore } from '../stores/todo-api';
import EditToDo from '@/components/EditToDo.vue';
import { ToDoPrimaryKey, ToDoAttributes } from '../todo-classes';

const toDoApi = useToDoApiStore();
const { toDos } = toRefs(toDoApi);
toDoApi.getAllToDos();

const toDoDetails = ref([] as { id: string; show: boolean; }[]);
function isEditing(id: string): boolean { return toDoDetails.value.some(toDo => toDo.id === id && toDo.show) };
const isCreating = ref(false);

function switchCreating() {
    isCreating.value = !isCreating.value;

    toDoDetails.value.forEach(toDo => toDo.show = false);
};
function switchEditing(id: string) {
    isCreating.value = false;

    toDoDetails.value.forEach(toDo => toDo.show = toDo.id === id ? !toDo.show : false);
};

watch(toDoApi.$state, (state) => {
    toDoDetails.value = state.toDos.map(toDo => {
        return { id: toDo.id, show: false };
    });
});
</script>
  