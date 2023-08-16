import { defineStore } from 'pinia'
import axios from 'axios';
import { ToDo, ToDoAttributes, ToDoPrimaryKey } from '@/todo-classes';
import { areEqualToDos, isEqualPrimaryKey } from '../tools';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const useToDoApiStore = defineStore('ToDo Api', {
  state: () => {
    return {
      toDos: [] as ToDo[],
    }
  },
  getters: {
    getToDoByPrimaryKey: (state) => {
      return (primaryKey: ToDoPrimaryKey): ToDo | undefined => state.toDos.find(toDo => isEqualPrimaryKey(toDo.primaryKey, primaryKey));
    },
  },
  actions: {
    async getAllToDos() {
      try {
        const apiResponse = await apiClient.get('');
        this.toDos = apiResponse.data.items as ToDo[];
      }
      catch (error) { console.log(error) };
    },
    async createToDo(attributes: ToDoAttributes) {
      try {
        const apiResponse = await apiClient.post('', attributes);
        this.toDos.push(apiResponse.data.item);
      }
      catch (error) { console.log(error) };
    },
    async updateToDo(toDoToUpdate: ToDo) {
      try {
        await apiClient.put('', toDoToUpdate.attributes, {
          params: toDoToUpdate.primaryKey
        });
        this.toDos.map(toDo => {
          if (areEqualToDos(toDo, toDoToUpdate))
            toDo.attributes === toDoToUpdate.attributes;
        });
      }
      catch (error) { console.log(error) };
    },
    async deleteToDo(toDoToRemove: ToDo) {
      try {
        await apiClient.delete('', {
          params: toDoToRemove.primaryKey,
        });
        this.toDos = this.toDos.filter(toDo => !areEqualToDos(toDo, toDoToRemove));
      }
      catch (error) { console.log(error) };
    },
  },
});
