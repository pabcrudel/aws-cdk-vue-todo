/** Represents a ToDo item with a name and an ID. */
export interface ToDo {
    name: string;
    id: string;
}

/** Interface defining methods to interact with the DynamoDB store for ToDo items. */
export interface ToDoDynamoDB {
    /**
     * Retrieves multiple ToDo items from the DynamoDB store.
     * @returns A Promise that resolves to an array of ToDo items, or undefined if no items are found.
     */
    getToDos(): Promise<ToDo[] | undefined>;

    /**
     * Retrieves a ToDo item from the DynamoDB store based on its ID.
     * @param id - The ID of the ToDo item to retrieve.
     * @returns A Promise that resolves to the retrieved ToDo item, or undefined if not found.
     */
    getToDo(id: string): Promise<ToDo | undefined>;

    /**
     * Adds or updates a ToDo item in the DynamoDB store.
     * @param todo - The ToDo item to add or update.
     * @returns A Promise that resolves when the ToDo item is successfully added or updated.
     */
    putToDo(todo: ToDo): Promise<void>;

    /**
     * Deletes a ToDo item from the DynamoDB store based on its ID.
     * @param id - The ID of the ToDo item to delete.
     * @returns A Promise that resolves when the ToDo item is successfully deleted.
     */
    deleteToDo(id: string): Promise<void>;
}