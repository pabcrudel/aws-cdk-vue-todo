import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class WebsiteResourceBuildingConstruct extends Construct {
    s3HostingBucket: cdk.aws_s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** The s3 bucket where the website will be hosted */
        this.s3HostingBucket = new s3.Bucket(this, 'S3HostingBucket', {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            accessControl: s3.BucketAccessControl.PRIVATE,
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        // Displays Bucket name on CloudFormation output
        new cdk.CfnOutput(this, 'S3BucketName', {
            value: this.s3HostingBucket.bucketName,
            description: 'Bucket name of the s3 hosting bucket',
            exportName: "S3BucketName"
        });

        /** An AWS CloudWatch Events rule that triggers when there are changes made to the S3 bucket. */
        const s3EventRule = new events.Rule(this, 'S3EventRule', {
            eventPattern: {
                source: ['aws.s3'],
                detailType: ['AWS API Call via CloudTrail'],
                detail: {
                    eventSource: ['s3.amazonaws.com'],
                    eventName: ['PutObject', 'CompleteMultipartUpload'], // Detecta cambios de carga
                    requestParameters: {
                        bucketName: [this.s3HostingBucket.bucketName],
                    },
                },
            },
        });

        /** CloudFront Origin Access Identity (OAI) user */
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
            this, 'CloudFrontOriginAccessIdentity'
        );

        // Add the OAI user with read permissions for the objects in the S3 bucket
        this.s3HostingBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [this.s3HostingBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));

        /** Creates a Cloudfront Response Headers Policy which applies security headers to enhance security. */
        const responseHeaderPolicy = new cloudfront.ResponseHeadersPolicy(this, 'CloudFrontResponseHeaderPolicy', {
            comment: 'Security headers response header policy',
            securityHeadersBehavior: {
                contentSecurityPolicy: {
                    override: true,
                    contentSecurityPolicy: "default-src https:;"
                },
                strictTransportSecurity: {
                    override: true,
                    accessControlMaxAge: cdk.Duration.days(2 * 365),
                    includeSubdomains: true,
                    preload: true
                },
                contentTypeOptions: {
                    override: true
                },
                referrerPolicy: {
                    override: true,
                    referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                },
                xssProtection: {
                    override: true,
                    protection: true,
                    modeBlock: true
                },
                frameOptions: {
                    override: true,
                    frameOption: cloudfront.HeadersFrameOption.DENY
                }
            }
        });

        /** Binding S3 bucket, OAI user and Response Headers Policy to the Cloudfront distribution */
        const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultRootObject: 'index.html',
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            defaultBehavior: {
                origin: new origins.S3Origin(this.s3HostingBucket, {
                    originAccessIdentity: cloudfrontOAI
                }),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: responseHeaderPolicy
            },
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 404,
                    responsePagePath: "/index.html"
                }
            ]
        });

        /** Lambda function that is responsible for invalidating the cache of the CloudFront distribution. */
        const invalidateFunction = new lambda.Function(this, 'InvalidateCacheFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
                const aws = require('aws-sdk');
                const cloudfront = new aws.CloudFront();
            
                exports.handler = async (event) => {
                    const invalidationParams = {
                    DistributionId: '${cloudfrontDistribution.distributionId}',
                    InvalidationBatch: {
                        CallerReference: new Date().toString(),
                        Paths: {
                        Quantity: 1,
                        Items: ['/*'], // Invalida todos los archivos en la distribución
                        },
                    },
                    };
            
                    await cloudfront.createInvalidation(invalidationParams).promise();
                };
            `),
        });

        // Adds lambda function as a target to the s3 event
        s3EventRule.addTarget(new targets.LambdaFunction(invalidateFunction));

        // Displays Website domain name on CloudFormation output
        new cdk.CfnOutput(this, 'CloudFrontDomainName', {
            value: cloudfrontDistribution.distributionDomainName,
            description: 'Domain name of the CloudFront distribution',
            exportName: "WebsiteDomainName"
        });
    };
};