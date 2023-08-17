import { defineStore } from 'pinia'
import axios from 'axios';
import { ToDo, ToDoAttributes, ToDoPrimaryKey } from '@/todo-classes';
import { areEqualToDos, isEqualPrimaryKey } from '../tools';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const useToDoApiStore = defineStore('ToDo Api', {
  state: () => {
    return {
      toDos: [] as ToDo[],
      requestInProgress: false,
    }
  },
  getters: {
    getToDoByPrimaryKey: (state) => {
      return (primaryKey: ToDoPrimaryKey): ToDo | undefined => state.toDos.find(toDo => isEqualPrimaryKey(toDo.primaryKey, primaryKey));
    },
  },
  actions: {
    async getAllToDos() {
      this.requestInProgress = true;

      try {

        const apiResponse = await apiClient.get('');
        this.toDos = apiResponse.data.items as ToDo[];
      }
      catch (error) { console.log(error) };

      this.requestInProgress = false;
    },
    async createToDo(attributes: ToDoAttributes) {
      this.requestInProgress = true;

      try {
        const apiResponse = await apiClient.post('', attributes);
        this.toDos.push(apiResponse.data.item);
      }
      catch (error) { console.log(error) };

      this.requestInProgress = false;
    },
    async updateToDo(toDoToUpdate: ToDo) {
      this.requestInProgress = true;

      try {
        const {primaryKey, attributes} = toDoToUpdate;
        await apiClient.put('', attributes, {
          params: primaryKey
        });
        this.toDos.map(toDo => {
          if (isEqualPrimaryKey(toDo.primaryKey, primaryKey))
            toDo.attributes = attributes;
        });
      }
      catch (error) { console.log(error) };

      this.requestInProgress = false;
    },
    async deleteToDo(toDoToRemove: ToDo) {
      this.requestInProgress = true;

      try {
        await apiClient.delete('', {
          params: toDoToRemove.primaryKey,
        });
        this.toDos = this.toDos.filter(toDo => !areEqualToDos(toDo, toDoToRemove));
      }
      catch (error) { console.log(error) };

      this.requestInProgress = false;
    },
  },
});
