import * as fs from 'fs';
import path from 'path';
import {
  CfnResource,
  DefaultStackSynthesizer,
  DockerImageAssetLocation,
  DockerImageAssetSource,
  FileAssetLocation,
  FileAssetSource,
  IBoundStackSynthesizer,
  IReusableStackSynthesizer,
  ISynthesisSession,
  Stack,
} from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export class HeroesSynthesizer implements IReusableStackSynthesizer {
  stack: Stack | undefined;
  private defaultSynthesizer: DefaultStackSynthesizer;
  private path: string;


  constructor(options: { path: string }) {
    this.path = options.path;
    this.defaultSynthesizer = new DefaultStackSynthesizer();
  }

  addDockerImageAsset(asset: DockerImageAssetSource): DockerImageAssetLocation {
    return this.defaultSynthesizer.addDockerImageAsset(asset);
  }

  addFileAsset(asset: FileAssetSource): FileAssetLocation {
    return this.defaultSynthesizer.addFileAsset(asset);
  }

  bind(stack: Stack): void {
    this.stack = stack;
    return this.defaultSynthesizer.bind(stack);
  }

  reusableBind(stack: Stack): IBoundStackSynthesizer {
    // Create a copy of the current object and bind that
    const copy = Object.create(this);
    copy.defaultSynthesizer = new DefaultStackSynthesizer();
    copy.bind(stack);
    return copy;
  }

  synthesize(session: ISynthesisSession): void {
    if (!this.stack) {
      throw new Error('Stack is undefined');
    }
    const allThings = this.stack.node.findAll();
    const heroesData = this.getTheHeroesData(this.stack.stackName, allThings);
    fs.writeFileSync(path.join(this.path, `${this.stack.stackName}-resources.json`), JSON.stringify(heroesData, null, 2));
    this.defaultSynthesizer.synthesize(session);

  }

  private getTheHeroesData(stackName: string, allThings: IConstruct[]) {
    const allTheThings: {stackName: string; resources: string[]} = {
      stackName: stackName,
      resources: [],
    };

    for (const resource of allThings) {
      let cfnResource = resource as CfnResource;
      if (cfnResource.cfnResourceType) {
        const resourceType = cfnResource.cfnResourceType;
        allTheThings.resources.push(resourceType);
      }
    }
    return allTheThings;
  }


}
