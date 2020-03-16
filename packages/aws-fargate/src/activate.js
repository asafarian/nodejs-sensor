'use strict';

const instanaCore = require('@instana/core');
const { backendConnector, consoleLogger } = require('@instana/serverless');

const identityProvider = require('./identity_provider');

const { tracing } = instanaCore;

// @instana/collector sends span data every second. To reduce HTTP overhead,
// we throttle this back to once every 5 seconds.
const config = {
  tracing: {
  }
};

let logger = consoleLogger;

function init() {
  if (process.env.INSTANA_DEBUG || process.env.INSTANA_LOG_LEVEL) {
    logger.setLevel(process.env.INSTANA_DEBUG ? 'debug' : process.env.INSTANA_LOG_LEVEL);
  }

  identityProvider.init({
  });
  backendConnector.init(identityProvider, logger);

  instanaCore.init(config, backendConnector, identityProvider);

  tracing.activate();
}

init();

exports.currentSpan = function getHandleForCurrentSpan() {
  return tracing.getHandleForCurrentSpan();
};

exports.sdk = tracing.sdk;

exports.setLogger = function setLogger(_logger) {
  logger = _logger;
  config.logger = logger;
  instanaCore.logger.init(config);
};

exports.opentracing = tracing.opentracing;
