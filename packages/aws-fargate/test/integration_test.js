'use strict';

const expect = require('chai').expect;
const path = require('path');
const constants = require('@instana/core').tracing.constants;

const Control = require('./Control');
const expectExactlyOneMatching = require('../../core/test/test_util/expectExactlyOneMatching');
const config = require('../../serverless/test/config');
const retry = require('../../serverless/test/util/retry');

const downstreamDummyPort = 4567;
const downstreamDummyUrl = `http://localhost:${downstreamDummyPort}/`;

const region = 'us-east-2';
const account = '555123456789';
const taskDefinition = 'nodejs-fargate-test-task-definition';
const taskDefinitionVersion = '42';
const qualifiedArn = `arn:aws:ecs:${region}:${account}:task/55566677-c1e5-5780-9806-aabbccddeeff`;

const instanaAgentKey = 'aws-fargate-dummy-key';

describe('AWS fargate integration test', function() {
  this.timeout(config.getTestTimeout());
  this.slow(config.getTestTimeout() / 4);

  const control = new Control({
    fargateTaskPath: path.join(__dirname, './tasks/server'),
    downstreamDummyPort,
    downstreamDummyUrl,
    instanaAgentKey,
    startBackend: true
  });

  control.registerTestHooks();

  it('should collect metrics and trace http requests', () =>
    control
      .sendRequest({
        method: 'GET',
        path: '/'
      })
      .then(verify));

  function verify(response) {
    expect(response).to.equal('Hello Fargate!');
    return retry(() => getAndVerifyMetrics().then(() => getAndVerifySpans()));
  }

  function getAndVerifyMetrics() {
    return control.getMetrics().then(metrics => verifyMetrics(metrics));
  }

  function verifyMetrics(allMetrics) {
    expect(allMetrics).to.exist;
    expect(allMetrics).to.be.an('array');
    expect(allMetrics).to.have.lengthOf.at.least(1);
    const allPlugins = allMetrics[0];
    expect(allPlugins.plugins).to.be.an('array');
    expect(allPlugins.plugins).to.have.lengthOf(1);
    const pluginData = allPlugins.plugins[0];
    expect(pluginData.data).to.exist;
    expect(pluginData.name).to.equal('com.instana.plugin.aws.fargatetask');
    expect(pluginData.entityId).to.equal(qualifiedArn);
    const metrics = pluginData.data;
    expect(Object.keys(pluginData)).to.have.lengthOf(3); // name, entityId, data
    expect(metrics.sensorVersion).to.match(/1\.\d\d+\.\d+/);
    expect(metrics.startTime).to.be.at.most(Date.now());
    expect(metrics.versions).to.be.an('object');
    expect(metrics.versions.node).to.match(/\d+\.\d+\.\d+/);
    expect(metrics.versions.v8).to.match(/\d+\.\d+\.\d+/);
    expect(metrics.versions.uv).to.match(/\d+\.\d+\.\d+/);
    expect(metrics.versions.zlib).to.match(/\d+\.\d+\.\d+/);
    expect(metrics.taskDefinition).to.equal(taskDefinition);
    expect(metrics.taskDefinitionVersion).to.equal(taskDefinitionVersion);
    verifyHeaders(allPlugins);
  }

  function getAndVerifySpans() {
    return control.getSpans().then(spans => verifySpans(spans));
  }

  function verifySpans(spans) {
    const entry = verifyHttpEntry(spans);
    verifyHttpExit(spans, entry);
  }

  function verifyHttpEntry(spans) {
    return expectExactlyOneMatching(spans, span => {
      expect(span.t).to.exist;
      expect(span.p).to.not.exist;
      expect(span.s).to.exist;
      expect(span.n).to.equal('node.http.server');
      expect(span.k).to.equal(constants.ENTRY);
      expect(span.f).to.be.an('object');
      expect(span.f.h).to.not.exist;
      expect(span.f.hl).to.be.true;
      expect(span.f.cp).to.equal('aws');
      expect(span.f.e).to.equal(qualifiedArn);
      expect(span.data.http.method).to.equal('GET');
      expect(span.data.http.url).to.equal('/');
      expect(span.data.http.host).to.equal('127.0.0.1:4215');
      expect(span.data.http.status).to.equal(200);
      expect(span.ec).to.equal(0);
      verifyHeaders(span);
    });
  }

  function verifyHttpExit(spans, entry) {
    return expectExactlyOneMatching(spans, span => {
      expect(span.t).to.equal(entry.t);
      expect(span.p).to.equal(entry.s);
      expect(span.s).to.exist;
      expect(span.n).to.equal('node.http.client');
      expect(span.k).to.equal(constants.EXIT);
      expect(span.f).to.be.an('object');
      expect(span.f.h).to.not.exist;
      expect(span.f.hl).to.be.true;
      expect(span.f.cp).to.equal('aws');
      expect(span.f.e).to.equal(qualifiedArn);
      expect(span.data.http).to.be.an('object');
      expect(span.data.http.method).to.equal('GET');
      expect(span.data.http.url).to.equal(downstreamDummyUrl);
      expect(span.ec).to.equal(0);
      verifyHeaders(span);
    });
  }

  function verifyHeaders(payload) {
    const headers = payload._receivedHeaders;
    expect(headers).to.exist;
    expect(headers['x-instana-host']).to.equal(qualifiedArn);
    expect(headers['x-instana-key']).to.equal(instanaAgentKey);
    expect(headers['x-instana-time']).to.be.a('string');
  }
});
