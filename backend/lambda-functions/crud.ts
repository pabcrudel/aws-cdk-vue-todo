import { RequestFunction } from "./types";
import { ApiSuccessResponse } from "./utils";

export const listToDos: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const createToDo: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const updateToDo: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const deleteToDo: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};