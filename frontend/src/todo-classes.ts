import type { IToDoPrimaryKey, IToDoAttributes } from '../../common-types.d.ts';

export class ToDoPrimaryKey implements IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;

    constructor(id: string, date: string) {
        this.id = id;
        this.date = date;
    };

    isEquals(obj: Object): boolean {
        return obj instanceof ToDoPrimaryKey &&
            obj.id === this.id &&
            obj.date === this.date;
    };
};

export class ToDoAttributes implements IToDoAttributes {
    name: string;

    constructor(name: string) {
        this.name = name;
    };

    isEquals(obj: Object): boolean {
        return obj instanceof ToDoAttributes && obj.name === this.name;
    };
};