import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import { ApiSuccessResponse } from "./utils";

const cognito = new CognitoIdentityProviderClient({ region: process.env.USER_POOL_REGION });

export const register: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const login: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const recovery: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const changePassword: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const changeUsername: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};
export const changeEmail: RequestFunction = (event) => {
    return new ApiSuccessResponse(event);
};