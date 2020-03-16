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

describe('fargate tracing', function() {
  this.timeout(config.getTestTimeout());
  this.slow(config.getTestTimeout() / 4);

  const control = new Control({
    fargateTaskPath: path.join(__dirname, './tasks/server'),
    downstreamDummyPort,
    downstreamDummyUrl
  });

  control.registerTestHooks();

  it('should trace http entries', () =>
    control
      .sendRequest({
        method: 'GET',
        path: '/'
      })
      .then(() => verify()));

  function verify() {
    return retry(() => getAndVerifySpans());
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
      expect(span.f.hl).to.be.true;
      expect(span.f.cp).to.equal('aws');
      expect(span.ec).to.equal(0);
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
      expect(span.data.http).to.be.an('object');
      expect(span.data.http.method).to.equal('GET');
      expect(span.data.http.url).to.equal(downstreamDummyUrl);
      expect(span.ec).to.equal(0);
    });
  }
});
