import { RequestFunction } from "./types";
import { ApiSuccessResponse } from "./utils";

export const listToDos: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const createToDo: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const updateToDo: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const deleteToDo: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};