import { IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';

export interface ApiResourceProps {
    readonly restApi: IRestApi;
    readonly userPoolID: string;
    readonly userPoolClientID: string;
}

export interface CRUDResourceProps extends ApiResourceProps {
    readonly todoTable: ITable;
    readonly todoUserTableName: string;
}