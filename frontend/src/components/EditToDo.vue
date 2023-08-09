<template>
    <div class="editToDo">
        <input type="text" :placeholder="props.initialText" v-model="toDoName" />
        <button @click="executeFunction" v-html="'Send'" :disabled="disableButton"/>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
    id: String,
    date: String,
    initialText: String,
    sendRequest: Function
});

const toDoName = ref('');

const disableButton = computed(() => {
    return toDoName.value.length < 1;
});

const executeFunction = () => {
    if (toDoName.value.length > 0 && props.sendRequest !== undefined) {
        if (props.id !== undefined && props.date !== undefined)
            props.sendRequest({ name: toDoName.value, id: props.id, date: props.date });
        else {
            props.sendRequest(toDoName.value);
            toDoName.value = '';
        };
    };
};
</script>
  
