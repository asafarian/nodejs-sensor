'use strict';

const fetch = require('node-fetch');

const instanaCore = require('@instana/core');
const { backendConnector, consoleLogger } = require('@instana/serverless');

const { fullyQualifiedContainerId, readSnapshotData } = require('./metadata');
const identityProvider = require('./identity_provider');
const metrics = require('./metrics');

const { tracing } = instanaCore;
const metricsSender = instanaCore.metrics.sender;

// @instana/collector sends metric and span data every second. To reduce HTTP overhead we throttle this back:
// Metrics will be send every 2.5 seconds, spans every 5 seconds.
const config = {};

if (!process.env.INSTANA_METRICS_TRANSMISSION_DELAY) {
  config.metrics = {
    transmissionDelay: 2500
  };
}
if (!process.env.INSTANA_TRACING_TRANSMISSION_DELAY) {
  config.tracing = {
    transmissionDelay: 5000
  };
}

let logger = consoleLogger;

function init() {
  if (process.env.INSTANA_DEBUG || process.env.INSTANA_LOG_LEVEL) {
    logger.setLevel(process.env.INSTANA_DEBUG ? 'debug' : process.env.INSTANA_LOG_LEVEL);
  }

  const metadataUriKey = 'ECS_CONTAINER_METADATA_URI';
  const metadataUri = process.env.ECS_CONTAINER_METADATA_URI;
  if (!metadataUri) {
    logger.error(`${metadataUriKey} is not set. This fargate task will not be monitored.`);
    return;
  }

  instanaCore.preInit();
  logger.debug(`Retrieving ECS metadata from ${metadataUri}.`);
  fetch(`${metadataUri}`)
    .then(res => res.text())
    .then(txt => {
      let json;
      try {
        json = JSON.parse(txt);
      } catch (jsonError) {
        logger.error(`Received invalid JSON from ${metadataUri}: ${txt}`);
        logger.error('This fargate task will not be monitored.', jsonError);
        return;
      }

      try {
        const snapshotData = readSnapshotData(json);
        const containerId = fullyQualifiedContainerId(snapshotData);
        identityProvider.init(snapshotData.taskArn, containerId);
        backendConnector.init(identityProvider, logger, false);

        instanaCore.util.compression.setBlacklist([
          //
          ['taskDefinition'],
          ['taskDefinitionVersion']
        ]);
        instanaCore.init(config, backendConnector, identityProvider);

        metrics.init(config, containerId, snapshotData);
        metrics.activate();
        metricsSender.activate(metrics, backendConnector, metricsData => ({
          plugins: [
            {
              name: 'com.instana.plugin.aws.ecs.container',
              entityId: identityProvider.getEntityId(),
              data: metricsData
            }
          ]
        }));
        tracing.activate();
      } catch (e) {
        logger.error('Initializing @instana/aws-fargate failed. This fargate task will not be monitored.', e);
      }
    })
    .catch(e => {
      logger.error(`Fetching metadata from ${metadataUri} failed. This fargate task will not be monitored.`, e);
    });
}

init();

// TODO create a util in serverless to add API exports to any object, use from here and aws-lambda
exports.currentSpan = function getHandleForCurrentSpan() {
  return tracing.getHandleForCurrentSpan();
};

exports.sdk = tracing.sdk;

exports.setLogger = function setLogger(_logger) {
  logger = _logger;
  config.logger = logger;
  instanaCore.logger.init(config);
  metrics.setLogger(_logger);
};

exports.opentracing = tracing.opentracing;
