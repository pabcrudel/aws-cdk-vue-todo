export interface IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;
};
export interface IToDoAttributes {
    name: string;
};
export interface IToDo {
    readonly primaryKey: IToDoPrimaryKey;
    attributes: IToDoAttributes;
};