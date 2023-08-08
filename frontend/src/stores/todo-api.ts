import { defineStore } from 'pinia'
import axios from 'axios';

const apiClient = axios.create({baseURL: import.meta.env.VITE_API_URL});

interface ToDo {
  id: string;
  date: string;
  name: string;
}

export const useToDoApiStore = defineStore('ToDo Api', {
  state: () => {
    return {
      toDos: [] as ToDo[],
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
