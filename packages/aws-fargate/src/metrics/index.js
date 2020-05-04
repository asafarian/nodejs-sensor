'use strict';

const { metrics: coreMetrics } = require('@instana/core');

const simpleSnapshotAttribute = require('./simple');

exports.init = function init(config, taskDefinitionVersionArn) {
  coreMetrics.registerAdditionalMetrics([
    //
    simpleSnapshotAttribute.create('taskDefVer', taskDefinitionVersionArn)
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
