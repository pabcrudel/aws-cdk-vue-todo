export interface IToDoKey {
    id: string;
    date: string;
};
export interface IToDo extends IToDoKey {
    name: string;
};