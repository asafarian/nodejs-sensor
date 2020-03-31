'use strict';

var applicationUnderMonitoring = require('@instana/core').util.applicationUnderMonitoring;

var logger = require('@instana/core').logger.getLogger('metrics');
exports.setLogger = function(_logger) {
  logger = _logger;
};

exports.payloadPrefix = 'description';
exports.currentPayload = undefined;

exports.activate = function() {
  applicationUnderMonitoring.getMainPackageJson(function(err, pckg) {
    if (err) {
      logger.warn('Failed to determine main package json. Reason: ', err.message, err.stack);
    }

    if (!err && pckg) {
      exports.currentPayload = pckg.description;
    }
  });
};
