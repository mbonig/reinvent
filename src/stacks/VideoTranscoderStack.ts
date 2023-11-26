import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Transcoder } from '../constructs/Transcoder';
import { TranscoderTests } from '../constructs/VideoTranscodingStackTest';

interface VideoTranscoderStackProps extends StackProps {
  mediaBucket: IBucket;
}

export class VideoTranscoderStack extends Stack {
  constructor(scope: Construct, id: string, props: VideoTranscoderStackProps) {
    super(scope, id, props);
    const { mediaBucket } = props;

    new Transcoder(this, 'VideoTranscoder', {
      bucket: mediaBucket,
    });

    new TranscoderTests(this, 'Tester', {
      bucket: mediaBucket,
    });

    Tags.of(this).add('role', 'video-transcoder');
  }
}


