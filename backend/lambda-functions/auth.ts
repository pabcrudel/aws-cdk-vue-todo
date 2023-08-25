import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import { authResponseCors } from "./utils";

const cognito = new CognitoIdentityProviderClient({ region: process.env.USER_POOL_REGION });

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