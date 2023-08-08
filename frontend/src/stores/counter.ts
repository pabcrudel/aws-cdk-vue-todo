import { defineStore } from 'pinia'
import axios from 'axios';

const apiClient = axios.create({baseURL: import.meta.env.VITE_API_URL});

export const useToDoApiStore = defineStore('ToDo Api', {
  state: () => {
    return {
      toDos: []
    }
  },
  actions: {
    async getAllToDos() {
      try {
        const apiResponse = await apiClient.get('');
        this.toDos = apiResponse.data.items;
      } 
      catch (error) {console.log(error)};
    },
  },
});
