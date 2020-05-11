'use strict';

const DataSource = require('../DataSource');

/**
 * A source for metrics for the process entity.
 */
class ProcessDataSource extends DataSource {
  constructor(refreshDelay) {
    super(refreshDelay);
  }

  doRefresh(callback) {
    process.nextTick(() => {
      callback(null, {
        cpu: process.cpuUsage()
      });
    });
  }
}

module.exports = exports = ProcessDataSource;
