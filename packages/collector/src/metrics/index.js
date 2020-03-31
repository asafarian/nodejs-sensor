'use strict';

var coreMetrics = require('@instana/core').metrics;
var sharedMetrics = require('@instana/shared-metrics');

var sharedMetricsLogger = require('../logger').getLogger('metrics', function(newLogger) {
  sharedMetrics.setLogger(newLogger);
});
sharedMetrics.setLogger(sharedMetricsLogger);

coreMetrics.registerAdditionalMetrics(sharedMetrics.allMetrics);

var additionalCollectorMetrics = coreMetrics.findAndRequire(__dirname);
coreMetrics.registerAdditionalMetrics(additionalCollectorMetrics);

exports.init = function(config) {
  coreMetrics.init(config);
};

exports.activate = function() {
  coreMetrics.activate();
};

exports.deactivate = function() {
  coreMetrics.deactivate();
};

exports.gatherData = function gatherData() {
  return coreMetrics.gatherData();
};
