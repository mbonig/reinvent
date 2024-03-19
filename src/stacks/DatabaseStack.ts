import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, ITableV2, StreamViewType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends StackProps {
  tablePrefix: string;
}

export class DatabaseStack extends Stack {
  public tables: ITableV2[] = [];

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    new TableV2(this, 'HeroesTable', {
      tableName: `${props.tablePrefix}-Heroes`,
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      dynamoStream: StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      replicas: [
        {
          region: 'us-west-2',
        },
      ],
    });

  }

}
