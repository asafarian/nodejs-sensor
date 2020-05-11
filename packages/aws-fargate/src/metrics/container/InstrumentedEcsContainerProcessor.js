'use strict';

const DataProcessor = require('../DataProcessor');

class InstrumentedEcsContainerProcessor extends DataProcessor {
  constructor(dataSource) {
    super('com.instana.plugin.aws.ecs.container');
    this.addSource('snapshot', dataSource);
  }

  static fullyQualifiedContainerId(taskArn, containerName) {
    return taskArn + '::' + containerName;
  }

  getEntityId() {
    if (this.entityId != null) {
      return this.entityId;
    }
    const rawData = this._compileRawData();
    if (
      !rawData.snapshot ||
      !rawData.snapshot.Labels ||
      !rawData.snapshot.Labels['com.amazonaws.ecs.task-arn'] ||
      !rawData.snapshot.Name
    ) {
      return null;
    }
    this.entityId = InstrumentedEcsContainerProcessor.fullyQualifiedContainerId(
      rawData.snapshot.Labels['com.amazonaws.ecs.task-arn'],
      rawData.snapshot.Name
    );
    return this.entityId;
  }

  processData(rawDataPerSource) {
    const metadata = rawDataPerSource.snapshot;
    return {
      runtime: 'node',
      instrumented: true,
      dockerId: metadata.DockerId,
      dockerName: metadata.DockerName,
      containerName: metadata.Name,
      image: metadata.Image,
      imageId: metadata.ImageID,
      taskArn: metadata.Labels ? metadata.Labels['com.amazonaws.ecs.task-arn'] : undefined,
      taskDefinition: metadata.Labels ? metadata.Labels['com.amazonaws.ecs.task-definition-family'] : undefined,
      taskDefinitionVersion: metadata.Labels ? metadata.Labels['com.amazonaws.ecs.task-definition-version'] : undefined,
      clusterArn: metadata.Labels ? metadata.Labels['com.amazonaws.ecs.cluster'] : undefined,
      desiredStatus: metadata.desireStatus,
      knownStatus: metadata.knownStatus,
      limits: {
        cpu: metadata.Limits ? metadata.Limits.CPU : undefined,
        memory: metadata.Limits ? metadata.Limits.Memory : undefined
      },
      createdAt: metadata.CreatedAt,
      startedAt: metadata.StartedAt,
      type: metadata.Type
    };
  }
}

module.exports = exports = InstrumentedEcsContainerProcessor;
