import { IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';

export interface ApiResourceProps {
    readonly restApi: IRestApi;
    readonly userPool: IUserPool;
    readonly userPoolClientID: string;
}

export interface CRUDResourceProps extends ApiResourceProps {
    readonly todoTable: ITable;
    readonly todoUserTableName: string;
}