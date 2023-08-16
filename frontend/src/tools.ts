import { ToDo, ToDoAttributes, ToDoPrimaryKey } from './todo-classes';

export const areEqualToDos = (toDoA: ToDo, toDoB: ToDo): boolean =>
    isEqualPrimaryKey(toDoA.primaryKey, toDoB.primaryKey) &&
    areEqualAttributes(toDoA.attributes, toDoB.attributes);

export const isEqualPrimaryKey = (primaryKeyA: ToDoPrimaryKey, primaryKeyB: ToDoPrimaryKey): boolean =>
    primaryKeyA.id === primaryKeyB.id &&
    primaryKeyA.date === primaryKeyB.date;

export const areEqualAttributes = (attributesA: ToDoAttributes, attributesB: ToDoAttributes): boolean =>
    attributesA.name === attributesB.name;
