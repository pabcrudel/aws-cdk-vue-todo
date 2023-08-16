<template>
    <form @submit.prevent="sendRequest()" class="editToDo">
        <fieldset>
            <label for="todoName" v-html="'ToDo name: '" />
            <input id="todoName" ref="todoName" type="text" :placeholder="'Eat more vegetables'" v-model="toDoAttributes.name" />
            <button type="submit" v-html="'Send'" :disabled="disableButton" />
        </fieldset>
    </form>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';
import { ToDoAttributes, ToDo } from '../todo-classes';
import { useToDoApiStore } from '../stores/todo-api';
import { onKeyStroke, useFocus } from '@vueuse/core';
import type { IToDoAttributes, IToDoPrimaryKey } from '../../../common-types';

const props = defineProps<{
    primaryKey?: IToDoPrimaryKey,
    attributes?: IToDoAttributes
}>();
const emit = defineEmits(['formSubmitted']);

const toDoApi = useToDoApiStore();

const toDoAttributes = ref(props.attributes || new ToDoAttributes(''));

const disableButton = computed(() => {
    return toDoAttributes.value.name.length < 1;
});

function sendRequest() {
    if (toDoAttributes.value.name.length > 0) {
        if (props.primaryKey === undefined || props.attributes === undefined)
            toDoApi.createToDo(toDoAttributes.value);
        else if (hasChanged())
            toDoApi.updateToDo(new ToDo(props.primaryKey, toDoAttributes.value));

        emit('formSubmitted');
    };
};

function hasChanged() {
    return !toDoApi.getToDoByPrimaryKey(props.primaryKey!)?.attributes.isEquals(toDoAttributes.value);
};

const todoName = ref<HTMLInputElement | null>(null);
useFocus(todoName, { initialValue: true });

onKeyStroke('Enter', (e) => {
    e.preventDefault();
    sendRequest();
});
</script>
