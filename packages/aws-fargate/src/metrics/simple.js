'use strict';

exports.create = function create(key, value) {
  return {
    payloadPrefix: key,
    currentPayload: value
  };
};
