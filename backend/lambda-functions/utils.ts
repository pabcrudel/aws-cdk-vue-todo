const responseCors = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*"
};

export const authResponseCors = {
    ...responseCors,
    "Access-Control-Allow-Methods": "POST"
};