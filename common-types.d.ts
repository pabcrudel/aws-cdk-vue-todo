export interface IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;
    isEquals(obj: Object): boolean;
};
export interface IToDoAttributes {
    name: string;
    isEquals(obj: Object): boolean;
};
export interface IToDo {
    readonly primaryKey: IToDoPrimaryKey;
    attributes: IToDoAttributes;
    isEquals(obj: Object): boolean;
};