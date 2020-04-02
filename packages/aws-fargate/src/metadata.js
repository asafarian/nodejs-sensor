'use strict';

exports.readSnapshotData = function readSnapshotData(json) {
  return {
    containerName: json.Name,
    image: json.Image,
    imageId: json.ImageID,
    taskArn: json.Labels ? json.Labels['com.amazonaws.ecs.task-arn'] : undefined,
    taskDefinition: json.Labels ? json.Labels['com.amazonaws.ecs.task-definition-family'] : undefined,
    taskDefinitionVersion: json.Labels ? json.Labels['com.amazonaws.ecs.task-definition-version'] : undefined,
    clusterArn: json.Labels ? json.Labels['com.amazonaws.ecs.cluster'] : undefined,
    limits: {
      cpu: json.Limits ? json.Limits.CPU : undefined,
      memory: json.Limits ? json.Limits.Memory : undefined
    },
    createdAt: json.CreatedAt,
    startedAt: json.StartedAt
  };
};

exports.fullyQualifiedContainerId = function fullyQualifiedContainerId(snapshotData) {
  return snapshotData.taskArn + '::' + snapshotData.containerName;
};
