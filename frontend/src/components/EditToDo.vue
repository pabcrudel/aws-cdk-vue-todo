<template>
    <form @submit.prevent="sendRequest()" class="editToDo">
        <fieldset>
            <label for="todoName" v-html="'ToDo name: '" />
            <input id="todoName" ref="todoName" type="text" :placeholder="props.initialText" v-model="toDo.name" />
            <button type="submit" v-html="'Send'" :disabled="disableButton" />
        </fieldset>
    </form>
</template>
  
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ToDoPrimaryKey, ToDoAttributes } from '../todo-classes';
import { useToDoApiStore } from '../stores/todo-api';
import { onKeyStroke } from '@vueuse/core'

const props = defineProps({
    primaryKey: ToDoPrimaryKey,
    attributes: ToDoAttributes,
    initialText: {
        type: String,
        default: "Eat more vegetables",
    },
});
const emit = defineEmits(['formSubmitted']);

const toDoApi = useToDoApiStore();

const toDo = ref(props.attributes || new ToDoAttributes(''));

const disableButton = computed(() => {
    return toDo.value.name.length < 1;
});

function sendRequest() {
    if (toDo.value.name.length > 0) {
        if (props.primaryKey === undefined || props.attributes === undefined)
            toDoApi.createToDo(toDo.value);
        else toDoApi.updateToDo(props.primaryKey, toDo.value);

        emit('formSubmitted');
    };
};

const todoName = ref<HTMLInputElement | null>(null);
onMounted(() => {
    if (todoName.value) todoName.value.focus();
});

onKeyStroke('Enter', (e) => {
  e.preventDefault();
  sendRequest();
});
</script>
  
