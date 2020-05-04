'use strict';

const expect = require('chai').expect;

const arnParser = require('../src/arn_parser');

const region = 'us-east-2';
const account = '555123456789';
const taskArn = `arn:aws:ecs:${region}:${account}:task/55566677-c1e5-5780-9806-aabbccddeeff`;

const taskDefinition = 'nodejs-fargate-test-task-definition';
const expectedTaskDefinitionArn = `arn:aws:ecs:${region}:${account}:task-definition/${taskDefinition}`;
const taskDefinitionVersion = '42';
const expectedTaskDefinitionVersionArn = `${expectedTaskDefinitionArn}:${taskDefinitionVersion}`;

describe('arn parser', () => {
  it('should parse task arn', () => {
    const parsed = arnParser.parseTaskArn(taskArn);
    expect(parsed.region).to.equal(region);
    expect(parsed.account).to.equal(account);
  });

  it('should create the task definition arn', () => {
    const parsed = arnParser.parseTaskArn(taskArn);
    const taskDefinitionVersionArn = arnParser.toTaskDefinitionArn(parsed, taskDefinition);
    expect(taskDefinitionVersionArn).to.equal(expectedTaskDefinitionArn);
  });

  it('should create the task definition version arn', () => {
    const parsed = arnParser.parseTaskArn(taskArn);
    const taskDefinitionVersionArn = arnParser.toTaskDefinitionVersionArn(
      parsed,
      taskDefinition,
      taskDefinitionVersion
    );
    expect(taskDefinitionVersionArn).to.equal(expectedTaskDefinitionVersionArn);
  });
});
