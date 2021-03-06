'use strict';

const path = require('path');
const expect = require('chai').expect;
const _ = require('lodash');

const config = require('../../../../core/test/config');
const testUtils = require('../../../../core/test/test_util');
const ProcessControls = require('../../test_util/ProcessControls');

describe('snapshot data and metrics', function() {
  this.timeout(config.getTestTimeout());

  const agentControls = require('../../apps/agentStubControls');
  agentControls.registerTestHooks();
  const controls = new ProcessControls({
    appPath: path.join(__dirname, 'app'),
    args: ['foo', 'bar', 'baz']
  }).registerTestHooks();

  it('must report metrics from a running process', () =>
    testUtils.retry(() =>
      agentControls.getAllMetrics(controls.getPid()).then(allMetrics => {
        expect(findMetric(allMetrics, ['activeHandles'])).to.exist;
        expect(findMetric(allMetrics, ['activeRequests'])).to.exist;

        const args = findMetric(allMetrics, ['args']);
        expect(args).to.have.lengthOf(5);
        expect(args[0]).to.contain('node');
        expect(args[1]).to.contain('packages/collector/test/metrics/app/app');
        expect(args[2]).to.equal('foo');
        expect(args[3]).to.equal('bar');
        expect(args[4]).to.equal('baz');

        const deps = findMetric(allMetrics, ['dependencies']);
        expect(deps).to.be.an('object');
        expect(Object.keys(deps)).to.have.lengthOf(1);
        expect(deps['node-fetch']).to.equal('2.6.0');

        expect(findMetric(allMetrics, ['description'])).to.equal(
          'This is a test application to test snapshot and metrics data.'
        );

        const directDeps = findMetric(allMetrics, ['directDependencies']);
        expect(directDeps).to.be.an('object');
        expect(Object.keys(directDeps)).to.have.lengthOf.at.least(1);
        expect(directDeps.dependencies['node-fetch']).to.equal('^2.6.0');

        expect(findMetric(allMetrics, ['execArgs'])).to.be.an('array');
        expect(findMetric(allMetrics, ['execArgs'])).to.be.empty;

        expect(findMetric(allMetrics, ['gc', 'minorGcs'])).to.exist;
        expect(findMetric(allMetrics, ['gc', 'majorGcs'])).to.exist;

        expect(findMetric(allMetrics, ['healthchecks'])).to.exist;
        expect(findMetric(allMetrics, ['heapSpaces'])).to.exist;
        expect(findMetric(allMetrics, ['http'])).to.exist;
        expect(findMetric(allMetrics, ['keywords'])).to.deep.equal(['keyword1', 'keyword2']);
        expect(findMetric(allMetrics, ['libuv'])).to.exist;
        expect(findMetric(allMetrics, ['memory'])).to.exist;
        expect(findMetric(allMetrics, ['name'])).to.equal('metrics-test-app');
        expect(findMetric(allMetrics, ['pid'])).to.equal(controls.getPid());
        expect(findMetric(allMetrics, ['versions'])).to.exist;
        expect(`v${findMetric(allMetrics, ['versions', 'node'])}`).to.equal(process.version);
      })
    ));
});

function findMetric(allMetrics, _path) {
  for (let i = allMetrics.length - 1; i >= 0; i--) {
    const value = _.get(allMetrics[i], ['data'].concat(_path));
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}
