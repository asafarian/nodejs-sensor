'use strict';

const DataProcessor = require('../DataProcessor');

const ProcessSnapshotDataSource = require('./ProcessSnapshotDataSource');
const ProcessMetricsSource = require('./ProcessMetricsSource');

class ProcessProcessor extends DataProcessor {
  constructor() {
    super('com.instana.plugin.process');
    this.addSource('snapshot', new ProcessSnapshotDataSource(5 * 60 * 1000));
    this.addSource('metrics', new ProcessMetricsSource());
  }

  getEntityId() {
    if (this.entityId != null) {
      return this.entityId;
    }
    const rawData = this._compileRawData();
    if (!rawData.snapshot) {
      return null;
    }
    this.entityId = rawData.snapshot.pid;
    return this.entityId;
  }

  processData(rawDataPerSource) {
    const { snapshot, metrics } = rawDataPerSource;
    return {
      ...snapshot,
      cpu: {
        user: metrics.cpu.user / 1000,
        sys: metrics.cpu.system / 1000
      }
    };
  }
}

module.exports = exports = ProcessProcessor;
