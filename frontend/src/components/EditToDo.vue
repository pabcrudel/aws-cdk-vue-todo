<template>
    <div>
        <input type="text" :placeholder="props.initialText" v-model="toDo"/>
        <button @click="returnToDo" v-html="'Send'"/>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({initialText: String});

const emit = defineEmits();

const toDo = ref('');

const returnToDo = () => {
    if (toDo.value.length > 0) emit('ToDo', toDo.value);
};
</script>
  