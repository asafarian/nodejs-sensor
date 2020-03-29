'use strict';

const { metrics: coreMetrics } = require('@instana/core');

const simpleSnapshotAttribute = require('./simple');

exports.init = function init(config, taskDefinition, taskDefinitionVersion) {
  coreMetrics.registerAdditionalMetrics([
    //
    simpleSnapshotAttribute.create('taskDefinition', taskDefinition),
    simpleSnapshotAttribute.create('taskDefinitionVersion', taskDefinitionVersion)
  ]);

  coreMetrics.init(config);
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
