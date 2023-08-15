import type { IToDoPrimaryKey, IToDoAttributes, IToDo } from '../../common-types.d.ts';

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

export class ToDo implements IToDo {
    readonly primaryKey: IToDoPrimaryKey;
    attributes: IToDoAttributes;

    constructor(id: string, date: string, name: string)
    constructor(primaryKey: IToDoPrimaryKey, attributes: IToDoAttributes)
    constructor(...args: any[]) {
        if (args.length === 3) {
            this.primaryKey = new ToDoPrimaryKey(args[0], args[1]);
            this.attributes = new ToDoAttributes(args[2]);
        }
        else {
            this.primaryKey = args[0];
            this.attributes = args[1];
        }
    };

    isEquals(obj: Object): boolean {
        return obj instanceof ToDo &&
            this.primaryKey.isEquals(obj.primaryKey) &&
            this.attributes.isEquals(obj.attributes);
    };
};