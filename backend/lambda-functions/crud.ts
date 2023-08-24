import { RequestFunction } from "./types";
import { authResponseCors } from "./utils";

export const listToDos: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const createToDo: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const updateToDo: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const deleteToDo: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};