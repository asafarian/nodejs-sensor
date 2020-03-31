'use strict';

const { metrics: coreMetrics } = require('@instana/core');
const { consoleLogger } = require('@instana/serverless');
var sharedMetrics = require('@instana/shared-metrics');

const simpleSnapshotAttribute = require('./simple');

sharedMetrics.setLogger(consoleLogger);

exports.init = function init(config, taskDefinition, taskDefinitionVersion) {
  coreMetrics.registerAdditionalMetrics(sharedMetrics.allMetrics);
  coreMetrics.registerAdditionalMetrics([
    //
    simpleSnapshotAttribute.create('taskDefinition', taskDefinition),
    simpleSnapshotAttribute.create('taskDefinitionVersion', taskDefinitionVersion)
  ]);

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
