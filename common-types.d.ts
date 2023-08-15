export interface IToDoPrimaryKey {
    id: string;
    date: string;
};
export interface IToDoAttributes {
    name: string;
};
export interface IToDo extends IToDoPrimaryKey, IToDoAttributes {};