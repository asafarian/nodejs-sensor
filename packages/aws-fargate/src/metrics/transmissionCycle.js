'use strict';

const { backendConnector, consoleLogger } = require('@instana/serverless');

const HttpDataSource = require('./HttpDataSource');
const InstrumentedEcsContainerProcessor = require('./container/InstrumentedEcsContainerProcessor');
const EcsTaskProcessor = require('./task/EcsTaskProcessor');
const DockerProcessor = require('./docker/DockerProcessor');
const ProcessProcessor = require('./process/ProcessProcessor');
const coreAndShared = require('./nodejs/coreAndShared');
const NodeJsProcessor = require('./nodejs/NodeJsProcessor');

let logger = consoleLogger;

let transmissionDelay = 1000;
let transmissionTimeoutHandle;
let isActive = false;

let allProcessors;

exports.init = function init(config, metadataUri, onReady) {
  transmissionDelay = config.metrics.transmissionDelay;

  coreAndShared.init(config);

  const metadataRootDataSource = new HttpDataSource(metadataUri, 60 * 1000);
  const instrumentedEcsContainerProcessor = new InstrumentedEcsContainerProcessor(metadataRootDataSource);

  allProcessors = [
    new EcsTaskProcessor(new HttpDataSource(`${metadataUri}/task`, 60 * 1000)),
    instrumentedEcsContainerProcessor,
    new DockerProcessor(metadataRootDataSource),
    new ProcessProcessor(),
    new NodeJsProcessor(coreAndShared, process.pid),
  ];

  instrumentedEcsContainerProcessor.once('ready', data => {
    onReady(null, data);
  });

  // Activate processors and data sources directly in #init (instead of in #activate) to fetch the initial snapshot
  // data for the ECS task. This needs to happen before the rest of the components can be activated (for example, to
  // get the entity ID for the task).
  allProcessors.forEach(processor => processor.activate());
};

exports.activate = function activate() {
  isActive = true;

  // The processors have been activated in init already, this is just to make sure they also get activated in a
  // (rather hypothetical) init -> deactivate -> activate scenario.
  allProcessors.forEach(processor => processor.activate());

  sendMetrics();
};

exports.deactivate = function() {
  isActive = false;
  allProcessors.forEach(processor => processor.deactivate());
  clearTimeout(transmissionTimeoutHandle);
};

function sendMetrics() {
  if (!isActive) {
    return;
  }

  const payload = { plugins: [] };
  const uncompressedPerProcessor = {};

  allProcessors.forEach(processor => {
    if (processor.isReady()) {
      const uncompressedData = processor.getUncompressedData(true);
      uncompressedPerProcessor[processor.getId()] = uncompressedData;
      if (uncompressedData) {
        const compressedData = processor.compress(uncompressedData);
        payload.plugins.push(processor.wrapAsPayload(compressedData));
      }
    }
  });

  if (payload.plugins.length === 0) {
    throw new Error('Empty payload');
  }

  backendConnector.sendMetrics(payload, onMetricsHaveBeenSent.bind(null, uncompressedPerProcessor));
}

function onMetricsHaveBeenSent(transmittedPayloadPerProcessor, error) {
  // schedule next transmission, no matter if success or error
  transmissionTimeoutHandle = setTimeout(sendMetrics, transmissionDelay);
  transmissionTimeoutHandle.unref();

  if (error) {
    logger.error('Error received while trying to send snapshot data and metrics: %s', error.message);
    return;
  }

  allProcessors.forEach(processor => {
    processor.setLastTransmittedPayload(transmittedPayloadPerProcessor[processor.getId()]);
  });
}

exports.setLogger = function setLogger(_logger) {
  logger = _logger;
};

