import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cr from 'aws-cdk-lib/custom-resources'
import { Construct } from 'constructs'


export interface S3ObjectStorageProps {
    /** The bucket where object should be uploaded */
    bucket: s3.IBucket
    /** Key to upload to object */
    key: string
    /** The object to be uploaded */
    object: Record<string, string>
}

/** This construct allow to upload a JSON object to given S3 bucket. */
export class S3ObjectStorage extends Construct {
    constructor(scope: Construct, id: string, props: S3ObjectStorageProps) {
        super(scope, id);

        /** Common atributes for the Aws Sdk call */
        class awsCall implements cr.AwsSdkCall {
            action = 'putObject';
            parameters = {
                Body: JSON.stringify(props.object),
                Bucket: props.bucket.bucketName,
                CacheControl: 'max-age=0, no-cache, no-store, must-revalidate',
                ContentType: 'application/json',
                Key: props.key,
            };
            service = 'S3';
            physicalResourceId: cr.PhysicalResourceId;

            constructor(physicalResourceId: string) {
                this.physicalResourceId = cr.PhysicalResourceId.of(physicalResourceId);
            };
        };

        new cr.AwsCustomResource(this, 'CustomeS3Storage', {
            resourceType: 'Custom::AWS-S3-Object',
            onCreate: new awsCall('create-config'),
            onUpdate: new awsCall('update-config'),
            policy: cr.AwsCustomResourcePolicy.fromStatements([
                new iam.PolicyStatement({
                    actions: [
                        's3:PutObject',
                    ],
                    resources: [
                        props.bucket.arnForObjects(props.key),
                    ],
                }),
            ]),
        });
    };
};
