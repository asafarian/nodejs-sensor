/* eslint-disable consistent-return */

'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const pino = require('pino')();

const sendToParent = require('../../../serverless/test/util/send_to_parent');

const logPrefix = 'metadata-v3';
const logger = pino.child({ name: logPrefix, pid: process.pid });
logger.level = 'info';

const port = process.env.METADATA_MOCK_PORT || 1604;
const app = express();

if (process.env.WITH_STDOUT) {
  app.use(morgan(`${logPrefix} (${process.pid}): :method :url :status`));
}

app.use(bodyParser.json());

const awsAccount = '555123456789';
const clusterName = 'nodejs-fargate-test-cluster';
const taskDefinitionName = 'nodejs-fargate-test-task-definition';
const taskDefinitionVersion = '42';
const containerName = 'nodejs-fargate-test-container';

app.get('/', (req, res) => {
  res.json({
    DockerId: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab',
    Name: containerName,
    DockerName: `ecs-${taskDefinitionName}-${taskDefinitionVersion}-${containerName}-abcdefg0123456789012`,
    Image: `${awsAccount}.dkr.ecr.us-east-2.amazonaws.com/${taskDefinitionName}:latest`,
    ImageID: 'sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    Labels: {
      'com.amazonaws.ecs.cluster': `arn:aws:ecs:us-east-2:${awsAccount}:cluster/${clusterName}`,
      'com.amazonaws.ecs.container-name': containerName,
      'com.amazonaws.ecs.task-arn': `arn:aws:ecs:us-east-2:${awsAccount}:task/55566677-c1e5-5780-9806-aabbccddeeff`,
      'com.amazonaws.ecs.task-definition-family': taskDefinitionName,
      'com.amazonaws.ecs.task-definition-version': taskDefinitionVersion
    },
    DesiredStatus: 'RUNNING',
    KnownStatus: 'RUNNING',
    Limits: {
      CPU: 0,
      Memory: 0
    },
    CreatedAt: '2020-03-25T14:34:29.936120727Z',
    StartedAt: '2020-03-25T14:34:31.56264157Z',
    Type: 'NORMAL',
    Networks: [
      {
        NetworkMode: 'awsvpc',
        IPv4Addresses: ['166.66.66.66']
      }
    ]
  });
});

app.listen(port, () => {
  logger.info('Listening on port: %s', port);
  sendToParent('metadata mock: started');
});
