<template>
    <div>
        <textarea v-model="toDo"></textarea>
        <button @click="returnToDo">Send</button>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({initialText: String});

const emit = defineEmits();

const toDo = ref(props.initialText || '');

const returnToDo = () => {
    emit('ToDo', toDo.value);
};
</script>
  