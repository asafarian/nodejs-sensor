'use strict';

const { fork } = require('child_process');
const path = require('path');
const request = require('request-promise');
const {
  assert: { fail }
} = require('chai');

const config = require('../../serverless/test/config');
const AbstractServerlessControl = require('../../serverless/test/util/AbstractServerlessControl');

const PATH_TO_INSTANA_FARGATE_PACKAGE = path.join(__dirname, '..');

function Control(opts) {
  AbstractServerlessControl.call(this, opts);
  this.port = opts.port || 4215;
  this.baseUrl = `http://127.0.0.1:${this.port}`;
  this.backendPort = this.opts.backendPort || 9443;
  this.backendBaseUrl = this.opts.backendBaseUrl || `https://localhost:${this.backendPort}/serverless`;
  this.downstreamDummyPort = this.opts.downstreamDummyPort || 4567;
  this.downstreamDummyUrl = this.opts.downstreamDummyUrl || `http://localhost:${this.downstreamDummyPort}`;
  this.instanaAgentKey = this.opts.instanaAgentKey || 'aws-fargate-dummy-key';

  opts.startBackend = true;
}

Control.prototype = Object.create(AbstractServerlessControl.prototype);

Control.prototype.reset = function reset() {
  AbstractServerlessControl.prototype.reset.call(this);
  this.messageFromFargateTask = [];

  this.fargateErrors = [];
  this.fargateResults = [];

  this.taskHasStarted = false;
  this.taskHasTerminated = false;
};

Control.prototype.registerTestHooks = function registerTestHooks() {
  AbstractServerlessControl.prototype.registerTestHooks.call(this);
  beforeEach(() => {
    if (!this.opts.fargateTaskPath) {
      fail('opts.fargateTaskPath is unspecified.');
    }
  });
};

Control.prototype.startMonitoredProcess = function startMonitoredProcess() {
  this.fargateTask = fork(this.opts.fargateTaskPath, {
    stdio: config.getAppStdio(),
    execArgv: ['--require', PATH_TO_INSTANA_FARGATE_PACKAGE],
    env: Object.assign(
      {
        TASK_HTTP_PORT: this.port,
        DOWNSTREAM_DUMMY_URL: this.downstreamDummyUrl,
        INSTANA_DISABLE_CA_CHECK: true,
        INSTANA_ENDPOINT_URL: this.backendBaseUrl,
        INSTANA_AGENT_KEY: this.instanaAgentKey
      },
      process.env,
      this.opts.env
    )
  });
  this.taskHasStarted = true;

  this.fargateTask.on('exit', () => {
    this.taskHasTerminated = true;
  });

  this.fargateTask.on('message', message => {
    if (message.type === 'fargate-result') {
      if (message.error) {
        this.fargateErrors.push(message.payload);
      } else {
        this.fargateResults.push(message.payload);
      }
    } else {
      this.messageFromFargateTask.push(message);
    }
  });
};

Control.prototype.hasMonitoredProcessStarted = function hasMonitoredProcessStarted() {
  return this.messageFromFargateTask.indexOf('fargate-task: listening') >= 0 && !this.taskHasTerminated;
};

Control.prototype.hasMonitoredProcessTerminated = function hasMonitoredProcessTerminated() {
  return !this.taskHasStarted || this.taskHasTerminated;
};

Control.prototype.killMonitoredProcess = function killMonitoredProcess() {
  if (!this.hasMonitoredProcessTerminated()) {
    return this.killChildProcess(this.fargateTask);
  }
  return Promise.resolve();
};

Control.prototype.getLambdaResults = function getLambdaResults() {
  return this.fargateResults;
};

Control.prototype.getLambdaErrors = function getLambdaErrors() {
  return this.fargateErrors;
};

Control.prototype.sendRequest = function(opts) {
  if (opts.suppressTracing === true) {
    opts.headers = opts.headers || {};
    opts.headers['X-INSTANA-L'] = '0';
  }

  opts.url = this.baseUrl + opts.path;
  opts.json = true;
  return request(opts);
};

module.exports = Control;
