'use strict';

const { metrics: coreMetrics } = require('@instana/core');
const { consoleLogger } = require('@instana/serverless');
const sharedMetrics = require('@instana/shared-metrics');

const simpleSnapshotAttribute = require('./simple');

sharedMetrics.setLogger(consoleLogger);

exports.init = function init(config, containerId, snapshotData) {
  coreMetrics.registerAdditionalMetrics(sharedMetrics.allMetrics);
  coreMetrics.registerAdditionalMetrics(
    [
      simpleSnapshotAttribute.create('runtime', 'node'),
      simpleSnapshotAttribute.create('containerId', containerId)
    ].concat(
      Object.keys(snapshotData).map(function(key) {
        return simpleSnapshotAttribute.create(key, snapshotData[key]);
      })
    )
  );

  coreMetrics.init(config);
};

exports.setLogger = function(_logger) {
  sharedMetrics.setLogger(_logger);
};

exports.activate = function activate() {
  coreMetrics.activate();
};

exports.deactivate = function deactivate() {
  coreMetrics.deactivate();
};

exports.gatherData = function gatherData() {
  return coreMetrics.gatherData();
};
