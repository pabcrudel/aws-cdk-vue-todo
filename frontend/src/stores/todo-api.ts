import { defineStore } from 'pinia'
import axios from 'axios';
import type { IToDo, IToDoAttributes, IToDoPrimaryKey } from '../../../common-types';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const useToDoApiStore = defineStore('ToDo Api', {
  state: () => {
    return {
      toDos: [] as IToDo[],
    }
  },
  getters: {
    getToDoByPrimaryKey: (state) => {
      return (primaryKey: IToDoPrimaryKey): IToDo | undefined => state.toDos.find(toDo =>
        toDo.primaryKey.isEquals(primaryKey)
      );
    },
  },
  actions: {
    async getAllToDos() {
      try {
        const apiResponse = await apiClient.get('');
        this.toDos = apiResponse.data.items;
      }
      catch (error) { console.log(error) };
    },
    async createToDo(attributes: IToDoAttributes) {
      try {
        const apiResponse = await apiClient.post('', attributes);
        this.toDos.push(apiResponse.data.item);
      }
      catch (error) { console.log(error) };
    },
    async updateToDo(toDoToUpdate: IToDo) {
      try {
        await apiClient.put('', toDoToUpdate);
        this.toDos.map(toDo => {
          if (toDo.primaryKey.isEquals(toDoToUpdate.primaryKey))
            toDo.attributes === toDoToUpdate.attributes;
        });
      }
      catch (error) { console.log(error) };
    },
    async deleteToDo(toDo: IToDo) {
      try {
        await apiClient.delete('', {
          params: toDo.primaryKey,
        });
        this.removeToDo(toDo);
      }
      catch (error) { console.log(error) };
    },
    removeToDo(toDoToRemove: IToDo) {
      this.toDos = this.toDos.filter(toDo => {
        return toDo.isEquals(toDoToRemove);
      });
    },
  },
});
