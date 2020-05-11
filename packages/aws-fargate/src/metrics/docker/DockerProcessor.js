'use strict';

const DataProcessor = require('../DataProcessor');

const InstrumentedEcsContainerProcessor = require('../container/InstrumentedEcsContainerProcessor');

class DockerProcessor extends DataProcessor {
  constructor(dataSource) {
    super('com.instana.plugin.docker');
    this.addSource('root', dataSource);
  }

  getEntityId() {
    if (this.entityId != null) {
      return this.entityId;
    }
    const rawData = this._compileRawData();
    if (
      !rawData.root ||
      !rawData.root.Labels ||
      !rawData.root.Labels['com.amazonaws.ecs.task-arn'] ||
      !rawData.root.Name
    ) {
      return null;
    }
    this.entityId = InstrumentedEcsContainerProcessor.fullyQualifiedContainerId(
      rawData.root.Labels['com.amazonaws.ecs.task-arn'],
      rawData.root.Name
    );
    return this.entityId;
  }

  processData(rawDataPerSource) {
    const data = rawDataPerSource.root;
    return {
      Id: data.DockerId,
      Created: data.CreatedAt,
      Started: data.StartedAt,
      Image: data.Image,
      Labels: data.Labels,
      NetworkMode:
        data.Networks && Array.isArray(data.Networks) && data.Networks.length > 0
          ? data.Networks[0].NetworkMode
          : undefined,
      memory: {
        limit: data.Limits.Memory
      }
    };
  }
}

module.exports = exports = DockerProcessor;
