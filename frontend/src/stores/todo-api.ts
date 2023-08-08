import { defineStore } from 'pinia'
import axios from 'axios';
import type { ToDo } from '../todo-types';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

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
      catch (error) { console.log(error) };
    },
    async createToDo(name: string) {
      try {
        const apiResponse = await apiClient.post('', {
          "name": name
        });
        this.toDos.push(apiResponse.data.item);
      }
      catch (error) { console.log(error) };
    },
    async deleteToDo(toDo: ToDo) {
      try {
        await apiClient.delete('', {
          headers: {
            "id": toDo.id,
            "date": toDo.date
          },
        });
      }
      catch (error) { console.log(error) };
    }
  },
});
