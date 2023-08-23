import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBStorage extends Construct {
    /** DynamoDB table for storing ToDo items. */
    readonly todoTable: dynamodb.Table;

    /** Local secondary DynamoDB table name */
    readonly todoUserTableName = 'ToDoUserTable';

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.todoTable = new dynamodb.Table(this, 'ToDoTable', {
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'toDoId',
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Local secondary DynamoDB table for sorting by Cognito User
        this.todoTable.addLocalSecondaryIndex({
            indexName: this.todoUserTableName,
            sortKey: {
                name: 'date',
                type: dynamodb.AttributeType.STRING
            },
        });
    };
};