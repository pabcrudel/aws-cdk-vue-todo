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
      return (id: string, date: string): IToDo | undefined => state.toDos.find(toDo =>
        toDo.id === id && toDo.date === date
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
      const { name } = attributes;

      try {
        const apiResponse = await apiClient.post('', {
          "name": name
        });
        this.toDos.push(apiResponse.data.item);
      }
      catch (error) { console.log(error) };
    },
    async updateToDo(primaryKey: IToDoPrimaryKey, attributes: IToDoAttributes) {
      const toDoToUpdate = {...primaryKey, ...attributes};

      try {
        await apiClient.put('', toDoToUpdate);
        this.toDos.map(toDo => {
          if (toDo.id === toDoToUpdate.id && toDo.date === toDoToUpdate.date)
            toDo.name = toDoToUpdate.name;
        });
      }
      catch (error) { console.log(error) };
    },
    async deleteToDo(toDo: IToDo) {
      try {
        await apiClient.delete('', {
          params: {
            "id": toDo.id,
            "date": toDo.date
          },
        });
        this.removeToDo(toDo);
      }
      catch (error) { console.log(error) };
    },
    removeToDo(toDoToRemove: IToDo) {
      this.toDos = this.toDos.filter(toDo => {
        return toDo.id !== toDoToRemove.id || toDo.date !== toDoToRemove.date
      });
    },
  },
});
