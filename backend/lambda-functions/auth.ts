import { RequestFunction } from "./types";
import { authResponseCors } from "./utils";

export const register: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const login: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const recovery: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const changePassword: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const changeUsername: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};
export const changeEmail: RequestFunction = (event) => {
    return { statusCode: 200, headers: authResponseCors, body: JSON.stringify(event) };
};