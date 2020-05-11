'use strict';

const { expect } = require('chai');

const { delay, retry } = require('../../../../core/test/test_util');
const config = require('../../../../serverless/test/config');

const ProcessMetricsSource = require('../../../src/metrics/process/ProcessMetricsSource');

describe('process snapshot data source', function() {
  this.timeout(config.getTestTimeout());

  let dataSource;
  beforeEach(() => {
    dataSource = new ProcessMetricsSource();
  });

  afterEach(() => {
    dataSource.deactivate();
    dataSource.reset();
  });

  it('should know that no refresh has happened yet', () => {
    // deliberately not activating the source
    return delay(50).then(() => expect(dataSource.hasRefreshedAtLeastOnce()).to.be.false);
  });

  it('should know that at least one refresh has happened already', () => {
    dataSource.activate();
    return retry(() => expect(dataSource.hasRefreshedAtLeastOnce()).to.be.true);
  });

  it('should collect snapshot data', () => {
    dataSource.activate();
    return retry(() => {
      const rawData = dataSource.getRawData();
      expect(rawData.cpu).to.exist;
      expect(rawData.cpu.user).to.be.a('number');
      expect(rawData.cpu.system).to.be.a('number');
    });
  });

  it('should emit firstRefresh event', () => {
    let emittedData;
    dataSource.on('firstRefresh', data => {
      emittedData = data;
    });
    dataSource.activate();

    return retry(() => {
      expect(emittedData).to.exist;
      expect(emittedData.cpu).to.exist;
      expect(emittedData.cpu.user).to.be.a('number');
      expect(emittedData.cpu.system).to.be.a('number');
    });
  });
});
