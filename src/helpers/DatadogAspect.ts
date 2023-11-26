import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { IAspect } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IConstruct } from 'constructs';
import { Datadog } from 'datadog-cdk-constructs-v2';

interface DataDogAspectProps {
  datadog: Datadog;
}

export class DatadogAspect implements IAspect {
  constructor(private props: DataDogAspectProps) {
  }

  visit(node: IConstruct): void {
    if (
      node instanceof Function ||
      node instanceof NodejsFunction ||
      node instanceof PythonFunction
    ) {
      this.props.datadog.addLambdaFunctions([node]);
    }
  }
}
