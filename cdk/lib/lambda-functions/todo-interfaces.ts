interface ToDo {
    name: string;
    id: string;
}

export interface ToDoDynamo {
    getToDo: (id: string) => Promise<ToDo | undefined>;
    putToDo: (todo: ToDo) => Promise<void>;
    deleteToDo: (id: string) => Promise<void>;
    getToDos: () => Promise<ToDo[] | undefined>;
};