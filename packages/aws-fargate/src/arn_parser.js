'use strict';

// arn:aws:ecs:$region:$account:task/id
const taskArnRegex = /^arn:aws:ecs:([^:]+):([^:]+):task\/.*$/;

exports.parseTaskArn = function parseTaskArn(taskArn) {
  const match = taskArnRegex.exec(taskArn);
  if (!match) {
    return {};
  } else {
    return {
      region: match[1],
      account: match[2]
    };
  }
};

exports.toTaskDefinitionArn = function toTaskDefinitionArn(parsed, taskDefinition) {
  return `arn:aws:ecs:${parsed.region}:${parsed.account}:task-definition/${taskDefinition}`;
};

exports.toTaskDefinitionVersionArn = function toTaskDefinitionVersionArn(
  parsed,
  taskDefinition,
  taskDefinitionVersion
) {
  return `arn:aws:ecs:${parsed.region}:${parsed.account}:task-definition/${taskDefinition}:${taskDefinitionVersion}`;
};
