import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Transcoder } from '../../../src/constructs/Transcoder';

describe('Transcoder', () => {
  function createTestTemplate() {
    const stack = new Stack();
    new Transcoder(stack, 'TriggerTranscodingFunction', {
      bucket: new Bucket(stack, 'Bucket'),
    });
    return Template.fromStack(stack);
  }

  describe('mediaconvert role', () => {
    it('create the mediaConvert assumable role', () => {
      const template = createTestTemplate();
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Principal: {
                Service: 'mediaconvert.amazonaws.com',
              },
            },
          ],
        },
      });
    });

    it('mediaconvert role is assigned to policy', () => {
      const template = createTestTemplate();
      template.hasResourceProperties('AWS::IAM::Policy', {
        Roles: [
          {
            Ref: 'TriggerTranscodingFunctionMediaConvertRole914A7152',
          },
        ],
      });
    });

    it('mediaconvert role has permissions to read bucket objects in uploads/ path', () => {
      const template = createTestTemplate();
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: [
                's3:GetObject*',
                's3:GetBucket*',
                's3:List*',
              ],
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::GetAtt': ['Bucket83908E77', 'Arn'],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::GetAtt': ['Bucket83908E77', 'Arn'],
                      },
                      '/uploads/*',
                    ],
                  ],
                },
              ],
            },
            {},
          ],
        },
      });
    });

    it('mediaconvert role has permissions to put bucket objects in converted/ path', () => {
      const template = createTestTemplate();
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {},
            {
              Action: [
                's3:DeleteObject*',
                's3:PutObject',
                's3:PutObjectLegalHold',
                's3:PutObjectRetention',
                's3:PutObjectTagging',
                's3:PutObjectVersionTagging',
                's3:Abort*',
              ],
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::GetAtt': ['Bucket83908E77', 'Arn'],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::GetAtt': ['Bucket83908E77', 'Arn'],
                      },
                      '/converted/*',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });

});
