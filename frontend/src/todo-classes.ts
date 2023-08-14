import type {IToDoPrimaryKey, IToDoAttributes} from '../../common-types.d.ts';

export class ToDoPrimaryKey implements IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;
    
    constructor(id: string, date: string) {
        this.id = id;
        this.date = date;
    };
};

export class ToDoAttributes implements IToDoAttributes {
    name: string;

    constructor(name: string) {
        this.name = name;
    };
};