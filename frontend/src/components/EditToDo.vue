<template>
    <div class="editToDo">
        <input type="text" :placeholder="props.initialText" v-model="toDoName" />
        <button @click="" v-html="'Send'" :disabled="disableButton"/>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';
import {ToDoPrimaryKey, ToDoAttributes} from '../todo-classes';

const props = defineProps({
    primaryKey: ToDoPrimaryKey,
    attributes: ToDoAttributes,
    initialText: String
});

const toDoName = ref('');

const disableButton = computed(() => {
    return toDoName.value.length < 1;
});
</script>
  
