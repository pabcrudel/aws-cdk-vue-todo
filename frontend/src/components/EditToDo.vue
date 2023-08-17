<template>
    <form @submit.prevent="sendRequest()" class="editToDo">
        <fieldset>
            <label for="todoName" v-html="'ToDo name: '" />
            <input id="todoName" ref="todoName" type="text" :placeholder="'Eat more vegetables'"
                v-model="toDoAttributes.name" />
            <button type="submit" v-html="'Send'" :disabled="disableButton" />
        </fieldset>
    </form>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToDoApiStore } from '../stores/todo-api';
import { onKeyStroke, useFocus } from '@vueuse/core';
import type { IToDoAttributes, IToDoPrimaryKey } from '../../../common-types';
import { ToDo, ToDoAttributes } from '@/todo-classes';
import { areEqualToDos } from '../tools';

const props = defineProps<{
    primaryKey?: IToDoPrimaryKey,
    attributes?: IToDoAttributes
}>();
const emit = defineEmits(['formSubmitted']);

const toDoApi = useToDoApiStore();

const toDoAttributes = ref(
    props.attributes === undefined ?
    new ToDoAttributes('') :
    Object.assign({}, props.attributes) // Object.assign copies without reference
);

const disableButton = computed(() => {
    return toDoAttributes.value.name.length < 1;
});

function sendRequest() {
    if (toDoAttributes.value.name.length > 0) {
        if (props.primaryKey === undefined || props.attributes === undefined)
            toDoApi.createToDo(toDoAttributes.value);
        else {
            const toDo = new ToDo(props.primaryKey, toDoAttributes.value);
            if (!areEqualToDos(toDo, toDoApi.getToDoByPrimaryKey(props.primaryKey)!))
                toDoApi.updateToDo(new ToDo(props.primaryKey, toDoAttributes.value));
        };

        emit('formSubmitted');
    };
};

const todoName = ref<HTMLInputElement | null>(null);
useFocus(todoName, { initialValue: true });

onKeyStroke('Enter', (e) => {
    e.preventDefault();
    sendRequest();
});
</script>
