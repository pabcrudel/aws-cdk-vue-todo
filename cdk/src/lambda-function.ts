import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dbSDK from "./dynamodb-sdk";
import { randomUUID } from "crypto";

