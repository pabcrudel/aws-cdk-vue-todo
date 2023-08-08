<template>
    <div>
        <input type="text" :placeholder="props.initialText" v-model="toDoName"/>
        <button @click="returnToDoName" v-html="'Send'"/>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({initialText: String});

const emit = defineEmits();

const toDoName = ref('');

const returnToDoName = () => {
    if (toDoName.value.length > 0) emit('ToDoName', toDoName.value);
};
</script>
  