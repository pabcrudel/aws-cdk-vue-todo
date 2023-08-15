<template>
    <form @submit.prevent="sendRequest()" class="editToDo">
        <fieldset>
            <label for="todoName" v-html="'ToDo name: '" />
            <input id="todoName" ref="todoName" type="text" :placeholder="'Eat more vegetables'" v-model="toDo.name" />
            <button type="submit" v-html="'Send'" :disabled="disableButton" />
        </fieldset>
    </form>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';
import { ToDoPrimaryKey, ToDoAttributes } from '../todo-classes';
import { useToDoApiStore } from '../stores/todo-api';
import { onKeyStroke, useFocus } from '@vueuse/core';

const props = defineProps({
    primaryKey: ToDoPrimaryKey,
    attributes: ToDoAttributes,
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
        else if (hasChanged())
            toDoApi.updateToDo(props.primaryKey, toDo.value);

        emit('formSubmitted');
    };
};

function hasChanged() {
    return !toDo.value.isEquals(new ToDoAttributes(toDoApi.getToDoByPrimaryKey(props.primaryKey!)?.name!));
};

const todoName = ref<HTMLInputElement | null>(null);
useFocus(todoName, { initialValue: true });

onKeyStroke('Enter', (e) => {
    e.preventDefault();
    sendRequest();
});
</script>
