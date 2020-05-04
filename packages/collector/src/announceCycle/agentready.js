'use strict';

var instanaCore = require('@instana/core');
var tracing = instanaCore.tracing;
var metricsSender = instanaCore.metrics.sender;

var metrics = require('../metrics');
var uncaught = require('../uncaught');

var logger;
logger = require('../logger').getLogger('announceCycle/agentready', function(newLogger) {
  logger = newLogger;
});
var requestHandler = require('../agent/requestHandler');
var agentConnection = require('../agentConnection');

var ctx;

var tracingMetricsDelay = 1000;
if (typeof process.env.INSTANA_TRACER_METRICS_INTERVAL === 'string') {
  tracingMetricsDelay = parseInt(process.env.INSTANA_TRACER_METRICS_INTERVAL, 10);
  if (isNaN(tracingMetricsDelay) || tracingMetricsDelay <= 0) {
    tracingMetricsDelay = 1000;
  }
}
var tracingMetricsTimeout = null;

module.exports = exports = {
  enter: enter,
  leave: leave
};

function enter(_ctx) {
  ctx = _ctx;
  uncaught.activate();
  metrics.activate();
  metricsSender.activate(
    metrics,
    agentConnection,
    null,
    function onSuccess(requests) {
      requestHandler.handleRequests(requests);
    },
    function onError() {
      ctx.transitionTo('unannounced');
    }
  );
  tracing.activate();
  requestHandler.activate();
  scheduleTracingMetrics();
  logger.info('The Instana Node.js collector is now fully initialized.');
}

function leave() {
  uncaught.deactivate();
  metrics.deactivate();
  metricsSender.deactivate();
  tracing.deactivate();
  requestHandler.deactivate();
  if (tracingMetricsTimeout) {
    clearTimeout(tracingMetricsTimeout);
    tracingMetricsTimeout = null;
  }
}

function sendTracingMetrics() {
  var payload = tracing._getAndResetTracingMetrics();
  agentConnection.sendTracingMetricsToAgent(payload, function(error) {
    if (error) {
      logger.warn('Error received while trying to send tracing metrics to agent: %s', error.message);
      if (typeof error.message === 'string' && error.message.indexOf('Got status code 404')) {
        logger.warn('Apparently the agent does not support POST /tracermetrics, will stop sending tracing metrics.');
        return;
      }
    }
    scheduleTracingMetrics();
  });
}

function scheduleTracingMetrics() {
  tracingMetricsTimeout = setTimeout(sendTracingMetrics, tracingMetricsDelay);
  tracingMetricsTimeout.unref();
}
